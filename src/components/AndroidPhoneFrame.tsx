import React, { useState, useEffect } from "react";
import {
  AndroidPackage,
  NotificationEntity,
  SuggestedAction,
} from "../types";
import { AppIcon } from "./AppIcon";
import {
  Wifi,
  Battery,
  ChevronDown,
  ArrowLeft,
  Search,
  MessageSquare,
  KeyRound,
  Sparkles,
  ExternalLink,
  Check,
  Copy,
  Layers,
  Volume2,
  Moon,
  Bluetooth,
  Shield,
  Zap,
} from "lucide-react";

interface AndroidPhoneFrameProps {
  notifications: NotificationEntity[];
  packages: AndroidPackage[];
  onActionClick: (action: SuggestedAction, notification: NotificationEntity) => void;
  onDismissNotification: (id: string) => void;
  listenerActive: boolean;
  onToggleListener: () => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  notifications,
  packages,
  onActionClick,
  onDismissNotification,
  listenerActive,
  onToggleListener,
}) => {
  const [screenMode, setScreenMode] = useState<"lockscreen" | "homescreen" | "shade" | "in_app">("homescreen");
  const [activeApp, setActiveApp] = useState<AndroidPackage | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("10:42");
  const [currentDate, setCurrentDate] = useState<string>("Friday, Sep 4");
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
      setCurrentDate(now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLaunchApp = (pkg: AndroidPackage) => {
    setActiveApp(pkg);
    setScreenMode("in_app");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(code);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  // Find most critical active notification
  const topCriticalNotif = notifications.find((n) => n.analysis?.tier === "critical") || notifications[0];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Phone Hardware Shell */}
      <div className="relative w-full max-w-[360px] h-[720px] bg-[#02040a] rounded-[52px] p-3.5 shadow-[0_0_50px_rgba(6,182,212,0.25)] border-2 border-white/10 ring-1 ring-cyan-500/20 flex flex-col select-none overflow-hidden">
        
        {/* Device Screen Area */}
        <div className="relative w-full h-full bg-[#030712] rounded-[42px] overflow-hidden flex flex-col text-[#e0e0e0] font-sans border border-white/5">
          
          {/* Status Bar */}
          <div
            onClick={() => setScreenMode(screenMode === "shade" ? "homescreen" : "shade")}
            className="h-9 px-6 flex items-center justify-between text-xs text-gray-400 z-30 cursor-pointer hover:bg-white/5 transition-colors"
          >
            {/* Left: Time + Notification Icons */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight text-white">{currentTime}</span>
              <div className="flex items-center gap-1.5 ml-1">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="w-3.5 h-3.5 opacity-80">
                    <AppIcon name={n.appName} className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                ))}
                {notifications.length > 3 && (
                  <span className="text-[9px] text-cyan-400 font-mono">+{notifications.length - 3}</span>
                )}
              </div>
            </div>

            {/* Center: Dynamic Camera Punchhole */}
            <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center border border-white/5">
              <div className="w-2 h-2 rounded-full bg-neutral-900" />
            </div>

            {/* Right: Icons & Battery */}
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-[10px] font-mono font-medium text-cyan-400">5G</span>
              <Battery className="w-4 h-4 text-gray-300" />
            </div>
          </div>

          {/* ================= SCREEN VIEW MODES ================= */}

          {/* 1. LOCKSCREEN MODE */}
          {screenMode === "lockscreen" && (
            <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
              <div className="text-center mt-6">
                <div className="text-5xl font-extralight tracking-tight text-white">{currentTime}</div>
                <div className="text-xs text-neutral-400 mt-1">{currentDate}</div>
              </div>

              {/* Ambient Notification Cards */}
              <div className="space-y-2.5 my-auto max-h-[380px] overflow-y-auto no-scrollbar">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setScreenMode("shade");
                    }}
                    className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-2xl backdrop-blur-md cursor-pointer hover:border-neutral-700 transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${notif.iconBg || "bg-neutral-800"}`}>
                          <AppIcon name={notif.appName} className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="font-semibold text-neutral-300">{notif.appName}</span>
                      </div>
                      {notif.analysis?.tier === "critical" && (
                        <span className="text-[10px] text-rose-400 font-mono bg-rose-950/60 px-1.5 py-0.5 rounded">
                          Urgent {notif.analysis.urgency}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-neutral-200 truncate">{notif.title}</div>
                    <div className="text-[11px] text-neutral-400 line-clamp-1">{notif.text}</div>
                  </div>
                ))}
              </div>

              <div className="text-center pb-2">
                <button
                  onClick={() => setScreenMode("homescreen")}
                  className="text-xs text-neutral-400 hover:text-white px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800"
                >
                  Swipe up to unlock
                </button>
              </div>
            </div>
          )}

          {/* 2. HOMESCREEN MODE */}
          {screenMode === "homescreen" && (
            <div className="flex-1 flex flex-col justify-between p-4 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 overflow-y-auto">
              {/* Wave Agent Proactive Ambient Widget */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 border border-neutral-700/60 shadow-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <Zap className="w-4 h-4" />
                      <span>Wave Agent</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {listenerActive ? "Listening" : "Paused"}
                    </span>
                  </div>

                  {topCriticalNotif ? (
                    <div className="bg-black/40 rounded-xl p-2.5 border border-neutral-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400 font-medium">
                          {topCriticalNotif.appName}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          Priority {topCriticalNotif.analysis?.urgency || "90"}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-200 mt-0.5 line-clamp-1">
                        {topCriticalNotif.title}
                      </div>

                      {topCriticalNotif.analysis?.entities?.otp && (
                        <div className="mt-1.5 flex items-center justify-between bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/30">
                          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold">
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>{topCriticalNotif.analysis.entities.otp}</span>
                          </div>
                          <button
                            onClick={() => handleCopyCode(topCriticalNotif.analysis!.entities.otp!)}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium"
                          >
                            {copiedOtp === topCriticalNotif.analysis.entities.otp ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400">All notifications triaged. Inbox zero.</p>
                  )}
                </div>

                {/* Installed Apps Grid (QUERY_ALL_PACKAGES) */}
                <div>
                  <div className="text-[11px] font-medium text-neutral-400 px-1 mb-2">
                    Installed Apps (QUERY_ALL_PACKAGES)
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    {packages.slice(0, 8).map((pkg) => (
                      <button
                        key={pkg.packageName}
                        onClick={() => handleLaunchApp(pkg)}
                        className="group flex flex-col items-center gap-1 p-1 hover:bg-neutral-800/40 rounded-xl transition-colors"
                      >
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                              pkg.iconBg || "bg-neutral-700"
                            } group-hover:scale-105 transition-transform`}
                          >
                            <AppIcon name={pkg.name} className="w-6 h-6" />
                          </div>
                          {pkg.unreadCount && pkg.unreadCount > 0 ? (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-neutral-900">
                              {pkg.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-neutral-300 font-medium truncate w-14">
                          {pkg.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Dock */}
              <div className="mt-auto pt-4">
                <div className="p-2.5 rounded-3xl bg-neutral-900/90 border border-neutral-800/80 flex items-center justify-around shadow-lg">
                  {packages.slice(0, 4).map((pkg) => (
                    <button
                      key={`dock-${pkg.packageName}`}
                      onClick={() => handleLaunchApp(pkg)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
                        pkg.iconBg || "bg-neutral-700"
                      } hover:scale-105 transition-transform`}
                    >
                      <AppIcon name={pkg.name} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. NOTIFICATION SHADE (PULL-DOWN) */}
          {screenMode === "shade" && (
            <div className="flex-1 flex flex-col bg-neutral-950/95 backdrop-blur-xl p-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-200">{currentTime}</span>
                  <span className="text-neutral-500">• {currentDate}</span>
                </div>
                <button
                  onClick={() => setScreenMode("homescreen")}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Settings Tiles */}
              <div className="grid grid-cols-4 gap-2 py-3 border-b border-neutral-800/80 text-center">
                <button
                  onClick={onToggleListener}
                  className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    listenerActive ? "bg-cyan-600 text-white" : "bg-neutral-900 text-neutral-400"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Wave AI</span>
                </button>
                <div className="p-2.5 rounded-2xl bg-cyan-600 text-white flex flex-col items-center gap-1">
                  <Wifi className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Wi-Fi</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-neutral-900 text-neutral-400 flex flex-col items-center gap-1">
                  <Bluetooth className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Bluetooth</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-neutral-900 text-neutral-400 flex flex-col items-center gap-1">
                  <Moon className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Do Not Disturb</span>
                </div>
              </div>

              {/* Notifications in shade */}
              <div className="flex-1 py-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                  <span>Wave Notification Listener</span>
                  <span className="text-[10px] font-mono">{notifications.length} active</span>
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-xs">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${n.iconBg || "bg-neutral-800"}`}>
                            <AppIcon name={n.appName} className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="font-semibold text-neutral-300">{n.appName}</span>
                        </div>
                        <button
                          onClick={() => onDismissNotification(n.id)}
                          className="text-neutral-500 hover:text-rose-400 text-[10px]"
                        >
                          Dismiss
                        </button>
                      </div>
                      <div className="text-xs font-medium text-neutral-100">{n.title}</div>
                      <div className="text-[11px] text-neutral-400">{n.text}</div>

                      {n.analysis?.suggestedActions && n.analysis.suggestedActions.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1.5">
                          {n.analysis.suggestedActions.map((act) => (
                            <button
                              key={act.id}
                              onClick={() => onActionClick(act, n)}
                              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-cyan-300 border border-neutral-700"
                            >
                              {act.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. IN-APP SIMULATOR (Launched via QUERY_ALL_PACKAGES intent) */}
          {screenMode === "in_app" && activeApp && (
            <div className="flex-1 flex flex-col bg-neutral-950">
              {/* App Titlebar */}
              <div className="h-12 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScreenMode("homescreen")}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-white ${activeApp.iconBg}`}>
                    <AppIcon name={activeApp.name} className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-100">{activeApp.name}</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[120px]">
                  {activeApp.packageName}
                </span>
              </div>

              {/* In-app Mock Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
                  <div className="text-cyan-400 font-medium">Intent Resolved Successfully</div>
                  <div className="text-neutral-400 text-[11px]">
                    Package launched through <span className="font-mono text-neutral-300">QUERY_ALL_PACKAGES</span> permission.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-neutral-300">Supported Intent Filters:</div>
                  <div className="flex flex-wrap gap-1">
                    {activeApp.intentActions.map((intent, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {intent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notifications for this app */}
                <div className="pt-2">
                  <div className="text-xs font-medium text-neutral-300 mb-2">
                    Active Notifications for {activeApp.name}:
                  </div>
                  {notifications.filter((n) => n.packageName === activeApp.packageName).length === 0 ? (
                    <p className="text-xs text-neutral-500">No active alerts for this app.</p>
                  ) : (
                    notifications
                      .filter((n) => n.packageName === activeApp.packageName)
                      .map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs mb-2">
                          <div className="font-medium text-neutral-200">{n.title}</div>
                          <div className="text-neutral-400 text-[11px] mt-0.5">{n.text}</div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Android Navigation Pill */}
          <div className="h-6 bg-neutral-950 flex items-center justify-center">
            <button
              onClick={() => setScreenMode("homescreen")}
              className="w-24 h-1 rounded-full bg-neutral-600 hover:bg-neutral-400 transition-colors"
              title="Home navigation gesture"
            />
          </div>
        </div>
      </div>

      {/* Screen Mode Quick Controls beneath the phone */}
      <div className="mt-4 flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl text-xs backdrop-blur-md shadow-lg">
        <button
          onClick={() => setScreenMode("homescreen")}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            screenMode === "homescreen"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setScreenMode("shade")}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            screenMode === "shade"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Shade
        </button>
        <button
          onClick={() => setScreenMode("lockscreen")}
          className={`px-3.5 py-1.5 rounded-xl transition-all ${
            screenMode === "lockscreen"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
              : "text-gray-400 hover:text-gray-200 border border-transparent"
          }`}
        >
          Lockscreen
        </button>
      </div>
    </div>
  );
};
