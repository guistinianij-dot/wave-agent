import React from "react";
import { PermissionStatus } from "../types";
import {
  ShieldCheck,
  FileCode,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Code2,
} from "lucide-react";

interface PermissionsManifestViewProps {
  permissions: PermissionStatus[];
  onTogglePermission: (key: string) => void;
}

export const PermissionsManifestView: React.FC<PermissionsManifestViewProps> = ({
  permissions,
  onTogglePermission,
}) => {
  const rawManifestXml = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Required to find and open other apps -->
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".WaveApplication"
        android:theme="@style/Theme.WaveAgent"
        android:label="Wave Agent">
        
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Notification Intelligence Service -->
        <service android:name=".core.device.WaveNotificationListener"
            android:permission="android.permission.BIND_NOTIFICATION_LISTENER_SERVICE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.notification.NotificationListenerService" />
            </intent-filter>
        </service>
    </application>
</manifest>`;

  return (
    <div className="space-y-6">
      {/* Manifest Overview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Android Manifest Architecture & Permissions
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Wave Agent runs as a privileged notification listener and application orchestrator.
            </p>
          </div>
        </div>

        {/* Permissions list */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {permissions.map((perm) => (
            <div
              key={perm.key}
              className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-start justify-between gap-3.5 backdrop-blur-md hover:border-cyan-500/30 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-cyan-300">
                    {perm.name}
                  </span>
                  {perm.granted ? (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                      GRANTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                      REVOKED
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-cyan-400/80">
                  android.permission.{perm.key}
                </div>
                <p className="text-xs text-gray-400 pt-0.5 leading-relaxed">
                  {perm.description}
                </p>
              </div>

              <button
                onClick={() => onTogglePermission(perm.key)}
                className="text-gray-400 hover:text-cyan-400 p-1 transition-colors shrink-0"
                title="Toggle permission state"
              >
                {perm.granted ? (
                  <ToggleRight className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-gray-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Manifest XML Viewer */}
      <div className="bg-black/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-lg">
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white text-xs font-mono">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>app/src/main/AndroidManifest.xml</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300/80">Target SDK: 35 (Android 15)</span>
        </div>
        <pre className="p-4 text-xs font-mono text-cyan-200/90 overflow-x-auto leading-relaxed selection:bg-cyan-500/30">
          <code>{rawManifestXml}</code>
        </pre>
      </div>

      {/* Component Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 backdrop-blur-md">
          <div className="text-xs font-semibold text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>WaveNotificationListener Service</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Bound to <code className="font-mono text-cyan-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">BIND_NOTIFICATION_LISTENER_SERVICE</code>.
            Intercepts Android <code className="font-mono text-cyan-300 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">StatusBarNotification</code> postings, parses notification extras, computes urgency levels, and extracts one-time passwords automatically.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 backdrop-blur-md">
          <div className="text-xs font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>QUERY_ALL_PACKAGES Capability</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Allows Wave Agent to enumerate installed Android apps, query exported activities and intent filters, and perform deep-link cross-application automation workflows directly from triaged notifications.
          </p>
        </div>
      </div>
    </div>
  );
};
