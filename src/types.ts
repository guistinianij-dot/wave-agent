export type PermissionKey =
  | "QUERY_ALL_PACKAGES"
  | "INTERNET"
  | "POST_NOTIFICATIONS"
  | "BIND_NOTIFICATION_LISTENER_SERVICE";

export interface PermissionStatus {
  key: PermissionKey;
  name: string;
  description: string;
  granted: boolean;
  required: boolean;
}

export interface AndroidPackage {
  packageName: string;
  name: string;
  version: string;
  category: "work" | "communication" | "finance" | "travel" | "productivity" | "system" | "entertainment";
  iconName: string;
  iconBg: string;
  intentActions: string[];
  isSystemApp?: boolean;
  unreadCount?: number;
}

export interface NotificationEntity {
  id: string;
  packageName: string;
  appName: string;
  appIcon?: string;
  iconBg?: string;
  title: string;
  text: string;
  subText?: string;
  postTime: string; // ISO string
  isRead: boolean;
  isPinned?: boolean;
  channelId: string;
  rawExtras?: Record<string, string>;
  analysis?: NotificationAnalysis;
}

export interface NotificationAnalysis {
  urgency: number; // 1 - 100
  tier: "critical" | "high" | "normal" | "low";
  category: "work" | "security" | "finance" | "travel" | "social" | "productivity" | "system";
  smartSummary: string;
  sentiment: "neutral" | "urgent" | "positive" | "warning";
  entities: {
    otp: string | null;
    sender: string | null;
    deadline: string | null;
    amount: string | null;
    actionableLink: string | null;
  };
  suggestedActions: SuggestedAction[];
  agentInsight: string;
}

export interface SuggestedAction {
  id: string;
  label: string;
  type: "launch_app" | "copy_text" | "quick_reply" | "schedule" | "dismiss";
  targetPackage?: string;
  payload?: string;
}

export interface AgentChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  actions?: {
    type: string;
    label: string;
    payload: any;
  }[];
  suggestedFollowUps?: string[];
  isStreaming?: boolean;
}

export interface DailyBriefing {
  headline: string;
  criticalItems: string[];
  insights: string[];
  noiseFilteredCount: number;
}

export type AIProviderType = "nano" | "cloud";

export interface AIProviderConfig {
  activeProvider: AIProviderType;
  sdkInt: number;
  autoSelectionEnabled: boolean;
  nanoAvailable: boolean;
  latencyMs: number;
  privacyTier: string;
  modelName: string;
  contextWindow: string;
  ramUsageMb: number;
}

export interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

export interface AgentTool {
  id: "openAppTool" | "shareTool" | "paymentTool" | string;
  name: string;
  toolIdentifier?: string; // e.g. "open_app"
  className: string;
  description: string;
  sensitivity?: "LOW" | "MEDIUM" | "HIGH"; // AgentTool.SensitivityLevel.LOW
  intentAction: string;
  category: "navigation" | "communication" | "financial";
  parameters: ToolParameter[];
  enabled: boolean;
  invocationsCount: number;
  lastExecutedPayload?: string;
  lastExecutionTime?: string;
}

export interface ToolExecutionResult {
  toolId: string;
  toolName: string;
  status: "success" | "pending" | "failed" | "cancelled";
  resultType?: "ToolResult.Success" | "ToolResult.Error";
  resultMessage?: string;
  intentUri?: string;
  actionTaken: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface PendingAction {
  id: string;
  title: string;
  description: string;
  toolId?: string;
  toolName?: string;
  params?: Record<string, any>;
  riskLevel: "HIGH" | "CRITICAL";
  targetPackage?: string;
  timestamp: string;
  actionSummary?: string;
}

export interface ConfirmationUiState {
  isVisible: boolean;
  title: string;
  description: string;
  pendingAction?: PendingAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}
