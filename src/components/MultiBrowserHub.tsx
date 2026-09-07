import React, { useState } from 'react';
import {
  Globe,
  Compass,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge } from './UIElements';
import { sound } from '../utils/audio';

export interface BrowserTabItem {
  browser?: string;
  appName?: string;
  title: string;
  url: string;
  domain: string;
}

interface MultiBrowserHubProps {
  tabs: BrowserTabItem[];
  caches: { chrome?: string; safari?: string; edge?: string; total?: string };
  onKillTab: (tab: BrowserTabItem) => void;
  onCloseAllTabs: () => void;
  onReapHeavyTabs: () => void;
  onFlushCaches: () => void;
  onRescanTabs?: () => void;
}

export const MultiBrowserHub: React.FC<MultiBrowserHubProps> = ({
  tabs = [],
  caches = {},
  onKillTab,
  onCloseAllTabs,
  onReapHeavyTabs,
  onFlushCaches,
  onRescanTabs
}) => {
  const [browserFilter, setBrowserFilter] = useState<'all' | 'Chrome' | 'Safari' | 'Edge'>('all');
  const [killedTabUrls, setKilledTabUrls] = useState<string[]>([]);

  const filteredTabs = tabs.filter((t) => {
    if (browserFilter === 'all') return true;
    return t.browser === browserFilter;
  });

  const handleKill = (tab: BrowserTabItem) => {
    sound.playReap();
    setKilledTabUrls((prev) => [...prev, tab.url || tab.title]);
    onKillTab(tab);
  };

  const browserCards = [
    { name: 'Chrome', label: 'Google Chrome', icon: Globe, count: tabs.filter(t => t.browser === 'Chrome').length, cache: caches.chrome || '1.2 GB' },
    { name: 'Safari', label: 'Apple Safari', icon: Compass, count: tabs.filter(t => t.browser === 'Safari').length, cache: caches.safari || '15 MB' },
    { name: 'Edge', label: 'Microsoft Edge', icon: Globe, count: tabs.filter(t => t.browser === 'Edge').length, cache: caches.edge || '2.3 MB' },
  ];

  return (
    <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08] text-[#f5f5f7]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#86868b]" /> Browser Tab & Renderer Hub
            </h3>
            <CyberBadge variant="slate" size="xs">
              {tabs.length} ACTIVE TABS
            </CyberBadge>
          </div>
          <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
            Live process telemetry for Chrome, Safari, and Edge renderers. Sleep memory hogs and reclaim cache allocations.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onRescanTabs && (
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={onRescanTabs}
            >
              ↻ Rescan
            </TactileButton>
          )}

          <TactileButton
            variant="secondary"
            size="sm"
            onClick={onFlushCaches}
          >
            Flush Caches (~1.2 GB)
          </TactileButton>

          <TactileButton
            variant="primary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5 text-black" />}
            onClick={onReapHeavyTabs}
          >
            Reap Heavy Tabs
          </TactileButton>
        </div>
      </div>

      {/* Browser Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {browserCards.map((b) => (
          <div
            key={b.name}
            onClick={() => setBrowserFilter(browserFilter === b.name ? 'all' : (b.name as any))}
            className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
              browserFilter === b.name
                ? 'bg-white/[0.08] border-white/20'
                : 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/[0.04] text-[#f5f5f7]">
                <b.icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#f5f5f7] block">{b.label}</span>
                <span className="text-[11px] text-[#86868b]">{b.cache} disk cache</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-xs font-mono text-[#86868b]">
              {b.count}
            </span>
          </div>
        ))}
      </div>

      {/* Tab List */}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {filteredTabs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#86868b] border border-white/[0.04] rounded-xl">
            No active browser tabs detected.
          </div>
        ) : (
          filteredTabs.map((tab, idx) => {
            const isKilled = killedTabUrls.includes(tab.url || tab.title);
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all text-xs ${
                  isKilled
                    ? 'opacity-40 bg-transparent border-white/[0.04]'
                    : 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-[#86868b] uppercase shrink-0">
                    {tab.browser || 'Web'}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-[#f5f5f7] block truncate">{tab.title || 'Untitled Tab'}</span>
                    <span className="text-[11px] text-[#86868b] block truncate">{tab.domain || tab.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isKilled ? (
                    <span className="text-[11px] text-[#30d158] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reaped
                    </span>
                  ) : (
                    <button
                      onClick={() => handleKill(tab)}
                      className="p-1.5 rounded-lg text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors"
                      title="Kill this tab renderer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </HoloCard>
  );
};
