import React, { useState } from 'react';
import { BatteryCharging, Battery, Zap, Shield, Sparkles, Thermometer, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed, MetricProgressRing } from './UIElements';
import { sound } from '../utils/audio';

interface BatteryStudioProps {
  battery?: {
    percent: number;
    state: string;
    remaining: string;
    cycles: number;
    health: string;
    condition: string;
  };
  m4Telemetry?: {
    tempC: string;
    voltV: string;
    watts: string;
    designCapacity?: number;
    rawMaxCapacity?: number;
  };
}

export const BatteryDegradationStudio: React.FC<BatteryStudioProps> = ({ battery, m4Telemetry }) => {
  const [chargeLimitMode, setChargeLimitMode] = useState<boolean>(true);

  const percent = battery?.percent || 91;
  const cycles = battery?.cycles || 121;
  const health = battery?.health || '100%';
  const condition = battery?.condition || 'Normal';
  const remaining = battery?.remaining || '10:28 remaining';
  const tempC = m4Telemetry?.tempC || '30.6';
  const voltV = m4Telemetry?.voltV || '12.72';
  const watts = m4Telemetry?.watts || '3.8';
  const design = m4Telemetry?.designCapacity || 4629;
  const rawMax = m4Telemetry?.rawMaxCapacity || 4673;

  // Calculate degradation curve projection (Apple Silicon standard ~1000 cycles to 80%)
  const expectedCapacityPercent = Math.max(80, Math.round(100 - (cycles / 1000) * 20));

  return (
    <HoloCard className="p-8 sm:p-10 space-y-8 bg-gradient-to-b from-[#0e1526]/95 to-[#090e1a]/95 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-white">Apple Silicon Battery Degradation & Longevity Studio</h3>
              <CyberBadge variant="emerald">100% HEALTH</CyberBadge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Cathode Life Expectancy • AlDente 80% Threshold Governance • 1,000-Cycle Durability Model
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium flex items-center gap-2">
            <StatusLed color="green" size="sm" />
            <span>Condition: {condition.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* 3-Column Layout: Visual Gauge + Longevity Curve + AlDente Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Circular Gauge & Real-time Battery Stats (4 cols) */}
        <div className="lg:col-span-4 bg-[#080d1a]/90 rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Current Battery State
          </span>

          <MetricProgressRing
            value={percent}
            size={140}
            strokeWidth={12}
            color={percent > 30 ? '#10b981' : (percent > 15 ? '#fbbf24' : '#f43f5e')}
            label={percent.toString()}
            unit="%"
            sublabel={battery?.state || 'Discharging'}
          />

          <div className="w-full space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Runtime:</span>
              <span className="text-white font-semibold">{remaining || '10+ hours'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Raw Capacity:</span>
              <span className="text-white">{rawMax} mAh / {design} mAh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cycle Count:</span>
              <span className="text-cyan-400 font-bold">{cycles} / 1,000</span>
            </div>
          </div>
        </div>

        {/* Center: Visual 1000-Cycle Degradation Projection Curve (5 cols) */}
        <div className="lg:col-span-5 bg-[#080d1a]/90 rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                1,000-Cycle Degradation Curve
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Current Position: {(cycles / 10).toFixed(1)}% of cycle life
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              Apple Silicon lithium-ion battery cells are engineered to retain up to 80% of original capacity at 1,000 full charge cycles under normal thermal governance.
            </p>

            {/* Visual Step Timeline */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Cycle 0 (100%)</span>
                <span className="text-white font-bold">Cycle {cycles} (Today: {health})</span>
                <span>Cycle 1,000 (80%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(12, (cycles / 1000) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.06] text-xs font-mono">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-slate-400 text-[10px]">Bus Voltage</div>
              <div className="text-base font-bold text-white mt-0.5">{voltV} V</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <div className="text-slate-400 text-[10px]">Battery Temp</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{tempC} °C</div>
            </div>
          </div>
        </div>

        {/* Right: AlDente Longevity Recommendations (3 cols) */}
        <div className="lg:col-span-3 bg-[#080d1a]/90 rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Longevity Tips
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 80% Charge Cap
                </div>
                <p className="text-[11px] text-slate-400">
                  Keeping battery between 20% and 80% quadruples chemical cathode life.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="font-semibold text-cyan-300 text-xs flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5" /> Thermal Rule
                </div>
                <p className="text-[11px] text-slate-400">
                  Avoid charging when battery temp exceeds 35°C to avoid irreversible plating.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              Zero Degradation Anomalies
            </span>
          </div>
        </div>

      </div>
    </HoloCard>
  );
};
