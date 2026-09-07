import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Globe, 
  Trash2, 
  Sun, 
  ShieldAlert, 
  Check, 
  ExternalLink, 
  Zap, 
  HardDrive, 
  Layers, 
  Terminal, 
  Clock, 
  Coffee 
} from 'lucide-react';
import { sound } from '../utils/audio';

interface BentoSpecSheetProps {
  stats: any;
  triggerAction: (action: string, payload: any, label: string) => void;
  loadingAction: string | null;
  onOpenSpecs?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const BentoSpecSheet: React.FC<BentoSpecSheetProps> = ({
  stats,
  triggerAction,
  loadingAction,
  onOpenSpecs,
  onNavigateTab,
}) => {
  // Cursor spotlight tracking per card
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const chipName = stats?.specs?.chip || 'Apple M4';
  const osVersion = stats?.specs?.osVersion || 'macOS 15.0 Sequoia';
  const uptime = stats?.uptime || '6 days, 4 hours';
  const m4 = stats?.m4Telemetry || { watts: '3.8', tempC: '30.6' };

  // Sample or live tab data
  const browserTabs = stats?.browserHub?.tabs || [
    { id: '1', title: 'GitHub - Pull Requests', memoryMb: 420, domain: 'github.com', browser: 'Brave' },
    { id: '2', title: 'Figma - Apple Design System', memoryMb: 890, domain: 'figma.com', browser: 'Chrome' },
    { id: '3', title: 'YouTube - 4K Spatial Audio', memoryMb: 610, domain: 'youtube.com', browser: 'Safari' },
  ];

  const totalTabMemoryMb = browserTabs.reduce((acc: number, t: any) => acc + (t.memoryMb || 0), 0);

  return (
    <section className="py-20 px-6 sm:px-10 md:px-12 max-w-7xl mx-auto w-full space-y-12">
      {/* Section Header with Dark Cinematic Typography */}
      <div className="space-y-3 text-center md:text-left">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#7C3AED]">
          Architecture & Diagnostics
        </span>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
          The Silicon Grid.
        </h2>
        <p className="text-[#8A8A93] max-w-xl text-base">
          Engineered for Apple Silicon telemetry, zero-friction tab hibernation, and surgical disk reclamation.
        </p>
      </div>

      {/* 4-Column Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: Apple Silicon M-Series Metallic Die (Span 2 cols on md/lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl overflow-hidden hover:border-[#7C3AED]/40 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-300"
        >
          {/* Subtle cursor spotlight effect with violet glow */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.12), transparent 80%)`,
            }}
          />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#F5F5F7] tracking-tight">{chipName}</h3>
                <span className="text-xs text-[#8A8A93] font-mono">{osVersion}</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSpecs?.();
              }}
              className="px-3.5 py-1.5 rounded-2xl bg-white/10 hover:bg-white/15 text-[#F5F5F7] text-xs font-medium border border-white/15 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Die Inspection</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8A8A93]" />
            </button>
          </div>

          {/* Micro Metallic Die Visual representation */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">Performance Cores</span>
              <span className="text-xl font-mono font-semibold text-[#F5F5F7]">4 Firestorm</span>
              <span className="text-[10px] text-[#22D3EE] block mt-1">4.40 GHz Max</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">Efficiency Cores</span>
              <span className="text-xl font-mono font-semibold text-[#F5F5F7]">6 Icestorm</span>
              <span className="text-[10px] text-[#8A8A93] block mt-1">Sub-100mW Idle</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">Neural Engine</span>
              <span className="text-xl font-mono font-semibold text-[#7C3AED]">38 TOPS</span>
              <span className="text-[10px] text-[#8A8A93] block mt-1">16-Core CoreML</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-[#8A8A93]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#7C3AED]" /> Uptime: {uptime}
            </span>
            <span className="font-mono text-[#F5F5F7]">Thermal Envelope: {m4.watts}W Draw</span>
          </div>
        </div>

        {/* CARD 2: Browser Tab Memory Reaper (1 col on lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative rounded-2xl bg-white/5 border border-white/10 p-7 backdrop-blur-xl overflow-hidden hover:border-[#7C3AED]/40 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-300 flex flex-col justify-between"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.12), transparent 80%)`,
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#22D3EE]" />
              </div>
              <span className="text-xs font-mono text-[#8A8A93]">
                {browserTabs.length} Active Tabs
              </span>
            </div>

            <h3 className="text-lg font-semibold text-[#F5F5F7] tracking-tight mb-1">Tab Memory Reaper</h3>
            <p className="text-xs text-[#8A8A93] mb-4">
              Reclaim {((totalTabMemoryMb || 1920) / 1024).toFixed(1)} GB locked by runaway JavaScript heaps.
            </p>

            <div className="space-y-2 mb-4">
              {browserTabs.slice(0, 3).map((tab: any) => (
                <div key={tab.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <span className="truncate max-w-[140px] text-[#F5F5F7]">{tab.title}</span>
                  <span className="font-mono text-[#22D3EE] text-[11px]">{tab.memoryMb} MB</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => triggerAction('reap-chrome-tabs', {}, 'Reap Browser Tabs')}
            disabled={loadingAction === 'reap-chrome-tabs'}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-[#EF4444]/20 hover:text-[#EF4444] hover:border-[#EF4444]/30 border border-white/10 text-xs font-medium text-[#F5F5F7] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loadingAction === 'reap-chrome-tabs' ? 'Reaping Tabs...' : 'Reap Memory Hog Tabs'}</span>
          </button>
        </div>

        {/* CARD 3: Caffeinate Awake Sentry (1 col on lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative rounded-2xl bg-white/5 border border-white/10 p-7 backdrop-blur-xl overflow-hidden hover:border-[#7C3AED]/40 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-300 flex flex-col justify-between"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.12), transparent 80%)`,
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-2xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <span className="text-xs font-mono text-[#22D3EE]">
                Assertion: Active
              </span>
            </div>

            <h3 className="text-lg font-semibold text-[#F5F5F7] tracking-tight mb-1">Caffeinate Sentry</h3>
            <p className="text-xs text-[#8A8A93] mb-4">
              Prevent display sleep & CPU power idle during large downloads, model compilation, or long renders.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {['30m', '1h', '4h'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => triggerAction('caffeinate-preset', { duration: preset }, `Caffeinate ${preset}`)}
                  className="py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 text-xs font-mono text-[#F5F5F7] transition-all text-center hover:border-white/15"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => triggerAction('toggle-caffeinate', {}, 'Toggle Caffeinate')}
            disabled={loadingAction === 'toggle-caffeinate'}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-[#F5F5F7] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sun className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Indefinite Stay-Awake</span>
          </button>
        </div>

        {/* CARD 4: Dev Artifacts & Cache Reclaimer (Span 2 cols on md/lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl overflow-hidden hover:border-[#7C3AED]/40 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-300"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.12), transparent 80%)`,
            }}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#F5F5F7] tracking-tight">APFS Dev Cleaner</h3>
                <span className="text-xs text-[#8A8A93]">node_modules • Xcode DerivedData • Docker overlays</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onNavigateTab?.('developer');
              }}
              className="text-xs text-[#22D3EE] hover:underline"
            >
              Inspect Ghost Folders
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">Xcode Derived</span>
              <span className="font-mono text-[#F5F5F7] font-medium">8.4 GB</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">Orphan node_modules</span>
              <span className="font-mono text-[#F5F5F7] font-medium">14.2 GB</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">Docker Layers</span>
              <span className="font-mono text-[#F5F5F7] font-medium">5.1 GB</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <span className="text-[#8A8A93] block mb-1">NPM/Yarn Cache</span>
              <span className="font-mono text-[#F5F5F7] font-medium">3.8 GB</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
            <span className="text-xs text-[#8A8A93]">
              31.5 GB recoverable without breaking project lockfiles.
            </span>
            <button
              onClick={() => triggerAction('clean-dev-caches', {}, 'Purge Dev Caches')}
              disabled={loadingAction === 'clean-dev-caches'}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] hover:brightness-110 text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{loadingAction === 'clean-dev-caches' ? 'Purging Dev Caches...' : 'Purge All Dev Caches'}</span>
            </button>
          </div>
        </div>

        {/* CARD 5: Boss Key & Confidentiality Cloak (Span 2 cols on md/lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-xl overflow-hidden hover:border-[#7C3AED]/40 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-all duration-300"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(124,58,237,0.12), transparent 80%)`,
            }}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#F5F5F7] tracking-tight">Sub-10ms Privacy Cloak</h3>
                <span className="text-xs text-[#8A8A93]">Panic Key • Headphone Stem Squeeze • Bezel Gaze</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-2xl bg-[#EF4444]/20 text-[#EF4444] text-xs font-mono font-medium border border-[#EF4444]/30">
              Zero Latency
            </span>
          </div>

          <p className="text-xs text-[#8A8A93] mb-6">
            Instantly cloaks target applications (Telegram, Discord, Steam, WhatsApp), clears clipboard memory, 
            and switches active virtual desktop to a pristine Xcode or Terminal workspace in under 10 milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#8A8A93]">
              <Terminal className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Keyboard Shortcut: ⌥ + Esc</span>
            </div>
            <button
              onClick={() => triggerAction('boss-key-reap', {}, 'Boss Screen Cloak')}
              disabled={loadingAction === 'boss-key-reap'}
              className="px-5 py-2.5 rounded-2xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <span>{loadingAction === 'boss-key-reap' ? 'Cloaking...' : 'Execute Cloak Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
