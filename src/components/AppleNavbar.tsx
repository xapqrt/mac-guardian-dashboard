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
        <div className="flex items-center gap-3.5 min-w-0 shrink-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#EF4444] border border-black/20 transition-transform duration-150 hover:scale-110" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-black/20 transition-transform duration-150 hover:scale-110" />
            <span className="w-3 h-3 rounded-full bg-[#22D3EE] border border-black/20 transition-transform duration-150 hover:scale-110" />
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <span className="text-sm font-semibold tracking-tight text-[#F5F5F7] group-hover:text-white transition-colors">
              Mac Guardian
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSpecs();
            }}
            title="Inspect Hardware Specifications"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#8A8A93] hover:text-white transition-all active:scale-95 group cursor-pointer"
          >
            <Cpu className="w-3 h-3 text-[#7C3AED] transition-all duration-150 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.7)]" />
            <span className="font-medium text-[#F5F5F7] truncate">{chipName || 'Apple Silicon'}</span>
          </button>
        </div>

        {/* Center: Global Search in Top Bar */}
        <div className="flex-1 max-w-lg mx-2 sm:mx-4">
          <button
            onClick={() => {
              sound.playClick();
              onOpenCmd();
            }}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-[#8A8A93] hover:text-[#F5F5F7] transition-all group cursor-pointer shadow-sm"
          >
            <span className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-[#7C3AED] group-hover:scale-110 transition-transform" />
              <span className="truncate">Search processes, daemons, ports, files...</span>
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-mono text-[#8A8A93] border border-white/10">
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#8A8A93] hover:text-[#F5F5F7] transition-all group cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#22D3EE] transition-all duration-150 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            <span className="text-[11px] font-medium">Audit</span>
            {receiptCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] text-[10px] font-semibold">
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
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#F5F5F7] transition-all active:scale-95 group cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-[#7C3AED] transition-all duration-150 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.7)]" />
            <span className="text-[11px] font-medium">AI</span>
            <kbd className="text-[9px] font-mono px-1 rounded bg-black/50 text-[#8A8A93]">⌘J</kbd>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCmd();
            }}
            title="Open Command Palette (⌘K)"
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8A8A93] hover:text-white transition-all group cursor-pointer"
          >
            <Command className="w-3.5 h-3.5 transition-all duration-150 ease-out group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.7)]" />
          </button>

          {/* Rescan Button */}
          <button
            onClick={() => {
              sound.playClick();
              onRescan();
            }}
            title="Force Hardware & Telemetry Rescan"
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8A8A93] hover:text-white transition-all group cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-all duration-150 ease-out group-hover:scale-110 ${isScanning ? 'animate-spin text-[#22D3EE]' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute audio feedback' : 'Enable click audio'}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8A8A93] hover:text-white transition-all group cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#22D3EE] transition-all duration-150 ease-out group-hover:scale-110" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 transition-all duration-150 ease-out group-hover:scale-110" />
            )}
          </button>

          {/* Primary Action Button: Violet to Cyan gradient with fixed min-width */}
          <button
            onClick={onQuickSweep}
            disabled={isSweeping}
            className="min-w-[95px] px-4 py-1.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white text-xs font-medium hover:shadow-[0_0_24px_rgba(124,58,237,0.45)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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

