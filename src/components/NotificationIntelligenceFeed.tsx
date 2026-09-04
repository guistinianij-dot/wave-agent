import React, { useState, useMemo } from "react";
import {
  NotificationEntity,
  SuggestedAction,
  DailyBriefing,
} from "../types";
import { AppIcon } from "./AppIcon";
import {
  ShieldAlert,
  Clock,
  KeyRound,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Sparkles,
  SlidersHorizontal,
  Search,
  Pin,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface NotificationIntelligenceFeedProps {
  notifications: NotificationEntity[];
  onDismiss: (id: string) => void;
  onToggleRead: (id: string) => void;
  onTogglePin: (id: string) => void;
  onActionClick: (action: SuggestedAction, notification: NotificationEntity) => void;
  onClearAll: () => void;
  onRequestBriefing: () => void;
  briefing: DailyBriefing | null;
  isGeneratingBriefing: boolean;
}

export const NotificationIntelligenceFeed: React.FC<NotificationIntelligenceFeedProps> = ({
  notifications,
  onDismiss,
  onToggleRead,
  onTogglePin,
  onActionClick,
  onClearAll,
  onRequestBriefing,
  briefing,
  isGeneratingBriefing,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "critical" | "high" | "normal">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedExtrasId, setExpandedExtrasId] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Category filter
      if (selectedCategory !== "all" && notif.analysis?.category !== selectedCategory) {
        return false;
      }
      // Urgency filter
      if (urgencyFilter === "critical" && notif.analysis?.tier !== "critical") return false;
      if (urgencyFilter === "high" && notif.analysis?.tier !== "critical" && notif.analysis?.tier !== "high") return false;
      if (urgencyFilter === "normal" && notif.analysis?.tier !== "normal" && notif.analysis?.tier !== "low") return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(query);
        const matchesText = notif.text.toLowerCase().includes(query);
        const matchesApp = notif.appName.toLowerCase().includes(query);
        const matchesOtp = notif.analysis?.entities?.otp?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesText && !matchesApp && !matchesOtp) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, selectedCategory, urgencyFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const critical = notifications.filter((n) => n.analysis?.tier === "critical").length;
    const otps = notifications.filter((n) => !!n.analysis?.entities?.otp).length;
    const unread = notifications.filter((n) => !n.isRead).length;
    return { total, critical, otps, unread };
  }, [notifications]);

  const categories = [
    { id: "all", label: "All Alerts" },
    { id: "security", label: "Security & 2FA" },
    { id: "work", label: "Work & Incident" },
    { id: "finance", label: "Banking" },
    { id: "travel", label: "Travel & Transit" },
    { id: "productivity", label: "Calendar & Tasks" },
    { id: "social", label: "Messages" },
  ];

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-cyan-500/40 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Intercepted</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">Stream listener active</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-rose-500/40 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-rose-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Critical / Urgent</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{stats.critical}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">Immediate triage required</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-amber-500/40 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">OTP Tokens</span>
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats.otps}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">1-tap clipboard ready</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-cyan-500/40 hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between text-cyan-400 text-xs mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Unread Queue</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.unread}</div>
          <div className="text-[11px] text-gray-500 font-mono mt-0.5">Pending user resolution</div>
        </div>
      </div>

      {/* Immersive Intelligence Core & Executive Briefing */}
      {briefing ? (
        <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Holographic Radar Core Visual */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-pulse"></div>
              <div className="absolute w-24 h-24 bg-blue-500/10 rounded-full border border-blue-500/30 blur-sm"></div>
              <div className="absolute w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <div className="w-6 h-6 bg-cyan-400 rounded-full blur-[10px] opacity-60"></div>
                <Sparkles className="w-6 h-6 text-cyan-300 relative z-10" />
              </div>
            </div>

            {/* Briefing Text and Analysis */}
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest font-semibold">
                  <span>Wave Intelligence Core Briefing</span>
                </div>
                <button
                  onClick={onRequestBriefing}
                  disabled={isGeneratingBriefing}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white border border-white/10 transition-colors"
                >
                  {isGeneratingBriefing ? "Synthesizing..." : "Re-synthesize"}
                </button>
              </div>

              <h3 className="text-base font-semibold text-white tracking-tight">{briefing.headline}</h3>

              {briefing.criticalItems && briefing.criticalItems.length > 0 && (
                <div className="space-y-1.5">
                  {briefing.criticalItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-rose-300 bg-rose-950/20 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {briefing.insights && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {briefing.insights.map((insight, idx) => (
                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                      {insight}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-white/5 via-white/[0.03] to-transparent border border-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-white">Wave Intelligence Core</div>
              <div className="text-[11px] text-gray-400">Synthesize an AI executive summary across all active notification streams.</div>
            </div>
          </div>
          <button
            onClick={onRequestBriefing}
            disabled={isGeneratingBriefing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs text-white font-semibold shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-400/30 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{isGeneratingBriefing ? "Synthesizing..." : "Generate Briefing"}</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications, apps, OTPs..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 backdrop-blur-md transition-colors"
          />
        </div>

        {/* Urgency and Clear buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 text-xs backdrop-blur-md">
            <button
              onClick={() => setUrgencyFilter("all")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                urgencyFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-semibold"
                  : "text-gray-400 hover:text-gray-200 border border-transparent"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setUrgencyFilter("critical")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                urgencyFilter === "critical"
                  ? "bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                  : "text-gray-400 hover:text-gray-200 border border-transparent"
              }`}
            >
              Critical (85+)
            </button>
            <button
              onClick={() => setUrgencyFilter("high")}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                urgencyFilter === "high"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                  : "text-gray-400 hover:text-gray-200 border border-transparent"
              }`}
            >
              High (70+)
            </button>
          </div>

          <button
            onClick={onClearAll}
            className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-rose-400 text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors"
            title="Clear all non-pinned notifications"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold"
                : "bg-white/5 text-gray-400 hover:text-gray-200 border border-white/10 hover:border-white/20"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-gray-400 backdrop-blur-md">
            <CheckCircle2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No matching notifications in queue</p>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Use "Simulate Notification" above to test incoming Android alerts.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isCritical = notif.analysis?.tier === "critical";
            const isHigh = notif.analysis?.tier === "high";
            const otpCode = notif.analysis?.entities?.otp;
            const isExtrasExpanded = expandedExtrasId === notif.id;

            return (
              <div
                key={notif.id}
                className={`group relative bg-white/5 rounded-2xl border backdrop-blur-md transition-all duration-200 p-5 ${
                  isCritical
                    ? "border-rose-500/40 border-l-4 border-l-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500/60"
                    : isHigh
                    ? "border-amber-500/30 border-l-4 border-l-amber-500 hover:border-amber-500/50"
                    : !notif.isRead
                    ? "border-white/10 border-l-4 border-l-cyan-500/70 hover:border-white/20"
                    : "border-white/5 border-l-4 border-l-white/15 hover:border-white/15"
                } ${notif.isRead ? "opacity-75" : "opacity-100"}`}
              >
                {/* Header row: App info, timestamp, urgency badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                        notif.iconBg || "bg-cyan-600"
                      }`}
                    >
                      <AppIcon name={notif.appName} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {notif.appName}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400/80">
                          {notif.packageName}
                        </span>
                        {notif.subText && (
                          <span className="text-[10px] text-gray-400 hidden sm:inline">
                            • {notif.subText}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {formatRelativeTime(notif.postTime)}
                      </span>
                    </div>
                  </div>

                  {/* Urgency & Pin controls */}
                  <div className="flex items-center gap-2">
                    {notif.analysis && (
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold ${
                          isCritical
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]"
                            : isHigh
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-white/10 text-cyan-300 border border-white/10"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold">Urgency</span>
                        <span>{notif.analysis.urgency}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onTogglePin(notif.id)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        notif.isPinned
                          ? "text-cyan-400 bg-cyan-500/20 border border-cyan-500/40"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/10"
                      }`}
                      title={notif.isPinned ? "Unpin notification" : "Pin notification"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDismiss(notif.id)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                      title="Dismiss from listener"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content: Title & Text */}
                <div className="mt-3">
                  <h4 className="text-sm font-semibold text-white tracking-tight">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">
                    {notif.text}
                  </p>
                </div>

                {/* Smart AI Summary Pill */}
                {notif.analysis?.smartSummary && (
                  <div className="mt-3 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-gray-300 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-cyan-300 text-[11px] uppercase tracking-wider font-mono">AI Triage:</span>
                    <span className="text-xs text-gray-200 truncate">
                      {notif.analysis.smartSummary}
                    </span>
                  </div>
                )}

                {/* Special OTP Extraction Banner */}
                {otpCode && (
                  <div className="mt-3 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span className="text-gray-300 font-medium">Verification Code:</span>
                      <span className="font-mono text-amber-300 font-bold tracking-widest text-sm bg-black/60 px-2.5 py-0.5 rounded-lg border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        {otpCode}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyOtp(otpCode)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition-colors border border-amber-500/40 shadow-sm"
                    >
                      {copiedOtp === otpCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Suggested Intent Action Buttons */}
                {notif.analysis?.suggestedActions && notif.analysis.suggestedActions.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2.5 border-t border-white/10">
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider font-bold">Agent Actions:</span>
                    {notif.analysis.suggestedActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => onActionClick(action, notif)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white border border-white/10 transition-all hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                      >
                        {action.type === "launch_app" && <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />}
                        {action.type === "quick_reply" && <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />}
                        {action.type === "copy_text" && <Copy className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Expandable Android Platform Extras */}
                <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px] text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px]">Channel: {notif.channelId}</span>
                    <span>•</span>
                    <button
                      onClick={() => onToggleRead(notif.id)}
                      className="hover:text-cyan-300 transition-colors"
                    >
                      {notif.isRead ? "Mark Unread" : "Mark Read"}
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedExtrasId(isExtrasExpanded ? null : notif.id)}
                    className="flex items-center gap-1 hover:text-cyan-300 transition-colors font-mono text-[10px]"
                  >
                    <span>NotificationExtras</span>
                    {isExtrasExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {isExtrasExpanded && (
                  <div className="mt-2.5 p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[10px] text-gray-400 space-y-1 backdrop-blur-md">
                    <div>android.package: <span className="text-cyan-300">{notif.packageName}</span></div>
                    <div>android.postTime: {notif.postTime}</div>
                    <div>android.channelId: {notif.channelId}</div>
                    <div>android.listener: WaveNotificationListener</div>
                    <div>android.urgencyScore: <span className="text-cyan-300">{notif.analysis?.urgency}</span></div>
                    <div>android.category: {notif.analysis?.category}</div>
                    {notif.rawExtras &&
                      Object.entries(notif.rawExtras).map(([key, value]) => (
                        <div key={key}>
                          {key}: <span className="text-gray-300">{value}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
