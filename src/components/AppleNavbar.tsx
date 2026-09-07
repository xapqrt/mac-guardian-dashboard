import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Command,
  Bot,
  FileCheck2,
  Volume2,
  VolumeX,
  RotateCw,
  Cpu
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
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 pt-3 pb-2 transition-all duration-300">
      <div
        className={`max-w-6xl mx-auto rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border ${
          scrolled
            ? 'bg-black/60 backdrop-blur-2xl border-white/[0.12] shadow-[0_12px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)]'
            : 'bg-black/30 backdrop-blur-xl border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
        }`}
      >
        {/* Left: macOS Traffic Lights & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black/20 transition-transform hover:scale-110" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black/20 transition-transform hover:scale-110" />
            <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black/20 transition-transform hover:scale-110" />
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2 text-left group"
          >
            <span className="text-sm font-semibold tracking-tight text-white group-hover:text-[#f5f5f7] transition-colors">
              Mac Guardian
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSpecs();
            }}
            title="Inspect Apple Silicon Hardware Specifications"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] text-[#86868b] hover:text-white transition-all active:scale-95"
          >
            <Cpu className="w-3 h-3 text-[#0071e3]" />
            <span className="font-medium text-[#a1a1a6] truncate">{chipName || 'Apple Silicon'}</span>
          </button>
        </div>

        {/* Center: Smooth Pill Anchor Nav */}
        <nav className="hidden md:flex items-center p-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onNavigate(item.id);
                }}
                className={`px-3.5 py-1.5 rounded-full transition-all duration-200 text-xs font-medium ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-[#86868b] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Action Capsule & Tool Cluster */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Action Receipts Counter */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenReceipts();
            }}
            title="Action Execution Receipts"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-[#86868b] hover:text-white transition-colors"
          >
            <FileCheck2 className="w-3 h-3 text-[#30d158]" />
            <span className="text-[11px]">Audit</span>
            {receiptCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#30d158]/15 text-[#30d158] text-[10px] font-semibold">
                {receiptCount}
              </span>
            )}
          </button>

          {/* AI Copilot Studio Pill */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAI();
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-white transition-all active:scale-95"
          >
            <Bot className="w-3 h-3 text-[#2997ff]" />
            <span className="text-[11px] font-medium">AI</span>
            <kbd className="text-[9px] font-mono px-1 rounded bg-black/40 text-[#86868b]">⌘J</kbd>
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenCmd();
            }}
            title="Open Command Palette (⌘K)"
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#86868b] hover:text-white transition-colors"
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
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#86868b] hover:text-white transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#0071e3]' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute audio feedback' : 'Enable click audio'}
            className="p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#86868b] hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#30d158]" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Apple Liquid Gloss CTA Pill */}
          <button
            onClick={onQuickSweep}
            disabled={isSweeping}
            className="apple-btn-gloss px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white text-xs font-medium shadow-[0_2px_12px_rgba(0,113,227,0.4)] transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden xs:inline">{isSweeping ? 'Sweeping...' : 'Sweep'}</span>
            <kbd className="hidden md:inline px-1 rounded bg-black/20 text-[9px] font-mono">⌘B</kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
