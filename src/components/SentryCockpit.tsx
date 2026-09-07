import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Eye,
  MousePointer,
  Radio,
  ShieldCheck,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { EarbudsTab } from './EarbudsTab';
import { GazeSentryTab } from './GazeSentryTab';
import { OnePlusAudiophileStudio } from './OnePlusAudiophileStudio';
import { sound } from '../utils/audio';

export const SentryCockpit: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'buds' | 'gaze' | 'audiophile'>('buds');

  const modes = [
    {
      id: 'buds' as const,
      label: 'Headphone Stem Sentry',
      description: 'OnePlus Buds & AirPods stem touch gestures',
      icon: Headphones,
    },
    {
      id: 'gaze' as const,
      label: 'Neural Vision & Gaze',
      description: 'Head-pose yaw & subtle eyebrow trigger',
      icon: Eye,
    },
    {
      id: 'audiophile' as const,
      label: 'Acoustic Studio & RF',
      description: 'Nord 4 Bluetooth packet telemetry & EQ',
      icon: Radio,
    },
  ];

  return (
    <div className="w-full space-y-10">
      {/* Calm Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/[0.06]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8B5CF6]">
            <ShieldCheck className="w-4 h-4" />
            <span className="uppercase tracking-[0.2em]">Spatial Hardware Sentry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            GhostKey Spatial Sentry
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Hands-free zero-latency gesture sentry. Switch virtual desktops, cloak target windows, and sanitize memory in sub-10ms via physical stem squeeze or subtle head glance.
          </p>
        </div>

        {/* Relaxed, spacious mode pill selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
          {modes.map((mode) => {
            const isActive = activeMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  sound.playClick();
                  setActiveMode(mode.id);
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer select-none ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSentryModePill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#7C3AED]/30 to-[#8B5CF6]/20 border border-[#8B5CF6]/40 shadow-[0_0_16px_rgba(139,92,246,0.15)]"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-[#38BDF8]' : 'text-zinc-400'}`} />
                <span className="relative z-10">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacious Full-Width Studio View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full"
        >
          {activeMode === 'buds' && (
            <div className="w-full">
              <EarbudsTab />
            </div>
          )}

          {activeMode === 'gaze' && (
            <div className="w-full">
              <GazeSentryTab />
            </div>
          )}

          {activeMode === 'audiophile' && (
            <div className="w-full">
              <OnePlusAudiophileStudio />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
