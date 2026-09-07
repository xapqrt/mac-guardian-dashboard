import React from 'react';
import { Cpu, Zap, Thermometer, BatteryCharging, Activity } from 'lucide-react';
import { HoloCard, StatusLed, CyberBadge } from './UIElements';

interface M4TelemetryProps {
  telemetry?: {
    chipBrand: string;
    totalCores: number;
    pCores: number;
    eCores: number;
    tempC: string;
    voltV: string;
    watts: string;
    thermalState: string;
    cycles: number;
    health: string;
    designCapacity?: number;
    rawMaxCapacity?: number;
  };
  loadAvg?: {
    load1: string;
    load5: string;
    load15: string;
  };
}

export const M4TelemetryCard: React.FC<M4TelemetryProps> = ({ telemetry, loadAvg }) => {
  const m4 = telemetry || {
    chipBrand: 'Apple M4',
    totalCores: 10,
    pCores: 4,
    eCores: 6,
    tempC: '30.6',
    voltV: '12.74',
    watts: '3.8',
    thermalState: 'Nominal',
    cycles: 121,
    health: '100%',
    designCapacity: 4629,
    rawMaxCapacity: 4673
  };

  const currentWatts = parseFloat(m4.watts) || 3.8;
  const currentTemp = parseFloat(m4.tempC) || 30.6;
  const load1 = parseFloat(loadAvg?.load1 || '2.2');

  return (
    <HoloCard className="p-8 sm:p-10 space-y-8 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.12)] backdrop-blur-xl relative overflow-hidden">
      {/* Ambient Silicon Glow Background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Apple Silicon M4 Deep Telemetry
              </h2>
              <CyberBadge variant="slate">M4 10-CORE</CyberBadge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Armv9.2-A Architecture • 4 Performance Cores + 6 Efficiency Cores • Unified Memory Bus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <StatusLed color="green" size="sm" />
            <span>Thermal State: {m4.thermalState.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Silicon Die Visualizer + Power / Thermal Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Interactive Silicon Die Architecture (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0e17]/80 rounded-2xl border border-white/[0.08] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Silicon Core Topology & Active Clusters
              </span>
              <span className="text-[11px] font-mono text-cyan-400/80">
                10 Total Cores (100% Silicon Health)
              </span>
            </div>

            {/* P-Core Cluster */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono text-slate-400 px-1">
                <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Performance Cluster (P-Cores)
                </span>
                <span>4 Cores • Heavy Computational Workloads</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((coreNum) => {
                  const isActive = load1 > (coreNum * 0.6);
                  return (
                    <div
                      key={`p-core-${coreNum}`}
                      className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between h-20 ${
                        isActive
                          ? 'bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-white">P{coreNum}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {isActive ? 'High Gear' : 'Standby'}
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                            style={{ width: isActive ? `${Math.min(100, Math.round(load1 * 25))}%` : '15%' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* E-Core Cluster */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400 px-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Efficiency Cluster (E-Cores)
                </span>
                <span>6 Cores • Background Daemons & Low Draw</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((coreNum) => (
                  <div
                    key={`e-core-${coreNum}`}
                    className="p-3 rounded-xl border bg-emerald-950/20 border-emerald-500/30 flex flex-col justify-between h-20 shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                  >
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="font-bold text-emerald-300">E{coreNum}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] text-emerald-400/80 font-mono">Active</div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Dynamic Frequency Scaling Active</span>
            <span className="text-slate-300">Asymmetric Multiprocessing (AMP)</span>
          </div>
        </div>

        {/* Right Column: Live Thermodynamics & Power Metrics (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* SoC Package Power Card */}
          <div className="p-6 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2 text-amber-400 font-semibold">
                <Zap className="w-4 h-4" /> Package Power
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                LIVE IOKIT
              </span>
            </div>
            <div>
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
                {currentWatts}
                <span className="text-sm font-normal text-slate-400">Watts</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {currentWatts < 5.0 ? 'Ultra-High Efficiency Idle' : 'Active Compute Phase'}
              </p>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentWatts / 25) * 100)}%` }}
              />
            </div>
          </div>

          {/* Battery Temperature Card */}
          <div className="p-6 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Thermometer className="w-4 h-4" /> Thermal Sensor
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">
                CELSIUS
              </span>
            </div>
            <div>
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-baseline gap-1.5">
                {currentTemp}
                <span className="text-sm font-normal text-slate-400">°C</span>
              </div>
              <p className="text-xs text-emerald-400 mt-1 font-mono">
                Optimal Operating Temperature
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Bus Voltage:</span>
              <span className="text-white font-semibold">{m4.voltV} V</span>
            </div>
          </div>

          {/* Battery Degradation & Cycles */}
          <div className="sm:col-span-2 p-6 rounded-2xl bg-[#0b0e17]/80 border border-white/[0.08] flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">Battery Health & Health Factor</div>
                <div className="text-base font-bold text-white font-mono flex items-center gap-2 mt-0.5">
                  <span>{m4.health} Capacity</span>
                  <span className="text-xs font-normal text-slate-400">• {m4.cycles} Cycle Count</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <div className="text-right">
                <div>Raw Max: <span className="text-white">{m4.rawMaxCapacity || 4673} mAh</span></div>
                <div>Design: <span className="text-slate-400">{m4.designCapacity || 4629} mAh</span></div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-emerald-400 font-semibold text-xs">
                Zero Throttling
              </div>
            </div>
          </div>

        </div>

      </div>
    </HoloCard>
  );
};
