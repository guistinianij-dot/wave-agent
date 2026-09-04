import React, { useState, useEffect } from "react";
import {
  AndroidPackage,
  NotificationEntity,
  PermissionStatus,
  SuggestedAction,
  DailyBriefing,
  AgentTool,
  AIProviderConfig,
  ToolExecutionResult,
  PendingAction,
} from "./types";
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_PACKAGES,
  INITIAL_PERMISSIONS,
  INITIAL_AI_PROVIDER_CONFIG,
  INITIAL_TOOLS,
} from "./data/mockData";
import { Header, ActiveTab } from "./components/Header";
import { NotificationIntelligenceFeed } from "./components/NotificationIntelligenceFeed";
import { AndroidPhoneFrame } from "./components/AndroidPhoneFrame";
import { AppEcosystemManager } from "./components/AppEcosystemManager";
import { WaveAgentChat } from "./components/WaveAgentChat";
import { PermissionsManifestView } from "./components/PermissionsManifestView";
import { AppModuleInspector } from "./components/AppModuleInspector";
import { ConfirmationOverlay } from "./components/ConfirmationOverlay";
import { NotificationSimulatorModal } from "./components/NotificationSimulatorModal";
import { InstallModal } from "./components/InstallModal";
import { AppIcon } from "./components/AppIcon";
import { Bell, Check, Copy, ExternalLink, Sparkles, X } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("intelligence");
  const [notifications, setNotifications] = useState<NotificationEntity[]>(() => {
    const saved = localStorage.getItem("wave_agent_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [packages, setPackages] = useState<AndroidPackage[]>(INITIAL_PACKAGES);
  const [permissions, setPermissions] = useState<PermissionStatus[]>(INITIAL_PERMISSIONS);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() => {
    const saved = localStorage.getItem("wave_agent_ai_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_AI_PROVIDER_CONFIG;
  });
  const [tools, setTools] = useState<AgentTool[]>(INITIAL_TOOLS);
  const [lastToolResult, setLastToolResult] = useState<ToolExecutionResult | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);

  // Heads-up banner for real-time notifications
  const [headsUpNotification, setHeadsUpNotification] = useState<NotificationEntity | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // The Security Confirmation Wall state (MainActivity.kt architecture)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Sync notifications and AI config to localStorage
  useEffect(() => {
    localStorage.setItem("wave_agent_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("wave_agent_ai_config", JSON.stringify(aiConfig));
  }, [aiConfig]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const executeToolInternal = (
    tool: AgentTool,
    params: Record<string, any>,
    wasConfirmed = false
  ) => {
    setTools((prev) =>
      prev.map((t) =>
        t.id === tool.id
          ? {
              ...t,
              invocationsCount: t.invocationsCount + 1,
              lastExecutedPayload: JSON.stringify(params),
              lastExecutionTime: "Just now",
            }
          : t
      )
    );

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    if (tool.id === "openAppTool") {
      const rawAppName = params.app_name !== undefined ? params.app_name : (params.appName || params.packageName || "");
      const appName = typeof rawAppName === "string" ? rawAppName.trim() : "";

      if (!appName) {
        setLastToolResult({
          toolId: tool.id,
          toolName: "OpenAppTool (open_app)",
          status: "failed",
          resultType: "ToolResult.Error",
          resultMessage: "Missing app name",
          actionTaken: "ToolResult.Error(\"Missing app name\")",
          timestamp: now,
          details: params,
        });
        showToast("OpenAppTool -> ToolResult.Error(\"Missing app name\")");
        return;
      }

      // pm.getInstalledApplications(0).find { it.loadLabel(pm).toString().contains(appName, true) }?.packageName
      const matchedApp = packages.find(
        (p) =>
          p.name.toLowerCase().includes(appName.toLowerCase()) ||
          p.packageName.toLowerCase().includes(appName.toLowerCase())
      );

      if (matchedApp) {
        setLastToolResult({
          toolId: tool.id,
          toolName: "OpenAppTool (open_app)",
          status: "success",
          resultType: "ToolResult.Success",
          resultMessage: `Launched ${appName}`,
          intentUri: `pm.getLaunchIntentForPackage("${matchedApp.packageName}").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)`,
          actionTaken: `ToolResult.Success(\"Launched ${appName}\") [${matchedApp.name} | ${matchedApp.packageName}]`,
          timestamp: now,
          details: { ...params, matchedPackage: matchedApp.packageName, label: matchedApp.name },
        });
        showToast(`OpenAppTool -> ToolResult.Success(\"Launched ${appName}\")`);
      } else {
        setLastToolResult({
          toolId: tool.id,
          toolName: "OpenAppTool (open_app)",
          status: "failed",
          resultType: "ToolResult.Error",
          resultMessage: "App not found",
          actionTaken: `ToolResult.Error(\"App not found\") for query: "${appName}"`,
          timestamp: now,
          details: params,
        });
        showToast(`OpenAppTool -> ToolResult.Error(\"App not found\")`);
      }
    } else if (tool.id === "shareTool") {
      const textToShare = params.text || "Wave Agent notification payload";
      const target = params.targetApp || "System Share Sheet";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToShare);
      }
      setLastToolResult({
        toolId: tool.id,
        toolName: tool.name,
        status: "success",
        intentUri: `android.intent.action.SEND [MIME: text/plain] -> ${target}`,
        actionTaken: `Dispatched share intent with payload "${textToShare.slice(0, 40)}${textToShare.length > 40 ? "..." : ""}"`,
        timestamp: now,
        details: params,
      });
      showToast(`ShareTool: Dispatched payload via Intent.ACTION_SEND`);
    } else if (tool.id === "paymentTool") {
      const amount = params.amount || "49.99";
      const currency = params.currency || "USD";
      const payee = params.payee || "Apex Cloud Services";
      setLastToolResult({
        toolId: tool.id,
        toolName: tool.name,
        status: "success",
        intentUri: `android.intent.action.PAY?amount=${amount}&currency=${currency}&payee=${encodeURIComponent(payee)}`,
        actionTaken: wasConfirmed
          ? `Biometrically authorized by Security Confirmation Wall: Processed ${currency} ${amount} transfer to ${payee}`
          : `Approved secure biometric payment authorization of ${currency} ${amount} to ${payee}`,
        timestamp: now,
        details: params,
      });
      showToast(`PaymentTool: Processed payment of ${currency} ${amount} to ${payee}`);
    }
  };

  const handleExecuteTool = (
    tool: AgentTool,
    params: Record<string, any>,
    bypassSecurityWall = false
  ) => {
    // The Security Confirmation Wall: Intercept high-risk tools like PaymentTool
    if (tool.id === "paymentTool" && !bypassSecurityWall) {
      setPendingAction({
        id: `action-${Date.now()}`,
        title: "High Risk Action",
        description: `Authorize high-risk payment transfer of ${params.currency || "USD"} ${params.amount || "49.99"} to ${params.payee || "Apex Cloud Services"} via PaymentTool.`,
        toolId: tool.id,
        toolName: tool.name,
        params,
        riskLevel: "CRITICAL",
        timestamp: new Date().toLocaleTimeString(),
        actionSummary: `Payment to ${params.payee || "Apex Cloud Services"} (${params.currency || "USD"} ${params.amount || "49.99"})`,
      });
      return;
    }

    executeToolInternal(tool, params);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const tool =
      tools.find((t) => t.id === pendingAction.toolId) ||
      tools.find((t) => t.id === "paymentTool") || {
        id: "paymentTool",
        name: "PaymentTool",
        className: "PaymentTool",
        description: "Payment Intent",
        intentAction: "android.intent.action.PAY",
        category: "financial",
        parameters: [],
        enabled: true,
        invocationsCount: 0,
      };

    executeToolInternal(tool as AgentTool, pendingAction.params || {}, true);
    setPendingAction(null);
    showToast("Security Confirmation Wall: High-risk action confirmed & executed");
  };

  const cancelAction = () => {
    if (!pendingAction) return;
    const targetTool = pendingAction.toolName || "Action";
    setLastToolResult({
      toolId: pendingAction.toolId,
      toolName: targetTool,
      status: "cancelled",
      actionTaken: `Action aborted by user at Security Confirmation Wall`,
      timestamp: new Date().toLocaleTimeString(),
      details: pendingAction.params,
    });
    setPendingAction(null);
    showToast(`Security Confirmation Wall: ${targetTool} was aborted`);
  };

  const listenerGranted = permissions.find(
    (p) => p.key === "BIND_NOTIFICATION_LISTENER_SERVICE"
  )?.granted ?? true;

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification dismissed from stream");
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleTogglePin = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleClearAll = () => {
    setNotifications((prev) => prev.filter((n) => n.isPinned));
    showToast("Cleared non-pinned notifications");
  };

  const handleActionClick = (action: SuggestedAction, notification?: NotificationEntity) => {
    if (action.type === "copy_text" && action.payload) {
      navigator.clipboard.writeText(action.payload);
      showToast(`Copied ${action.payload} to clipboard`);
    } else if (action.type === "launch_app") {
      const matchPkg = packages.find((p) => p.packageName === action.targetPackage);
      if (matchPkg) {
        setActiveTab("device");
        showToast(`Launched ${matchPkg.name}`);
      } else {
        showToast(`Intent dispatched to ${action.targetPackage}`);
      }
    } else if (action.type === "quick_reply") {
      showToast(`Replied: "${action.payload}"`);
      if (notification) {
        handleToggleRead(notification.id);
      }
    } else if (action.type === "dismiss" && notification) {
      handleDismissNotification(notification.id);
    }
  };

  const handleSimulateNotification = async (notifData: {
    packageName: string;
    appName: string;
    title: string;
    text: string;
    subText?: string;
  }) => {
    const rawNotif: NotificationEntity = {
      id: `notif-${Date.now()}`,
      packageName: notifData.packageName,
      appName: notifData.appName,
      title: notifData.title,
      text: notifData.text,
      subText: notifData.subText,
      postTime: new Date().toISOString(),
      isRead: false,
      channelId: "interactive_stream",
      rawExtras: {
        "android.title": notifData.title,
        "android.text": notifData.text,
        "android.appInfo": `${notifData.appName} (Simulated)`,
      },
    };

    try {
      const res = await fetch("/api/agent/analyze-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification: rawNotif,
          installedApps: packages,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        rawNotif.analysis = data.analysis;
      }
    } catch (err) {
      console.warn("AI analysis failed, using fallback", err);
    }

    setNotifications((prev) => [rawNotif, ...prev]);
    setHeadsUpNotification(rawNotif);
    setTimeout(() => {
      setHeadsUpNotification((current) => (current?.id === rawNotif.id ? null : current));
    }, 6000);
  };

  const handleRequestBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      const res = await fetch("/api/agent/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications }),
      });
      const data = await res.json();
      if (data.success && data.briefing) {
        setBriefing(data.briefing);
      }
    } catch (err) {
      showToast("Could not synthesize briefing");
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleTogglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.key === key ? { ...p, granted: !p.granted } : p))
    );
    showToast(`Updated permission android.permission.${key}`);
  };

  const handleToggleListener = () => {
    handleTogglePermission("BIND_NOTIFICATION_LISTENER_SERVICE");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const criticalCount = notifications.filter((n) => n.analysis?.tier === "critical").length;

  return (
    <div className="min-h-screen bg-[#02040a] text-[#e0e0e0] flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Immersive UI Ambient Glow Backgrounds */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        criticalCount={criticalCount}
        permissions={permissions}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenInstallModal={() => setIsInstallOpen(true)}
        aiConfig={aiConfig}
      />

      {/* Heads-up Android Alert Banner (when simulated alert arrives) */}
      {headsUpNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-bounce">
          <div className="p-3.5 rounded-2xl bg-[#02040a]/90 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl flex items-start justify-between gap-3 text-[#e0e0e0]">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <AppIcon name={headsUpNotification.appName} className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">{headsUpNotification.appName}</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Urgency {headsUpNotification.analysis?.urgency || 85}
                  </span>
                </div>
                <div className="text-xs font-medium text-neutral-200 line-clamp-1">
                  {headsUpNotification.title}
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-1">
                  {headsUpNotification.text}
                </div>
              </div>
            </div>
            <button
              onClick={() => setHeadsUpNotification(null)}
              className="text-neutral-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10">
        {activeTab === "intelligence" && (
          <NotificationIntelligenceFeed
            notifications={notifications}
            onDismiss={handleDismissNotification}
            onToggleRead={handleToggleRead}
            onTogglePin={handleTogglePin}
            onActionClick={handleActionClick}
            onClearAll={handleClearAll}
            onRequestBriefing={handleRequestBriefing}
            briefing={briefing}
            isGeneratingBriefing={isGeneratingBriefing}
          />
        )}

        {activeTab === "device" && (
          <AndroidPhoneFrame
            notifications={notifications}
            packages={packages}
            onActionClick={handleActionClick}
            onDismissNotification={handleDismissNotification}
            listenerActive={listenerGranted}
            onToggleListener={handleToggleListener}
          />
        )}

        {activeTab === "packages" && (
          <AppEcosystemManager
            packages={packages}
            notifications={notifications}
            onLaunchApp={(pkg) => {
              setActiveTab("device");
              showToast(`Switching to Android device view for ${pkg.name}`);
            }}
          />
        )}

        {activeTab === "agent" && (
          <WaveAgentChat
            notifications={notifications}
            packages={packages}
            onActionClick={handleActionClick}
            onLaunchApp={(pkg) => {
              setActiveTab("device");
              showToast(`Launching ${pkg.name}`);
            }}
            config={aiConfig}
            tools={tools}
            onExecuteTool={handleExecuteTool}
          />
        )}

        {activeTab === "permissions" && (
          <PermissionsManifestView
            permissions={permissions}
            onTogglePermission={handleTogglePermission}
          />
        )}

        {activeTab === "architecture" && (
          <AppModuleInspector
            config={aiConfig}
            onConfigChange={(newConfig) => {
              setAiConfig(newConfig);
              showToast(
                `Switched provider to ${
                  newConfig.activeProvider === "nano" ? "Gemini Nano (On-Device AICore)" : "CloudAIProvider (Gemini 3.8 Flash)"
                }`
              );
            }}
            tools={tools}
            onExecuteTool={handleExecuteTool}
            lastResult={lastToolResult}
          />
        )}
      </main>

      {/* Immersive System Diagnostics Footer */}
      <footer className="mt-auto border-t border-white/5 bg-[#02040a]/80 backdrop-blur-md px-6 py-5 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase tracking-tighter font-bold">Post Notifications</span>
              <span className="text-xs font-mono text-cyan-100">
                {permissions.find((p) => p.key === "POST_NOTIFICATIONS")?.granted ? "GRANTED" : "REVOKED"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase tracking-tighter font-bold">Service Binding</span>
              <span className="text-xs font-mono text-cyan-100">
                {listenerGranted ? "PERSISTENT" : "DETACHED"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase tracking-tighter font-bold">App Indexing</span>
              <span className="text-xs font-mono text-cyan-100">
                {packages.length} APPS ACTIVE
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase tracking-tighter font-bold">Hilt AppModule</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {aiConfig.activeProvider === "nano" ? "NANO (API 34+)" : "CLOUD FALLBACK"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase tracking-tighter font-bold">Tool Registry</span>
              <span className="text-xs font-mono text-indigo-300">
                {tools.length} TOOLS INJECTED
              </span>
            </div>
          </div>
          <div className="text-right flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-500 uppercase font-bold">System Uptime</span>
              <span className="text-sm font-mono text-white">124:12:09:44</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Simulator Modal */}
      <NotificationSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        packages={packages}
        onSimulate={handleSimulateNotification}
      />

      {/* Install App Modal */}
      <InstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

      {/* The Security Confirmation Wall (MainActivity.kt architecture) */}
      {pendingAction != null && (
        <ConfirmationOverlay
          state={{
            isVisible: true,
            title: "High Risk Action",
            description: pendingAction.description,
            pendingAction: pendingAction,
            onConfirm: confirmAction,
            onCancel: cancelAction,
          }}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#02040a]/90 border border-white/10 text-xs text-[#e0e0e0] shadow-[0_0_25px_rgba(6,182,212,0.25)] flex items-center gap-2 backdrop-blur-xl animate-fadeIn">
          <Check className="w-3.5 h-3.5 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
