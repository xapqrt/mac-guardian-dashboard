import React, { useState, useEffect } from 'react';
import {
  Headphones,
  ShieldAlert,
  RotateCcw,
  Volume2,
  Radio,
  Smartphone,
  Check,
  CheckCircle2,
  Sliders,
  Activity,
  Trash2,
  Copy,
  ArrowRight,
  ArrowLeft,
  VolumeX,
  MousePointer,
  Eye,
  Compass,
  Battery,
  BatteryCharging,
  Wifi,
  WifiOff,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { HoloCard, TactileSwitch, TactileButton, StatusLed, CyberBadge } from './UIElements';
import { LiveWaveform } from './LiveWaveform';
import { OnePlusAudiophileStudio } from './OnePlusAudiophileStudio';
import { sound } from '../utils/audio';

interface EarbudConfig {
  enableInEarRemoval: boolean;
  enableStemTap: boolean;
  tapMode: string;
  singleTapAction: string;
  doubleTapAction: string;
  tripleTapAction: string;
  suppressOriginalMedia: boolean;
  tapWindowMs: number;
  doubleTapWindowMs: number;
  debounceMs: number;

  // Idea 1: Bezel / Notch Cursor Flick Sentry
  enableNotchFlick?: boolean;
  notchMode?: string;
  notchVelocity?: number;
  notchFlickAction?: string;

  // Gaze & Head-Pose Sentry (Turn Head 45° to Right)
  enableGazeTracking?: boolean;
  gazeYawAngle?: number;
  gazeDirection?: string;
  gazeAction?: string;

  muteAudio: boolean;
  muteMode: 'zero' | 'lower_to_10';
  muteMic: boolean;
  restoreVolumeLevel: number;
  switchDesktop: boolean;
  desktopDirection: 'right' | 'left' | 'smart';
  slideDwellTimeMs: number;
  pauseMedia: boolean;
  pauseChrome: boolean;
  pauseQuickTime: boolean;
  hideChromeWindow: boolean;
  decoyApp: string;
  toggleMode: boolean;
  autoRevertSeconds: number;
  activePreset: string;
}

interface BtStats {
  rate_kbps?: number;
  rssi_dbm?: number;
  retx_percent?: number;
  packets?: number;
  status?: string;
  battery?: number;
  deviceName?: string;
  connected?: boolean;
  codec?: string;
  snr_db?: number;
  jitter_ms?: number;
  timestamp?: string;
}

interface GazeTelemetry {
  rightTurnDelta: number;
  targetYaw: number;
  rawYaw: number;
  time: number;
}

export const EarbudsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'overview' | 'audiophile' | 'gaze' | 'notch' | 'triggers' | 'actions' | 'recovery' | 'logs' | 'phone'>('overview');
  const [isPanicking, setIsPanicking] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: string; timestamp: string; source: string; message: string; details?: any }>>([]);
  const [networkIps, setNetworkIps] = useState<Array<{ interface: string; address: string }>>([]);
  const [copiedIp, setCopiedIp] = useState(false);

  const [gazeTelemetry, setGazeTelemetry] = useState<GazeTelemetry>({
    rightTurnDelta: 0,
    targetYaw: 15,
    rawYaw: 0,
    time: Date.now()
  });

  const [btStats, setBtStats] = useState<BtStats>({
    rate_kbps: 224,
    rssi_dbm: -47,
    retx_percent: 8.3,
    packets: 52,
    status: 'STREAMING_ACTIVE',
    battery: 60,
    deviceName: 'OnePlus Buds 4',
    connected: true,
    codec: 'AAC-LC',
    snr_db: 53,
    jitter_ms: 150
  });

  const [config, setConfig] = useState<EarbudConfig>({
    enableInEarRemoval: false,
    enableStemTap: true,
    tapMode: 'multi_action',
    singleTapAction: 'switch_right',
    doubleTapAction: 'panic',
    tripleTapAction: 'switch_left',
    suppressOriginalMedia: true,
    tapWindowMs: 500,
    doubleTapWindowMs: 700,
    debounceMs: 200,

    enableNotchFlick: true,
    notchMode: 'notch',
    notchVelocity: 1200,
    notchFlickAction: 'switch_right',

    enableGazeTracking: true,
    gazeYawAngle: 15,
    gazeDirection: 'right',
    gazeAction: 'switch_right',

    muteAudio: true,
    muteMode: 'zero',
    muteMic: false,
    restoreVolumeLevel: 50,
    switchDesktop: true,
    desktopDirection: 'right',
    slideDwellTimeMs: 20,
    pauseMedia: true,
    pauseChrome: true,
    pauseQuickTime: true,
    hideChromeWindow: false,
    decoyApp: 'none',
    toggleMode: true,
    autoRevertSeconds: 0,
    activePreset: 'custom'
  });

  useEffect(() => {
    // Initial fetch of OnePlus Buds battery and RF telemetry from Guardian API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.onePlusBuds) {
          setBtStats(prev => ({
            ...prev,
            battery: data.onePlusBuds.battery,
            deviceName: data.onePlusBuds.deviceName,
            connected: data.onePlusBuds.connected,
            rssi_dbm: data.onePlusBuds.rssi,
            rate_kbps: data.onePlusBuds.bitrate,
            codec: data.onePlusBuds.codec,
            snr_db: data.onePlusBuds.snr,
            jitter_ms: data.onePlusBuds.jitter,
            retx_percent: data.onePlusBuds.retx
          }));
        }
      })
      .catch(() => {});

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:3334';
      ws = new WebSocket(`${protocol}//${host}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            setIsPanicking(data.isPanicking);
            if (data.config) setConfig(data.config);
            if (data.logs) setLogs(data.logs);
            if (data.ips) setNetworkIps(data.ips);
            if (data.btStats) setBtStats(prev => ({ ...prev, ...data.btStats }));
          } else if (data.type === 'panic_state') {
            setIsPanicking(data.isPanicking);
            sound.playClick();
          } else if (data.type === 'config_update') {
            setConfig(data.config);
          } else if (data.type === 'bt_stats') {
            setBtStats(prev => ({ ...prev, ...data.stats }));
          } else if (data.type === 'gaze_telemetry') {
            if (data.telemetry) setGazeTelemetry(data.telemetry);
          } else if (data.type === 'log') {
            setLogs((prev) => [data.entry, ...prev.slice(0, 49)]);
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWs, 2000);
      };
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const updateConfig = async (partial: Partial<EarbudConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    try {
      await fetch('/api/earbuds/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
    } catch (e) {
      console.error('Failed to sync earbud config:', e);
    }
  };

  const triggerPanic = async (source = 'Mac Guardian Dashboard') => {
    sound.playClick();
    try {
      const res = await fetch('/api/earbuds/panic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source })
      });
      const data = await res.json();
      setIsPanicking(data.isPanicking);
    } catch (e) {
      console.error('Panic failed:', e);
    }
  };

  const triggerRestore = async () => {
    sound.playClick();
    try {
      const res = await fetch('/api/earbuds/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setIsPanicking(data.isPanicking);
    } catch (e) {
      console.error('Restore failed:', e);
    }
  };

  const executeDirectAction = async (action: string) => {
    sound.playClick();
    try {
      await fetch('/api/earbuds/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, source: 'Dashboard Quick Action' })
      });
    } catch (e) {
      console.error('Action failed:', e);
    }
  };

  const primaryIp = networkIps[0]?.address || window.location.hostname || 'localhost';
  const remoteUrl = `http://${primaryIp}:3334`;

  const copyRemoteUrl = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopiedIp(true);
    sound.playClick();
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const subTabs = [
    { id: 'overview', label: 'Overview & Battery', icon: Activity },
    { id: 'gaze', label: 'Head-Pose Gaze (45° Look)', icon: Eye },
    { id: 'audiophile', label: 'Nord 4 Acoustic Studio & EQ', icon: Radio },
    { id: 'notch', label: 'Notch / Bezel Flick', icon: MousePointer },
    { id: 'triggers', label: 'Stem Tap Actions (1x, 2x, 3x)', icon: Headphones },
    { id: 'actions', label: 'Desktop & Sound Options', icon: Sliders },
    { id: 'recovery', label: 'Return Settings', icon: RotateCcw },
    { id: 'logs', label: 'Live Packets & Logs', icon: Activity },
    { id: 'phone', label: 'Mobile Remote', icon: Smartphone }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Apple Hardware Header Banner */}
      <HoloCard className="p-8 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white">
                <Headphones className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-semibold text-white tracking-tight">OnePlus Buds 4 & Stealth Sentry</h2>
                  <CyberBadge variant="emerald" size="xs">ARMED & ZERO-LATENCY</CyberBadge>
                </div>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Hardware stem touch capture, notch cursor flick, and head-pose gaze sentry.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isPanicking ? (
              <TactileButton
                variant="success"
                size="md"
                className="px-6 py-2"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={triggerRestore}
              >
                Return to Movie
              </TactileButton>
            ) : (
              <TactileButton
                variant="danger"
                size="md"
                className="px-6 py-2"
                icon={<ShieldAlert className="w-4 h-4" />}
                onClick={() => triggerPanic('Manual Hub Button')}
              >
                Trigger Panic Switch
              </TactileButton>
            )}

            <TactileButton
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => executeDirectAction('switch_left')}
            >
              Slide Left
            </TactileButton>

            <TactileButton
              variant="secondary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => executeDirectAction('switch_right')}
            >
              Slide Right
            </TactileButton>
          </div>
        </div>

        {/* Apple Segmented Sub-Navigation Bar */}
        <div className="flex items-center p-1 rounded-full bg-white/[0.05] border border-white/[0.06] overflow-x-auto gap-1 text-xs">
          {[
            { id: 'overview', label: 'Hardware Overview', icon: Activity },
            { id: 'triggers', label: 'Stem Taps', icon: Headphones },
            { id: 'gaze', label: 'Head-Pose Gaze', icon: Eye },
            { id: 'notch', label: 'Notch Flick', icon: MousePointer },
            { id: 'audiophile', label: 'Acoustic Studio', icon: Radio },
            { id: 'actions', label: 'Desktop & Sound', icon: Sliders },
            { id: 'recovery', label: 'Return Settings', icon: RotateCcw },
            { id: 'logs', label: 'Packets & Logs', icon: Activity },
            { id: 'phone', label: 'Mobile Remote', icon: Smartphone }
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  sound.playClick();
                  setSubTab(t.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-150 flex items-center gap-1.5 shrink-0 ${
                  active
                    ? 'bg-white text-black font-semibold shadow-sm scale-[1.02]'
                    : 'text-[#86868b] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </HoloCard>

      {/* SUBTAB 1: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-8">
          {/* Low-Latency Disconnect Warning Banner */}
          {btStats.connected === false && (
            <div className="p-6 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-rose-300 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl shadow-rose-950/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <WifiOff className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="font-bold text-base text-white flex items-center gap-2.5">
                    <span>{btStats.deviceName || 'OnePlus Buds'} Disconnected</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <p className="text-xs text-rose-300/80 font-mono mt-0.5">
                    Low-latency Bluetooth link dropped at {btStats.timestamp || 'just now'} • Background auto-reconnect listener armed.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs font-mono font-bold text-rose-300">
                RECONNECTING KERNEL DAEMON
              </div>
            </div>
          )}

          {/* OnePlus Buds 4 Live Battery & Audio Link Cockpit */}
          <HoloCard className="p-8 sm:p-10 space-y-8 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.12)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {btStats.deviceName || 'OnePlus Buds 4'}
                    </h3>
                    <CyberBadge variant="cyan">LIVE CBPowerSource</CyberBadge>
                  </div>
                  <p className="text-xs text-[#86868b] font-mono mt-0.5">
                    Sub-20ms CoreAudio Link • Hardware Stem Gesture Engine • Real-time RF Metrics
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <StatusLed color={btStats.connected !== false ? 'green' : 'red'} size="sm" />
                  <span>{btStats.connected !== false ? 'CONNECTED & SYNCED' : 'DISCONNECTED'}</span>
                </div>
              </div>
            </div>

            {/* Main Battery + RF Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left: Earbuds Battery Cockpit (6 cols) */}
              <div className="lg:col-span-6 bg-[#0c111e]/90 rounded-2xl border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      Earbuds Battery Level
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      Discharging • Normal
                    </span>
                  </div>

                  <div className="flex items-center gap-6 my-2">
                    <div className="relative w-24 h-24 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <div className="text-2xl font-black font-mono text-white">
                        {btStats.battery || 60}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">OnePlus Active Battery</div>
                      <p className="text-xs text-[#86868b] leading-relaxed font-mono">
                        Captured live from macOS Bluetooth daemon CBPowerSource frame stream.
                      </p>
                      <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> High-Resolution Readout
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left & Right Synchronized Status */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-300 font-semibold">Left Earbud</span>
                    </div>
                    <span className="text-white font-mono font-bold text-xs">{btStats.battery || 60}%</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-300 font-semibold">Right Earbud</span>
                    </div>
                    <span className="text-white font-mono font-bold text-xs">{btStats.battery || 60}%</span>
                  </div>
                </div>
              </div>

              {/* Right: Audio Link Quality (AuLQ) & Signal (6 cols) */}
              <div className="lg:col-span-6 bg-[#0c111e]/90 rounded-2xl border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                      Bluetooth 5.4 RF Link Quality (AuLQ)
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      {btStats.rssi_dbm || -47} dBm (Optimal)
                    </span>
                  </div>

                  {/* 4-Item Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="text-xs font-mono text-[#86868b]">Stream Bitrate</div>
                      <div className="text-lg font-bold font-mono text-white">
                        {btStats.rate_kbps || 224} <span className="text-xs font-normal text-[#86868b]">Kbps</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">Codec: {btStats.codec || 'AAC-LC'}</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="text-xs font-mono text-[#86868b]">Signal-to-Noise Ratio</div>
                      <div className="text-lg font-bold font-mono text-white">
                        {btStats.snr_db || 53} <span className="text-xs font-normal text-[#86868b]">dB</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">Clean Airwaves</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="text-xs font-mono text-[#86868b]">Retransmission Rate</div>
                      <div className="text-lg font-bold font-mono text-white">
                        {btStats.retx_percent || 8.3}%
                      </div>
                      <div className="text-[10px] text-[#86868b] font-mono">Low Interference</div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                      <div className="text-xs font-mono text-[#86868b]">Jitter Buffer</div>
                      <div className="text-lg font-bold font-mono text-white">
                        {btStats.jitter_ms || 150} <span className="text-xs font-normal text-[#86868b]">ms</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 font-mono">Stable Playback</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#86868b] font-mono">
                  <span>Transport: PCIe BCM_4388C2</span>
                  <span className="text-slate-300">Last Synced: {btStats.timestamp || 'Live'}</span>
                </div>
              </div>

            </div>
          </HoloCard>

          {/* OnePlus Buds Nord 4 Acoustic Studio & 6-Band Equalizer */}
          <OnePlusAudiophileStudio btStats={btStats} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HoloCard className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Single Tap (1x)</span>
                <CyberBadge variant="sky" size="xs">{config.singleTapAction}</CyberBadge>
              </div>
              <h4 className="text-lg font-bold text-white">
                {config.singleTapAction === 'switch_right' ? 'Move 1 Desktop Right' : config.singleTapAction.replace('_', ' ')}
              </h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Tapping stem once executes your chosen action immediately in under 30ms.
              </p>
            </HoloCard>

            <HoloCard className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Double Tap (2x)</span>
                <CyberBadge variant="emerald" size="xs">{config.doubleTapAction}</CyberBadge>
              </div>
              <h4 className="text-lg font-bold text-white">
                {config.doubleTapAction === 'panic' ? 'Full Boss Key (Mute + Switch)' : config.doubleTapAction.replace('_', ' ')}
              </h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                2 quick stem taps triggers your primary hide sequence or desktop change.
              </p>
            </HoloCard>

            <HoloCard className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Triple Tap (3x)</span>
                <CyberBadge variant="purple" size="xs">{config.tripleTapAction}</CyberBadge>
              </div>
              <h4 className="text-lg font-bold text-white">
                {config.tripleTapAction === 'switch_left' ? 'Move 1 Desktop Left' : config.tripleTapAction.replace('_', ' ')}
              </h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                3 quick stem taps switches opposite direction without triggering macOS game mode or pause.
              </p>
            </HoloCard>
          </div>

          {/* Idea 1: Bezel / Notch Cursor Flick Banner */}
          <HoloCard className="p-6 space-y-4 border-indigo-500/30 bg-indigo-950/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <MousePointer className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">Trackpad Bezel / Notch Flick Sentry</span>
                    <CyberBadge variant="indigo" size="xs">0.0% CPU • 0 AUDIO TOUCH</CyberBadge>
                  </div>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    Fling cursor into the top camera notch with a flick of your finger to trigger instant switch.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-300">
                  {config.enableNotchFlick !== false ? 'ACTIVE' : 'DISABLED'}
                </span>
                <TactileSwitch
                  checked={config.enableNotchFlick !== false}
                  onChange={(checked) => updateConfig({ enableNotchFlick: checked })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#86868b] pt-1 border-t border-white/[0.05]">
              <span>Mode: <strong className="text-white">{config.notchMode === 'notch' ? 'Camera Notch Center (260px)' : 'Entire Top Edge'}</strong></span>
              <span>Min Velocity: <strong className="text-indigo-400 font-mono">{config.notchVelocity || 1200} px/s</strong></span>
              <button
                onClick={() => setSubTab('notch')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
              >
                Customize Trigger Zone →
              </button>
            </div>
          </HoloCard>

          {/* Gaze & Head-Pose Look-Away Sentry Banner */}
          <HoloCard className="p-6 space-y-4 border-emerald-500/30 bg-emerald-950/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">Neural Head-Pose Sentry (Quick Right Glance)</span>
                    <CyberBadge variant="emerald" size="xs">STRICT RIGHT-ONLY • 0 AUDIO TOUCH</CyberBadge>
                  </div>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    As soon as you glance or turn slightly to your right side (+{config.gazeYawAngle || 15}°), desktop switches immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs font-mono text-[#86868b] flex items-center gap-2">
                  <span>Turn to Right: <strong className={`${gazeTelemetry.rightTurnDelta >= (config.gazeYawAngle || 15) ? 'text-emerald-400 font-bold animate-pulse' : 'text-slate-300'}`}>{gazeTelemetry.rightTurnDelta > 0 ? `+${gazeTelemetry.rightTurnDelta.toFixed(1)}°` : `${gazeTelemetry.rightTurnDelta.toFixed(1)}°`}</strong></span>
                  <span>•</span>
                  <span>Trigger at: <strong className="text-emerald-400">+{config.gazeYawAngle || 15}°</strong></span>
                </div>
                <TactileSwitch
                  checked={config.enableGazeTracking !== false}
                  onChange={(checked) => updateConfig({ enableGazeTracking: checked })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#86868b] pt-1 border-t border-white/[0.05]">
              <span>Direction: <strong className="text-white">Strictly User Right Side (Left/Down completely ignored)</strong></span>
              <span>Action: <strong className="text-emerald-400">{config.gazeAction === 'switch_right' ? 'Move 1 Desktop Right' : config.gazeAction}</strong></span>
              <button
                onClick={() => setSubTab('gaze')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4"
              >
                Open Sensitivity Dashboard & Calibrate →
              </button>
            </div>
          </HoloCard>

          {/* Live Bluetooth Telemetry Waveform */}
          <HoloCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-semibold text-white">Live Hardware Bluetooth Stream</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono text-[#86868b]">
                <span>Rate: {btStats.rate_kbps} kbps</span>
                <span>•</span>
                <span>Signal: {btStats.rssi_dbm} dBm</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <StatusLed color="green" size="sm" />
                  ONLINE
                </span>
              </div>
            </div>

            <div className="h-28 rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06]">
              <LiveWaveform
                isStreaming={btStats.status === 'STREAMING_ACTIVE'}
                rate={btStats.rate_kbps}
                rssi={btStats.rssi_dbm}
              />
            </div>
          </HoloCard>
        </div>
      )}

      {/* DEDICATED HEAD-POSE GAZE SENTRY TAB */}
      {subTab === 'gaze' && (
        <div className="space-y-6">
          <HoloCard className="p-6 space-y-5 border-emerald-500/30 bg-emerald-950/15">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Neural Head-Pose Gaze Sentry (Quick Look-Right)</h3>
                    <p className="text-xs text-[#86868b]">
                      Vision framework face tracking running on Apple Neural Engine. Zero audio impact & strictly triggers ONLY on right turns.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    sound.playClick();
                    await fetch('/api/earbuds/calibrate-gaze', { method: 'POST' });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  Recalibrate Center
                </button>
                <span className="text-xs font-semibold text-slate-300">
                  {config.enableGazeTracking !== false ? 'ARMED & ACTIVE' : 'DISABLED'}
                </span>
                <TactileSwitch
                  checked={config.enableGazeTracking !== false}
                  onChange={(checked) => updateConfig({ enableGazeTracking: checked })}
                />
              </div>
            </div>


            {/* Live Visual Dual-Direction Angle Meter */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Live Head-Pose Yaw Tracker (Apple Neural Engine)
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {gazeTelemetry.rightTurnDelta > 0.5 ? `Right +${gazeTelemetry.rightTurnDelta.toFixed(1)}°` : gazeTelemetry.rightTurnDelta < -0.5 ? `Left ${gazeTelemetry.rightTurnDelta.toFixed(1)}°` : `Center ${gazeTelemetry.rightTurnDelta.toFixed(1)}°`}
                </span>
              </div>

              {/* Dynamic Bidirectional Meter */}
              <div className="space-y-1.5">
                <div className="relative h-8 bg-[#0a0a0c]/90 rounded-full overflow-hidden border border-white/[0.08] flex items-center">
                  {/* Center reference line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-20" />

                  {/* Left trigger threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-cyan-400 z-20 shadow-[0_0_12px_rgba(34,211,238,1)]"
                    style={{ left: `${Math.max(0, 50 - ((config.gazeYawAngle || 10) / 90) * 50)}%` }}
                  />

                  {/* Right trigger threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-20 shadow-[0_0_12px_rgba(52,211,153,1)]"
                    style={{ left: `${Math.min(100, 50 + ((config.gazeYawAngle || 10) / 90) * 50)}%` }}
                  />

                  {/* Live Left-Turn Bar (Cyan) */}
                  {gazeTelemetry.rightTurnDelta < 0 && (
                    <div
                      className={`h-full transition-all duration-75 absolute right-1/2 rounded-l-full ${
                        gazeTelemetry.rightTurnDelta <= -(config.gazeYawAngle || 10)
                          ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9)]'
                          : 'bg-cyan-500/50'
                      }`}
                      style={{
                        width: `${Math.min(50, (Math.abs(gazeTelemetry.rightTurnDelta) / 90) * 50)}%`
                      }}
                    />
                  )}

                  {/* Live Right-Turn Bar (Emerald) */}
                  {gazeTelemetry.rightTurnDelta > 0 && (
                    <div
                      className={`h-full transition-all duration-75 absolute left-1/2 rounded-r-full ${
                        gazeTelemetry.rightTurnDelta >= (config.gazeYawAngle || 10)
                          ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.9)]'
                          : 'bg-emerald-500/50'
                      }`}
                      style={{
                        width: `${Math.min(50, (gazeTelemetry.rightTurnDelta / 90) * 50)}%`
                      }}
                    />
                  )}
                </div>

                <div className="flex justify-between text-[10px] font-mono text-[#86868b]">
                  <span className="text-cyan-400 font-bold">← -90° (Left)</span>
                  <span className="text-cyan-400">Trigger: -{config.gazeYawAngle || 10}°</span>
                  <span>0° Center</span>
                  <span className="text-emerald-400">Trigger: +{config.gazeYawAngle || 10}°</span>
                  <span className="text-emerald-400 font-bold">+90° (Right) →</span>
                </div>
              </div>

              <div className="text-center pt-1">
                {gazeTelemetry.rightTurnDelta <= -(config.gazeYawAngle || 10) ? (
                  <span className="text-xs font-bold text-cyan-400 animate-pulse">
                    ⬅️ LEFT GLANCE DETECTED ({gazeTelemetry.rightTurnDelta.toFixed(1)}°): SWITCHING LEFT DESKTOP!
                  </span>
                ) : gazeTelemetry.rightTurnDelta >= (config.gazeYawAngle || 10) ? (
                  <span className="text-xs font-bold text-emerald-400 animate-pulse">
                    ➡️ RIGHT GLANCE DETECTED (+{gazeTelemetry.rightTurnDelta.toFixed(1)}°): SWITCHING RIGHT DESKTOP!
                  </span>
                ) : (
                  <span className="text-xs text-[#86868b]">
                    Glance left by -{config.gazeYawAngle || 10}° to move left; glance right by +{config.gazeYawAngle || 10}° to move right.
                  </span>
                )}
              </div>
            </div>

            {/* Threshold Angle Slider (5° to 90°) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Custom Trigger Angle (5° - 90°)</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  ±{config.gazeYawAngle || 10}°
                  {(config.gazeYawAngle || 10) <= 10 ? ' (Micro Glance - Barely Turn Head)' : (config.gazeYawAngle || 10) <= 25 ? ' (Natural Look)' : (config.gazeYawAngle || 10) <= 50 ? ' (Deliberate Turn)' : ' (Deep 90° Full Head Turn)'}
                </span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Full degree range from a slight 5° glance all the way up to a 90° right-angle head turn.
              </p>
              <input
                type="range"
                min="5"
                max="90"
                step="1"
                value={config.gazeYawAngle || 10}
                onChange={(e) => updateConfig({ gazeYawAngle: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#86868b]">
                <span className="text-cyan-400 font-bold">5° (Micro Glance)</span>
                <span className="text-emerald-400 font-bold">15° (Natural)</span>
                <span>30° (Noticeable)</span>
                <span>45° (Side Glance)</span>
                <span>65° (Wide)</span>
                <span className="text-amber-400 font-bold">90° (Full Head Turn)</span>
              </div>
            </div>

            {/* Quick Presets Grid (6 options up to 90°) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {[
                { deg: 8, label: '8° Glance', desc: 'Instant touch' },
                { deg: 15, label: '15° Natural', desc: 'Subtle glance' },
                { deg: 30, label: '30° Firm', desc: 'Active turn' },
                { deg: 45, label: '45° Look', desc: 'Half turn' },
                { deg: 60, label: '60° Wide', desc: 'Clear turn' },
                { deg: 90, label: '90° Full', desc: 'Right angle turn' }
              ].map(preset => (
                <button
                  key={preset.deg}
                  onClick={() => updateConfig({ gazeYawAngle: preset.deg })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    (config.gazeYawAngle || 10) === preset.deg
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[10px] opacity-75">{preset.desc}</div>
                </button>
              ))}
            </div>

            {/* Confirmation Card */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Seamless Dual-Direction Navigation:</strong> Looking slightly to your left slides to the <strong>Left Desktop</strong>. Looking slightly to your right slides to the <strong>Right Desktop</strong>. Looking down at your keyboard or straight ahead produces 0 triggers.
              </div>
            </div>
          </HoloCard>

          {/* Configured Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <HoloCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Turn Left Action
                </span>
                <CyberBadge variant="cyan" size="xs">{config.gazeLeftAction || 'switch_left'}</CyberBadge>
              </div>
              <p className="text-[11px] text-[#86868b]">Action executed when you glance slightly to the left.</p>
              <div className="space-y-1.5">
                {[
                  { id: 'switch_left', label: 'Move 1 Desktop Left (Default)' },
                  { id: 'switch_right', label: 'Move 1 Desktop Right' },
                  { id: 'panic', label: 'Trigger Full Panic' },
                  { id: 'mute_toggle', label: 'Toggle Mute' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => updateConfig({ gazeLeftAction: item.id })}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      (config.gazeLeftAction || 'switch_left') === item.id
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200 font-semibold'
                        : 'bg-white/[0.02] border-white/[0.05] text-[#86868b] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {(config.gazeLeftAction || 'switch_left') === item.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            </HoloCard>

            <HoloCard className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" /> Turn Right Action
                </span>
                <CyberBadge variant="emerald" size="xs">{config.gazeRightAction || 'switch_right'}</CyberBadge>
              </div>
              <p className="text-[11px] text-[#86868b]">Action executed when you glance slightly to the right.</p>
              <div className="space-y-1.5">
                {[
                  { id: 'switch_right', label: 'Move 1 Desktop Right (Default)' },
                  { id: 'switch_left', label: 'Move 1 Desktop Left' },
                  { id: 'panic', label: 'Trigger Full Panic' },
                  { id: 'mute_toggle', label: 'Toggle Mute' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => updateConfig({ gazeRightAction: item.id, gazeAction: item.id })}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      (config.gazeRightAction || 'switch_right') === item.id
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 font-semibold'
                        : 'bg-white/[0.02] border-white/[0.05] text-[#86868b] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {(config.gazeRightAction || 'switch_right') === item.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </HoloCard>
          </div>
        </div>
      )}

      {/* DEDICATED NORD 4 AUDIOPHILE & EQUALIZER STUDIO SUBTAB */}
      {subTab === 'audiophile' && (
        <OnePlusAudiophileStudio btStats={btStats} />
      )}

      {/* DEDICATED NOTCH & BEZEL FLICK TAB */}
      {subTab === 'notch' && (
        <div className="space-y-6">
          <HoloCard className="p-6 space-y-5 border-indigo-500/30 bg-indigo-950/15">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                    <MousePointer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Trackpad Bezel / Camera Notch Flick Sentry</h3>
                    <p className="text-xs text-[#86868b]">
                      Passive OS-level event tap with zero microphone access. Completely leaves audio at 320kbps HD Stereo.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  {config.enableNotchFlick !== false ? 'ACTIVE' : 'DISABLED'}
                </span>
                <TactileSwitch
                  checked={config.enableNotchFlick !== false}
                  onChange={(checked) => updateConfig({ enableNotchFlick: checked })}
                />
              </div>
            </div>

            {/* Trigger Zone Selection */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-white">Target Detection Zone</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => updateConfig({ notchMode: 'notch' })}
                  className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between ${
                    (config.notchMode || 'notch') === 'notch'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">MacBook Camera Notch Center (Recommended)</div>
                    <div className="text-[11px] opacity-80 mt-1">
                      Only triggers when the cursor flings directly into the physical center notch (260px width). Allows normal use of top left menu bar and top right control center without false alarms.
                    </div>
                  </div>
                  {(config.notchMode || 'notch') === 'notch' && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>

                <button
                  onClick={() => updateConfig({ notchMode: 'edge' })}
                  className={`p-4 rounded-2xl text-left border transition-all flex items-start justify-between ${
                    config.notchMode === 'edge'
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Full Top Bezel Slam (Entire Top Edge)</div>
                    <div className="text-[11px] opacity-80 mt-1">
                      Triggers whenever the cursor slams the top edge anywhere across the 1710px display at high velocity.
                    </div>
                  </div>
                  {config.notchMode === 'edge' && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              </div>
            </div>

            {/* Velocity Threshold Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Upward Flick Velocity Threshold</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {config.notchVelocity || 1200} px/s
                  {(config.notchVelocity || 1200) <= 800 ? ' (Light Flick)' : (config.notchVelocity || 1200) <= 1500 ? ' (Fast Swipe - Recommended)' : ' (Violent Slam)'}
                </span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Prevents accidental triggers when casually moving the mouse to click browser tabs or menu items. Only a quick, purposeful upward throw will qualify.
              </p>
              <input
                type="range"
                min="500"
                max="2500"
                step="100"
                value={config.notchVelocity || 1200}
                onChange={(e) => updateConfig({ notchVelocity: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#86868b]">
                <span>Gentle Swipe (500 px/s)</span>
                <span>Standard Flick (1200 px/s)</span>
                <span>Fast Snap (2500 px/s)</span>
              </div>
            </div>
          </HoloCard>

          {/* Action on Notch Trigger */}
          <HoloCard className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">Action on Cursor Flick</h4>
                <p className="text-xs text-[#86868b]">What macOS does instantly when your cursor flings into the notch.</p>
              </div>
              <CyberBadge variant="indigo" size="xs">{config.notchFlickAction || 'switch_right'}</CyberBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {[
                { id: 'switch_right', label: 'Move 1 Desktop Right', desc: 'Instantly slides to right space' },
                { id: 'switch_left', label: 'Move 1 Desktop Left', desc: 'Instantly slides to left space' },
                { id: 'panic', label: 'Full Boss Key (Mute + Switch)', desc: 'Instant panic sequence' },
                { id: 'return', label: 'Return to Movie', desc: 'Restores space & audio' },
                { id: 'mute_toggle', label: 'Mute / Unmute Audio', desc: 'Silences sound immediately' },
                { id: 'pause_media', label: 'Pause Chrome / Netflix', desc: 'Halts video playback' }
              ].map((act) => {
                const isSelected = (config.notchFlickAction || 'switch_right') === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => updateConfig({ notchFlickAction: act.id })}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-400/40 text-white font-semibold'
                        : 'bg-white/[0.02] border-white/[0.05] text-[#86868b] hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-white text-xs">{act.label}</div>
                      <div className="text-[10px] text-[#86868b]">{act.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </HoloCard>

          {/* Stealth & Safety Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HoloCard className="p-5 space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                100% Guaranteed Pristine Audio
              </span>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Zero audio subsystems are touched. The OnePlus Buds Nord 4 stay in 320kbps A2DP stereo with zero risk of codec downgrade.
              </p>
            </HoloCard>

            <HoloCard className="p-5 space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                Invisible Natural Reflex
              </span>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Your hand is already resting on the trackpad. A quick 1-centimeter flick of your index finger triggers the desktop switch in 15ms. To anyone watching, it looks like a normal hand reposition.
              </p>
            </HoloCard>
          </div>
        </div>
      )}

      {/* SUBTAB 2: TAP ACTIONS */}
      {subTab === 'triggers' && (
        <div className="space-y-6">
          {/* Protection Banner */}
          <HoloCard className="p-5 border-emerald-500/30 bg-emerald-950/10 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Block Original Mac Events (Pause / Game Mode / Siri)</span>
                </div>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  When enabled, system media daemon <code className="text-emerald-300 font-mono">rcd</code> is suppressed so tapping does <strong>not</strong> trigger accidental macOS pause/play or switch into Game Mode.
                </p>
              </div>
              <TactileSwitch
                checked={config.suppressOriginalMedia}
                onChange={(checked) => updateConfig({ suppressOriginalMedia: checked })}
              />
            </div>
          </HoloCard>

          {/* Matrix of Single, Double, Triple Tap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: 'singleTapAction', label: 'Single Tap (1x)', badge: 'sky', color: 'sky', current: config.singleTapAction },
              { key: 'doubleTapAction', label: 'Double Tap (2x)', badge: 'emerald', color: 'emerald', current: config.doubleTapAction },
              { key: 'tripleTapAction', label: 'Triple Tap (3x)', badge: 'purple', color: 'purple', current: config.tripleTapAction }
            ].map((tap) => (
              <HoloCard key={tap.key} className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{tap.label}</h4>
                  <CyberBadge variant={tap.badge as any} size="xs">{tap.current}</CyberBadge>
                </div>

                <div className="space-y-1.5">
                  {[
                    { id: 'switch_right', label: 'Move 1 Desktop Right', desc: 'Slide right' },
                    { id: 'switch_left', label: 'Move 1 Desktop Left', desc: 'Slide left' },
                    { id: 'panic', label: 'Full Boss Key (Mute + Switch)', desc: 'Panic sequence' },
                    { id: 'return', label: 'Return to Movie', desc: 'Restore window & sound' },
                    { id: 'mute_toggle', label: 'Mute / Unmute Sound', desc: 'Toggle audio' },
                    { id: 'pause_media', label: 'Pause Chrome / Netflix', desc: 'Pause active players' },
                    { id: 'hide_window', label: 'Hide Chrome Window', desc: 'Make invisible' },
                    { id: 'none', label: 'Do Nothing (Ignore)', desc: 'Disable' }
                  ].map((act) => (
                    <button
                      key={act.id}
                      onClick={() => updateConfig({ [tap.key]: act.id })}
                      className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs ${
                        tap.current === act.id
                          ? 'bg-white/10 text-white border-white/30 font-semibold'
                          : 'bg-white/[0.02] border-white/[0.05] text-[#86868b] hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{act.label}</div>
                        <div className="text-[10px] text-[#86868b]">{act.desc}</div>
                      </div>
                      {tap.current === act.id && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </HoloCard>
            ))}
          </div>

          {/* Speed Window & In-Ear Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HoloCard className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Multi-Tap Speed Window</span>
                <span className="font-mono text-sky-400">{config.tapWindowMs || 500} ms</span>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Time allowed between taps. 500ms makes it comfortable to hit double and triple taps.
              </p>
              <input
                type="range"
                min="350"
                max="900"
                step="25"
                value={config.tapWindowMs || 500}
                onChange={(e) => updateConfig({ tapWindowMs: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#86868b]">
                <span>Fast (350ms)</span>
                <span>Standard (500ms)</span>
                <span>Relaxed (900ms)</span>
              </div>
            </HoloCard>

            <HoloCard className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white">In-Ear Removal Detection</span>
                  <p className="text-xs text-[#86868b] leading-relaxed">
                    Triggers when you pull the bud out. Turned OFF so it does not trigger accidentally.
                  </p>
                </div>
                <TactileSwitch
                  checked={config.enableInEarRemoval}
                  onChange={(checked) => updateConfig({ enableInEarRemoval: checked })}
                />
              </div>
            </HoloCard>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DESKTOP & SOUND */}
      {subTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HoloCard className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white">Move to Another Desktop</span>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Switches spaces automatically when triggered.
                </p>
              </div>
              <TactileSwitch
                checked={config.switchDesktop}
                onChange={(checked) => updateConfig({ switchDesktop: checked })}
              />
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="space-y-3">
              <span className="text-xs font-bold text-white">Default Direction</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateConfig({ desktopDirection: 'right' })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    config.desktopDirection === 'right'
                      ? 'bg-white text-slate-950 font-bold border-white shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Move Once Right</div>
                  <div className="text-[10px] opacity-75">Your preference</div>
                </button>

                <button
                  onClick={() => updateConfig({ desktopDirection: 'left' })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    config.desktopDirection === 'left'
                      ? 'bg-white text-slate-950 font-bold border-white shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Move Once Left</div>
                  <div className="text-[10px] opacity-75">Opposite direction</div>
                </button>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white">Pause Video in Chrome</span>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Pauses whatever YouTube or video is playing so you don't lose your spot.
                </p>
              </div>
              <TactileSwitch
                checked={config.pauseChrome}
                onChange={(checked) => updateConfig({ pauseChrome: checked })}
              />
            </div>
          </HoloCard>

          <HoloCard className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white">Mute Sound Immediately</span>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Silences all audio coming through headphones and speakers.
                </p>
              </div>
              <TactileSwitch
                checked={config.muteAudio}
                onChange={(checked) => updateConfig({ muteAudio: checked })}
              />
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="space-y-3">
              <span className="text-xs font-bold text-white">Mute Mode</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateConfig({ muteMode: 'zero' })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    config.muteMode === 'zero'
                      ? 'bg-white text-slate-950 font-bold border-white shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">100% Silent</div>
                  <div className="text-[10px] opacity-75">Volume 0 + Mute flag</div>
                </button>

                <button
                  onClick={() => updateConfig({ muteMode: 'lower_to_10' })}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    config.muteMode === 'lower_to_10'
                      ? 'bg-white text-slate-950 font-bold border-white shadow-md'
                      : 'bg-white/[0.02] border-white/[0.06] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Whisper (10%)</div>
                  <div className="text-[10px] opacity-75">Low volume</div>
                </button>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white">Mute Microphone Too</span>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Prevents discord/meetings from hearing room noises.
                </p>
              </div>
              <TactileSwitch
                checked={config.muteMic}
                onChange={(checked) => updateConfig({ muteMic: checked })}
              />
            </div>
          </HoloCard>
        </div>
      )}

      {/* SUBTAB 4: RECOVERY */}
      {subTab === 'recovery' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HoloCard className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white">Tap Again to Return</span>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  When enabled, tapping in panic state slides back to your movie and restores audio.
                </p>
              </div>
              <TactileSwitch
                checked={config.toggleMode}
                onChange={(checked) => updateConfig({ toggleMode: checked })}
              />
            </div>

            <div className="h-px bg-white/[0.06]" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Volume level when returning</span>
                <span className="font-mono text-sky-400">{config.restoreVolumeLevel}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={config.restoreVolumeLevel}
                onChange={(e) => updateConfig({ restoreVolumeLevel: parseInt(e.target.value, 10) })}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          </HoloCard>

          <HoloCard className="p-6 space-y-4">
            <span className="text-sm font-bold text-white">Auto-Return Timer</span>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Optional countdown to return automatically without needing a second tap.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { sec: 0, label: 'Manual Only' },
                { sec: 10, label: 'After 10s' },
                { sec: 20, label: 'After 20s' },
                { sec: 45, label: 'After 45s' }
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => updateConfig({ autoRevertSeconds: item.sec })}
                  className={`p-2.5 rounded-xl text-xs font-medium border transition-all ${
                    config.autoRevertSeconds === item.sec
                      ? 'bg-white text-slate-950 font-bold border-white shadow-sm'
                      : 'bg-white/[0.03] border-white/[0.06] text-[#86868b] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </HoloCard>
        </div>
      )}

      {/* SUBTAB 5: LOGS */}
      {subTab === 'logs' && (
        <HoloCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Live Bluetooth Event Log</h4>
            <TactileButton
              variant="secondary"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setLogs([])}
            >
              Clear Log
            </TactileButton>
          </div>

          <div className="font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="text-[#86868b] py-8 text-center">
                Tap your earbud stem to see real-time packet triggers here!
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-start gap-3"
                >
                  <span className="text-[#86868b] shrink-0">{log.timestamp}</span>
                  <CyberBadge variant="sky" size="xs">{log.source}</CyberBadge>
                  <span className="text-[#f5f5f7] flex-1">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </HoloCard>
      )}

      {/* SUBTAB 6: MOBILE REMOTE */}
      {subTab === 'phone' && (
        <HoloCard className="p-8 text-center space-y-6 max-w-xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Silent Mobile Remote</h3>
            <p className="text-xs text-[#86868b]">
              Open this address on your phone connected to the same Wi-Fi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] inline-flex items-center gap-3">
            <span className="font-mono text-sm text-sky-400">{remoteUrl}</span>
            <button
              onClick={copyRemoteUrl}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {copiedIp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (isPanicking) triggerRestore();
                else triggerPanic('Phone Web Remote');
              }}
              className={`w-full py-12 rounded-2xl border text-lg font-extrabold tracking-tight transition-all duration-200 active:scale-95 shadow-2xl flex flex-col items-center justify-center gap-2 ${
                isPanicking
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-rose-600 text-white border-rose-500'
              }`}
            >
              <ShieldAlert className="w-8 h-8" />
              <span>{isPanicking ? 'RETURN TO MOVIE' : 'MOVE 1 SPACE RIGHT'}</span>
            </button>
          </div>
        </HoloCard>
      )}
    </div>
  );
};
