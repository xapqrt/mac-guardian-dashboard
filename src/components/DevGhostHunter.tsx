import React, { useState } from 'react';
import { Terminal, Skull, RefreshCw, Radio, Zap, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed } from './UIElements';
import { FilterBar } from './FilterBar';
import { DevMatrixInspector } from './DevMatrixInspector';
import { sound } from '../utils/audio';

interface DevPort {
  command: string;
  pid: string;
  user: string;
  port: number;
  address: string;
  isCurrentServer?: boolean;
}

interface DevGhostHunterProps {
  stats: any;
  triggerAction: (action: string, payload: any, label: string) => Promise<void>;
  loadingAction: string | null;
}

export const DevGhostHunter: React.FC<DevGhostHunterProps> = ({ stats, triggerAction, loadingAction }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [portCategory, setPortCategory] = useState<'all' | 'dev' | 'system'>('all');
  const [portSort, setPortSort] = useState<'port' | 'command' | 'pid'>('port');
  const devPorts: DevPort[] = stats?.devPorts || [];
  const devCaches = stats?.devCaches || { npm: '0 MB', brew: '0 MB', xcodeDerived: '0 MB', uv: '0 MB', totalMb: 0 };

  const filteredPorts = React.useMemo(() => {
    let list = devPorts.filter(p => {
      const q = filterQuery.toLowerCase();
      const matchSearch =
        !filterQuery ||
        p.command.toLowerCase().includes(q) ||
        p.port.toString().includes(filterQuery) ||
        p.pid.includes(filterQuery);
      if (!matchSearch) return false;

      const isCommonDev = [3000, 3334, 5000, 5173, 8000, 8080, 9222, 5432, 6379, 4000, 4200, 8081].includes(p.port);
      if (portCategory === 'dev') return isCommonDev;
      if (portCategory === 'system') return !isCommonDev;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (portSort === 'command') return a.command.localeCompare(b.command);
      if (portSort === 'pid') return parseInt(a.pid, 10) - parseInt(b.pid, 10);
      return a.port - b.port;
    });

    return list;
  }, [devPorts, filterQuery, portCategory, portSort]);

  const handleKillPort = (port: number, pid: string, cmd: string) => {
    sound.playClick();
    triggerAction('kill-port', { port, pid }, `Kill Port :${port} (${cmd})`);
  };

  const handlePurgeZombies = () => {
    sound.playPurge();
    triggerAction('purge-dev-zombies', {}, 'Purge Orphaned Dev Zombie Trees');
  };

  const handleCleanDevCaches = () => {
    sound.playPurge();
    triggerAction('clean-dev-caches', {}, 'Flush Build Caches (NPM, Brew, Xcode)');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#000000] text-[#f5f5f7]">
      
      {/* Top Hero Card */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#f5f5f7]">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-[#f5f5f7]">Developer Ghost Hunter & Port Sentry</h1>
                <CyberBadge variant="slate">DEV WORKSPACE</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] mt-1">
                Zero-latency scanner for stuck TCP listening sockets, rogue compilers, and orphaned background servers.
              </p>
            </div>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <TactileButton
              onClick={handlePurgeZombies}
              disabled={loadingAction === 'purge-dev-zombies'}
              variant="danger"
              size="sm"
            >
              <Skull className="w-3.5 h-3.5 mr-1.5" />
              <span>{loadingAction === 'purge-dev-zombies' ? 'Purging...' : 'Purge Zombie Trees'}</span>
            </TactileButton>

            <TactileButton
              onClick={handleCleanDevCaches}
              disabled={loadingAction === 'clean-dev-caches'}
              variant="secondary"
              size="sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#86868b] mr-1.5" />
              <span>Flush Build Caches</span>
            </TactileButton>
          </div>
        </div>

        {/* Reclaimable Caches Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06]">
            <div className="text-xs font-mono text-[#86868b]">NPM Cache</div>
            <div className="text-base font-bold text-[#f5f5f7] font-mono mt-1">{devCaches.npm || '0 MB'}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06]">
            <div className="text-xs font-mono text-[#86868b]">Homebrew Cache</div>
            <div className="text-base font-bold text-[#f5f5f7] font-mono mt-1">{devCaches.brew || '0 MB'}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06]">
            <div className="text-xs font-mono text-[#86868b]">Xcode DerivedData</div>
            <div className="text-base font-bold text-[#f5f5f7] font-mono mt-1">{devCaches.xcodeDerived || '0 MB'}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06]">
            <div className="text-xs font-mono text-[#86868b]">Active Sockets</div>
            <div className="text-base font-bold text-[#f5f5f7] font-mono mt-1">{devPorts.length} Open Sockets</div>
          </div>
        </div>
      </HoloCard>

      {/* Listening Ports Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Radio className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-base font-bold text-[#F5F5F7] tracking-tight">Active TCP Listening Ports</h2>
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-[#22D3EE] border border-white/10">
            {filteredPorts.length} Sockets
          </span>
        </div>

        <FilterBar
          search={filterQuery}
          onSearchChange={setFilterQuery}
          searchPlaceholder="Search port, process name, or PID..."
          categories={[
            { id: 'all', label: 'All Sockets', count: devPorts.length },
            { id: 'dev', label: 'Dev Servers' },
            { id: 'system', label: 'System Sockets' },
          ]}
          selectedCategory={portCategory}
          onCategoryChange={(c) => setPortCategory(c as any)}
          sortOptions={[
            { id: 'port', label: 'PORT' },
            { id: 'command', label: 'CMD' },
            { id: 'pid', label: 'PID' },
          ]}
          selectedSort={portSort}
          onSortChange={(s) => setPortSort(s as any)}
        />

        {/* Ports Table */}
        <div className="rounded-2xl bg-[#101010] border border-white/[0.08] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/[0.02] border-b border-white/[0.06] text-[#86868b] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">Port</th>
                  <th className="py-3 px-5">Service / Process</th>
                  <th className="py-3 px-5">PID</th>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Binding Address</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredPorts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#86868b]">
                      No matching listening sockets found.
                    </td>
                  </tr>
                ) : (
                  filteredPorts.map((portInfo) => {
                    const isGuardian = portInfo.isCurrentServer || portInfo.port === 3334;
                    const isCommonDev = [3000, 3334, 5000, 5173, 8000, 8080, 9222, 5432, 6379].includes(portInfo.port);
                    const actionKey = `kill-port${portInfo.port}`;

                    return (
                      <tr
                        key={`${portInfo.port}-${portInfo.pid}`}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#f5f5f7] font-mono">:{portInfo.port}</span>
                            {isCommonDev && (
                              <span className="px-1.5 py-0.2 rounded bg-white/[0.05] text-[#86868b] border border-white/[0.08] text-[10px]">
                                DEV PORT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2 text-[#f5f5f7] font-medium">
                            <span>{portInfo.command}</span>
                            {isGuardian && (
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#30d158] border border-white/[0.1] text-[10px] flex items-center gap-1">
                                <StatusLed color="green" size="sm" />
                                GUARDIAN
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-[#86868b]">{portInfo.pid}</td>
                        <td className="py-3.5 px-5 text-[#86868b]">{portInfo.user}</td>
                        <td className="py-3.5 px-5 text-[#86868b] font-mono text-[11px]">{portInfo.address}</td>
                        <td className="py-3.5 px-5 text-right">
                          {isGuardian ? (
                            <span className="text-[#86868b] text-[11px] font-mono italic">Protected</span>
                          ) : (
                            <TactileButton
                              onClick={() => handleKillPort(portInfo.port, portInfo.pid, portInfo.command)}
                              disabled={loadingAction === actionKey}
                              variant="danger"
                              size="sm"
                            >
                              <Skull className="w-3 h-3 mr-1" />
                              {loadingAction === actionKey ? 'Nuking...' : 'Nuke'}
                            </TactileButton>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2D Orbital Socket Radar & Terminal Diagnostic Matrix */}
      <DevMatrixInspector
        stats={stats}
        triggerAction={triggerAction}
        loadingAction={loadingAction}
      />

    </div>
  );
};
