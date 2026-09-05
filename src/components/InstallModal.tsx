import React, { useState, useEffect } from "react";
import {
  Download,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  X,
  Package,
  Key,
  Cpu,
  Layers,
  ShieldCheck,
  Terminal,
  HelpCircle,
  Share2
} from "lucide-react";

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"pwa" | "apk">("pwa");

  const [showChromeGuide, setShowChromeGuide] = useState(false);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const installUrl = currentOrigin;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(installUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowChromeGuide(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b101b] border border-cyan-500/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Install Wave Agent</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Deploy
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Install as a mobile app directly to your phone or build a native Android APK.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-white/10 flex gap-2">
          <button
            onClick={() => setActiveTab("pwa")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "pwa"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1-Click App Install (PWA / Mobile)</span>
          </button>

          <button
            onClick={() => setActiveTab("apk")}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "apk"
                ? "border-indigo-400 text-indigo-300"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Native Android APK Build Checklist</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === "pwa" ? (
            <div className="space-y-5">
              {/* Direct Link Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <label className="text-[11px] font-semibold text-gray-300 flex items-center justify-between">
                  <span>Your App Installation Link</span>
                  <span className="text-cyan-400 text-[10px] font-mono">HTTPS Standalone Mode</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={installUrl}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-cyan-200 font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all border border-white/10 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                  <a
                    href={installUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition-all shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Install Action Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-blue-950/20 to-indigo-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Direct Home Screen Installation</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      PWA Manifest v1.0
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-1">
                    Installs as a standalone full-screen Android app without browser URL bars.
                  </p>
                </div>

                <button
                  onClick={handleInstallPWA}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Install to Phone</span>
                </button>
              </div>

              {showChromeGuide && (
                <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-400/50 flex items-start gap-3 animate-fadeIn">
                  <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-cyan-200">How to add Wave Agent to your home screen:</div>
                    <p className="text-cyan-100/90 leading-relaxed">
                      Tap the <strong>three dots menu (⋮)</strong> in Chrome at the top right of your screen, then select <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Mobile Install Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Android Chrome</span>
                  </div>
                  <ol className="list-decimal list-inside text-gray-300 space-y-1 text-[11px] leading-relaxed">
                    <li>Open the link above in Chrome on your phone</li>
                    <li>Tap the <strong>3 dots (Menu)</strong> in top right</li>
                    <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong></li>
                    <li>The Wave Agent icon will appear on your app drawer!</li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>iOS Safari / Desktop</span>
                  </div>
                  <ol className="list-decimal list-inside text-gray-300 space-y-1 text-[11px] leading-relaxed">
                    <li>Open link in Safari (iOS) or Chrome/Edge (Desktop)</li>
                    <li>On iOS: Tap <strong>Share</strong> &gt; <strong>&quot;Add to Home Screen&quot;</strong></li>
                    <li>On Desktop: Click the <strong>Install icon</strong> in address bar</li>
                    <li>Launches with native dark window styling!</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 leading-relaxed text-xs">
                To compile the standalone <strong>Native Android APK / AAB</strong> via Android Studio or Gradle, here are the details needed before running the build:
              </div>

              {/* Required Details Checklist */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-cyan-300 font-bold flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-400" />
                      1. Application ID / Package Name
                    </span>
                    <span className="text-gray-400 text-[10px]">Default: com.wave.agent</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    Do you want to keep <code className="text-cyan-300 font-mono">com.wave.agent</code> or do you have a specific domain/bundle name (e.g. <code className="text-white font-mono">com.yourcompany.waveagent</code>)?
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-amber-300 font-bold flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      2. Build Type &amp; Signing Keystore
                    </span>
                    <span className="text-gray-400 text-[10px]">Debug vs Release</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    Are you building a <strong>Debug APK</strong> (auto-signed, instant testing) or a signed <strong>Production Release APK / AAB</strong> for Google Play (requires your Keystore file, alias, and key password)?
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-emerald-300 font-bold flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      3. Minimum &amp; Target Android SDK
                    </span>
                    <span className="text-gray-400 text-[10px]">Min SDK 26 / Target SDK 34</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    Default is <code className="text-white font-mono">minSdkVersion = 26</code> (Android 8.0 Oreo) and <code className="text-white font-mono">targetSdkVersion = 34</code> (Android 14). If using Gemini Nano On-Device inference, Android 14+ with AICore is required.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-indigo-300 font-bold flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      4. Cloud Gemini API Key
                    </span>
                    <span className="text-gray-400 text-[10px]">Optional Fallback</span>
                  </div>
                  <p className="text-gray-300 text-[11px]">
                    For devices where Gemini Nano AICore is not present, CloudAIProvider connects to the Gemini API.
                  </p>
                </div>
              </div>

              {/* Build Command Box */}
              <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
                <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
                  <span>How to export &amp; build:</span>
                  <span className="text-cyan-400">Settings &gt; Export to GitHub / ZIP</span>
                </div>
                <pre className="text-cyan-300 font-mono text-[11px] bg-white/5 p-3 rounded-lg overflow-x-auto">
{`# In your exported Android Studio project:
./gradlew assembleDebug      # Generates debug APK in app/build/outputs/apk/debug/
./gradlew bundleRelease      # Generates Play Store bundle (AAB)`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted HTTPS &bull; Wave Agent Mobile Runtime</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
