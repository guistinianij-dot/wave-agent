import {
  AndroidPackage,
  NotificationEntity,
  PermissionStatus,
  AgentTool,
  AIProviderConfig,
} from "../types";

export const INITIAL_PERMISSIONS: PermissionStatus[] = [
  {
    key: "BIND_NOTIFICATION_LISTENER_SERVICE",
    name: "Notification Intelligence Listener",
    description: "Allows Wave Agent to intercept, parse, and triage all incoming status bar notifications.",
    granted: true,
    required: true,
  },
  {
    key: "QUERY_ALL_PACKAGES",
    name: "Query All Packages",
    description: "Allows Wave Agent to inspect installed applications and trigger deep-link intents.",
    granted: true,
    required: true,
  },
  {
    key: "POST_NOTIFICATIONS",
    name: "Post Notifications",
    description: "Enables Wave Agent to send synthesized briefings, priority alerts, and action prompts.",
    granted: true,
    required: true,
  },
  {
    key: "INTERNET",
    name: "Network & AI Cloud Reasoning",
    description: "Connects Wave Agent with Gemini AI for context classification and entity extraction.",
    granted: true,
    required: true,
  },
];

export const INITIAL_PACKAGES: AndroidPackage[] = [
  {
    packageName: "com.slack.android",
    name: "Slack",
    version: "24.08.10",
    category: "work",
    iconName: "MessageSquare",
    iconBg: "bg-emerald-600",
    intentActions: ["android.intent.action.VIEW", "com.slack.intent.REPLY", "com.slack.intent.OPEN_CHANNEL"],
    unreadCount: 3,
  },
  {
    packageName: "com.google.android.gm",
    name: "Gmail",
    version: "2024.07.28",
    category: "communication",
    iconName: "Mail",
    iconBg: "bg-red-500",
    intentActions: ["android.intent.action.SENDTO", "android.intent.action.VIEW"],
    unreadCount: 12,
  },
  {
    packageName: "com.google.android.calendar",
    name: "Calendar",
    version: "2024.06.12",
    category: "productivity",
    iconName: "Calendar",
    iconBg: "bg-blue-600",
    intentActions: ["android.intent.action.INSERT", "android.intent.action.VIEW"],
    unreadCount: 1,
  },
  {
    packageName: "com.google.android.apps.maps",
    name: "Google Maps",
    version: "11.140.01",
    category: "travel",
    iconName: "MapPin",
    iconBg: "bg-teal-600",
    intentActions: ["android.intent.action.VIEW", "geo:0,0?q="],
  },
  {
    packageName: "com.chase.sig.android",
    name: "Chase Mobile",
    version: "4.89.2",
    category: "finance",
    iconName: "CreditCard",
    iconBg: "bg-sky-700",
    intentActions: ["android.intent.action.VIEW"],
    unreadCount: 1,
  },
  {
    packageName: "com.github.android",
    name: "GitHub",
    version: "1.172.0",
    category: "work",
    iconName: "GitPullRequest",
    iconBg: "bg-neutral-800",
    intentActions: ["android.intent.action.VIEW"],
    unreadCount: 2,
  },
  {
    packageName: "com.flightaware.android",
    name: "FlightTracker",
    version: "7.14.3",
    category: "travel",
    iconName: "Plane",
    iconBg: "bg-indigo-600",
    intentActions: ["android.intent.action.VIEW"],
    unreadCount: 1,
  },
  {
    packageName: "com.whatsapp",
    name: "WhatsApp",
    version: "2.24.16",
    category: "communication",
    iconName: "MessageCircle",
    iconBg: "bg-green-600",
    intentActions: ["android.intent.action.SEND", "android.intent.action.VIEW"],
    unreadCount: 4,
  },
  {
    packageName: "com.ubercab",
    name: "Uber",
    version: "4.510.1",
    category: "travel",
    iconName: "Car",
    iconBg: "bg-neutral-900",
    intentActions: ["android.intent.action.VIEW"],
  },
  {
    packageName: "so.notion.android",
    name: "Notion",
    version: "0.6.140",
    category: "productivity",
    iconName: "FileText",
    iconBg: "bg-stone-700",
    intentActions: ["android.intent.action.VIEW"],
  },
  {
    packageName: "com.android.settings",
    name: "Settings",
    version: "15.0",
    category: "system",
    iconName: "Settings",
    iconBg: "bg-slate-600",
    intentActions: ["android.settings.SETTINGS", "android.settings.NOTIFICATION_LISTENER_SETTINGS"],
    isSystemApp: true,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationEntity[] = [
  {
    id: "notif-1",
    packageName: "com.chase.sig.android",
    appName: "Chase Mobile",
    iconBg: "bg-sky-700",
    title: "Chase Security Alert: Verification Code",
    text: "Your one-time passcode is 849201 for online sign-in. Do NOT share this code with anyone.",
    subText: "Security Verification",
    postTime: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    isRead: false,
    isPinned: true,
    channelId: "security_alerts",
    rawExtras: {
      "android.title": "Chase Security Alert: Verification Code",
      "android.text": "Your one-time passcode is 849201 for online sign-in.",
      "android.appInfo": "Chase Mobile v4.89.2",
    },
    analysis: {
      urgency: 96,
      tier: "critical",
      category: "security",
      smartSummary: "Chase 2FA OTP code: 849201 (expires soon)",
      sentiment: "urgent",
      entities: {
        otp: "849201",
        sender: "Chase Security",
        deadline: "10 mins",
        amount: null,
        actionableLink: null,
      },
      suggestedActions: [
        { id: "act-copy-otp", label: "Copy OTP (849201)", type: "copy_text", payload: "849201" },
        { id: "act-open-bank", label: "Open Chase", type: "launch_app", targetPackage: "com.chase.sig.android" },
      ],
      agentInsight: "Detected high-security token. 1-tap clipboard copy activated.",
    },
  },
  {
    id: "notif-2",
    packageName: "com.slack.android",
    appName: "Slack",
    iconBg: "bg-emerald-600",
    title: "#eng-incidents • Marcus Vance",
    text: "@channel Severity-1 alert: Payment webhook gateway experiencing latency spikes. Please join the war room.",
    subText: "Acme Corp Workspace",
    postTime: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    isRead: false,
    isPinned: true,
    channelId: "high_priority_messages",
    analysis: {
      urgency: 92,
      tier: "critical",
      category: "work",
      smartSummary: "Sev-1 payment gateway incident declared by Marcus Vance",
      sentiment: "urgent",
      entities: {
        otp: null,
        sender: "Marcus Vance",
        deadline: "Immediate",
        amount: null,
        actionableLink: "slack://channel?id=eng-incidents",
      },
      suggestedActions: [
        { id: "act-slack-open", label: "Open #eng-incidents", type: "launch_app", targetPackage: "com.slack.android" },
        { id: "act-slack-ack", label: "Reply: 'Investigating now'", type: "quick_reply", targetPackage: "com.slack.android", payload: "Investigating now" },
      ],
      agentInsight: "High priority workspace alert mentions @channel and sev-1 keyword.",
    },
  },
  {
    id: "notif-3",
    packageName: "com.flightaware.android",
    appName: "FlightTracker",
    iconBg: "bg-indigo-600",
    title: "Flight UA 482 Gate Change",
    text: "Gate changed from A14 to B22. Boarding starts at 11:15 AM (in 35 mins). Terminal transfer tram recommended.",
    subText: "SFO -> JFK",
    postTime: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isRead: false,
    channelId: "travel_updates",
    analysis: {
      urgency: 84,
      tier: "high",
      category: "travel",
      smartSummary: "UA 482 moved to Gate B22. Boarding starts in 35 mins.",
      sentiment: "warning",
      entities: {
        otp: null,
        sender: "FlightTracker / United",
        deadline: "11:15 AM",
        amount: null,
        actionableLink: null,
      },
      suggestedActions: [
        { id: "act-open-maps", label: "Navigate Airport (Maps)", type: "launch_app", targetPackage: "com.google.android.apps.maps" },
        { id: "act-view-boarding", label: "View Boarding Pass", type: "launch_app", targetPackage: "com.flightaware.android" },
      ],
      agentInsight: "Gate change alert with imminent boarding deadline. Recommended route navigation.",
    },
  },
  {
    id: "notif-4",
    packageName: "com.google.android.calendar",
    appName: "Calendar",
    iconBg: "bg-blue-600",
    title: "Product Roadmap Sync in 15 mins",
    text: "11:00 AM - 11:45 AM • Conference Room 4B / Google Meet with Product Team",
    subText: "Work Calendar",
    postTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isRead: true,
    channelId: "event_reminders",
    analysis: {
      urgency: 74,
      tier: "high",
      category: "productivity",
      smartSummary: "Product Roadmap Sync begins at 11:00 AM (Room 4B)",
      sentiment: "neutral",
      entities: {
        otp: null,
        sender: "Google Calendar",
        deadline: "11:00 AM",
        amount: null,
        actionableLink: "https://meet.google.com/xyz-wave",
      },
      suggestedActions: [
        { id: "act-join-meet", label: "Join Google Meet", type: "launch_app", targetPackage: "com.google.android.calendar" },
        { id: "act-open-notes", label: "Open Sync Notes", type: "launch_app", targetPackage: "so.notion.android" },
      ],
      agentInsight: "Event scheduled to start shortly. Pre-loaded connected agenda notes.",
    },
  },
  {
    id: "notif-5",
    packageName: "com.github.android",
    appName: "GitHub",
    iconBg: "bg-neutral-800",
    title: "PR #214 approved: 'Wave Notification Listener'",
    text: "Sarah Lin approved your pull request with 2 comments: 'Architecture looks great, tests all pass!'",
    subText: "wave-agent-android",
    postTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    isRead: true,
    channelId: "code_reviews",
    analysis: {
      urgency: 55,
      tier: "normal",
      category: "work",
      smartSummary: "PR #214 approved by Sarah Lin ('tests all pass')",
      sentiment: "positive",
      entities: {
        otp: null,
        sender: "Sarah Lin",
        deadline: null,
        amount: null,
        actionableLink: null,
      },
      suggestedActions: [
        { id: "act-merge-pr", label: "View on GitHub", type: "launch_app", targetPackage: "com.github.android" },
      ],
      agentInsight: "Code review milestone reached. Ready for merge pipeline.",
    },
  },
  {
    id: "notif-6",
    packageName: "com.whatsapp",
    appName: "WhatsApp",
    iconBg: "bg-green-600",
    title: "Mom",
    text: "Don't forget Grandma's birthday call later this afternoon! Let me know when you're free ❤️",
    subText: "+1 (555) 234-8901",
    postTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    isRead: false,
    channelId: "chat_messages",
    analysis: {
      urgency: 48,
      tier: "normal",
      category: "social",
      smartSummary: "Mom: Reminder to call Grandma this afternoon",
      sentiment: "positive",
      entities: {
        otp: null,
        sender: "Mom",
        deadline: "Afternoon",
        amount: null,
        actionableLink: null,
      },
      suggestedActions: [
        { id: "act-reply-mom", label: "Reply: 'Will call around 3!'", type: "quick_reply", targetPackage: "com.whatsapp", payload: "Will call around 3!" },
        { id: "act-open-wa", label: "Open Chat", type: "launch_app", targetPackage: "com.whatsapp" },
      ],
      agentInsight: "Personal message from favorite contact.",
    },
  },
];

export const SIMULATION_TEMPLATES = [
  {
    label: "Security 2FA Code",
    app: "Chase Mobile",
    packageName: "com.chase.sig.android",
    iconBg: "bg-sky-700",
    title: "Chase Security Passcode",
    text: "Your login authentication code is 915234. Never share this code with anyone.",
    subText: "Fraud Prevention",
  },
  {
    label: "Critical Production Outage",
    app: "Slack",
    packageName: "com.slack.android",
    iconBg: "bg-emerald-600",
    title: "#incident-management • Alex Chen",
    text: "@channel CRITICAL: Database replica lag exceeded 450s. Failover in progress. All leads pinged.",
    subText: "Work Slack",
  },
  {
    label: "Flight Gate Change",
    app: "FlightTracker",
    packageName: "com.flightaware.android",
    iconBg: "bg-indigo-600",
    title: "Flight LH 455 Departure Alert",
    text: "Gate has changed to C34. Boarding starts at 14:20. Security line wait estimated at 12 mins.",
    subText: "Flight Status",
  },
  {
    label: "Urgent Meeting Overlap",
    app: "Calendar",
    packageName: "com.google.android.calendar",
    iconBg: "bg-blue-600",
    title: "Calendar Conflict Detected",
    text: "Upcoming 'Q3 Architecture Strategy' conflicts with 'Customer Escalation Call' at 2:00 PM.",
    subText: "Schedule Manager",
  },
  {
    label: "Uber Driver Arriving",
    app: "Uber",
    packageName: "com.ubercab",
    iconBg: "bg-neutral-900",
    title: "Your Driver is 2 mins away",
    text: "Prius (Black, License 7XYZ982) is pulling up to the main terminal entrance.",
    subText: "Ride Tracking",
  },
  {
    label: "Wire Transfer Confirmation",
    app: "Chase Mobile",
    packageName: "com.chase.sig.android",
    iconBg: "bg-sky-700",
    title: "Transfer Processed",
    text: "Payment of $1,250.00 to Apex Cloud Services was completed successfully.",
    subText: "Account *4192",
  },
];

export const INITIAL_AI_PROVIDER_CONFIG: AIProviderConfig = {
  activeProvider: "nano",
  sdkInt: 34,
  autoSelectionEnabled: true,
  nanoAvailable: true,
  latencyMs: 14,
  privacyTier: "100% On-Device (Zero Data Egress)",
  modelName: "Gemini Nano (Android AICore)",
  contextWindow: "4K low-power context",
  ramUsageMb: 148,
};

export const INITIAL_TOOLS: AgentTool[] = [
  {
    id: "openAppTool",
    name: "OpenAppTool",
    toolIdentifier: "open_app",
    className: "com.wave.agent.tools.OpenAppTool",
    description: "Launch an installed app",
    sensitivity: "LOW",
    intentAction: "android.intent.action.VIEW",
    category: "navigation",
    enabled: true,
    invocationsCount: 24,
    lastExecutedPayload: "Slack",
    lastExecutionTime: "2 mins ago",
    parameters: [
      {
        name: "app_name",
        type: "String",
        required: true,
        description: "Application name to match against installed app labels (e.g. Slack, Gmail, WhatsApp)",
        defaultValue: "Slack",
      },
    ],
  },
  {
    id: "shareTool",
    name: "ShareTool",
    toolIdentifier: "share_text",
    className: "com.wave.agent.tools.ShareTool",
    description: "Dispatches content, extracted verification OTPs, summaries, or messages to other apps via Android system share sheet (Intent.ACTION_SEND).",
    sensitivity: "LOW",
    intentAction: "android.intent.action.SEND",
    category: "communication",
    enabled: true,
    invocationsCount: 18,
    lastExecutedPayload: "Verification Code: 482910",
    lastExecutionTime: "8 mins ago",
    parameters: [
      {
        name: "text",
        type: "String",
        required: true,
        description: "The text content or extracted payload to share across applications",
        defaultValue: "482910",
      },
      {
        name: "targetApp",
        type: "String?",
        required: false,
        description: "Specific package name if routing directly without opening picker",
      },
      {
        name: "mimeType",
        type: "String",
        required: false,
        description: "MIME type of payload",
        defaultValue: "text/plain",
      },
    ],
  },
  {
    id: "paymentTool",
    name: "PaymentTool",
    toolIdentifier: "process_payment",
    className: "com.wave.agent.tools.PaymentTool",
    description: "Parses payment requests, initiates UPI/NFC/card payment intents, and prompts the user for biometric or one-tap transaction approval.",
    sensitivity: "HIGH",
    intentAction: "android.intent.action.PAY",
    category: "financial",
    enabled: true,
    invocationsCount: 9,
    lastExecutedPayload: "$1,250.00 to Apex Cloud Services",
    lastExecutionTime: "15 mins ago",
    parameters: [
      {
        name: "amount",
        type: "BigDecimal",
        required: true,
        description: "Transaction amount parsed from notification or agent intent",
        defaultValue: "49.99",
      },
      {
        name: "currency",
        type: "String",
        required: true,
        description: "Currency code (e.g. USD, EUR, GBP, INR)",
        defaultValue: "USD",
      },
      {
        name: "payee",
        type: "String",
        required: true,
        description: "Merchant name, invoice identifier, or payee handle",
        defaultValue: "Apex Cloud Services",
      },
      {
        name: "paymentUri",
        type: "Uri?",
        required: false,
        description: "Direct payment link or UPI URI if available",
      },
    ],
  },
];

export const KOTLIN_APP_MODULE_CODE = `@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAIProvider(nano: GeminiNanoProvider): AIProvider {
        // Automatically selects Nano if available, else Cloud
        return if (Build.VERSION.SDK_INT >= 34) nano else CloudAIProvider()
    }

    @Provides
    @Singleton
    fun provideToolRegistry(
        openAppTool: OpenAppTool,
        shareTool: ShareTool,
        paymentTool: PaymentTool
    ): List<AgentTool> {
        return listOf(openAppTool, shareTool, paymentTool)
    }
}`;

export const KOTLIN_PROVIDER_INTERFACES_CODE = `// Architecture Interfaces: AIProvider & AgentTool
package com.wave.agent.di

import android.content.Context
import android.os.Build
import com.google.ai.edge.aicore.GenerativeModel

interface AIProvider {
    val providerName: String
    val isLocal: Boolean
    val latencyExpectedMs: Int
    suspend fun analyzeNotification(notification: NotificationEntity): NotificationAnalysis
    suspend fun executeReasoning(prompt: String, tools: List<AgentTool>): AgentResponse
}

class GeminiNanoProvider @Inject constructor(
    @ApplicationContext private val context: Context
) : AIProvider {
    override val providerName = "Gemini Nano (AICore)"
    override val isLocal = true
    override val latencyExpectedMs = 12
    // Runs on-device NPU via Android AICore on API 34+
}

class CloudAIProvider @Inject constructor() : AIProvider {
    override val providerName = "CloudAIProvider (Gemini 3.8 Flash)"
    override val isLocal = false
    override val latencyExpectedMs = 320
    // Cloud fallback for API < 34 or low-RAM devices
}

interface AgentTool {
    val name: String
    val description: String
    val sensitivity: SensitivityLevel
    suspend fun execute(parameters: Map<String, Any>): ToolResult

    enum class SensitivityLevel {
        LOW,
        MEDIUM,
        HIGH
    }
}

sealed class ToolResult {
    data class Success(val message: String) : ToolResult()
    data class Error(val message: String) : ToolResult()
}
`;

export const KOTLIN_OPEN_APP_TOOL_CODE = `package com.wave.agent.tools

import android.content.Context
import android.content.Intent
import com.wave.agent.di.AgentTool
import com.wave.agent.di.ToolResult
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

class OpenAppTool @Inject constructor(
    @ApplicationContext private val context: Context
) : AgentTool {
    override val name = "open_app"
    override val description = "Launch an installed app"
    override val sensitivity = AgentTool.SensitivityLevel.LOW

    override suspend fun execute(parameters: Map<String, Any>): ToolResult {
        val appName = parameters["app_name"] as? String ?: return ToolResult.Error("Missing app name")
        val pm = context.packageManager
        
        val intent = pm.getLaunchIntentForPackage(
            pm.getInstalledApplications(0)
                .find { it.loadLabel(pm).toString().contains(appName, true) }
                ?.packageName ?: ""
        )

        return if (intent != null) {
            context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            ToolResult.Success("Launched $appName")
        } else {
            ToolResult.Error("App not found")
        }
    }
}`;

export const KOTLIN_MAIN_ACTIVITY_CODE = `@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WaveAgentTheme(darkTheme = true) {
                val viewModel: ChatViewModel = hiltViewModel()
                val uiState by viewModel.uiState.collectAsState()

                ChatScreen(
                    state = uiState,
                    onSendMessage = { text -> viewModel.handleUserRequest(text) }
                )

                // The Security Confirmation Wall
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
                }
            }
        }
    }
}`;
