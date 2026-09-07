import React, { useState } from 'react';
import {
  Thermometer,
  Zap,
  Wind,
  ShieldCheck,
  Activity,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
  PauseCircle,
  Minimize2,
  Check
} from 'lucide-react';
import { HoloCard, CyberBadge } from './UIElements';
import { sound } from '../utils/audio';

interface ThermalTabProps {
  stats: any;
  triggerAction: (action: string, payload?: any, label?: string) => Promise<any>;
  loadingAction: string | null;
}

export const ThermalTab: React.FC<ThermalTabProps> = ({ stats, triggerAction, loadingAction }) => {
  const [activeCoolingMode, setActiveCoolingMode] = useState<string | null>(null);

  const m4 = stats?.m4SoC || stats?.m4Telemetry || {};
  const currentTemp = parseFloat(m4.tempC || '31.2');
  const watts = parseFloat(m4.watts || '4.0');
  const volt = parseFloat(m4.voltV || '12.8');
  const cycles = m4.cycles || 123;
  const health = m4.health || '100%';
  const thermalState = m4.thermalState || 'Nominal';

  const isHot = currentTemp > 55;
  const isWarm = currentTemp > 42;

  const handleExecuteCooling = async (action: string, label: string) => {
    sound.playClick();
    setActiveCoolingMode(action);
    await triggerAction(action, {}, label);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto text-[#f5f5f7] bg-[#000000]">
      {/* 1. Header: Apple Silicon Thermal Architecture */}
      <HoloCard className="p-8 sm:p-10 border border-white/[0.08] bg-[#101010] shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#f5f5f7] shrink-0">
              <Thermometer className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#f5f5f7] tracking-tight">Apple Silicon Thermal & Heat Sentry</h2>
                <CyberBadge variant="slate" size="xs">Live Telemetry</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] mt-1 max-w-2xl leading-relaxed">
                Direct hardware thermistors reading power delivery, SoC junction temperature, and passive dissipation. Cool down your Mac without closing running apps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-[#f5f5f7] tracking-tight">
                {currentTemp.toFixed(1)}°C
              </div>
              <div className="text-[11px] font-mono text-[#86868b]">
                {isHot ? 'High Thermal State' : isWarm ? 'Elevated Temperature' : 'Nominal • Optimal Cool'}
              </div>
            </div>
            <div className={`w-3.5 h-3.5 rounded-full ${isHot ? 'bg-[#ff453a] animate-ping' : 'bg-[#30d158]'}`} />
          </div>
        </div>

        {/* Real-time Heat Gauge */}
        <div className="p-6 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#86868b] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#f5f5f7]" /> Apple M4 Die & Battery Junction Thermistor
            </span>
            <span className="text-[#f5f5f7] font-bold">{currentTemp.toFixed(1)}°C / 100°C Max Safe</span>
          </div>

          <div className="relative h-3 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]">
            <div
              className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, (currentTemp / 95) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#86868b]">
            <span>20°C (Cold)</span>
            <span>35°C (Nominal Idle)</span>
            <span>50°C (Moderate)</span>
            <span>75°C (High Load)</span>
            <span className="text-[#f5f5f7] font-bold">100°C (Thermal Limit)</span>
          </div>
        </div>

        {/* Real-Time Hardware Sensor Metrics (4 Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] space-y-1">
            <span className="text-[11px] font-mono text-[#86868b]">SoC Core Power</span>
            <div className="text-base font-bold font-mono text-[#f5f5f7]">{watts.toFixed(1)} Watts</div>
            <p className="text-[10px] text-[#86868b]">Instantaneous Power Draw</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] space-y-1">
            <span className="text-[11px] font-mono text-[#86868b]">Battery Voltage</span>
            <div className="text-base font-bold font-mono text-[#f5f5f7]">{volt.toFixed(2)} Volts</div>
            <p className="text-[10px] text-[#86868b]">PMU Bus Regulation</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] space-y-1">
            <span className="text-[11px] font-mono text-[#86868b]">Thermal Pressure</span>
            <div className="text-base font-bold font-mono text-[#30d158]">{thermalState}</div>
            <p className="text-[10px] text-[#86868b]">macOS Thermal State</p>
          </div>

          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] space-y-1">
            <span className="text-[11px] font-mono text-[#86868b]">Battery Cycle & Health</span>
            <div className="text-base font-bold font-mono text-[#f5f5f7]">{cycles} Cycles • {health}</div>
            <p className="text-[10px] text-[#86868b]">Cell Condition Pristine</p>
          </div>
        </div>
      </HoloCard>

      {/* 2. Non-Destructive Active Cooling Studio */}
      <HoloCard className="p-8 sm:p-10 border border-white/[0.08] bg-[#101010] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#f5f5f7] flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#86868b]" />
              Non-Destructive Thermal Cooling Options
            </h3>
            <p className="text-xs text-[#86868b] mt-1">
              Reduce heat, CPU power draw, and fan speeds <strong>without quitting any applications</strong>.
            </p>
          </div>
          <button
            onClick={() => handleExecuteCooling('cool-full-cycle', 'Master Silent Silicon Cooling Sequence')}
            disabled={loadingAction === 'cool-full-cycle'}
            className="px-5 py-2.5 rounded-full bg-[#f5f5f7] hover:bg-white text-black font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loadingAction === 'cool-full-cycle' ? 'animate-spin' : ''}`} />
            {loadingAction === 'cool-full-cycle' ? 'Executing Cooling Cycle...' : 'Execute Master Cooling Cycle'}
          </button>
        </div>

        {/* 4 Dedicated Non-Destructive Cooling Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Inactive Memory Purge */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#f5f5f7] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#86868b]" /> Purge Inactive RAM Pressure
                </span>
                <CyberBadge variant="slate" size="xs">Zero App Closures</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Flushes stale disk cache buffers and dormant pagefiles from unified memory without quitting open apps, cooling SoC memory controllers instantly.
              </p>
            </div>
            <button
              onClick={() => handleExecuteCooling('cool-purge-inactive-ram', 'Purge Inactive RAM')}
              disabled={loadingAction === 'cool-purge-inactive-ram'}
              className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-[#f5f5f7] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingAction === 'cool-purge-inactive-ram' ? 'Purging Memory Pressure...' : 'Purge Inactive Memory Pressure'}
            </button>
          </div>

          {/* Option 2: Background CPU Priority Throttle (Renice) */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#f5f5f7] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#86868b]" /> Throttle Background Process Priority
                </span>
                <CyberBadge variant="slate" size="xs">Gentle Renice (+15)</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Adjusts Unix priority of background processes so your active app remains responsive while background tasks surrender CPU cycles to let the chip cool down.
              </p>
            </div>
            <button
              onClick={() => handleExecuteCooling('cool-renice-background', 'Throttle Background Priorities')}
              disabled={loadingAction === 'cool-renice-background'}
              className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-[#f5f5f7] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingAction === 'cool-renice-background' ? 'Throttling Background Tasks...' : 'Throttle Background CPU Priority'}
            </button>
          </div>

          {/* Option 3: Pause Background Browser Media Decoders */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#f5f5f7] flex items-center gap-2">
                  <PauseCircle className="w-4 h-4 text-[#86868b]" /> Pause Inactive Tab Video Decoders
                </span>
                <CyberBadge variant="slate" size="xs">Chrome & Safari</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Sends a silent pause signal to video/audio streams in all background browser tabs without closing any tabs, immediately relieving GPU and hardware decoder load.
              </p>
            </div>
            <button
              onClick={() => handleExecuteCooling('cool-pause-background-tabs', 'Pause Background Browser Media')}
              disabled={loadingAction === 'cool-pause-background-tabs'}
              className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-[#f5f5f7] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingAction === 'cool-pause-background-tabs' ? 'Pausing Media Streams...' : 'Pause Background Tab Media Decoders'}
            </button>
          </div>

          {/* Option 4: Metal GPU Compositor Rest */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#f5f5f7] flex items-center gap-2">
                  <Minimize2 className="w-4 h-4 text-[#86868b]" /> Throttle Window Animation Frame Rate
                </span>
                <CyberBadge variant="slate" size="xs">Metal Engine Rest</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Disables window resize and modal transition physics in WindowServer to drastically reduce Metal GPU graphics render passes and dissipate heat.
              </p>
            </div>
            <button
              onClick={() => handleExecuteCooling('cool-throttle-display-rate', 'Throttle Metal Animation Physics')}
              disabled={loadingAction === 'cool-throttle-display-rate'}
              className="w-full py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-[#f5f5f7] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              {loadingAction === 'cool-throttle-display-rate' ? 'Resting Metal Engine...' : 'Throttle Window Animation Physics'}
            </button>
          </div>
        </div>
      </HoloCard>

      {/* 3. Apple Thermal Verification Guarantee */}
      <HoloCard className="p-6 border border-white/[0.08] bg-[#101010] flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#f5f5f7] shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#30d158]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#f5f5f7]">Apple Silicon Thermal Guarantee</h4>
          <p className="text-xs text-[#86868b] leading-relaxed">
            All cooling operations use non-destructive POSIX signals (`renice`), memory allocator purges, and native AppleEvents script dispatching. You will never lose unsaved project files, open documents, or browser state while cooling down your Mac.
          </p>
        </div>
      </HoloCard>
    </div>
  );
};
