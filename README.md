# Wave Agent 🌊📱

**Wave Agent** is an Android notification intelligence service, AI agent runtime, and cross-app assistant featuring on-device Gemini Nano inference with Cloud AI fallback, Hilt dependency injection, and a biometric Security Confirmation Wall.

---

## 🌟 Key Architecture & Capabilities

### 1. 🛡️ The Security Confirmation Wall (`MainActivity.kt`)
High-risk actions (such as financial transactions via `PaymentTool`) are gated by a biometric `ConfirmationOverlay` barrier. Tools declare their sensitivity level:
- **`SensitivityLevel.LOW`** (e.g. `OpenAppTool`, `ShareTool`): Executes directly without interruption.
- **`SensitivityLevel.HIGH`** (e.g. `PaymentTool`): Triggers the security confirmation wall requiring explicit user approval before execution.

```kotlin
// In MainActivity.kt
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
```

### 2. 🧩 Injected Tool Registry (`OpenAppTool.kt`)
Cross-app capabilities are provided as modular `AgentTool` instances injected via Hilt `@InstallIn(SingletonComponent::class)`:
- **`OpenAppTool`**: Resolves installed app labels using Android's `packageManager.getLaunchIntentForPackage` and dispatches `FLAG_ACTIVITY_NEW_TASK`.
- **`ShareTool`**: Broadcasts content via Android's System Share Sheet or specific target intents.
- **`PaymentTool`**: Handles merchant transactions guarded by the Security Wall.

```kotlin
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
}
```

### 3. ⚡ Dynamic AI Provider Switching (`AppModule.kt`)
- **Android 14+ (SDK >= 34)**: Automatically binds `GeminiNanoProvider` for low-latency on-device processing via Android AICore.
- **Legacy Devices**: Seamlessly falls back to `CloudAIProvider` with encrypted cloud synchronization.

---

## 🚀 Getting Started

### Local Development (Web & PWA)
```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive sandbox, notification simulator, and architecture inspector.

### Building for Production
```bash
npm run build
npm start
```

---

## 📱 Mobile Installation & Android APK Build

### Instant Mobile Install (PWA)
1. Open the deployed web app URL in Chrome (Android) or Safari (iOS).
2. Tap **"Install app"** or **"Add to Home Screen"**.
3. Wave Agent installs as a standalone native-style mobile app.

### Native Android APK Build (Gradle)
If building a standalone Android APK / AAB from an Android Studio project:
```bash
# Build Debug APK (for sideloading / testing)
./gradlew assembleDebug

# Build Release App Bundle (for Google Play Store)
./gradlew bundleRelease
```

---

## 📄 License
MIT License.
