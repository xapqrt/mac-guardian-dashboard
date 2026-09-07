import React, { useRef } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { sound } from '../utils/audio';

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
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

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

  // Motion Variants for Staggered Cinematic Text Reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const wordVariants = {
    hidden: { y: 40, opacity: 0 },
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
      
      {/* Ambient Diffuse Spotlight glowing softly behind hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none -z-10">
        <div
          className="w-full h-full opacity-60 blur-[120px]"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.28) 0%, rgba(41, 151, 255, 0.1) 45%, transparent 70%)'
          }}
        />
      </div>

      {/* Top Capsule Category Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl shadow-lg"
      >
        <span className="w-2 h-2 rounded-full bg-[#30d158] ring-4 ring-[#30d158]/20 animate-pulse" />
        <span className="text-xs font-semibold tracking-wider uppercase text-[#f5f5f7]">
          Apple Silicon Velocity Architecture
        </span>
        <span className="text-[#86868b] text-xs">•</span>
        <span className="text-xs text-[#86868b] font-medium">{stats?.specs?.osVersion || 'macOS Sequoia'}</span>
      </motion.div>

      {/* Cinematic Main Headline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-5xl mx-auto space-y-4"
      >
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tighter text-white leading-[1.05] sm:leading-[1.02]">
          <motion.span variants={wordVariants} className="block apple-text-gradient">
            Power in stillness.
          </motion.span>
          <motion.span variants={wordVariants} className="block text-[#86868b] font-medium">
            Speed at your command.
          </motion.span>
        </h1>

        <motion.p
          variants={wordVariants}
          className="text-lg sm:text-xl text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed tracking-tight"
        >
          Engineered for Apple Silicon. Zero-copy unified memory reclamation, passive cooling sentry, and wireless hardware stealth switcher.
        </motion.p>
      </motion.div>

      {/* Interactive Hero Product Frame with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.3 }}
        className="w-full max-w-5xl mt-12 perspective-[1200px]"
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
          className="relative rounded-3xl p-6 sm:p-10 apple-frosted-acrylic border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition-shadow duration-300 hover:shadow-[0_40px_100px_rgba(0,113,227,0.18)]"
        >
          {/* Subtle Top Specular Sheen */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Top Bar of the Product Frame: Hardware Status & Velocity Gauge */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl apple-metallic-chip flex items-center justify-center text-white shrink-0">
                <Cpu className="w-7 h-7 text-[#0071e3]" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                    {stats?.specs?.chip || 'Apple M-Series Pro'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#30d158]/15 text-[#30d158] text-xs font-semibold border border-[#30d158]/20">
                    {healthScore}% Peak Score
                  </span>
                </div>
                <p className="text-xs text-[#86868b] mt-0.5">
                  Unified Memory Subsystem • {stats?.cpu?.cores || 10}-Core Die Floorplan • Uptime: {stats?.uptime || 'Active'}
                </p>
              </div>
            </div>

            {/* Live Telemetry Pills */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <div className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#ff9f0a]" />
                <span className="text-[#86868b]">Power:</span>
                <span className="text-white font-semibold">{m4.watts} Watts</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#30d158]" />
                <span className="text-[#86868b]">SoC Junction:</span>
                <span className="text-white font-semibold">{m4.tempC}°C</span>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-[#0071e3]" />
                <span className="text-[#86868b]">Buds 4:</span>
                <span className="text-white font-semibold">{buds.battery || 60}%</span>
              </div>
            </div>
          </div>

          {/* Middle Body: Dynamic Unified Memory & Die Glance */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Unified Memory Allocation */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#0071e3]" /> Unified RAM
                </span>
                <span className="text-white font-semibold">{stats?.ram?.percent || 0}%</span>
              </div>

              <div className="text-3xl font-semibold tracking-tight text-white">
                {stats?.ram?.usedGb || '6.0'} <span className="text-base font-normal text-[#86868b]">/ {stats?.ram?.totalGb || '16'} GB</span>
              </div>

              {/* Multi-Segment Apple Memory Bar */}
              <div className="h-2 w-full bg-white/[0.08] rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${Math.round((parseFloat(stats?.ram?.appMemoryGb || '3') / parseFloat(stats?.ram?.totalGb || '16')) * 100)}%` }}
                  className="bg-[#0071e3] h-full"
                  title="App Memory"
                />
                <div
                  style={{ width: `${Math.round((parseFloat(stats?.ram?.wiredGb || '1.8') / parseFloat(stats?.ram?.totalGb || '16')) * 100)}%` }}
                  className="bg-[#bf5af2] h-full"
                  title="Wired"
                />
                <div
                  style={{ width: `${Math.round((parseFloat(stats?.ram?.compressedGb || '0.5') / parseFloat(stats?.ram?.totalGb || '16')) * 100)}%` }}
                  className="bg-[#ff9f0a] h-full"
                  title="Compressed"
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#86868b] pt-1">
                <span>Swap: {stats?.ram?.swapUsedMb || 0} MB</span>
                <button
                  onClick={onPurgeRam}
                  disabled={isPurgingRam}
                  className="text-[#0071e3] hover:text-[#2997ff] font-medium transition-colors cursor-pointer"
                >
                  {isPurgingRam ? 'Purging...' : 'Purge Inactive'}
                </button>
              </div>
            </div>

            {/* Thermal Headroom & Power */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Zap className="w-3.5 h-3.5 text-[#ff9f0a]" /> Thermal Headroom
                </span>
                <span className="text-[#30d158] font-semibold">Nominal</span>
              </div>

              <div className="text-3xl font-semibold tracking-tight text-white">
                {m4.tempC || '31.2'}°C <span className="text-base font-normal text-[#86868b]">Die Temp</span>
              </div>

              <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#30d158] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, (parseFloat(m4.tempC || '31') / 90) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#86868b] pt-1">
                <span>Fan: Silent 0 RPM</span>
                <span className="text-white">Draw: {m4.watts}W</span>
              </div>
            </div>

            {/* GhostKey Wireless Stealth Switcher */}
            <div className="space-y-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Shield className="w-3.5 h-3.5 text-[#30d158]" /> GhostKey Switcher
                </span>
                <span className="text-xs text-[#30d158] font-semibold">ARMED</span>
              </div>

              <div className="text-3xl font-semibold tracking-tight text-white">
                Sub-1ms <span className="text-base font-normal text-[#86868b]">Latency</span>
              </div>

              <p className="text-xs text-[#86868b] leading-relaxed">
                OnePlus Buds stem tap & Bezel Notch flick active. Instant slide to decoy workspace with zero audio leak.
              </p>

              <div className="pt-1 flex items-center justify-between text-[11px]">
                <button
                  onClick={onOpenSentry}
                  className="text-[#0071e3] hover:text-[#2997ff] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Configure Triggers <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Action Row at Bottom of Card */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onQuickSweep}
                disabled={isSweeping}
                className="apple-btn-gloss px-6 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white text-sm font-medium shadow-[0_4px_16px_rgba(0,113,227,0.4)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSweeping ? 'Reclaiming Memory...' : 'Instant Mac Sweep (⌘B)'}</span>
              </button>

              <button
                onClick={onFocusMode}
                disabled={isFocusing}
                className="px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] active:scale-95 text-white text-sm font-medium border border-white/[0.08] transition-all cursor-pointer"
              >
                Focus Mode
              </button>
            </div>

            <button
              onClick={onOpenSpecs}
              className="text-xs text-[#86868b] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Full Silicon Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>
      </motion.div>

    </section>
  );
};
