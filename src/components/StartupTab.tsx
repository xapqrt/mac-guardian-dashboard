import React, { useState, useMemo } from 'react';
import { Power, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge } from './UIElements';
import { FilterBar } from './FilterBar';

interface LaunchAgentItem {
  fileName: string;
  label: string;
  isEnabled: boolean;
  category: string;
  desc: string;
}

interface StartupTabProps {
  stats: any;
  triggerAction: (action: string, payload: Record<string, any>, label: string) => void;
}

export const StartupTab: React.FC<StartupTabProps> = ({
  stats,
  triggerAction
}) => {
  const [startupFilter, setStartupFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [startupSearch, setStartupSearch] = useState('');
  const [startupSort, setStartupSort] = useState<'status' | 'name' | 'category'>('status');
  const [toggledAgents, setToggledAgents] = useState<string[]>([]);

  const filteredAgents = useMemo(() => {
    if (!stats?.launchAgents) return [];
    let list = stats.launchAgents.filter((a: LaunchAgentItem) => {
      if (startupSearch) {
        const q = startupSearch.toLowerCase();
        const match =
          a.label?.toLowerCase().includes(q) ||
          a.fileName?.toLowerCase().includes(q) ||
          a.desc?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (startupFilter === 'enabled') return a.isEnabled;
      if (startupFilter === 'disabled') return !a.isEnabled;
      return true;
    });

    list = [...list].sort((a: LaunchAgentItem, b: LaunchAgentItem) => {
      if (startupSort === 'name') return a.label.localeCompare(b.label);
      if (startupSort === 'category') return a.category.localeCompare(b.category);
      // default: status (enabled first)
      if (a.isEnabled === b.isEnabled) return a.label.localeCompare(b.label);
      return a.isEnabled ? -1 : 1;
    });

    return list;
  }, [stats?.launchAgents, startupFilter, startupSearch, startupSort]);

  const handleToggleAgent = (agent: LaunchAgentItem) => {
    setToggledAgents(prev => [...prev, agent.fileName]);
    triggerAction(
      'toggle-launch-agent',
      { agentName: agent.fileName, enable: !agent.isEnabled },
      `${agent.isEnabled ? 'Disable' : 'Enable'} ${agent.label}`
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-[#F5F5F7]">
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-[#F5F5F7] flex items-center gap-2">
              <Power className="w-4 h-4 text-[#7C3AED]" /> Startup LaunchAgents Manager
            </h3>
            <CyberBadge variant="slate" size="xs">BOOT ACCELERATOR</CyberBadge>
          </div>
          <p className="text-xs text-[#8A8A93] max-w-2xl leading-relaxed">
            Stop heavy background apps and updater daemons from auto-starting on login and consuming memory before you even open them.
          </p>
        </div>

        {/* Reusable FilterBar */}
        <FilterBar
          search={startupSearch}
          onSearchChange={setStartupSearch}
          searchPlaceholder="Search daemons, agents, background apps..."
          categories={[
            { id: 'all', label: 'All Items' },
            { id: 'enabled', label: 'Enabled Only' },
            { id: 'disabled', label: 'Disabled Only' },
          ]}
          selectedCategory={startupFilter}
          onCategoryChange={(c) => setStartupFilter(c as any)}
          sortOptions={[
            { id: 'status', label: 'STATUS' },
            { id: 'name', label: 'NAME' },
            { id: 'category', label: 'TAG' },
          ]}
          selectedSort={startupSort}
          onSortChange={(s) => setStartupSort(s as any)}
          rightActions={
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => triggerAction('rescan-all', {}, 'Rescan LaunchAgents')}
            >
              ↻ Rescan
            </TactileButton>
          }
        />

        <div className="space-y-3 pt-2">
          {filteredAgents.length > 0 ? (
            filteredAgents.map((agent: LaunchAgentItem, idx: number) => {
              const isRecentlyToggled = toggledAgents.includes(agent.fileName);

              return (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 text-xs ${
                    agent.isEnabled
                      ? 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
                      : 'bg-transparent border-white/[0.04] opacity-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-[#f5f5f7]">{agent.label}</span>
                      <CyberBadge variant="slate" size="xs">
                        {agent.category}
                      </CyberBadge>
                      {agent.isEnabled ? (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[#30d158] font-mono text-[10px] border border-white/[0.08]">
                          ENABLED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.03] text-[#86868b] font-mono text-[10px]">
                          DISABLED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#86868b] mt-0.5">{agent.desc}</div>
                    <div className="text-[10px] text-[#86868b] font-mono mt-0.5 truncate">{agent.fileName}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <TactileButton
                      variant={agent.isEnabled ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleAgent(agent)}
                    >
                      {agent.isEnabled ? 'Disable on Login' : 'Enable on Login'}
                    </TactileButton>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#86868b]">No LaunchAgents found for this filter.</div>
          )}
        </div>
      </HoloCard>
    </div>
  );
};
