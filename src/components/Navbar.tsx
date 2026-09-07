import React from 'react';
import {
  Activity,
  HardDrive,
  Layers,
  Sliders,
  Search,
  Volume2,
  VolumeX,
  Bot,
  FileCheck2,
  Headphones,
  Thermometer,
  RotateCw
} from 'lucide-react';
import { StatusLed } from './UIElements';
import { sound } from '../utils/audio';

export type TabType = 'overview' | 'thermal' | 'gaze' | 'earbuds' | 'developer' | 'privacy' | 'storage' | 'processes' | 'controls' | 'startup';
export type ThemeMode = 'graphite' | 'midnight' | 'emerald' | 'ember';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  chipName: string;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCmd: () => void;
  onOpenAI: () => void;
  onOpenReceipts: () => void;
  onOpenSpecs: () => void;
  onRescanAll: () => void;
  isScanning?: boolean;
  receiptCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  chipName,
  soundEnabled,
  onToggleSound,
  onOpenCmd,
  onOpenAI,
  onOpenReceipts,
  receiptCount,
  onOpenSpecs,
  onRescanAll,
  isScanning = false
}) => {
  const primaryTabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Activity, matches: ['overview'] },
    { id: 'earbuds' as TabType, label: 'Earbuds & Sentry', icon: Headphones, matches: ['earbuds', 'gaze'] },
    { id: 'processes' as TabType, label: 'Activity', icon: Layers, matches: ['processes'] },
    { id: 'storage' as TabType, label: 'Storage', icon: HardDrive, matches: ['storage', 'developer'] },
    { id: 'thermal' as TabType, label: 'Thermals', icon: Thermometer, matches: ['thermal'] },
    { id: 'controls' as TabType, label: 'Settings', icon: Sliders, matches: ['controls', 'startup', 'privacy'] }
  ];

  return (
    <header className="border-b border-white/[0.08] bg-black/75 backdrop-blur-2xl sticky top-0 z-40 px-6 sm:px-10 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Left: macOS Traffic Lights & Apple Silicon Brand */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/20 transition-transform hover:scale-110" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/20 transition-transform hover:scale-110" />
          <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/20 transition-transform hover:scale-110" />
        </div>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-semibold text-white tracking-tight">Mac Guardian</span>
          <button
            onClick={() => {
              sound.playClick();
              onOpenSpecs();
            }}
            title="Inspect Apple Silicon hardware specifications"
            className="text-[11px] font-medium text-[#86868b] hover:text-white flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] transition-all cursor-pointer active:scale-95"
          >
            <StatusLed color="green" size="sm" />
            <span className="truncate">{chipName || 'Apple Silicon'}</span>
          </button>
        </div>
      </div>

      {/* Center: Apple Segmented Pill Navigation */}
      <nav className="hidden md:flex items-center p-1 rounded-full bg-white/[0.05] border border-white/[0.06] text-xs font-medium shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matches.includes(activeTab);
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm scale-[1.02]'
                  : 'text-[#86868b] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Tools: Receipts, AI Studio, Search, Rescan, Sound */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => {
            sound.playClick();
            onOpenReceipts();
          }}
          title="View verified action receipts"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97] border border-white/[0.06] text-[#86868b] hover:text-white transition-all"
        >
          <FileCheck2 className="w-3.5 h-3.5 text-[#30d158]" />
          <span className="hidden sm:inline">Receipts</span>
          {receiptCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#30d158]/15 text-[#30d158] text-[10px] font-semibold">
              {receiptCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onOpenAI();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.97] text-white font-medium shadow-sm transition-all"
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Studio</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono text-white/80">⌘J</kbd>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onRescanAll();
          }}
          title="Force-rescan all system modules"
          className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97] border border-white/[0.06] text-[#86868b] hover:text-white transition-all"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#0071e3]' : ''}`} />
        </button>

        <button
          onClick={onOpenCmd}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.97] border border-white/[0.06] text-[#86868b] hover:text-white transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono border border-white/[0.04]">⌘K</kbd>
        </button>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute sound effects' : 'Enable click sounds'}
          className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#86868b] hover:text-white transition-all border border-white/[0.06]"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#30d158]" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};

