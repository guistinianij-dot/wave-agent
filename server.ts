import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy init Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "WaveNotificationListener",
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    version: "2.4.0-wave",
  });
});

// Direct bundle archive download for Termux / offline setup
app.get(["/api/bundle.tar.gz", "/wave-agent-bundle.tar.gz"], (req, res) => {
  const bundlePath = path.join(process.cwd(), "public", "wave-agent-bundle.tar.gz");
  res.download(bundlePath, "wave-agent-bundle.tar.gz");
});

// Analyze notification via Gemini or intelligent fallback
app.post("/api/agent/analyze-notification", async (req, res) => {
  try {
    const { notification, installedApps } = req.body;
    if (!notification) {
      return res.status(400).json({ error: "Missing notification object" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are WaveNotificationListener on an Android device running Wave Agent.
Analyze the following incoming notification:
Package: ${notification.packageName || "unknown"}
App Name: ${notification.appName || "Unknown"}
Title: ${notification.title || "No title"}
Text: ${notification.text || "No text"}
SubText: ${notification.subText || ""}
Timestamp: ${notification.postTime || new Date().toISOString()}
Known Installed Apps: ${(installedApps || []).map((a: any) => a.name).join(", ")}

Analyze this notification and respond strictly in JSON matching this schema:
{
  "urgency": number (1-100),
  "tier": "critical" | "high" | "normal" | "low",
  "category": "work" | "security" | "finance" | "travel" | "social" | "productivity" | "system",
  "smartSummary": string (concise 1 sentence summary suitable for lockscreen ambient display),
  "sentiment": "neutral" | "urgent" | "positive" | "warning",
  "entities": {
    "otp": string or null (extracted 4-8 digit verification code if present),
    "sender": string or null,
    "deadline": string or null,
    "amount": string or null,
    "actionableLink": string or null
  },
  "suggestedActions": [
    {
      "id": string,
      "label": string (short action text),
      "type": "launch_app" | "copy_text" | "quick_reply" | "schedule" | "dismiss",
      "targetPackage": string (android package name if applicable),
      "payload": string
    }
  ],
  "agentInsight": string (proactive reasoning, e.g. "OTP detected - ready for 1-tap copy" or "High priority message from project lead")
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, analysis: parsed });
        } catch {
          // JSON parse failed, proceed to fallback
        }
      }
    }

    // Heuristic Fallback Analysis if no API key or API call failed
    const textCombined = `${notification.title} ${notification.text} ${notification.subText || ""}`.toLowerCase();
    
    // OTP detection
    const otpMatch = notification.text?.match(/\b\d{4,8}\b/) || notification.title?.match(/\b\d{4,8}\b/);
    const hasOtp = !!otpMatch && (textCombined.includes("code") || textCombined.includes("otp") || textCombined.includes("verification") || textCombined.includes("login"));

    let category = "social";
    let urgency = 45;
    let tier: "critical" | "high" | "normal" | "low" = "normal";

    if (hasOtp || textCombined.includes("fraud") || textCombined.includes("unauthorized") || textCombined.includes("security")) {
      category = "security";
      urgency = 92;
      tier = "critical";
    } else if (textCombined.includes("payment") || textCombined.includes("charged") || textCombined.includes("bank") || textCombined.includes("$") || textCombined.includes("eur")) {
      category = "finance";
      urgency = 78;
      tier = "high";
    } else if (textCombined.includes("urgent") || textCombined.includes("asap") || textCombined.includes("deploy") || textCombined.includes("incident") || textCombined.includes("pr ") || textCombined.includes("review")) {
      category = "work";
      urgency = 85;
      tier = "high";
    } else if (textCombined.includes("flight") || textCombined.includes("boarding") || textCombined.includes("driver") || textCombined.includes("arriving")) {
      category = "travel";
      urgency = 75;
      tier = "high";
    } else if (textCombined.includes("meeting") || textCombined.includes("calendar") || textCombined.includes("task") || textCombined.includes("reminder")) {
      category = "productivity";
      urgency = 65;
      tier = "normal";
    }

    const fallbackAnalysis = {
      urgency,
      tier,
      category,
      smartSummary: `${notification.appName}: ${notification.title} - ${notification.text}`.slice(0, 100),
      sentiment: tier === "critical" ? "urgent" : "neutral",
      entities: {
        otp: hasOtp ? otpMatch[0] : null,
        sender: notification.title || null,
        deadline: null,
        amount: notification.text?.match(/\$\d+(\.\d{2})?/) ? notification.text.match(/\$\d+(\.\d{2})?/)?.[0] : null,
        actionableLink: null,
      },
      suggestedActions: [
        ...(hasOtp ? [{ id: "copy_otp", label: `Copy OTP (${otpMatch[0]})`, type: "copy_text", payload: otpMatch[0] }] : []),
        { id: "open_app", label: `Open ${notification.appName}`, type: "launch_app", targetPackage: notification.packageName, payload: "" },
        { id: "reply", label: "Quick Reply", type: "quick_reply", targetPackage: notification.packageName, payload: "Got it, thanks!" },
      ],
      agentInsight: hasOtp ? "Security token extracted automatically" : `Processed via WaveNotificationListener triage pipeline.`,
    };

    return res.json({ success: true, analysis: fallbackAnalysis });
  } catch (error: any) {
    console.error("Error analyzing notification:", error);
    res.status(500).json({ error: error.message || "Failed to analyze notification" });
  }
});

