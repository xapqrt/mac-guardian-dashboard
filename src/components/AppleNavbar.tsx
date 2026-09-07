import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Command,
  Bot,
  FileCheck2,
  Volume2,
  VolumeX,
  RotateCw,
  Cpu,
  Loader2,
  Search
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AppleNavbarProps {
  chipName: string;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAI: () => void;
  onOpenCmd: () => void;
  onOpenReceipts: () => void;
  onOpenSpecs: () => void;
  onQuickSweep: () => void;
  isSweeping: boolean;
  receiptCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRescan: () => void;
  isScanning: boolean;
}

export const AppleNavbar: React.FC<AppleNavbarProps> = ({
  chipName,
  activeSection,
  onNavigate,
  onOpenAI,
  onOpenCmd,
  onOpenReceipts,
  onOpenSpecs,
  onQuickSweep,
  isSweeping,
  receiptCount,
  soundEnabled,
  onToggleSound,
  onRescan,
  isScanning
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'story', label: 'Architecture' },
    { id: 'specs', label: 'Specs' },
    { id: 'sentry', label: 'GhostKey Sentry' },
    { id: 'studio', label: 'Controls' }
  ];

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-6 pt-3 pb-2 transition-all duration-300">
      <div
        className={`w-full rounded-2xl transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border ${
          scrolled
            ? 'bg-[#08080a]/85 backdrop-blur-xl border-white/10 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.9),0_0_30px_rgba(124,58,237,0.1)]'
            : 'bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
        }`}
      >
        {/* Left: Traffic Lights & Title */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>

          <div className="h-3.5 w-px bg-white/[0.08] hidden sm:block" />

          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <span className="text-sm font-medium tracking-tight text-white/90 group-hover:text-white transition-colors">
              Mac Guardian
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSpecs();
            }}
            title="Inspect Hardware Specifications"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] text-zinc-400 hover:text-white transition-all active:scale-98 group cursor-pointer"
          >
            <Cpu className="w-3 h-3 text-[#8B5CF6]" />
            <span className="font-medium text-zinc-300 truncate">{chipName || 'Apple Silicon'}</span>
          </button>
        </div>

        {/* Center: Global Search in Top Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCmd();
            }}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] text-xs text-zinc-400 hover:text-zinc-200 transition-all group cursor-pointer"
          >
            <span className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
              <span className="truncate text-[11px]">Search processes, daemons, ports, files...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono text-zinc-400 border border-white/[0.08]">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Action & Tool Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Action Receipts Counter */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenReceipts();
            }}
            title="Action Execution Receipts"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 transition-all group cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="text-[11px] font-medium">Audit</span>
            {receiptCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/15 text-[#38BDF8] text-[10px] font-semibold">
                {receiptCount}
              </span>
            )}
          </button>

          {/* AI Copilot Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAI();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all active:scale-98 group cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span className="text-[11px] font-medium">AI</span>
            <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-zinc-400">⌘J</kbd>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCmd();
            }}
            title="Open Command Palette (⌘K)"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all group cursor-pointer"
          >
            <Command className="w-3.5 h-3.5" />
          </button>

          {/* Rescan Button */}
          <button
            onClick={() => {
              sound.playClick();
              onRescan();
            }}
            title="Force Hardware & Telemetry Rescan"
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all group cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-all duration-150 ease-out ${isScanning ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute audio feedback' : 'Enable click audio'}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white transition-all group cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onQuickSweep}
            disabled={isSweeping}
            className="min-w-[85px] px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSweeping ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3 h-3 shrink-0" />
                <span className="hidden xs:inline">Sweep</span>
                <kbd className="hidden md:inline px-1 rounded bg-black/20 text-[9px] font-mono">⌘B</kbd>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

