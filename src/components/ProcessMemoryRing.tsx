import React, { useState } from 'react';
import { Activity, ShieldCheck, Lock, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { sound } from '../utils/audio';

interface ProcessItem {
  pid: string | number;
  name: string;
  cpu: number;
  rssMb: number;
  category: string;
  categoryLabel: string;
  isSafeToQuit: boolean;
  advice: string;
}

interface ProcessMemoryRingProps {
  processes: ProcessItem[];
  onTerminate: (pid: any, name: string) => void;
  onSelectProcess?: (name: string) => void;
}

export const ProcessMemoryRing: React.FC<ProcessMemoryRingProps> = ({
  processes = [],
  onTerminate,
  onSelectProcess
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Take top 6 memory consumers
  const topProcesses = processes.slice(0, 6);
  const totalTopRss = topProcesses.reduce((acc, p) => acc + (p.rssMb || 0), 0) || 1;

  const colors = [
    { bg: '#38bdf8', label: 'text-sky-400', bar: 'bg-sky-400' },
    { bg: '#a855f7', label: 'text-purple-400', bar: 'bg-purple-500' },
    { bg: '#ec4899', label: 'text-pink-400', bar: 'bg-pink-500' },
    { bg: '#34d399', label: 'text-emerald-400', bar: 'bg-emerald-400' },
    { bg: '#fb923c', label: 'text-amber-400', bar: 'bg-amber-400' },
    { bg: '#818cf8', label: 'text-indigo-400', bar: 'bg-indigo-400' },
  ];

  const activeProcess = hoveredIdx !== null ? topProcesses[hoveredIdx] : topProcesses[0];

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0e15] border border-white/[0.08] relative overflow-hidden space-y-6">
      {/* Ambient background glow following active item */}
      <div
        className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-15 transition-colors duration-300"
        style={{ background: hoveredIdx !== null ? colors[hoveredIdx % colors.length].bg : '#38bdf8' }}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-white tracking-tight">
              Top Memory Consumer Footprints
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono font-bold uppercase">
              Unified RAM Allocation
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Proportional memory distribution of heavy runtimes. Hover to inspect, click to isolate.
          </p>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          <span>Total Top 6 Footprint: </span>
          <span className="text-white font-bold">{totalTopRss} MB</span>
        </div>
      </div>

      {/* Proportional Segmented Memory Bar */}
      <div className="h-5 w-full rounded-2xl bg-white/[0.04] border border-white/[0.06] p-1 flex gap-1.5 overflow-hidden relative z-10">
        {topProcesses.map((proc, idx) => {
          const pct = Math.max(6, Math.round((proc.rssMb / totalTopRss) * 100));
          const color = colors[idx % colors.length];
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={proc.pid}
              style={{ width: `${pct}%` }}
              onMouseEnter={() => {
                sound.playClick();
                setHoveredIdx(idx);
              }}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onSelectProcess && onSelectProcess(proc.name)}
              className={`h-full rounded-xl transition-all duration-200 cursor-pointer ${color.bar} ${
                isHovered ? 'scale-y-110 brightness-125 shadow-lg' : 'opacity-85 hover:opacity-100'
              }`}
              title={`${proc.name} (PID ${proc.pid}): ${proc.rssMb} MB (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Interactive Process Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
        {topProcesses.map((proc, idx) => {
          const color = colors[idx % colors.length];
          const isHovered = hoveredIdx === idx;
          const pct = Math.round((proc.rssMb / totalTopRss) * 100);

          return (
            <div
              key={proc.pid}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                isHovered
                  ? 'bg-white/[0.08] border-white/20 shadow-md scale-[1.02]'
                  : 'bg-black/40 border-white/[0.04] hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 mr-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ background: color.bg }}
                />
                <div className="min-w-0">
                  <div className="font-bold text-white truncate max-w-[140px]">{proc.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    PID {proc.pid} • {proc.cpu.toFixed(1)}% CPU
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 font-mono">
                <div className="text-right">
                  <span className={`font-bold ${color.label}`}>{proc.rssMb} MB</span>
                  <div className="text-[10px] text-slate-500">{pct}% Top</div>
                </div>

                {proc.isSafeToQuit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playPurge();
                      onTerminate(proc.pid, proc.name);
                    }}
                    title="Terminate process"
                    className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/20 text-[10px] font-bold transition-colors"
                  >
                    Kill
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
