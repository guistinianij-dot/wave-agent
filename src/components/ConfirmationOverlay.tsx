import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Fingerprint,
  X,
  Check,
  CreditCard,
  Send,
  Smartphone,
  Code2,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ConfirmationUiState } from "../types";

interface ConfirmationOverlayProps {
  state: ConfirmationUiState;
}

export const ConfirmationOverlay: React.FC<ConfirmationOverlayProps> = ({ state }) => {
  const [showComposeCode, setShowComposeCode] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  if (!state.isVisible) return null;

  const action = state.pendingAction;
  const isPayment = action?.toolId === "paymentTool" || action?.title?.toLowerCase().includes("pay");
  const isShare = action?.toolId === "shareTool" || action?.title?.toLowerCase().includes("share");
  const isOpenApp = action?.toolId === "openAppTool";

  const handleConfirm = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      state.onConfirm();
    }, 450);
  };

  return (
    <div
      id="security-confirmation-wall"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-wall-title"
    >
      <div className="bg-[#030712] border border-rose-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(244,63,94,0.35)] flex flex-col relative transition-all">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 animate-pulse" />

        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-white/10 bg-rose-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.4)] shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="security-wall-title"
                  className="text-lg font-bold text-white tracking-tight flex items-center gap-2"
                >
                  {state.title || "High Risk Action"}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold uppercase tracking-wider">
                  SECURITY WALL
                </span>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5 font-mono">
                Jetpack Compose: ConfirmationOverlay(uiState.pendingAction)
              </p>
            </div>
          </div>

          <button
            onClick={state.onCancel}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Cancel and abort"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Action Description */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Action Request</span>
            </div>
            <p className="text-sm text-gray-100 font-medium leading-relaxed">
              {state.description}
            </p>
          </div>

          {/* Action Context Card */}
          {action && (
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-gray-400 flex items-center gap-1.5">
                  {isPayment && <CreditCard className="w-3.5 h-3.5 text-emerald-400" />}
                  {isShare && <Send className="w-3.5 h-3.5 text-indigo-400" />}
                  {isOpenApp && <Smartphone className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>Tool Invocation:</span>
                </span>
                <span className="text-cyan-300 font-bold">
                  {action.toolName || action.toolId || "AgentAction"}
                </span>
              </div>

              {action.params && Object.keys(action.params).length > 0 && (
                <div className="space-y-1.5">
                  {Object.entries(action.params).map(([key, val]) => (
                    <div key={key} className="flex items-start justify-between gap-3 text-[11px]">
                      <span className="text-gray-400">{key}:</span>
                      <span className="text-white font-semibold text-right break-all">
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-gray-400">
                <span>Security Clearance Level:</span>
                <span className="text-rose-400 font-bold">BIOMETRIC USER MANDATE</span>
              </div>
            </div>
          )}

          {/* Biometric Clearance Notice */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <Fingerprint className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="leading-relaxed">
              Wave Agent cannot execute high-risk automated intents without explicit user biometric or interactive clearance.
            </div>
          </div>

          {/* Jetpack Compose Architecture Code Dropdown */}
          <div className="border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setShowComposeCode(!showComposeCode)}
              className="flex items-center justify-between w-full text-[11px] font-mono text-gray-400 hover:text-cyan-300 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>View MainActivity.kt Security Wall Code</span>
              </span>
              {showComposeCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showComposeCode && (
              <div className="mt-2.5 p-3 rounded-xl bg-black/80 border border-white/10 font-mono text-[11px] text-cyan-200/90 overflow-x-auto leading-relaxed">
                <pre>{`// The Security Confirmation Wall
if (uiState.pendingAction != null) {
    ConfirmationOverlay(
        state = ConfirmationUiState(
            isVisible = true,
            title = "High Risk Action",
            description = uiState.pendingAction!!.description,
            onConfirm = { viewModel.confirmAction() },
            onCancel = { viewModel.cancelAction() }
        )
    )
}`}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={state.onCancel}
            disabled={isAuthorizing}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
          >
            Cancel Action
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isAuthorizing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-xs font-semibold text-white transition-all shadow-[0_0_25px_rgba(244,63,94,0.45)] border border-rose-400/40 active:scale-[0.98] disabled:opacity-50"
          >
            {isAuthorizing ? (
              <>
                <Lock className="w-4 h-4 animate-spin text-white" />
                <span>Authorizing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Confirm &amp; Authorize</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
