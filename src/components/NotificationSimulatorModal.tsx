import React, { useState } from "react";
import { AndroidPackage, NotificationEntity } from "../types";
import { SIMULATION_TEMPLATES } from "../data/mockData";
import { AppIcon } from "./AppIcon";
import {
  X,
  PlusCircle,
  Zap,
  Sparkles,
  CheckCircle2,
  Radio,
} from "lucide-react";

interface NotificationSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: AndroidPackage[];
  onSimulate: (notifData: {
    packageName: string;
    appName: string;
    title: string;
    text: string;
    subText?: string;
  }) => Promise<void>;
}

export const NotificationSimulatorModal: React.FC<NotificationSimulatorModalProps> = ({
  isOpen,
  onClose,
  packages,
  onSimulate,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<AndroidPackage>(packages[0]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [subText, setSubText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: typeof SIMULATION_TEMPLATES[0]) => {
    const pkg = packages.find((p) => p.packageName === template.packageName) || packages[0];
    setSelectedPackage(pkg);
    setTitle(template.title);
    setText(template.text);
    setSubText(template.subText || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSimulate({
        packageName: selectedPackage.packageName,
        appName: selectedPackage.name,
        title,
        text,
        subText: subText || selectedPackage.name,
      });
      onClose();
      // Reset
      setTitle("");
      setText("");
      setSubText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#02040a]/95 border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-xl">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                Simulate Android Notification
              </h3>
              <p className="text-xs text-gray-400">
                Test WaveNotificationListener triage and Gemini AI parsing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2 tracking-wide uppercase font-mono text-[10px]">
              Preset Scenarios (1-click autofill)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SIMULATION_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="p-3 text-left rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all group backdrop-blur-md"
                >
                  <div className="text-[11px] font-semibold text-gray-200 group-hover:text-cyan-300 truncate">
                    {tpl.label}
                  </div>
                  <div className="text-[10px] text-cyan-400/80 truncate mt-0.5 font-mono">{tpl.app}</div>
                </button>
              ))}
            </div>
          </div>

          <form id="simulate-form" onSubmit={handleSubmit} className="space-y-4">
            {/* App selection */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2 tracking-wide uppercase font-mono text-[10px]">
                Posting Application (Package)
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {packages.map((pkg) => (
                  <button
                    key={pkg.packageName}
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs whitespace-nowrap transition-all ${
                      selectedPackage.packageName === pkg.packageName
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                        : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-200"
                    }`}
                  >
                    <AppIcon name={pkg.name} className="w-3.5 h-3.5" />
                    <span>{pkg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Title */}
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1.5">
                Notification Title <span className="text-[10px] font-mono text-cyan-400">(android.title)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Security Passcode or Urgent Slack"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
              />
            </div>

            {/* Notification Text */}
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1.5">
                Notification Body <span className="text-[10px] font-mono text-cyan-400">(android.text)</span>
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., Your one-time verification code is 482910..."
                rows={3}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-xs text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Subtext */}
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1.5">
                Subtext / Channel <span className="text-[10px] font-mono text-cyan-400">(android.subText)</span>
              </label>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="e.g., Security Alerts or #general"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#e0e0e0] placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
              />
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="simulate-form"
            disabled={isSubmitting || !title.trim() || !text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Triaging with AI..." : "Dispatch Notification"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
