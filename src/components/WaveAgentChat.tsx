import React, { useState, useRef, useEffect } from "react";
import {
  AgentChatMessage,
  AndroidPackage,
  NotificationEntity,
  SuggestedAction,
  AgentTool,
  AIProviderConfig,
} from "../types";
import {
  Sparkles,
  Send,
  Zap,
  Copy,
  ExternalLink,
  Check,
  Bot,
  User,
  KeyRound,
  Layers,
  Smartphone,
  CreditCard,
  Play,
  Cpu,
  Cloud,
} from "lucide-react";

interface WaveAgentChatProps {
  notifications: NotificationEntity[];
  packages: AndroidPackage[];
  onActionClick: (action: SuggestedAction, notification?: NotificationEntity) => void;
  onLaunchApp: (pkg: AndroidPackage) => void;
  config?: AIProviderConfig;
  tools?: AgentTool[];
  onExecuteTool?: (tool: AgentTool, params: Record<string, any>) => void;
}

export const WaveAgentChat: React.FC<WaveAgentChatProps> = ({
  notifications,
  packages,
  onActionClick,
  onLaunchApp,
  config,
  tools = [],
  onExecuteTool,
}) => {
  const isNano = config?.activeProvider === "nano";
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: "msg-init",
      sender: "agent",
      text: "Hello! I am Wave Agent. Injected via AppModule, my reasoning is currently running on " +
        (isNano ? "Gemini Nano (On-Device AICore, 0ms network latency)" : "CloudAIProvider (Gemini 3.8 Flash)") +
        ". I have full access to OpenAppTool, ShareTool, and PaymentTool.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedFollowUps: [
        "Summarize urgent alerts",
        "Launch Slack via OpenAppTool",
        "Share latest 2FA verification code",
        "Verify pending payments",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMessage: AgentChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          activeNotifications: notifications,
          installedApps: packages,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const agentMessage: AgentChatMessage = {
          id: `msg-agent-${Date.now()}`,
          sender: "agent",
          text: data.reply || "Processed request.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actions: data.actions || [],
          suggestedFollowUps: data.suggestedFollowUps || [],
        };
        setMessages((prev) => [...prev, agentMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err: any) {
      // Local fallback reasoning
      const textLower = text.toLowerCase();
      let fallbackText = "Wave Agent intercepted your query.";
      const fallbackActions: any[] = [];

      if (textLower.includes("otp") || textLower.includes("code")) {
        const otpNotif = notifications.find((n) => n.analysis?.entities?.otp);
        if (otpNotif) {
          fallbackText = `Found active verification code: **${otpNotif.analysis?.entities.otp}** from ${otpNotif.appName}.`;
          fallbackActions.push({
            type: "copy_to_clipboard",
            label: `Copy ${otpNotif.analysis?.entities.otp}`,
            payload: otpNotif.analysis?.entities.otp,
          });
        } else {
          fallbackText = "No active 2FA or verification codes found in the notification queue.";
        }
      } else if (textLower.includes("summar")) {
        const criticalCount = notifications.filter((n) => n.analysis?.tier === "critical").length;
        fallbackText = `Currently tracking ${notifications.length} notifications (${criticalCount} critical). Top notification: "${notifications[0]?.title || "None"}".`;
      } else if (textLower.includes("pay") || textLower.includes("transaction")) {
        fallbackText = "I detected a financial payment command. In accordance with MainActivity.kt security architecture, I am raising The Security Confirmation Wall (ConfirmationOverlay) for biometric authorization.";
        fallbackActions.push({
          type: "trigger_payment",
          label: "Authorize Payment ($49.99 to Apex Cloud)",
          payload: { amount: "49.99", currency: "USD", payee: "Apex Cloud Services" },
        });
        if (onExecuteTool) {
          const payTool = tools.find((t) => t.id === "paymentTool") || tools[2];
          if (payTool) {
            onExecuteTool(payTool, { amount: "49.99", currency: "USD", payee: "Apex Cloud Services" });
          }
        }
      } else {
        fallbackText = `Processed command across ${packages.length} installed apps and ${notifications.length} notifications. WaveNotificationListener is running at low latency.`;
      }

      const agentMessage: AgentChatMessage = {
        id: `msg-agent-${Date.now()}`,
        sender: "agent",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: fallbackActions,
        suggestedFollowUps: ["Summarize urgent alerts", "Check 2FA codes", "List installed apps"],
      };
      setMessages((prev) => [...prev, agentMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionExecute = (action: any) => {
    if (action.type === "copy_to_clipboard" && action.payload) {
      navigator.clipboard.writeText(action.payload);
      setCopiedText(action.payload);
      setTimeout(() => setCopiedText(null), 2500);
    } else if (action.type === "launch_app") {
      const matchPkg = packages.find(
        (p) => p.packageName === action.payload || p.name.toLowerCase() === String(action.payload).toLowerCase()
      );
      if (matchPkg) {
        onLaunchApp(matchPkg);
      }
    } else if ((action.type === "trigger_payment" || action.type === "high_risk_tool") && onExecuteTool) {
      const payTool = tools.find((t) => t.id === "paymentTool") || tools[2];
      if (payTool) {
        onExecuteTool(payTool, action.payload || { amount: "49.99", currency: "USD", payee: "Apex Cloud Services" });
      }
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl h-[650px] flex flex-col backdrop-blur-md overflow-hidden shadow-xl">
      {/* Chat header */}
      <div className="px-5 py-3.5 bg-white/[0.03] border-b border-white/10 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] ${
              isNano
                ? "bg-gradient-to-br from-emerald-500 to-cyan-600"
                : "bg-gradient-to-br from-cyan-500 to-blue-600"
            }`}
          >
            {isNano ? <Cpu className="w-4 h-4 text-white" /> : <Cloud className="w-4 h-4 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">Wave Intelligence Assistant</h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-semibold ${
                  isNano
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                }`}
              >
                {isNano ? "GeminiNanoProvider (On-Device)" : "CloudAIProvider"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
              <span>Context: {notifications.length} alerts, {packages.length} apps</span>
              <span>•</span>
              <span className="font-mono text-cyan-300">{config?.latencyMs ?? 14}ms latency</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)] ${
              isNano ? "bg-emerald-400" : "bg-cyan-400"
            }`}
          />
          <span className="text-[11px] font-mono text-cyan-300">
            {isNano ? "AICore On-Device" : "Cloud Bridge Active"}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "bg-white/10 text-cyan-300 border border-white/10"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-1.5">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.3)] font-medium"
                    : "bg-white/10 text-[#e0e0e0] rounded-tl-none border border-white/10 shadow-sm backdrop-blur-md"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Embedded Action Pills */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap gap-1.5">
                    {msg.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionExecute(act)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 hover:border-cyan-400 transition-all"
                      >
                        {act.type === "copy_to_clipboard" && (
                          <>
                            {copiedText === act.payload ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-amber-400" />
                            )}
                          </>
                        )}
                        {act.type === "launch_app" && <ExternalLink className="w-3 h-3 text-cyan-400" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-gray-500 font-mono px-1">
                {msg.timestamp}
              </span>

              {/* Follow-up suggestion pills */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestedFollowUps.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-cyan-300 shrink-0">
              <Bot className="w-4 h-4 animate-pulse text-cyan-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 text-gray-300 text-xs rounded-tl-none border border-white/10 flex items-center gap-2 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px] font-mono text-cyan-300">Wave Agent reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Tool Registry Quick Action Strip */}
      {tools && tools.length > 0 && (
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-2 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-400 shrink-0 font-mono text-[10px] uppercase">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>AppModule Tools:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            {tools.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (t.id === "openAppTool") {
                    handleSendMessage("Run OpenAppTool on Slack");
                  } else if (t.id === "shareTool") {
                    handleSendMessage("Run ShareTool to export latest notification details");
                  } else if (t.id === "paymentTool") {
                    if (onExecuteTool) {
                      onExecuteTool(t, { amount: "49.99", currency: "USD", payee: "Apex Cloud Services" });
                    }
                    handleSendMessage("Execute PaymentTool (Security Wall verification)");
                  }
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all shrink-0 font-mono text-[10px]"
              >
                {t.id === "openAppTool" && <Smartphone className="w-3 h-3 text-cyan-400" />}
                {t.id === "shareTool" && <Send className="w-3 h-3 text-indigo-400" />}
                {t.id === "paymentTool" && <CreditCard className="w-3 h-3 text-emerald-400" />}
                <span>{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-3.5 bg-black/40 border-t border-white/10 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Wave Agent (e.g., 'Summarize critical alerts' or 'What is my 2FA code?')..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 backdrop-blur-md transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
