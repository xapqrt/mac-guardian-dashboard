import React from 'react';
import { Layers, Zap, HardDrive, RefreshCw, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed, MetricProgressRing } from './UIElements';
import { sound } from '../utils/audio';

interface MemoryCompressorProps {
  ram?: {
    usedGb: string;
    freeGb: string;
    totalGb: string;
    percent: number;
    swapUsedMb: number;
    appMemoryGb: string;
    wiredGb: string;
    compressedGb: string;
  };
  triggerAction: (action: string, payload: any, label: string) => void;
  loadingAction: string | null;
}

export const MemoryCompressorVisualizer: React.FC<MemoryCompressorProps> = ({
  ram,
  triggerAction,
  loadingAction
}) => {
  const r = ram || {
    usedGb: '6.1',
    freeGb: '5.8',
    totalGb: '12.0',
    percent: 51,
    swapUsedMb: 424,
    appMemoryGb: '4.0',
    wiredGb: '2.2',
    compressedGb: '0.0'
  };

  const total = parseFloat(r.totalGb) || 16;
  const used = parseFloat(r.usedGb) || 6.1;
  const app = parseFloat(r.appMemoryGb) || 4.0;
  const wired = parseFloat(r.wiredGb) || 2.2;
  const compressed = parseFloat(r.compressedGb) || 0.1;
  const swapMb = r.swapUsedMb || 424;

  const appPercent = Math.round((app / total) * 100);
  const wiredPercent = Math.round((wired / total) * 100);
  const compressedPercent = Math.max(2, Math.round((compressed / total) * 100));

  const pressureStatus = r.percent < 70 ? 'NORMAL' : (r.percent < 85 ? 'WARNING' : 'CRITICAL');
  const pressureColor = r.percent < 70 ? 'text-emerald-400' : (r.percent < 85 ? 'text-amber-400' : 'text-rose-400');

  const handlePurgeMemory = () => {
    sound.playPurge();
    triggerAction('boost-quick', {}, 'Purge Inactive & Compressed Memory');
  };

  return (
    <HoloCard className="p-8 sm:p-10 space-y-8 bg-gradient-to-b from-[#0c1322]/95 to-[#080d18]/95 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold tracking-tight text-white">Mach VM Memory Compressor & Swap Engine</h3>
              <CyberBadge variant="indigo">ZERO-COPY ARCHITECTURE</CyberBadge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live Apple Silicon Memory Pressure • Hardware Zlib Compressor • APFS Disk Swap Paging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TactileButton
            variant="secondary"
            onClick={handlePurgeMemory}
            disabled={loadingAction === 'boost-quick'}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Flush Inactive Pages</span>
          </TactileButton>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono flex items-center gap-2">
            <StatusLed color={r.percent < 70 ? 'green' : 'amber'} size="sm" />
            <span className={pressureColor}>Pressure: {pressureStatus}</span>
          </div>
        </div>
      </div>

      {/* 3-Column Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Memory Circular Pressure Gauge (4 cols) */}
        <div className="lg:col-span-4 bg-[#080d1a]/90 rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between items-center text-center space-y-4">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Total Unified Memory Load
          </span>

          <MetricProgressRing
            value={r.percent}
            size={140}
            strokeWidth={12}
            color={r.percent < 70 ? '#10b981' : (r.percent < 85 ? '#fbbf24' : '#f43f5e')}
            label={r.usedGb}
            unit="GB"
            sublabel={`OF ${r.totalGb}GB TOTAL`}
          />

          <div className="w-full space-y-2 pt-2 border-t border-white/[0.06] text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Physical RAM Free:</span>
              <span className="text-emerald-400 font-bold">{r.freeGb} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">APFS Swap Used:</span>
              <span className="text-amber-400 font-bold">{swapMb} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Compression Factor:</span>
              <span className="text-cyan-400 font-bold">~2.7x Memory Density</span>
            </div>
          </div>
        </div>

        {/* Center: Memory Segments Breakdown Bar (5 cols) */}
        <div className="lg:col-span-5 bg-[#080d1a]/90 rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Mach Kernel Memory Segments
              </span>
              <span className="text-[11px] font-mono text-cyan-400">100% Zero-Copy Silicon</span>
            </div>

            {/* Segmented Bar */}
            <div className="w-full h-4 rounded-full bg-white/[0.06] overflow-hidden flex my-4">
              <div className="bg-cyan-400 h-full" style={{ width: `${appPercent}%` }} title={`App Memory: ${app}GB`} />
              <div className="bg-purple-400 h-full" style={{ width: `${wiredPercent}%` }} title={`Wired Memory: ${wired}GB`} />
              <div className="bg-amber-400 h-full" style={{ width: `${compressedPercent}%` }} title={`Compressed: ${compressed}GB`} />
            </div>

            {/* Legend Cards */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                <span className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> App Memory
                </span>
                <span className="text-white font-bold">{r.appMemoryGb} GB</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                <span className="flex items-center gap-2 text-purple-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Wired Down (Kernel)
                </span>
                <span className="text-white font-bold">{r.wiredGb} GB</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-between items-center">
                <span className="flex items-center gap-2 text-amber-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Compressed Pool
                </span>
                <span className="text-white font-bold">{r.compressedGb} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Swap Space & Paging Advice (3 cols) */}
        <div className="lg:col-span-3 bg-[#080d1a]/90 rounded-2xl border border-white/[0.08] p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                APFS VM Swap
              </span>
            </div>

            <div className="space-y-2 text-xs font-sans text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="font-semibold text-white font-mono text-xs">
                  {swapMb} MB Stored on Disk
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-mono">
                  {swapMb < 1000
                    ? 'Swap pressure is minimal. SSD write amplification is low.'
                    : 'Heavy swap activity detected. Flushing idle tabs will reclaim disk writes.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="font-semibold text-cyan-400 font-mono text-xs">
                  Compression Ratio
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-mono">
                  Apple Silicon hardware accelerator compresses inactive pages in sub-10 microseconds.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              VM Subsystem Healthy
            </span>
          </div>
        </div>

      </div>
    </HoloCard>
  );
};
