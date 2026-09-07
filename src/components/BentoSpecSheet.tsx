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
      {/* Section Header with Apple Typography */}
      <div className="space-y-3 text-center md:text-left">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#86868b]">
          Architecture & Diagnostics
        </span>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-[-0.03em] apple-text-gradient">
          The Silicon Grid.
        </h2>
        <p className="text-[#86868b] max-w-xl text-base">
          Engineered for Apple Silicon telemetry, zero-friction tab hibernation, and surgical disk reclamation.
        </p>
      </div>

      {/* 4-Column Asymmetric Apple Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: Apple Silicon M-Series Metallic Die (Span 2 cols on md/lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-2 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-8 backdrop-blur-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-300"
        >
          {/* Subtle cursor spotlight effect */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 80%)`,
            }}
          />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">{chipName}</h3>
                <span className="text-xs text-[#86868b] font-mono">{osVersion}</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenSpecs?.();
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.1] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>Die Inspection</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
            </button>
          </div>

          {/* Micro Metallic Die Visual representation */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#86868b] block mb-1">Performance Cores</span>
              <span className="text-xl font-mono font-semibold text-white">4 Firestorm</span>
              <span className="text-[10px] text-[#30d158] block mt-1">4.40 GHz Max</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#86868b] block mb-1">Efficiency Cores</span>
              <span className="text-xl font-mono font-semibold text-white">6 Icestorm</span>
              <span className="text-[10px] text-[#86868b] block mt-1">Sub-100mW Idle</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[#86868b] block mb-1">Neural Engine</span>
              <span className="text-xl font-mono font-semibold text-[#2997ff]">38 TOPS</span>
              <span className="text-[10px] text-[#86868b] block mt-1">16-Core CoreML</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs text-[#86868b]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Uptime: {uptime}
            </span>
            <span className="font-mono text-white">Thermal Envelope: {m4.watts}W Draw</span>
          </div>
        </div>

        {/* CARD 2: Browser Tab Memory Reaper (1 col on lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-7 backdrop-blur-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 80%)`,
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-2xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#2997ff]" />
              </div>
              <span className="text-xs font-mono text-[#86868b]">
                {browserTabs.length} Active Tabs
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-tight mb-1">Tab Memory Reaper</h3>
            <p className="text-xs text-[#86868b] mb-4">
              Reclaim {((totalTabMemoryMb || 1920) / 1024).toFixed(1)} GB locked by runaway JavaScript heaps.
            </p>

            <div className="space-y-2 mb-4">
              {browserTabs.slice(0, 3).map((tab: any) => (
                <div key={tab.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs">
                  <span className="truncate max-w-[140px] text-[#a1a1a6]">{tab.title}</span>
                  <span className="font-mono text-white text-[11px]">{tab.memoryMb} MB</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => triggerAction('reap-chrome-tabs', {}, 'Reap Browser Tabs')}
            disabled={loadingAction === 'reap-chrome-tabs'}
            className="w-full py-2.5 rounded-full bg-white/[0.08] hover:bg-[#ff453a]/20 hover:text-[#ff453a] hover:border-[#ff453a]/30 border border-white/[0.1] text-xs font-medium text-white transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loadingAction === 'reap-chrome-tabs' ? 'Reaping Tabs...' : 'Reap Memory Hog Tabs'}</span>
          </button>
        </div>

        {/* CARD 3: Caffeinate Awake Sentry (1 col on lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-7 backdrop-blur-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 80%)`,
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-2xl bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-[#ff9f0a]" />
              </div>
              <span className="text-xs font-mono text-[#30d158]">
                Assertion: Active
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white tracking-tight mb-1">Caffeinate Sentry</h3>
            <p className="text-xs text-[#86868b] mb-4">
              Prevent display sleep & CPU power idle during large downloads, model compilation, or long renders.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {['30m', '1h', '4h'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => triggerAction('caffeinate-preset', { duration: preset }, `Caffeinate ${preset}`)}
                  className="py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-xs font-mono text-white transition-all text-center"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => triggerAction('toggle-caffeinate', {}, 'Toggle Caffeinate')}
            disabled={loadingAction === 'toggle-caffeinate'}
            className="w-full py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-medium text-white transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sun className="w-3.5 h-3.5 text-[#ff9f0a]" />
            <span>Indefinite Stay-Awake</span>
          </button>
        </div>

        {/* CARD 4: Dev Artifacts & Cache Reclaimer (Span 2 cols on md/lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-2 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-8 backdrop-blur-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-300"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 80%)`,
            }}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-[#30d158]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">APFS Dev Cleaner</h3>
                <span className="text-xs text-[#86868b]">node_modules • Xcode DerivedData • Docker overlays</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onNavigateTab?.('developer');
              }}
              className="text-xs text-[#2997ff] hover:underline"
            >
              Inspect Ghost Folders
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#86868b] block mb-1">Xcode Derived</span>
              <span className="font-mono text-white font-medium">8.4 GB</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#86868b] block mb-1">Orphan node_modules</span>
              <span className="font-mono text-white font-medium">14.2 GB</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#86868b] block mb-1">Docker Layers</span>
              <span className="font-mono text-white font-medium">5.1 GB</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#86868b] block mb-1">NPM/Yarn Cache</span>
              <span className="font-mono text-white font-medium">3.8 GB</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
            <span className="text-xs text-[#86868b]">
              31.5 GB recoverable without breaking project lockfiles.
            </span>
            <button
              onClick={() => triggerAction('clean-dev-caches', {}, 'Purge Dev Caches')}
              disabled={loadingAction === 'clean-dev-caches'}
              className="px-5 py-2.5 rounded-full bg-[#30d158] hover:bg-[#34c759] text-black font-semibold text-xs transition-all active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{loadingAction === 'clean-dev-caches' ? 'Purging Dev Caches...' : 'Purge All Dev Caches'}</span>
            </button>
          </div>
        </div>

        {/* CARD 5: Boss Key & Confidentiality Cloak (Span 2 cols on md/lg) */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative md:col-span-2 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-8 backdrop-blur-2xl overflow-hidden hover:border-white/[0.18] transition-all duration-300"
        >
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
            style={{
              background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 80%)`,
            }}
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#ff453a]" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Sub-10ms Privacy Cloak</h3>
                <span className="text-xs text-[#86868b]">Panic Key • Headphone Stem Squeeze • Bezel Gaze</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-[#ff453a]/20 text-[#ff453a] text-xs font-mono font-medium">
              Zero Latency
            </span>
          </div>

          <p className="text-xs text-[#86868b] mb-6">
            Instantly cloaks target applications (Telegram, Discord, Steam, WhatsApp), clears clipboard memory, 
            and switches active virtual desktop to a pristine Xcode or Terminal workspace in under 10 milliseconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-[#86868b]">
              <Terminal className="w-3.5 h-3.5" />
              <span>Keyboard Shortcut: ⌥ + Esc</span>
            </div>
            <button
              onClick={() => triggerAction('boss-key-reap', {}, 'Boss Screen Cloak')}
              disabled={loadingAction === 'boss-key-reap'}
              className="px-5 py-2.5 rounded-full bg-[#ff453a] hover:bg-[#ff3b30] text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-2"
            >
              <span>{loadingAction === 'boss-key-reap' ? 'Cloaking...' : 'Execute Cloak Now'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
