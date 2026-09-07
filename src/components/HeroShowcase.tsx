import React, { useRef, lazy, Suspense } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Shield,
  Activity,
  ArrowRight,
  Headphones,
  Loader2
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useCountUp } from '../hooks/useCountUp';

const HeroScene = lazy(() => import('./HeroScene'));

interface HeroShowcaseProps {
  stats: any;
  healthScore: number;
  onQuickSweep: () => void;
  isSweeping: boolean;
  onPurgeRam: () => void;
  isPurgingRam: boolean;
  onFocusMode: () => void;
  isFocusing: boolean;
  onOpenSpecs: () => void;
  onOpenSentry: () => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  stats,
  healthScore,
  onQuickSweep,
  isSweeping,
  onPurgeRam,
  isPurgingRam,
  onFocusMode,
  isFocusing,
  onOpenSpecs,
  onOpenSentry
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Responsive Mouse Tilt physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 26 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const m4 = stats?.m4Telemetry || { watts: '3.8', tempC: '30.6', chipBrand: 'Apple Silicon' };
  const buds = stats?.onePlusBuds || { deviceName: 'OnePlus Buds 4', battery: 60, connected: true };

  // Count-up hooks for metrics
  const animatedScore = useCountUp(healthScore, 800);
  const animatedWatts = useCountUp(parseFloat(m4.watts || '3.8'), 800);
  const animatedTemp = useCountUp(parseFloat(m4.tempC || '30.6'), 800);
  const animatedRam = useCountUp(parseFloat(stats?.ram?.usedGb || '6.0'), 800);
  const ramPercent = stats?.ram?.percent || 48;

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const wordVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 26
      }
    }
  };

  return (
    <section id="overview" className="relative min-h-[90vh] flex flex-col items-center justify-center pt-8 pb-16 px-4 sm:px-6 overflow-hidden">
      
      {/* 3D Wireframe Scene Layer (Atmosphere) */}
      <Suspense fallback={null}>
        <HeroScene className="opacity-70" />
      </Suspense>

      {/* Top Capsule Category Badge */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg relative z-10"
      >
        <span className="w-2 h-2 rounded-full bg-[#22D3EE] ring-4 ring-[#22D3EE]/20 animate-pulse" />
        <span className="text-xs font-semibold tracking-wider uppercase text-[#F5F5F7]">
          Silicon Velocity Matrix
        </span>
        <span className="text-[#8A8A93] text-xs">•</span>
        <span className="text-xs text-[#8A8A93] font-medium">{stats?.specs?.osVersion || 'macOS Sequoia'}</span>
      </motion.div>

      {/* Cinematic Main Headline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-5xl mx-auto space-y-4 relative z-10"
      >
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.05]">
          <motion.span variants={wordVariants} className="block text-gradient-violet-cyan">
            Power in stillness.
          </motion.span>
          <motion.span variants={wordVariants} className="block text-[#8A8A93] font-medium">
            Speed at your command.
          </motion.span>
        </h1>

        <motion.p
          variants={wordVariants}
          className="text-lg sm:text-xl text-[#8A8A93] max-w-2xl mx-auto font-normal leading-relaxed tracking-tight"
        >
          Engineered for Apple Silicon. Zero-copy unified memory reclamation, passive cooling sentry, and wireless hardware stealth switcher.
        </motion.p>
      </motion.div>

      {/* Interactive Hero Product Frame with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.2 }}
        className="w-full max-w-5xl mt-12 perspective-[1200px] relative z-10"
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d'
          }}
          className="relative rounded-2xl p-6 sm:p-10 bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,0.9)] transition-all duration-200 hover:border-white/20 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]"
        >
          {/* Subtle Top Specular Sheen */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* Top Bar of the Product Frame: Hardware Status & Velocity Gauge */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                <Cpu className="w-7 h-7 text-[#7C3AED]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {stats?.specs?.chip || 'Apple M-Series Pro'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-2xl bg-[#22D3EE]/15 text-[#22D3EE] text-xs font-semibold border border-[#22D3EE]/30">
                    {Math.round(animatedScore)}% Peak Score
                  </span>
                </div>
                <p className="text-xs text-[#8A8A93] mt-0.5">
                  Unified Memory Subsystem • {stats?.cpu?.cores || 10}-Core Die Floorplan • Uptime: {stats?.uptime || 'Active'}
                </p>
              </div>
            </div>

            {/* Live Telemetry Pills */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[#8A8A93]">Power:</span>
                <span className="text-white font-semibold font-mono">{animatedWatts.toFixed(1)} W</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span className="text-[#8A8A93]">SoC Junction:</span>
                <span className="text-white font-semibold font-mono">{animatedTemp.toFixed(1)}°C</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span className="text-[#8A8A93]">Buds 4:</span>
                <span className="text-white font-semibold font-mono">{buds.battery || 60}%</span>
              </div>
            </div>
          </div>

          {/* Middle Body: Dynamic Unified Memory & Die Glance */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Unified Memory Allocation Card */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]">
              <div className="flex items-center justify-between text-xs text-[#8A8A93]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#7C3AED]" /> Unified RAM
                </span>
                <span className="text-white font-semibold font-mono">{ramPercent}%</span>
              </div>

              <div className="text-3xl font-semibold tracking-tight text-white font-mono">
                {animatedRam.toFixed(1)} <span className="text-base font-normal text-[#8A8A93]">/ {stats?.ram?.totalGb || '16'} GB</span>
              </div>

              {/* Multi-Segment Memory Bar */}
              <div className="h-2 w-full bg-white/10 rounded-2xl overflow-hidden flex">
                <div
                  style={{ width: `${Math.round((parseFloat(stats?.ram?.appMemoryGb || '3') / parseFloat(stats?.ram?.totalGb || '16')) * 100)}%` }}
                  className="bg-[#7C3AED] h-full"
                  title="App Memory"
                />
                <div
                  style={{ width: `${Math.round((parseFloat(stats?.ram?.wiredGb || '1.8') / parseFloat(stats?.ram?.totalGb || '16')) * 100)}%` }}
                  className="bg-[#A78BFA] h-full"
                  title="Wired"
                />
                <div
                  style={{ width: `${Math.round((parseFloat(stats?.ram?.compressedGb || '0.5') / parseFloat(stats?.ram?.totalGb || '16')) * 100)}%` }}
                  className="bg-[#22D3EE] h-full"
                  title="Compressed"
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#8A8A93] pt-1">
                <span>Swap: {stats?.ram?.swapUsedMb || 0} MB</span>
                <button
                  onClick={onPurgeRam}
                  disabled={isPurgingRam}
                  className="text-[#22D3EE] hover:text-[#38BDF8] font-medium transition-colors cursor-pointer"
                >
                  {isPurgingRam ? 'Purging...' : 'Purge Inactive'}
                </button>
              </div>
            </div>

            {/* Thermal Headroom & Power Card */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]">
              <div className="flex items-center justify-between text-xs text-[#8A8A93]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" /> Thermal Headroom
                </span>
                <span className="text-[#22D3EE] font-semibold font-mono">Nominal</span>
              </div>

              <div className="text-3xl font-semibold tracking-tight text-white font-mono">
                {animatedTemp.toFixed(1)}°C <span className="text-base font-normal text-[#8A8A93]">Die Temp</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-2xl overflow-hidden">
                <div
                  className="bg-[#22D3EE] h-full rounded-2xl transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, (parseFloat(m4.tempC || '31') / 90) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#8A8A93] pt-1">
                <span>Fan: Silent 0 RPM</span>
                <span className="text-white font-mono">Draw: {animatedWatts.toFixed(1)}W</span>
              </div>
            </div>

            {/* GhostKey Wireless Stealth Switcher Card */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]">
              <div className="flex items-center justify-between text-xs text-[#8A8A93]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Shield className="w-3.5 h-3.5 text-[#22D3EE]" /> GhostKey Switcher
                </span>
                <span className="text-xs text-[#22D3EE] font-semibold font-mono">ARMED</span>
              </div>

              <div className="text-3xl font-semibold tracking-tight text-white">
                Sub-1ms <span className="text-base font-normal text-[#8A8A93]">Latency</span>
              </div>

              <p className="text-xs text-[#8A8A93] leading-relaxed">
                OnePlus Buds stem tap & Bezel Notch flick active. Instant slide to decoy workspace with zero audio leak.
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <button
                  onClick={onOpenSentry}
                  className="text-[#22D3EE] hover:text-[#38BDF8] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Configure Triggers <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Action Row at Bottom of Card */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onQuickSweep}
                disabled={isSweeping}
                className="min-w-[170px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] hover:shadow-[0_0_24px_rgba(124,58,237,0.45)] active:scale-95 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSweeping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Mac Sweep (⌘B)</span>
                  </>
                )}
              </button>

              <button
                onClick={onFocusMode}
                disabled={isFocusing}
                className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white text-sm font-medium border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                Focus Mode
              </button>
            </div>

            <button
              onClick={onOpenSpecs}
              className="text-xs text-[#8A8A93] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Full Silicon Architecture</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#22D3EE]" />
            </button>
          </div>

        </motion.div>
      </motion.div>

    </section>
  );
};

