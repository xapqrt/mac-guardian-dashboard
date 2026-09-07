import React, { useState, useMemo } from 'react';
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
    <div className="space-y-8 animate-in fade-in duration-200 bg-[#000000] text-[#f5f5f7]">
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
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#86868b]" /> Activity Monitor & Safety Inspector
            </h3>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
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
            <div className="flex items-center gap-1 bg-[#0a0a0c] p-1 rounded-full border border-white/[0.08] text-xs font-mono">
              {(['mem', 'cpu', 'name'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setProcSort(s)}
                  className={`px-3 py-1 rounded-full uppercase font-medium transition-colors ${
                    procSort === s ? 'bg-[#f5f5f7] text-black shadow-sm' : 'text-[#86868b] hover:text-[#f5f5f7]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety & Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setProcCategoryFilter('safe')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                procCategoryFilter === 'safe'
                  ? 'bg-white/[0.14] text-[#f5f5f7] border border-white/20'
                  : 'bg-white/[0.04] text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.04]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#30d158]" /> Safe to Quit
            </button>

            <button
              onClick={() => setProcCategoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                procCategoryFilter === 'all'
                  ? 'bg-white/[0.14] text-[#f5f5f7] border border-white/20'
                  : 'bg-white/[0.04] text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.04]'
              }`}
            >
              All Processes
            </button>

            <button
              onClick={() => setProcCategoryFilter('browser')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                procCategoryFilter === 'browser'
                  ? 'bg-white/[0.14] text-[#f5f5f7] border border-white/20'
                  : 'bg-white/[0.04] text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.04]'
              }`}
            >
              Browsers
            </button>

            <button
              onClick={() => setProcCategoryFilter('dev')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                procCategoryFilter === 'dev'
                  ? 'bg-white/[0.14] text-[#f5f5f7] border border-white/20'
                  : 'bg-white/[0.04] text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.04]'
              }`}
            >
              Developer Tools
            </button>

            <button
              onClick={() => setProcCategoryFilter('system')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                procCategoryFilter === 'system'
                  ? 'bg-white/[0.14] text-[#f5f5f7] border border-white/20'
                  : 'bg-white/[0.04] text-[#86868b] hover:text-[#f5f5f7] border border-white/[0.04]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#86868b]" /> Apple Protected
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#86868b]" />
            <input
              type="text"
              placeholder="Search name or PID..."
              value={procSearch}
              onChange={(e) => setProcSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#0a0a0c] border border-white/[0.08] text-xs text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-white/25"
            />
          </div>
        </div>

        {procCategoryFilter === 'system' && (
          <div className="p-3.5 rounded-xl bg-[#0a0a0c] border border-white/[0.08] flex items-center gap-2.5 text-xs text-[#86868b]">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#f5f5f7]" />
            <span>
              <strong>Apple System Core:</strong> These processes (WindowServer, launchd, coreaudiod) are protected by macOS kernel integrity. Terminating them is locked to protect system stability.
            </span>
          </div>
        )}

        <div className="space-y-2 max-h-[500px] overflow-y-auto pt-1">
          {filteredProcesses.map((proc: ProcessItem) => {
            const isTerminated = terminatedPids.includes(proc.pid);

            return (
              <div
                key={proc.pid}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs ${
                  isTerminated
                    ? 'bg-transparent border-white/[0.04] opacity-50'
                    : 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className="min-w-0 flex-1 mr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[#86868b] text-[11px] shrink-0">{proc.pid}</span>
                    <span className={`font-medium text-[#f5f5f7] truncate max-w-xs ${isTerminated ? 'line-through text-[#86868b]' : ''}`}>
                      {proc.name}
                    </span>
                    
                    {isTerminated ? (
                      <CyberBadge variant="slate" size="xs">
                        <CheckCircle2 className="w-3 h-3 text-[#30d158]" /> Terminated
                      </CyberBadge>
                    ) : proc.isSafeToQuit ? (
                      <CyberBadge variant="slate" size="xs">
                        <ShieldCheck className="w-3 h-3 text-[#30d158]" /> Safe
                      </CyberBadge>
                    ) : (
                      <CyberBadge variant="slate" size="xs">
                        <Lock className="w-3 h-3" /> Core
                      </CyberBadge>
                    )}

                    <span className="hidden md:inline text-[11px] text-[#86868b] font-mono">
                      [{proc.categoryLabel}]
                    </span>
                  </div>
                  <div className="text-[11px] text-[#86868b] mt-0.5 truncate">{proc.advice}</div>
                </div>

                <div className="flex items-center gap-3 font-mono shrink-0">
                  <span className="text-[#86868b] text-xs">{proc.cpu.toFixed(1)}% CPU</span>
                  <span className="text-[#f5f5f7] font-semibold w-16 text-right text-xs">{proc.rssMb} MB</span>
                  
                  {isTerminated ? (
                    <span className="text-xs text-[#30d158] font-semibold px-2">Closed</span>
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
                    <span className="text-xs font-mono text-[#86868b] italic px-2">Protected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </HoloCard>

      {/* 2. Active Listening Ports */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#86868b]" /> Active TCP Listening Ports
            </h3>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">Servers and local runtimes holding ports open</p>
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
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-xs ${
                    isFreed
                      ? 'bg-transparent border-white/[0.04] opacity-50'
                      : 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-[#f5f5f7] font-mono font-semibold text-xs border border-white/[0.08] shrink-0">
                      :{p.port}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-medium text-[#f5f5f7] truncate ${isFreed ? 'line-through text-[#86868b]' : ''}`}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-[#86868b] font-mono">PID {p.pid}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`http://localhost:${p.port}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open in Browser"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {isFreed ? (
                      <span className="text-xs text-[#30d158] font-semibold px-2">Freed</span>
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
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#86868b] col-span-3">Scanning listening ports...</div>
          )}
        </div>
      </HoloCard>
    </div>
  );
};
