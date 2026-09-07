import React from 'react';
import { ArrowRight, Cpu, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';
import { useCountUp } from '../hooks/useCountUp';

interface ScrollStorySectionProps {
  stats?: any;
  onExploreFeature?: (tab: string) => void;
}

export const ScrollStorySection: React.FC<ScrollStorySectionProps> = ({ stats, onExploreFeature }) => {
  const ramUsed = stats?.ram?.usedGb || '6.2';
  const ramTotal = stats?.ram?.totalGb || '16.0';
  const ramPercent = stats?.ram?.percent || 48;
  const animatedRam = useCountUp(parseFloat(ramUsed), 800);

  return (
    <section className="relative w-full bg-[#08080a] text-[#F5F5F7] selection:bg-[#7C3AED]/30 overflow-hidden border-t border-white/5">
      <div className="w-full px-4 sm:px-8 py-16">
        {/* 1. Strict 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Text): Span 7 columns */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Context Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-[#38BDF8] mb-6">
              <Cpu className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Unified Memory Architecture • Apple Silicon</span>
            </div>

            {/* Heading: Single, unified headline in normal flow */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              Zero-copy bandwidth. <br />
              <span className="text-[#8A8A93]">Zero memory overhead.</span>
            </h2>

            {/* Body Paragraph: Clean separation without absolute collision */}
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#8A8A93] max-w-xl">
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
                className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all bg-[#7C3AED] hover:bg-[#6D28D9] text-white  flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Inspect Process Memory</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onExploreFeature?.('earbuds');
                }}
                className="rounded-2xl px-5 py-2.5 text-sm font-medium transition-all bg-white/5 text-[#F5F5F7] border border-white/10 hover:bg-white/10 hover:border-white/20 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#8A8A93]" />
                <span>GhostKey Sentry Matrix</span>
              </button>
            </div>
          </div>

          {/* Right Column (Spec Card): Span 5 columns */}
          <div className="lg:col-span-5 relative">
            {/* Subtle background radial glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#7C3AED]/15 blur-3xl" />

            {/* Outer Card: Glassmorphic panel with rounded-2xl */}
            <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl overflow-hidden hover:border-white/20  transition-all duration-200">
              
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-[#38BDF8]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22D3EE]" />
                  </span>
                  <span>DIRECT-ATTACHED LPDDR5X</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">120 GB/s</span>
              </div>

              {/* Large Metric Display with count-up */}
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold tracking-tight text-white font-mono">
                  {animatedRam.toFixed(1)}
                </span>
                <span className="text-sm text-zinc-400 font-mono">
                  of {ramTotal} GB Unified
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="h-2 w-full bg-white/5 rounded-2xl overflow-hidden my-4">
                <div
                  className="h-full bg-[#7C3AED] hover:bg-[#6D28D9] rounded-2xl transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                  style={{ width: `${Math.min(100, Math.max(8, ramPercent))}%` }}
                />
              </div>

              {/* Spec Rows (Key-Value Grid 1): Strict 2-column layout */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#8A8A93]">Swap Page-outs</span>
                  <span className="text-sm font-mono text-white font-medium">0 KB / sec</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#8A8A93]">App Memory</span>
                  <span className="text-sm font-mono text-[#38BDF8] font-medium">Local Neural Engine</span>
                </div>
              </div>

              {/* Spec Rows (Key-Value Grid 2): Acoustic & Gesture Sentry */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 mt-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#8A8A93]">Acoustic Profile</span>
                  <span className="text-sm font-mono text-white font-medium">0 RPM (Fanless)</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#8A8A93]">Bezel Notch Sentry</span>
                  <span className="text-sm font-mono text-[#8B5CF6] font-medium">Air-Gapped Local</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

