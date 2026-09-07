import React from 'react';
import { ArrowRight, Cpu, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface ScrollStorySectionProps {
  stats?: any;
  onExploreFeature?: (tab: string) => void;
}

export const ScrollStorySection: React.FC<ScrollStorySectionProps> = ({ stats, onExploreFeature }) => {
  const ramUsed = stats?.ram?.usedGb || '6.2';
  const ramTotal = stats?.ram?.totalGb || '16.0';
  const ramPercent = stats?.ram?.percent || 48;

  return (
    <section className="relative w-full bg-black text-white selection:bg-[#0071e3]/30 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* 1. Strict 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Text): Span 7 columns */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Context Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#2997ff] mb-6">
              <Cpu className="w-3.5 h-3.5" />
              <span>Unified Memory Architecture • Apple Silicon</span>
            </div>

            {/* Heading: Single, unified headline in normal flow */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              Zero-copy bandwidth. <br />
              <span className="text-[#86868b]">Zero memory overhead.</span>
            </h2>

            {/* Body Paragraph: Clean separation without absolute collision */}
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#86868b] max-w-xl">
              Every core—CPU, GPU, and Neural Engine—shares one unbroken pool of memory with sub-millisecond access.
              Real-time hardware compression and spatial gesture triggers operate seamlessly with zero thermal penalty.
            </p>

            {/* Actions: Wrapped CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  sound.playClick();
                  onExploreFeature?.('processes');
                }}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-all bg-white text-black hover:bg-zinc-200 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Inspect Process Memory</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onExploreFeature?.('earbuds');
                }}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-all bg-white/5 text-white border border-white/10 hover:bg-white/10 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#86868b]" />
                <span>GhostKey Sentry Matrix</span>
              </button>
            </div>
          </div>

          {/* Right Column (Spec Card): Span 5 columns */}
          <div className="lg:col-span-5 relative">
            {/* Apple Polish: Subtle background radial glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Outer Card: Apple-grade backdrop container */}
            <div className="relative rounded-3xl bg-[#121215]/80 border border-white/10 p-6 backdrop-blur-xl shadow-2xl overflow-hidden">
              
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>DIRECT-ATTACHED LPDDR5X</span>
                </div>
                <span className="text-xs font-mono text-zinc-500">120 GB/s</span>
              </div>

              {/* Large Metric Display */}
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight text-white">
                  {ramUsed}
                </span>
                <span className="text-sm text-zinc-400 font-mono">
                  of {ramTotal} GB Unified
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden my-4">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(8, ramPercent))}%` }}
                />
              </div>

              {/* Spec Rows (Key-Value Grid 1): Strict 2-column layout */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#86868b]">Swap Page-outs</span>
                  <span className="text-sm font-mono text-white font-medium">0 KB / sec</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#86868b]">App Memory</span>
                  <span className="text-sm font-mono text-emerald-400 font-medium">Local Neural Engine</span>
                </div>
              </div>

              {/* Spec Rows (Key-Value Grid 2): Acoustic & Gesture Sentry */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#86868b]">Acoustic Profile</span>
                  <span className="text-sm font-mono text-white font-medium">0 RPM (Fanless)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#86868b]">Bezel Notch Sentry</span>
                  <span className="text-sm font-mono text-[#2997ff] font-medium">Air-Gapped Local</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
