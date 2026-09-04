import React from "react";
import {
  Bell,
  Cpu,
  Layers,
  Sparkles,
  Smartphone,
  PlusCircle,
  ShieldCheck,
  Zap,
  Code2,
  Download,
} from "lucide-react";
import { PermissionStatus, AIProviderConfig } from "../types";

export type ActiveTab = "intelligence" | "device" | "packages" | "agent" | "permissions" | "architecture";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount: number;
  criticalCount: number;
  permissions: PermissionStatus[];
  onOpenSimulator: () => void;
  onOpenInstallModal: () => void;
  aiConfig?: AIProviderConfig;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
  criticalCount,
  permissions,
  onOpenSimulator,
  onOpenInstallModal,
  aiConfig,
}) => {
  const listenerGranted = permissions.find(
    (p) => p.key === "BIND_NOTIFICATION_LISTENER_SERVICE"
  )?.granted;

  const isNano = aiConfig?.activeProvider === "nano";

  return (
    <header className="sticky top-0 z-40 bg-[#02040a]/85 backdrop-blur-xl border-b border-white/10 text-[#e0e0e0] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Service Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0">
              <Zap className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight">
                  WAVE AGENT
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-400 border border-cyan-500/20">
                  v2.4.0
                </span>
              </div>
              <p className="text-[11px] text-cyan-400 font-mono uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${listenerGranted ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
                <span>Core Intelligence Service</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm"
              title="Install Wave Agent App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-semibold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto w-full md:w-auto bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("intelligence")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "intelligence"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Notification Triage</span>
            {unreadCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  criticalCount > 0
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-white/10 text-neutral-300"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("device")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "device"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>Android Device</span>
          </button>

          <button
            onClick={() => setActiveTab("packages")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "packages"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>App Ecosystem</span>
          </button>

          <button
            onClick={() => setActiveTab("agent")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "agent"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Wave AI Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "permissions"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manifest & Perms</span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === "architecture"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>AppModule &amp; Tools</span>
            {aiConfig && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                  isNano
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                }`}
              >
                {isNano ? "Nano" : "Cloud"}
              </span>
            )}
          </button>
        </div>

        {/* Right side: Diagnostics Telemetry & Simulation Action */}
        <div className="hidden md:flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-4 text-right">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">AI Engine</span>
              <span
                className={`text-xs flex items-center gap-1.5 font-mono ${
                  isNano ? "text-emerald-400" : "text-cyan-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    isNano ? "bg-emerald-400" : "bg-cyan-400"
                  }`}
                ></span>
                {isNano ? "NANO (ON-DEVICE)" : "CLOUD FLASH"}
              </span>
            </div>
            <div className="h-7 w-[1px] bg-white/10"></div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Inference Latency</span>
              <span className="text-xs font-mono text-cyan-300">
                {aiConfig ? `${aiConfig.latencyMs}ms` : "14ms"}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Install Wave Agent to phone or build APK"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install App</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>Simulate Notification</span>
          </button>
        </div>
      </div>
    </header>
  );
};
