import React, { useState } from "react";
import { AndroidPackage, NotificationEntity } from "../types";
import { AppIcon } from "./AppIcon";
import {
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Bell,
  Sliders,
  CheckCircle2,
  Plus,
  Play,
} from "lucide-react";

interface AppEcosystemManagerProps {
  packages: AndroidPackage[];
  notifications: NotificationEntity[];
  onLaunchApp: (pkg: AndroidPackage) => void;
  onAddPackage?: (newPkg: AndroidPackage) => void;
}

export const AppEcosystemManager: React.FC<AppEcosystemManagerProps> = ({
  packages,
  notifications,
  onLaunchApp,
  onAddPackage,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPackage, setSelectedPackage] = useState<AndroidPackage | null>(null);
  const [intentLog, setIntentLog] = useState<string | null>(null);

  const filteredPackages = packages.filter((pkg) => {
    if (selectedCategory !== "all" && pkg.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(q) ||
        pkg.packageName.toLowerCase().includes(q) ||
        pkg.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTriggerIntent = (pkg: AndroidPackage, action: string) => {
    setIntentLog(`Dispatched Android Intent: action=${action}, package=${pkg.packageName}`);
    onLaunchApp(pkg);
    setTimeout(() => setIntentLog(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner explaining QUERY_ALL_PACKAGES permission */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-white tracking-tight">
                Package Ecosystem & Intent Resolver
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                QUERY_ALL_PACKAGES
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Wave Agent indexes {packages.length} installed Android packages for cross-app automation and proactive deep-linking.
            </p>
          </div>
        </div>
      </div>

      {intentLog && (
        <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-mono flex items-center gap-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{intentLog}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages by name, bundle ID..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 backdrop-blur-md transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {["all", "work", "communication", "finance", "travel", "productivity", "system"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                    : "bg-white/5 text-gray-400 hover:text-gray-200 border border-white/10 hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredPackages.map((pkg) => {
          const appNotifs = notifications.filter((n) => n.packageName === pkg.packageName);
          const unreadNotifs = appNotifs.filter((n) => !n.isRead).length;

          return (
            <div
              key={pkg.packageName}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/40 hover:bg-white/[0.07] transition-all backdrop-blur-md group shadow-sm"
            >
              <div>
                {/* App header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                        pkg.iconBg || "bg-cyan-600"
                      }`}
                    >
                      <AppIcon name={pkg.name} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {pkg.name}
                      </h4>
                      <p className="text-[10px] font-mono text-cyan-400/80 truncate max-w-[180px]">
                        {pkg.packageName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/10 text-gray-300 border border-white/10 capitalize">
                    {pkg.category}
                  </span>
                </div>

                {/* Package metadata */}
                <div className="mt-3.5 pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                  <div>
                    <span className="text-gray-500">Version: </span>
                    <span className="font-mono text-cyan-200">{pkg.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Alerts in stream: </span>
                    <span className="font-semibold text-white">{appNotifs.length}</span>
                    {unreadNotifs > 0 && (
                      <span className="ml-1 text-rose-400 font-mono">({unreadNotifs} unread)</span>
                    )}
                  </div>
                </div>

                {/* Intent actions */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider font-bold">Exported Intent Actions:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.intentActions.slice(0, 2).map((act, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-black/50 text-gray-400 border border-white/10 truncate max-w-[160px]"
                      >
                        {act}
                      </span>
                    ))}
                    {pkg.intentActions.length > 2 && (
                      <span className="text-[9px] text-cyan-400 font-mono px-1.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        +{pkg.intentActions.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleTriggerIntent(pkg, pkg.intentActions[0] || "android.intent.action.VIEW")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all border border-white/10 hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Launch Intent</span>
                </button>

                <button
                  onClick={() => onLaunchApp(pkg)}
                  className="p-2 rounded-xl text-gray-400 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                  title="Open simulated screen"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
