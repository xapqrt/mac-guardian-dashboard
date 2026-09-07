import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Radio,
  Search,
  ShieldCheck,
  Lock,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge } from './UIElements';
import { ProcessMemoryRing } from './ProcessMemoryRing';
import { MemoryCompressorVisualizer } from './MemoryCompressorVisualizer';

interface ProcessItem {
  pid: string;
  name: string;
  cpu: number;
  mem: number;
  rssMb: number;
  category: 'system' | 'browser' | 'dev' | 'user' | 'helper';
  categoryLabel: string;
  isSafeToQuit: boolean;
  advice: string;
}

interface ProcessesTabProps {
  stats: any;
  triggerAction: (action: string, payload: Record<string, any>, label: string) => void;
}

export const ProcessesTab: React.FC<ProcessesTabProps> = ({
  stats,
  triggerAction
}) => {
  const [procCategoryFilter, setProcCategoryFilter] = useState<'all' | 'safe' | 'browser' | 'dev' | 'user' | 'system'>('safe');
  const [procSearch, setProcSearch] = useState('');
  const [procSort, setProcSort] = useState<'mem' | 'cpu' | 'name'>('mem');
  const [terminatedPids, setTerminatedPids] = useState<string[]>([]);
  const [freedPorts, setFreedPorts] = useState<string[]>([]);

  const filteredProcesses = useMemo(() => {
    if (!stats?.topProcesses) return [];
    let list = stats.topProcesses.filter((p: ProcessItem) => {
      const matchSearch = p.name.toLowerCase().includes(procSearch.toLowerCase()) || p.pid.includes(procSearch);
      if (!matchSearch) return false;

      if (procCategoryFilter === 'safe') return p.isSafeToQuit;
      if (procCategoryFilter === 'browser') return p.category === 'browser';
      if (procCategoryFilter === 'dev') return p.category === 'dev';
      if (procCategoryFilter === 'user') return p.category === 'user';
      if (procCategoryFilter === 'system') return p.category === 'system';
      return true;
    });

    if (procSort === 'mem') list.sort((a: ProcessItem, b: ProcessItem) => b.rssMb - a.rssMb);
    if (procSort === 'cpu') list.sort((a: ProcessItem, b: ProcessItem) => b.cpu - a.cpu);
    if (procSort === 'name') list.sort((a: ProcessItem, b: ProcessItem) => a.name.localeCompare(b.name));
    return list;
  }, [stats?.topProcesses, procSearch, procSort, procCategoryFilter]);

  const handleKillProcess = (pid: string, name: string, sig: 'TERM' | 'KILL' = 'TERM') => {
    setTerminatedPids(prev => [...prev, pid]);
    triggerAction('kill-process', { pid, sig }, `${sig === 'TERM' ? 'Quit' : 'Force Kill'} ${name}`);
  };

  const handleKillPort = (port: string) => {
    setFreedPorts(prev => [...prev, port]);
    triggerAction('kill-port', { port }, `Free Port :${port}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-[#F5F5F7]">
      {/* Mach Virtual Memory Compressor & Segment Analysis */}
      <MemoryCompressorVisualizer stats={stats} />

      {/* 0. Top Process Memory Distribution Visualizer */}
      {stats?.processes && stats.processes.length > 0 && (
        <ProcessMemoryRing
          processes={stats.processes}
          onTerminate={(pid, name) => handleKillProcess(pid, name)}
          onSelectProcess={(name) => setProcSearch(name)}
        />
      )}

      {/* 1. Activity Monitor Header & Filters */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7C3AED]" /> Activity Monitor & Safety Inspector
            </h3>
            <p className="text-xs text-[#8A8A93] max-w-2xl leading-relaxed">
              Real-time process intelligence with Apple kernel protection guards. Safely terminate memory-leaking apps without touching critical system daemons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => triggerAction('rescan-all', {}, 'Refresh Processes & Memory')}
            >
              ↻ Refresh
            </TactileButton>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-mono">
              {(['mem', 'cpu', 'name'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setProcSort(s)}
                  className={`px-3 py-1 rounded-2xl uppercase font-medium transition-all ${
                    procSort === s ? 'bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white shadow-sm' : 'text-[#8A8A93] hover:text-[#F5F5F7]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setProcCategoryFilter('safe')}
              className={`px-3.5 py-1.5 rounded-2xl font-medium transition-all flex items-center gap-1.5 ${
                procCategoryFilter === 'safe'
                  ? 'bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] border border-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE]" /> Safe to Quit
            </button>

            <button
              onClick={() => setProcCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-2xl font-medium transition-all ${
                procCategoryFilter === 'all'
                  ? 'bg-white/15 text-[#F5F5F7] border border-white/25 shadow-sm'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] border border-white/10'
              }`}
            >
              All Processes
            </button>

            <button
              onClick={() => setProcCategoryFilter('browser')}
              className={`px-3.5 py-1.5 rounded-2xl font-medium transition-all ${
                procCategoryFilter === 'browser'
                  ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] border border-white/10'
              }`}
            >
              Browsers
            </button>

            <button
              onClick={() => setProcCategoryFilter('dev')}
              className={`px-3.5 py-1.5 rounded-2xl font-medium transition-all ${
                procCategoryFilter === 'dev'
                  ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/40 shadow-[0_0_15px_rgba(124,58,237,0.2)]'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] border border-white/10'
              }`}
            >
              Developer Tools
            </button>

            <button
              onClick={() => setProcCategoryFilter('system')}
              className={`px-3.5 py-1.5 rounded-2xl font-medium transition-all flex items-center gap-1.5 ${
                procCategoryFilter === 'system'
                  ? 'bg-white/15 text-[#F5F5F7] border border-white/25'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] border border-white/10'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#8A8A93]" /> Apple Protected
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8A8A93]" />
            <input
              type="text"
              placeholder="Search name or PID..."
              value={procSearch}
              onChange={(e) => setProcSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#F5F5F7] placeholder-[#8A8A93] focus:outline-none focus:border-[#7C3AED]/60 focus:ring-1 focus:ring-[#7C3AED]/40 transition-all"
            />
          </div>
        </div>

        {procCategoryFilter === 'system' && (
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2.5 text-xs text-[#8A8A93]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#22D3EE]" />
            <span>
              <strong>Apple System Core:</strong> These processes (WindowServer, launchd, coreaudiod) are protected by macOS kernel integrity. Terminating them is locked to protect system stability.
            </span>
          </div>
        )}

        <div className="space-y-2 max-h-[500px] overflow-y-auto pt-1 pr-1">
          {filteredProcesses.length > 0 ? (
            filteredProcesses.map((proc: ProcessItem, idx: number) => {
              const isTerminated = terminatedPids.includes(proc.pid);

              return (
                <motion.div
                  key={proc.pid}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx, 15) * 0.03 }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 text-xs ${
                    isTerminated
                      ? 'bg-transparent border-white/5 opacity-40'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-[#7C3AED]/40 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[#8A8A93] text-[11px] shrink-0">{proc.pid}</span>
                      <span className={`font-medium text-[#F5F5F7] truncate max-w-xs ${isTerminated ? 'line-through text-[#8A8A93]' : ''}`}>
                        {proc.name}
                      </span>
                      
                      {isTerminated ? (
                        <CyberBadge variant="slate" size="xs">
                          <CheckCircle2 className="w-3 h-3 text-[#22D3EE]" /> Terminated
                        </CyberBadge>
                      ) : proc.isSafeToQuit ? (
                        <CyberBadge variant="slate" size="xs">
                          <ShieldCheck className="w-3 h-3 text-[#22D3EE]" /> Safe
                        </CyberBadge>
                      ) : (
                        <CyberBadge variant="slate" size="xs">
                          <Lock className="w-3 h-3" /> Core
                        </CyberBadge>
                      )}

                      <span className="hidden md:inline text-[11px] text-[#8A8A93] font-mono">
                        [{proc.categoryLabel}]
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8A8A93] mt-0.5 truncate">{proc.advice}</div>
                  </div>

                  <div className="flex items-center gap-3 font-mono shrink-0">
                    <span className="text-[#8A8A93] text-xs">{proc.cpu.toFixed(1)}% CPU</span>
                    <span className="text-[#F5F5F7] font-semibold w-16 text-right text-xs">{proc.rssMb} MB</span>
                    
                    {isTerminated ? (
                      <span className="text-xs text-[#22D3EE] font-semibold px-2">Closed</span>
                    ) : proc.isSafeToQuit ? (
                      <div className="flex items-center gap-1.5">
                        <TactileButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleKillProcess(proc.pid, proc.name, 'TERM')}
                        >
                          Quit
                        </TactileButton>
                        <TactileButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleKillProcess(proc.pid, proc.name, 'KILL')}
                        >
                          Kill -9
                        </TactileButton>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-[#8A8A93] italic px-2">Protected</span>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            /* Illustrated Animated SVG Empty State */
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-[#7C3AED]/30"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-2xl border border-[#22D3EE]/30"
                  animate={{ scale: [1.15, 1, 1.15], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.25)]">
                  <Search className="w-6 h-6 text-[#7C3AED]" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#F5F5F7]">No Matching Processes Found</h4>
                <p className="text-xs text-[#8A8A93] max-w-sm">
                  No active tasks match your search query or filter. Try broadening your criteria.
                </p>
              </div>
              <button
                onClick={() => {
                  setProcSearch('');
                  setProcCategoryFilter('all');
                }}
                className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-[#F5F5F7] font-medium transition-all active:scale-95 shadow-sm"
              >
                Reset Process Filters
              </button>
            </div>
          )}
        </div>
      </HoloCard>

      {/* 2. Active Listening Ports */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#22D3EE]" /> Active TCP Listening Ports
            </h3>
            <p className="text-xs text-[#8A8A93] max-w-2xl leading-relaxed">Servers and local runtimes holding ports open</p>
          </div>
          <div className="flex items-center gap-2">
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => triggerAction('rescan-all', {}, 'Rescan Ports')}
            >
              ↻ Rescan
            </TactileButton>
            <TactileButton
              variant="danger"
              size="sm"
              onClick={() => triggerAction('kill-all-dev-ports', {}, 'Kill All Dev Ports')}
            >
              Kill All Dev Ports
            </TactileButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats?.listeningPorts && stats.listeningPorts.length > 0 ? (
            stats.listeningPorts.map((p: any, idx: number) => {
              const isFreed = freedPorts.includes(p.port);

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx, 15) * 0.03 }}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-xs ${
                    isFreed
                      ? 'bg-transparent border-white/5 opacity-40'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-[#7C3AED]/40 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                    <span className="px-2.5 py-1 rounded-2xl bg-white/10 text-[#F5F5F7] font-mono font-semibold text-xs border border-white/15 shrink-0">
                      :{p.port}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-medium text-[#F5F5F7] truncate ${isFreed ? 'line-through text-[#8A8A93]' : ''}`}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-[#8A8A93] font-mono">PID {p.pid}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`http://localhost:${p.port}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open in Browser"
                      className="p-1.5 rounded-2xl bg-white/5 hover:bg-white/10 text-[#8A8A93] hover:text-[#F5F5F7] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {isFreed ? (
                      <span className="text-xs text-[#22D3EE] font-semibold px-2">Freed</span>
                    ) : (
                      <TactileButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleKillPort(p.port)}
                      >
                        Kill
                      </TactileButton>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#8A8A93] col-span-3">Scanning listening ports...</div>
          )}
        </div>
      </HoloCard>
    </div>
  );
};
