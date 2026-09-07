import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  HardDrive,
  Coffee,
  Terminal,
  Globe,
  ShieldAlert,
  Clipboard,
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed, MetricProgressRing } from './UIElements';
import { MultiBrowserHub } from './MultiBrowserHub';
import { SparklineChart } from './SparklineChart';
import { M4TelemetryCard } from './M4TelemetryCard';
import { M4DieArchitectVisualizer } from './M4DieArchitectVisualizer';
import { BatteryDegradationStudio } from './BatteryDegradationStudio';

interface SleepBlockerItem {
  pid: string;
  name: string;
  assertion: string;
  details: string;
}

interface OverviewTabProps {
  stats: any;
  healthScore: number;
  cpuHistory: number[];
  logs: Array<{ id: string; time: string; text: string; type: string }>;
  loadingAction: string | null;
  triggerAction: (action: string, payload: Record<string, any>, label: string) => void;
  onOpenAI: () => void;
  onOpenSupernova: () => void;
  recentActionStatus?: { action: string; message: string; timestamp: string } | null;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  healthScore,
  cpuHistory,
  logs,
  loadingAction,
  triggerAction,
  onOpenAI,
  onOpenSupernova,
  recentActionStatus
}) => {
  const [showDieVisualizer, setShowDieVisualizer] = useState(false);
  const m4 = stats?.m4Telemetry || { watts: '3.8', tempC: '30.6', chipBrand: 'Apple Silicon' };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 bg-[#000000] text-[#f5f5f7]">
      {/* 1. Apple Keynote Hero Banner */}
      <HoloCard className="p-8 sm:p-10 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/[0.06] text-[#f5f5f7] text-xs font-medium border border-white/[0.08] flex items-center gap-1.5">
                <StatusLed color="green" size="sm" />
                <span>{healthScore}% Velocity Score</span>
              </span>
              <span className="text-xs text-[#86868b]">Uptime: {stats?.uptime || 'Online'}</span>
              <span className="text-xs text-[#86868b]">• {stats?.specs?.osVersion || 'macOS Sequoia'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f5f5f7]">
              Apple Silicon Velocity Engine
            </h1>
            <p className="text-sm sm:text-base text-[#86868b] leading-relaxed">
              Unified memory telemetry, background tab memory sentry, and zero-latency hardware control.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <TactileButton
              variant="secondary"
              size="md"
              icon={<Bot className="w-4 h-4 text-[#86868b]" />}
              onClick={onOpenAI}
            >
              Ask AI Studio
            </TactileButton>

            <TactileButton
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4 text-black" />}
              disabled={loadingAction !== null}
              onClick={() => triggerAction('boost-quick', {}, 'Instant Mac Sweep')}
            >
              {loadingAction === 'boost-quick' ? 'Sweeping...' : 'One-Click Sweep (⌘B)'}
            </TactileButton>

            <button
              onClick={onOpenSupernova}
              className="px-3.5 py-2 rounded-full text-xs font-medium text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors border border-[#ff453a]/20"
            >
              Emergency Kill
            </button>
          </div>
        </div>

        {/* Action Verification Pill */}
        {recentActionStatus && recentActionStatus.action === 'boost-quick' && (
          <div className="mt-5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-[#f5f5f7] flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#30d158]" />
            <span>
              <strong>Verified Execution:</strong> {recentActionStatus.message}
            </span>
          </div>
        )}
      </HoloCard>

      {/* 2. Apple Bento Grid: 3 Hardware Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Unified Memory Architecture */}
        <HoloCard className="p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-[#86868b] font-medium">
              <Cpu className="w-4 h-4 text-[#f5f5f7]" />
              <span>Unified Memory</span>
            </div>
            <span className="text-xs font-semibold text-[#f5f5f7]">{stats?.ram?.percent ?? 0}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f5f5f7]">
                {stats?.ram?.usedGb ?? '--'} <span className="text-sm font-normal text-[#86868b]">GB</span>
              </div>
              <p className="text-xs text-[#86868b] mt-0.5">
                of {stats?.ram?.totalGb ?? '--'} GB Unified
              </p>
            </div>
            <MetricProgressRing
              value={stats?.ram?.percent ?? 0}
              size={80}
              strokeWidth={6}
              color="#f5f5f7"
              unit="%"
            />
          </div>

          {/* Settings Style Memory Bar */}
          {stats?.ram?.appMemoryGb && (
            <div className="space-y-2">
              <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.round((parseFloat(stats.ram.appMemoryGb) / parseFloat(stats.ram.totalGb)) * 100)}%` }}
                  className="bg-white h-full"
                  title="App Memory"
                />
                <div
                  style={{ width: `${Math.round((parseFloat(stats.ram.wiredGb) / parseFloat(stats.ram.totalGb)) * 100)}%` }}
                  className="bg-zinc-400 h-full"
                  title="Wired Memory"
                />
                <div
                  style={{ width: `${Math.round((parseFloat(stats.ram.compressedGb || "0") / parseFloat(stats.ram.totalGb)) * 100)}%` }}
                  className="bg-zinc-600 h-full"
                  title="Compressed"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#86868b]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />App {stats.ram.appMemoryGb}G
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />Wired {stats.ram.wiredGb}G
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />Free {stats.ram.freeGb}G
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868b]">
            <span>Swap: {stats?.ram?.swapUsedMb ?? 0} MB</span>
            <button
              onClick={() => triggerAction('purge-ram', {}, 'Purge Memory')}
              className="text-[#f5f5f7] hover:underline font-medium transition-colors"
            >
              Purge Inactive RAM
            </button>
          </div>
        </HoloCard>

        {/* Card 2: Silicon Die & Thermals */}
        <HoloCard className="p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-[#86868b] font-medium">
              <Zap className="w-4 h-4 text-[#f5f5f7]" />
              <span>Apple Silicon Die</span>
            </div>
            <span className="text-xs font-semibold text-[#f5f5f7]">{stats?.cpu?.cores ?? 8} Cores</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f5f5f7]">
                {m4.watts} <span className="text-sm font-normal text-[#86868b]">Watts</span>
              </div>
              <p className="text-xs text-[#86868b] mt-0.5">
                Load: {stats?.cpu?.load1 || '0.00'} • Temp: {m4.tempC || '31'}°C
              </p>
            </div>
            <div className="w-24">
              <SparklineChart data={cpuHistory} color="#f5f5f7" height={40} width={96} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1 text-xs text-[#86868b]">
            <div className="flex justify-between">
              <span>5m / 15m Load:</span>
              <span className="text-[#f5f5f7]">{stats?.cpu?.load5 || '0.00'} / {stats?.cpu?.load15 || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>Thermal Headroom:</span>
              <span className="text-[#f5f5f7] font-medium">Nominal (Fanless)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868b]">
            <span>Model: {stats?.specs?.model || 'MacBook'}</span>
            <button
              onClick={() => setShowDieVisualizer(!showDieVisualizer)}
              className="text-[#f5f5f7] hover:underline font-medium flex items-center gap-1 transition-colors"
            >
              <span>Die Architecture</span>
              {showDieVisualizer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </HoloCard>

        {/* Card 3: Storage & Battery */}
        <HoloCard className="p-6 sm:p-7 flex flex-col justify-between space-y-5 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-[#86868b] font-medium">
              <HardDrive className="w-4 h-4 text-[#f5f5f7]" />
              <span>APFS Storage & Battery</span>
            </div>
            <span className="text-xs font-semibold text-[#f5f5f7]">{stats?.disk?.capacity || '50%'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f5f5f7]">
                {stats?.disk?.free || '250G'} <span className="text-sm font-normal text-[#86868b]">Free</span>
              </div>
              <p className="text-xs text-[#86868b] mt-0.5">
                Battery: {stats?.battery?.percent ?? 100}% ({stats?.battery?.state || 'Normal'})
              </p>
            </div>
            <MetricProgressRing
              value={parseInt(stats?.disk?.capacity || '50', 10)}
              size={80}
              strokeWidth={6}
              color="#f5f5f7"
              unit="%"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1 text-xs text-[#86868b]">
            <div className="flex justify-between">
              <span>Battery Health:</span>
              <span className="text-[#f5f5f7] font-medium">{stats?.battery?.health || '100%'} ({stats?.battery?.cycleCount || 120} cycles)</span>
            </div>
            <div className="flex justify-between">
              <span>APFS Volume:</span>
              <span className="text-[#f5f5f7]">Encrypted & TRIM Active</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868b]">
            <button
              onClick={() => triggerAction('wipe-clipboard', {}, 'Wipe Clipboard')}
              className="hover:text-[#f5f5f7] flex items-center gap-1.5 transition-colors"
            >
              <Clipboard className="w-3.5 h-3.5" /> Clear Clipboard
            </button>
            <span className="text-[#86868b]">Encrypted APFS</span>
          </div>
        </HoloCard>

      </div>

      {/* Optional Collapsible Die Architecture & Degradation Studio */}
      {showDieVisualizer && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <M4TelemetryCard
            telemetry={stats?.m4Telemetry}
            loadAvg={stats?.cpu}
          />
          <M4DieArchitectVisualizer
            telemetry={stats?.m4Telemetry}
            loadAvg={stats?.cpu}
          />
          <BatteryDegradationStudio
            battery={stats?.battery}
            m4Telemetry={stats?.m4Telemetry}
          />
        </div>
      )}

      {/* 3. Quick Action Cards: Browser Reaper & Boss Key */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Browser Tab Memory Reaper */}
        <HoloCard className="p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-white/[0.05] text-[#f5f5f7] border border-white/[0.08]">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#f5f5f7]">Browser Tab Memory Reaper</h3>
                <p className="text-xs text-[#86868b] mt-0.5">Puts inactive background tabs holding high memory to sleep.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
            <span className="text-[#86868b]">
              {stats?.chromeTabs?.length || 0} tabs currently monitored
            </span>
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => triggerAction('reap-chrome-tabs', {}, 'Reap Heavy Browser Tabs')}
            >
              Reap Heavy Tabs
            </TactileButton>
          </div>
        </HoloCard>

        {/* Focus Mode / Boss Key */}
        <HoloCard className="p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-white/[0.05] text-[#f5f5f7] border border-white/[0.08]">
                <ShieldAlert className="w-6 h-6 text-[#86868b]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#f5f5f7]">Focus Mode (Boss Key)</h3>
                <p className="text-xs text-[#86868b] mt-0.5">Quickly mutes and minimizes Discord, Slack, Spotify, and Steam.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
            <span className="text-[#86868b]">One-click background silence</span>
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => triggerAction('boss-key-reap', {}, 'Focus Mode / Boss Key')}
            >
              Activate Focus
            </TactileButton>
          </div>
        </HoloCard>
      </div>

      {/* 4. Multi-Browser Tab & Renderer Hub */}
      <MultiBrowserHub
        tabs={stats?.chromeTabs || []}
        caches={stats?.browserCaches || {}}
        onKillTab={(tab) => triggerAction('close-browser-tab', { tabUrl: tab.url, tabTitle: tab.title, appName: tab.appName, browser: tab.browser }, 'Close ' + (tab.browser || 'Browser') + ' tab')}
        onCloseAllTabs={() => triggerAction('close-all-chrome-tabs', {}, 'Close All Background Tabs')}
        onReapHeavyTabs={() => triggerAction('reap-chrome-tabs', {}, 'Reap Heavy Tabs')}
        onFlushCaches={() => triggerAction('flush-browser-caches', {}, 'Flush All Browser Caches')}
        onRescanTabs={() => triggerAction('rescan-tabs', {}, 'Rescan Browser Tabs')}
      />

      {/* 5. Caffeinate & Sleep Assertions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Caffeinate Engine */}
        <HoloCard className="p-6 sm:p-7 space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7]">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#f5f5f7]">Caffeinate Engine</h3>
                <p className="text-xs text-[#86868b]">Prevent macOS sleep during long tasks</p>
              </div>
            </div>
            <CyberBadge variant={stats?.isCaffeinated ? 'emerald' : 'slate'} size="xs">
              {stats?.isCaffeinated ? 'ACTIVE' : 'IDLE'}
            </CyberBadge>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06] text-xs">
            {[
              { label: '15m', sec: 900 },
              { label: '30m', sec: 1800 },
              { label: '1h', sec: 3600 },
              { label: '2h', sec: 7200 },
              { label: 'Indefinite', sec: 0 },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => triggerAction('caffeinate', { duration: item.sec }, `Keep Awake for ${item.label}`)}
                className="px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.06] text-[#86868b] hover:text-[#f5f5f7] transition-colors"
              >
                {item.label}
              </button>
            ))}

            {stats?.isCaffeinated && (
              <button
                onClick={() => triggerAction('allow-sleep', {}, 'Allow Sleep')}
                className="ml-auto px-3 py-1.5 rounded-full bg-white/[0.08] text-[#f5f5f7] hover:bg-white/[0.14] transition-colors font-medium text-xs border border-white/[0.1]"
              >
                Allow Sleep
              </button>
            )}
          </div>
        </HoloCard>

        {/* Sleep Assertions */}
        <HoloCard className="p-6 sm:p-7 space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[#f5f5f7]">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#f5f5f7]">Wake Assertion Sentry</h3>
                <p className="text-xs text-[#86868b]">Apps preventing lid-closed sleep</p>
              </div>
            </div>
            <span className="text-xs text-[#86868b] font-medium">
              {stats?.sleepBlockers?.length || 0} active
            </span>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs max-h-36 overflow-y-auto">
            {stats?.sleepBlockers && stats.sleepBlockers.length > 0 ? (
              stats.sleepBlockers.map((sb: SleepBlockerItem, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex justify-between items-center">
                  <span className="font-medium text-[#f5f5f7] truncate">{sb.name}</span>
                  <span className="text-[#86868b] text-[11px] truncate">{sb.assertion}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-[#86868b] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#f5f5f7]" />
                <span>No wake assertions active. Deep sleep ready.</span>
              </div>
            )}
          </div>
        </HoloCard>
      </div>

      {/* 6. System Event Telemetry Feed */}
      <HoloCard className="p-6 sm:p-8 space-y-4 bg-[#101010] border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#86868b]" /> System Event Telemetry
          </h3>
          <span className="text-xs text-[#86868b]">Live Daemon Feed</span>
        </div>
        <div className="bg-[#0a0a0c] border border-white/[0.06] rounded-xl p-4 font-mono text-xs max-h-48 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-[#86868b] shrink-0 font-medium">[{log.time}]</span>
              <span
                className={
                  log.type === 'success'
                    ? 'text-[#f5f5f7]'
                    : log.type === 'error'
                    ? 'text-[#ff453a]'
                    : 'text-[#86868b]'
                }
              >
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </HoloCard>
    </div>
  );
};
