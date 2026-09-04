import React, { useState } from "react";
import {
  Cpu,
  Sparkles,
  Cloud,
  Layers,
  Code2,
  CheckCircle2,
  XCircle,
  Play,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Sliders,
  Smartphone,
  Send,
  CreditCard,
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  Server,
  Lock,
} from "lucide-react";
import {
  AgentTool,
  AIProviderConfig,
  AndroidPackage,
  ToolExecutionResult,
} from "../types";
import {
  KOTLIN_APP_MODULE_CODE,
  KOTLIN_PROVIDER_INTERFACES_CODE,
  KOTLIN_MAIN_ACTIVITY_CODE,
  KOTLIN_OPEN_APP_TOOL_CODE,
} from "../data/mockData";

interface AppModuleInspectorProps {
  config: AIProviderConfig;
  onChangeConfig: (newConfig: AIProviderConfig) => void;
  tools: AgentTool[];
  onExecuteTool: (tool: AgentTool, params: Record<string, any>) => void;
  packages: AndroidPackage[];
  lastToolResult: ToolExecutionResult | null;
}

export const AppModuleInspector: React.FC<AppModuleInspectorProps> = ({
  config,
  onChangeConfig,
  tools,
  onExecuteTool,
  packages,
  lastToolResult,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<"openAppTool" | "mainActivity" | "appModule" | "interfaces">("openAppTool");
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState<string>("openAppTool");

  // Custom tool runner state
  const [appNameInput, setAppNameInput] = useState<string>("Slack");
  const [openAppPackage, setOpenAppPackage] = useState<string>("com.slack.android");
  const [shareText, setShareText] = useState<string>("Wave Agent: OTP Code 482910");
  const [shareTarget, setShareTarget] = useState<string>("System Share Sheet");
  const [paymentAmount, setPaymentAmount] = useState<string>("49.99");
  const [paymentPayee, setPaymentPayee] = useState<string>("Apex Cloud Services");
  const [paymentCurrency, setPaymentCurrency] = useState<string>("USD");

  const isNanoActive = config.activeProvider === "nano";

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSdkChange = (sdk: number) => {
    const isNano = sdk >= 34;
    onChangeConfig({
      ...config,
      sdkInt: sdk,
      activeProvider: isNano ? "nano" : "cloud",
      latencyMs: isNano ? 14 : 320,
      privacyTier: isNano
        ? "100% On-Device (Zero Data Egress)"
        : "End-to-End Cloud Ingress",
      modelName: isNano ? "Gemini Nano (Android AICore)" : "Gemini 3.8 Flash (Cloud)",
    });
  };

  const handleToggleAutoSelection = () => {
    const nextAuto = !config.autoSelectionEnabled;
    const isNano = nextAuto ? config.sdkInt >= 34 : config.activeProvider === "nano";
    onChangeConfig({
      ...config,
      autoSelectionEnabled: nextAuto,
      activeProvider: isNano ? "nano" : "cloud",
      latencyMs: isNano ? 14 : 320,
      modelName: isNano ? "Gemini Nano (Android AICore)" : "Gemini 3.8 Flash (Cloud)",
    });
  };

  const handleManualProviderToggle = (provider: "nano" | "cloud") => {
    onChangeConfig({
      ...config,
      autoSelectionEnabled: false,
      activeProvider: provider,
      latencyMs: provider === "nano" ? 14 : 320,
      privacyTier:
        provider === "nano"
          ? "100% On-Device (Zero Data Egress)"
          : "End-to-End Cloud Ingress",
      modelName:
        provider === "nano"
          ? "Gemini Nano (Android AICore)"
          : "Gemini 3.8 Flash (Cloud)",
    });
  };

  const handleRunActiveTool = () => {
    const tool = tools.find((t) => t.id === selectedToolId);
    if (!tool) return;

    if (tool.id === "openAppTool") {
      onExecuteTool(tool, { app_name: appNameInput });
    } else if (tool.id === "shareTool") {
      onExecuteTool(tool, { text: shareText, targetApp: shareTarget });
    } else if (tool.id === "paymentTool") {
      onExecuteTool(tool, {
        amount: paymentAmount,
        currency: paymentCurrency,
        payee: paymentPayee,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_25px_rgba(6,182,212,0.45)] shrink-0 mt-0.5">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Hilt Dependency Injection: <code className="text-cyan-300 font-mono text-base">AppModule</code>
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                @InstallIn(SingletonComponent::class)
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1.5 max-w-2xl leading-relaxed">
              Provides the dynamic <code className="text-cyan-300 font-mono">AIProvider</code> contract (selecting on-device{" "}
              <strong className="text-white">Gemini Nano</strong> on API 34+ vs fallback <strong className="text-white">CloudAIProvider</strong>) and registers the singleton <strong className="text-white">AgentTool</strong> registry.
            </p>
          </div>
        </div>

        {/* Live Active Provider Badge */}
        <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-3 px-4 shrink-0 backdrop-blur-md">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              isNanoActive
                ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"
                : "bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] animate-pulse"
            }`}
          />
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              Active Injected Provider
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              {isNanoActive ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>GeminiNanoProvider</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CloudAIProvider</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Provider Selector & Telemetry vs Architecture Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dynamic Provider Resolver (Build.VERSION.SDK_INT simulation) */}
        <div className="lg:col-span-6 space-y-6">
          {/* SDK Selection & DI Decision Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Dynamic Provider Selection Logic
                </h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                fun provideAIProvider(nano: GeminiNanoProvider): AIProvider
              </span>
            </div>

            {/* Code Logic Expression */}
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-300 leading-relaxed">
              <span className="text-cyan-400 font-semibold">return if</span> (Build.VERSION.SDK_INT &gt;= <span className="text-emerald-300 font-bold">34</span>){" "}
              <span className="text-emerald-400 font-semibold">nano</span>{" "}
              <span className="text-cyan-400 font-semibold">else</span>{" "}
              <span className="text-blue-400 font-semibold">CloudAIProvider()</span>
            </div>

            {/* Interactive SDK Slider / Quick Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">Device Target API Level (Build.VERSION.SDK_INT):</span>
                <span className="font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/10">
                  API {config.sdkInt} {config.sdkInt >= 35 ? "(Android 15)" : config.sdkInt === 34 ? "(Android 14)" : "(Android 13 / Legacy)"}
                </span>
              </div>

              {/* API Level Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sdk: 35, label: "API 35 (Android 15)", provider: "nano", sub: "AICore Native" },
                  { sdk: 34, label: "API 34 (Android 14)", provider: "nano", sub: "AICore Gemini Nano" },
                  { sdk: 33, label: "API 33 (Android 13)", provider: "cloud", sub: "Cloud Fallback" },
                ].map((item) => (
                  <button
                    key={item.sdk}
                    onClick={() => handleSdkChange(item.sdk)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.sdkInt === item.sdk
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] font-mono text-cyan-300/80 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Override vs Automatic Resolution */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAutoSelection}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold border transition-all ${
                    config.autoSelectionEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-white/5 text-gray-400 border-white/10"
                  }`}
                >
                  Auto-Resolve: {config.autoSelectionEnabled ? "ACTIVE (API 34 Rule)" : "MANUAL OVERRIDE"}
                </button>
              </div>

              {!config.autoSelectionEnabled && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleManualProviderToggle("nano")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      config.activeProvider === "nano"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}
                  >
                    Force Nano
                  </button>
                  <button
                    onClick={() => handleManualProviderToggle("cloud")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                      config.activeProvider === "cloud"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}
                  >
                    Force Cloud
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Provider Comparison Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* GeminiNanoProvider Card */}
            <div
              className={`p-4 rounded-2xl border transition-all backdrop-blur-md ${
                isNanoActive
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">GeminiNanoProvider</h4>
                    <span className="text-[10px] font-mono text-emerald-400">Android AICore</span>
                  </div>
                </div>
                {isNanoActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="mt-3.5 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Latency:</span>
                  <span className="font-mono text-emerald-300 font-bold">~14ms (NPU)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Privacy Egress:</span>
                  <span className="font-mono text-emerald-300 font-bold">0% (100% Local)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Offline Functionality:</span>
                  <span className="font-mono text-white">Full / Airplane mode</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cloud Tokens:</span>
                  <span className="font-mono text-gray-300">0 (Zero quota used)</span>
                </div>
              </div>
            </div>

            {/* CloudAIProvider Card */}
            <div
              className={`p-4 rounded-2xl border transition-all backdrop-blur-md ${
                !isNanoActive
                  ? "bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">CloudAIProvider</h4>
                    <span className="text-[10px] font-mono text-cyan-400">Gemini 3.8 Flash</span>
                  </div>
                </div>
                {!isNanoActive && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="mt-3.5 space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Latency:</span>
                  <span className="font-mono text-cyan-300 font-bold">~320ms (Cloud roundtrip)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Reasoning Depth:</span>
                  <span className="font-mono text-cyan-300 font-bold">Deep Multimodal Flash</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Context Window:</span>
                  <span className="font-mono text-white">1M+ tokens</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Target Compatibility:</span>
                  <span className="font-mono text-gray-300">All Android versions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Kotlin Source Code & Hilt Registry */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#030712] border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md flex flex-col h-full">
            {/* Code Tabs Header */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between overflow-x-auto gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveCodeTab("openAppTool")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                    activeCodeTab === "openAppTool"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OpenAppTool.kt</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-sans font-semibold">
                    LOW
                  </span>
                </button>
                <button
                  onClick={() => setActiveCodeTab("mainActivity")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                    activeCodeTab === "mainActivity"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>MainActivity.kt</span>
                </button>
                <button
                  onClick={() => setActiveCodeTab("appModule")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                    activeCodeTab === "appModule"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>AppModule.kt</span>
                </button>
                <button
                  onClick={() => setActiveCodeTab("interfaces")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                    activeCodeTab === "interfaces"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>AIProvider.kt</span>
                </button>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    activeCodeTab === "openAppTool"
                      ? KOTLIN_OPEN_APP_TOOL_CODE
                      : activeCodeTab === "mainActivity"
                      ? KOTLIN_MAIN_ACTIVITY_CODE
                      : activeCodeTab === "appModule"
                      ? KOTLIN_APP_MODULE_CODE
                      : KOTLIN_PROVIDER_INTERFACES_CODE
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 hover:text-white transition-all border border-white/10 shrink-0"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Preformatted Block */}
            <div className="p-4 flex-1 overflow-x-auto font-mono text-xs leading-relaxed text-gray-300 selection:bg-cyan-500/30">
              {activeCodeTab === "openAppTool" ? (
                <div className="space-y-1">
                  <div className="text-gray-400 font-mono text-[11px]">// com.wave.agent.tools.OpenAppTool.kt</div>
                  <div className="text-white font-semibold">
                    <span className="text-cyan-400">class</span> OpenAppTool <span className="text-rose-400 font-bold">@Inject constructor</span>(
                  </div>
                  <div className="pl-4 text-gray-300">
                    <span className="text-amber-300">@ApplicationContext</span> <span className="text-cyan-400">private val</span> context: Context
                  </div>
                  <div className="text-white font-semibold">) : <span className="text-indigo-300">AgentTool</span> {"{"}</div>
                  <div className="pl-4 space-y-1">
                    <div className="text-gray-300">
                      <span className="text-cyan-400">override val</span> name = <span className="text-emerald-300">&quot;open_app&quot;</span>
                    </div>
                    <div className="text-gray-300">
                      <span className="text-cyan-400">override val</span> description = <span className="text-emerald-300">&quot;Launch an installed app&quot;</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">override val</span>
                      <span className="text-gray-300">sensitivity = AgentTool.SensitivityLevel.</span>
                      <span className="text-emerald-300 font-bold">LOW</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                        Bypasses Security Wall
                      </span>
                    </div>
                    <div className="py-1" />
                    <div className="text-white font-semibold">
                      <span className="text-rose-400 font-bold">override suspend fun</span> <span className="text-amber-300">execute</span>(parameters: Map&lt;String, Any&gt;): <span className="text-cyan-300">ToolResult</span> {"{"}
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="text-gray-300">
                        <span className="text-cyan-400">val</span> appName = parameters[<span className="text-emerald-300">&quot;app_name&quot;</span>] <span className="text-cyan-400">as?</span> String
                      </div>
                      <div className="pl-4 text-rose-300">
                        ?: <span className="text-rose-400 font-bold">return</span> ToolResult.Error(<span className="text-emerald-300">&quot;Missing app name&quot;</span>)
                      </div>
                      <div className="text-gray-300">
                        <span className="text-cyan-400">val</span> pm = context.packageManager
                      </div>
                      <div className="py-1" />
                      <div className="text-gray-400">// Search installed apps by matching label</div>
                      <div className="text-gray-300">
                        <span className="text-cyan-400">val</span> intent = pm.getLaunchIntentForPackage(
                      </div>
                      <div className="pl-4 text-gray-300">
                        pm.getInstalledApplications(<span className="text-amber-300">0</span>)
                      </div>
                      <div className="pl-8 text-cyan-300">
                        .find {"{ it.loadLabel(pm).toString().contains(appName, true) }"}
                      </div>
                      <div className="pl-8 text-cyan-300">
                        ?.packageName ?: <span className="text-emerald-300">&quot;&quot;</span>
                      </div>
                      <div className="text-gray-300">)</div>
                      <div className="py-1" />
                      <div className="text-amber-300 font-semibold">
                        <span className="text-rose-400 font-bold">return if</span> (intent != null) {"{"}
                      </div>
                      <div className="pl-4 text-emerald-300">
                        context.startActivity(intent.addFlags(Intent.<span className="text-amber-300">FLAG_ACTIVITY_NEW_TASK</span>))
                      </div>
                      <div className="pl-4 text-emerald-400 font-bold">
                        ToolResult.Success(<span className="text-emerald-300">&quot;Launched $appName&quot;</span>)
                      </div>
                      <div className="text-amber-300 font-semibold">{"}"} <span className="text-rose-400 font-bold">else</span> {"{"}</div>
                      <div className="pl-4 text-rose-400 font-bold">
                        ToolResult.Error(<span className="text-emerald-300">&quot;App not found&quot;</span>)
                      </div>
                      <div className="text-amber-300 font-semibold">{"}"}</div>
                    </div>
                    <div className="text-white font-semibold">{"}"}</div>
                  </div>
                  <div className="text-white font-semibold">{"}"}</div>
                </div>
              ) : activeCodeTab === "mainActivity" ? (
                <div className="space-y-1">
                  <div className="text-rose-400 font-bold">@AndroidEntryPoint</div>
                  <div className="text-white font-semibold">class MainActivity : ComponentActivity() {"{"}</div>
                  <div className="pl-4">
                    <div className="text-cyan-400 font-semibold">override fun onCreate(savedInstanceState: Bundle?) {"{"}</div>
                    <div className="pl-4">
                      <div className="text-gray-400">super.onCreate(savedInstanceState)</div>
                      <div className="text-amber-300 font-semibold">setContent {"{"}</div>
                      <div className="pl-4">
                        <div className="text-indigo-300 font-semibold">WaveAgentTheme(darkTheme = true) {"{"}</div>
                        <div className="pl-4">
                          <div className="text-gray-300">val viewModel: ChatViewModel = hiltViewModel()</div>
                          <div className="text-gray-300">val uiState by viewModel.uiState.collectAsState()</div>
                          <div className="py-1" />
                          <div className="text-cyan-300">ChatScreen(</div>
                          <div className="pl-4 text-gray-300">state = uiState,</div>
                          <div className="pl-4 text-gray-300">onSendMessage = {"{ text -> viewModel.handleUserRequest(text) }"}</div>
                          <div className="text-cyan-300">)</div>
                          <div className="py-1" />
                          <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                            <div className="text-rose-400 font-bold">// The Security Confirmation Wall</div>
                            <div className="text-white font-bold">if (uiState.pendingAction != null) {"{"}</div>
                            <div className="pl-4 text-amber-300">ConfirmationOverlay(</div>
                            <div className="pl-8 text-gray-300">state = ConfirmationUiState(</div>
                            <div className="pl-12 text-emerald-300">isVisible = true,</div>
                            <div className="pl-12 text-rose-300">title = &quot;High Risk Action&quot;,</div>
                            <div className="pl-12 text-cyan-300">description = uiState.pendingAction!!.description,</div>
                            <div className="pl-12 text-amber-300">onConfirm = {"{ viewModel.confirmAction() }"},</div>
                            <div className="pl-12 text-gray-300">onCancel = {"{ viewModel.cancelAction() }"}</div>
                            <div className="pl-8 text-gray-300">)</div>
                            <div className="pl-4 text-amber-300">)</div>
                            <div className="text-white font-bold">{"}"}</div>
                          </div>
                        </div>
                        <div className="text-indigo-300 font-semibold">{"}"}</div>
                      </div>
                      <div className="text-amber-300 font-semibold">{"}"}</div>
                    </div>
                    <div className="text-cyan-400 font-semibold">{"}"}</div>
                  </div>
                  <div className="text-white font-semibold">{"}"}</div>
                </div>
              ) : activeCodeTab === "appModule" ? (
                <div className="space-y-1">
                  <div className="text-cyan-400/90 font-bold">@Module</div>
                  <div className="text-cyan-400/90 font-bold">@InstallIn(SingletonComponent::class)</div>
                  <div className="text-white font-semibold">object AppModule {"{"}</div>
                  <div className="pl-4">
                    <div className="text-cyan-400 font-bold">@Provides</div>
                    <div className="text-cyan-400 font-bold">@Singleton</div>
                    <div className="text-amber-300 font-semibold">
                      fun provideAIProvider(nano: GeminiNanoProvider): AIProvider {"{"}
                    </div>
                    <div className="pl-4 text-gray-400 italic">
                      // Automatically selects Nano if available, else Cloud
                    </div>
                    <div className="pl-4 text-emerald-300">
                      return if (Build.VERSION.SDK_INT &gt;= 34) nano else CloudAIProvider()
                    </div>
                    <div className="text-amber-300">{"}"}</div>
                  </div>
                  <div className="pl-4 pt-2">
                    <div className="text-cyan-400 font-bold">@Provides</div>
                    <div className="text-cyan-400 font-bold">@Singleton</div>
                    <div className="text-amber-300 font-semibold">
                      fun provideToolRegistry(
                    </div>
                    <div className="pl-6 text-gray-300">openAppTool: OpenAppTool,</div>
                    <div className="pl-6 text-gray-300">shareTool: ShareTool,</div>
                    <div className="pl-6 text-gray-300">paymentTool: PaymentTool</div>
                    <div className="pl-4 text-amber-300 font-semibold">): List&lt;AgentTool&gt; {"{"}</div>
                    <div className="pl-6 text-cyan-300 font-semibold">
                      return listOf(openAppTool, shareTool, paymentTool)
                    </div>
                    <div className="pl-4 text-amber-300">{"}"}</div>
                  </div>
                  <div className="text-white font-semibold">{"}"}</div>
                </div>
              ) : (
                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                  {KOTLIN_PROVIDER_INTERFACES_CODE}
                </pre>
              )}
            </div>

            {/* Architecture Annotation Footnote */}
            <div className="p-3 px-4 bg-white/[0.02] border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Compile-time safety &amp; lazy singleton resolution</span>
              </span>
              <span className="font-mono text-cyan-400 text-[10px]">Hilt v2.52 / AndroidX</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Registry Section: provideToolRegistry */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Injected Tool Registry (<code className="text-cyan-300 font-mono">List&lt;AgentTool&gt;</code>)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {tools.length} Tools Registered
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Injected by <code className="text-cyan-300 font-mono">AppModule.provideToolRegistry</code> to empower Wave Agent cross-app execution.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-cyan-400 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            @Inject constructor(private val toolRegistry: List&lt;AgentTool&gt;)
          </div>
        </div>

        {/* 3 Injected Tools Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const isSelected = selectedToolId === tool.id;
            return (
              <div
                key={tool.id}
                onClick={() => setSelectedToolId(tool.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-md flex flex-col justify-between ${
                  isSelected
                    ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${
                          tool.id === "openAppTool"
                            ? "bg-cyan-600"
                            : tool.id === "shareTool"
                            ? "bg-indigo-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        {tool.id === "openAppTool" && <Smartphone className="w-4 h-4" />}
                        {tool.id === "shareTool" && <Send className="w-4 h-4" />}
                        {tool.id === "paymentTool" && <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white tracking-tight">{tool.name}</h4>
                          {tool.toolIdentifier && (
                            <span className="text-[10px] font-mono text-cyan-300">
                              (&quot;{tool.toolIdentifier}&quot;)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{tool.intentAction}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/10 text-cyan-300">
                        {tool.category}
                      </span>
                      {tool.sensitivity && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            tool.sensitivity === "LOW"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-300 border-rose-500/30 font-bold"
                          }`}
                        >
                          {tool.sensitivity === "LOW" ? "LOW SENSITIVITY" : "HIGH SENSITIVITY"}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 mt-3 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Tool Parameters Breakdown */}
                  <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                      Parameters ({tool.parameters.length})
                    </div>
                    <div className="space-y-1">
                      {tool.parameters.map((param, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-cyan-300">{param.name}: <span className="text-gray-400">{param.type}</span></span>
                          {param.required && (
                            <span className="text-rose-400 font-semibold">required</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-mono text-[10px]">
                    Invocations: <strong className="text-white">{tool.invocationsCount}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedToolId(tool.id);
                    }}
                    className={`flex items-center gap-1 font-semibold text-[11px] ${
                      isSelected ? "text-cyan-300" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>Configure &amp; Run</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Tool Execution Sandbox */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                Interactive Tool Execution Sandbox:{" "}
                <span className="text-cyan-300">
                  {tools.find((t) => t.id === selectedToolId)?.name}
                </span>
              </h4>
            </div>

            <span className="text-[10px] font-mono text-gray-400">
              Dispatches Android Intent via Wave Agent Bridge
            </span>
          </div>

          {/* Form controls based on selected tool */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedToolId === "openAppTool" && (
              <>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-gray-300 font-mono flex items-center gap-1.5">
                      <span>App Name Parameter (<code className="text-cyan-300">app_name: String</code>)</span>
                      <span className="text-[10px] text-rose-400 font-bold">*required</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">
                      Label search: <code className="text-cyan-400">contains(appName, true)</code>
                    </span>
                  </div>

                  <input
                    type="text"
                    value={appNameInput}
                    onChange={(e) => setAppNameInput(e.target.value)}
                    placeholder="Enter installed app name (e.g. Slack, Gmail, WhatsApp)..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />

                  {/* Preset Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-mono mr-1">Quick Test:</span>
                    {["Slack", "Gmail", "WhatsApp", "Apex Banking"].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setAppNameInput(name)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono transition-all ${
                          appNameInput.toLowerCase() === name.toLowerCase()
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            : "bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAppNameInput("NonExistentApp")}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono transition-all ${
                        appNameInput === "NonExistentApp"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-white/5 text-amber-300/80 border-white/10 hover:border-amber-400/30"
                      }`}
                      title="Test ToolResult.Error('App not found')"
                    >
                      NonExistentApp (404)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppNameInput("")}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono transition-all ${
                        appNameInput === ""
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-white/5 text-rose-300/80 border-white/10 hover:border-rose-400/30"
                      }`}
                      title="Test ToolResult.Error('Missing app name')"
                    >
                      [Empty] (Missing)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-gray-300 block font-mono">
                    PackageManager Resolution Preview
                  </label>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 text-[11px] font-mono">
                    {(() => {
                      if (!appNameInput.trim()) {
                        return (
                          <div className="text-rose-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>ToolResult.Error(&quot;Missing app name&quot;)</span>
                          </div>
                        );
                      }
                      const match = packages.find(
                        (p) =>
                          p.name.toLowerCase().includes(appNameInput.toLowerCase()) ||
                          p.packageName.toLowerCase().includes(appNameInput.toLowerCase())
                      );
                      if (match) {
                        return (
                          <div>
                            <div className="text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Matched: {match.name}</span>
                            </div>
                            <div className="text-gray-400 text-[10px] mt-0.5 truncate">
                              Package: {match.packageName}
                            </div>
                            <div className="text-cyan-400 text-[10px]">
                              Flags: FLAG_ACTIVITY_NEW_TASK
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div className="text-amber-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>ToolResult.Error(&quot;App not found&quot;)</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sensitivity: LOW (Direct execution, no wall)</span>
                  </div>
                </div>
              </>
            )}

            {selectedToolId === "shareTool" && (
              <>
                <div className="md:col-span-2">
                  <label className="text-[11px] text-gray-300 block mb-1 font-mono">
                    Share Text / Payload (text)
                  </label>
                  <input
                    type="text"
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-mono">
                    Target App (targetApp)
                  </label>
                  <select
                    value={shareTarget}
                    onChange={(e) => setShareTarget(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="System Share Sheet" className="bg-neutral-900">System Share Sheet (Picker)</option>
                    <option value="com.slack.android" className="bg-neutral-900">Slack</option>
                    <option value="com.google.android.gm" className="bg-neutral-900">Gmail</option>
                    <option value="Clipboard" className="bg-neutral-900">System Clipboard</option>
                  </select>
                </div>
              </>
            )}

            {selectedToolId === "paymentTool" && (
              <>
                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-mono">
                    Amount (amount)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-mono">
                    Currency (currency)
                  </label>
                  <select
                    value={paymentCurrency}
                    onChange={(e) => setPaymentCurrency(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="USD" className="bg-neutral-900">USD ($)</option>
                    <option value="EUR" className="bg-neutral-900">EUR (€)</option>
                    <option value="GBP" className="bg-neutral-900">GBP (£)</option>
                    <option value="INR" className="bg-neutral-900">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-300 block mb-1 font-mono">
                    Payee / Merchant (payee)
                  </label>
                  <input
                    type="text"
                    value={paymentPayee}
                    onChange={(e) => setPaymentPayee(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </>
            )}
          </div>

          {selectedToolId === "paymentTool" && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold text-white">Security Wall Protection:</span> Executing{" "}
                <code className="font-mono text-rose-300">PaymentTool</code> will trigger{" "}
                <strong className="text-amber-300">ConfirmationOverlay</strong> per{" "}
                <code className="font-mono text-cyan-300">MainActivity.kt</code> requirements.
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-gray-400">
              Invoking with provider:{" "}
              <strong className="text-cyan-300 font-mono">
                {isNanoActive ? "GeminiNanoProvider" : "CloudAIProvider"}
              </strong>
            </div>

            <button
              onClick={handleRunActiveTool}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-[0.98] ${
                selectedToolId === "paymentTool"
                  ? "bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] border border-rose-400/40"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/30"
              }`}
            >
              {selectedToolId === "paymentTool" ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Execute PaymentTool (Security Wall)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Execute {tools.find((t) => t.id === selectedToolId)?.name}</span>
                </>
              )}
            </button>
          </div>

          {/* Last Execution Result Banner */}
          {lastToolResult && (
            <div
              className={`mt-3 p-3.5 rounded-xl font-mono text-xs flex items-start gap-3 animate-fadeIn border ${
                lastToolResult.status === "failed" || lastToolResult.resultType === "ToolResult.Error"
                  ? "bg-rose-950/30 border-rose-500/40 text-rose-200"
                  : "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
              }`}
            >
              {lastToolResult.status === "failed" || lastToolResult.resultType === "ToolResult.Error" ? (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 w-full">
                <div className="font-bold text-white flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span>{lastToolResult.toolName}</span>
                    {lastToolResult.resultType ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono border font-semibold ${
                          lastToolResult.resultType === "ToolResult.Success"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {lastToolResult.resultType}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-gray-300">
                        {lastToolResult.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">{lastToolResult.timestamp}</span>
                </div>
                <div className="text-gray-200 text-[11px] font-sans font-medium">{lastToolResult.actionTaken}</div>
                {lastToolResult.intentUri && (
                  <div className="text-[11px] text-cyan-300 bg-black/40 p-2 rounded-lg border border-white/5 break-all">
                    {lastToolResult.intentUri}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