// Agent Chat / Intent execution
app.post("/api/agent/chat", async (req, res) => {
  try {
    const { message, activeNotifications, installedApps, agentState } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are Wave Agent, an on-device AI system assistant on Android.
Current device status:
- Service: WaveNotificationListener (BIND_NOTIFICATION_LISTENER_SERVICE active)
- App Querying: QUERY_ALL_PACKAGES granted (${installedApps?.length || 0} installed apps available)
- Notifications in queue: ${activeNotifications?.length || 0}
- Active notifications:
${(activeNotifications || []).slice(0, 10).map((n: any) => `* [${n.appName}] ${n.title}: ${n.text} (Urgency: ${n.analysis?.urgency || 'N/A'}, Category: ${n.analysis?.category || 'N/A'})`).join("\n") || "None"}

Installed apps:
${(installedApps || []).slice(0, 15).map((a: any) => `* ${a.name} (${a.packageName}) - category: ${a.category}`).join("\n")}

User request: "${message}"

You can answer queries, summarize notifications, execute cross-app actions, or draft messages.
Respond in valid JSON format:
{
  "reply": string (polite, direct agent response with key insights),
  "actions": [
    {
      "type": "launch_app" | "copy_to_clipboard" | "filter_notifications" | "clear_notifications" | "create_quick_reply" | "simulate_notification",
      "label": string,
      "payload": any
    }
  ],
  "suggestedFollowUps": string[] (2-3 short follow up prompts)
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text?.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, ...parsed });
        } catch {
          // fallback
        }
      }
    }

    // Heuristic response if no API key
    const msgLower = message.toLowerCase();
    let reply = "Wave Agent monitored your notification stream. All background services are running smoothly.";
    const actions: any[] = [];
    const suggestedFollowUps: string[] = ["Summarize urgent alerts", "Check installed packages", "Filter by security"];

    if (msgLower.includes("otp") || msgLower.includes("code")) {
      const otpNotif = (activeNotifications || []).find((n: any) => n.analysis?.entities?.otp);
      if (otpNotif) {
        reply = `Found active verification code: **${otpNotif.analysis.entities.otp}** from ${otpNotif.appName}.`;
        actions.push({
          type: "copy_to_clipboard",
          label: `Copy ${otpNotif.analysis.entities.otp}`,
          payload: otpNotif.analysis.entities.otp,
        });
      } else {
        reply = "No recent verification codes or OTP notifications found in the active listener queue.";
      }
    } else if (msgLower.includes("summar") || msgLower.includes("brief")) {
      const count = (activeNotifications || []).length;
      const urgentCount = (activeNotifications || []).filter((n: any) => n.analysis?.tier === "critical" || n.analysis?.tier === "high").length;
      reply = `Wave Notification Listener has tracked ${count} notifications (${urgentCount} high-priority). Top alert: ${(activeNotifications || [])[0]?.title || "All clear"}.`;
    } else if (msgLower.includes("open") || msgLower.includes("launch")) {
      const matchApp = (installedApps || []).find((a: any) => msgLower.includes(a.name.toLowerCase()));
      if (matchApp) {
        reply = `Launching ${matchApp.name} (${matchApp.packageName}) via Android Intent.`;
        actions.push({
          type: "launch_app",
          label: `Launch ${matchApp.name}`,
          payload: matchApp.packageName,
        });
      } else {
        reply = "I can launch any installed app matching QUERY_ALL_PACKAGES permissions. Which app would you like to open?";
      }
    }

    return res.json({
      success: true,
      reply,
      actions,
      suggestedFollowUps,
    });
  } catch (error: any) {
    console.error("Agent chat error:", error);
    res.status(500).json({ error: error.message || "Agent chat failed" });
  }
});

// Daily or On-Demand Briefing synthesis
app.post("/api/agent/briefing", async (req, res) => {
  try {
    const { notifications } = req.body;
    const ai = getGeminiClient();

    if (ai && notifications && notifications.length > 0) {
      const prompt = `Generate an executive briefing from these Android notifications intercepted by WaveNotificationListener:
${notifications.map((n: any, idx: number) => `${idx + 1}. [${n.appName}] ${n.title} - ${n.text} (${n.analysis?.tier || 'normal'})`).join("\n")}

Respond in JSON format:
{
  "headline": string (engaging 1-sentence recap),
  "criticalItems": string[] (up to 3 urgent items requiring immediate user action),
  "insights": string[] (2-3 proactive suggestions or schedule observations),
  "noiseFilteredCount": number
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const text = response.text?.trim();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, briefing: parsed });
        } catch {
          // fallback
        }
      }
    }

    // Heuristic briefing
    const count = notifications?.length || 0;
    res.json({
      success: true,
      briefing: {
        headline: count > 0 ? `Wave Agent intercepted ${count} active alerts across connected apps.` : "Notification queue is clear. No active alerts.",
        criticalItems: (notifications || []).slice(0, 2).map((n: any) => `${n.appName}: ${n.title}`),
        insights: ["All background services operational", "Notification triage model active at low latency"],
        noiseFilteredCount: Math.max(0, count - 3),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wave Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
