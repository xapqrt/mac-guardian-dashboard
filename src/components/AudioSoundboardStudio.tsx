import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Sparkles, Sliders, Play, Disc, Music, Activity } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed } from './UIElements';
import { sound } from '../utils/audio';

export const AudioSoundboardStudio: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState<'cyber' | 'retro' | 'braun' | 'lcars'>('cyber');
  const [lastPlayed, setLastPlayed] = useState<string>('Click any pad to preview sound');

  const soundPads = [
    { id: 'click', label: 'Haptic Click', desc: 'Tactile tactile tick (sub-35ms)', action: () => sound.playClick(), color: 'from-cyan-500/20 to-blue-600/20' },
    { id: 'success', label: 'C-E-G Chord', desc: 'Positive validation triad', action: () => sound.playSuccess(), color: 'from-emerald-500/20 to-teal-600/20' },
    { id: 'purge', label: 'Purge Drop', desc: 'Low-frequency triangle swoop', action: () => sound.playPurge(), color: 'from-rose-500/20 to-red-600/20' },
    { id: 'reap', label: 'Reap Chime', desc: 'Dual-frequency memory sweep', action: () => sound.playReap(), color: 'from-amber-500/20 to-yellow-600/20' },
    { id: 'laser', label: 'Laser Lock', desc: 'High-speed sawtooth chirp', action: () => sound.playLaser(), color: 'from-purple-500/20 to-indigo-600/20' },
    { id: 'subbass', label: 'Sub-Bass 30Hz', desc: 'Deep seismic haptic boom', action: () => sound.playSubBass(), color: 'from-blue-500/20 to-sky-600/20' },
    { id: 'relay', label: 'Mechanical Relay', desc: 'Square-wave micro-switch click', action: () => sound.playHapticRelay(), color: 'from-slate-500/20 to-slate-700/20' },
    { id: 'beacon', label: 'RF Beacon Ping', desc: 'High-register Bluetooth alert', action: () => sound.playBeacon(), color: 'from-pink-500/20 to-rose-600/20' }
  ];

  const handlePadClick = (pad: typeof soundPads[0]) => {
    pad.action();
    setLastPlayed(`Triggered: ${pad.label} [${pad.desc}]`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Soundboard Card */}
      <HoloCard className="p-8 sm:p-10 space-y-8 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.12)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
              <Disc className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white">Synthesized Acoustic Feedback Studio</h2>
                <CyberBadge variant="cyan">WEB AUDIO API</CyberBadge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Zero-Asset Procedural Audio Engine • Sub-1ms Latency • Real-Time Dynamic Oscillator Synthesis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2">
              <StatusLed color="green" size="sm" />
              <span>Audio Engine: ONLINE</span>
            </div>
          </div>
        </div>

        {/* Sound Themes & Master Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Acoustic Theme:</span>
            <div className="flex gap-2">
              {[
                { id: 'cyber', label: 'Cyberpunk 2077' },
                { id: 'retro', label: 'Macintosh 1984' },
                { id: 'braun', label: 'Braun Minimal' },
                { id: 'lcars', label: 'LCARS Sci-Fi' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveTheme(t.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                    activeTheme === t.id
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-white/[0.02] text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono text-cyan-400 font-semibold truncate max-w-sm">
            {lastPlayed}
          </span>
        </div>

        {/* 8 Interactive Synthesizer Trigger Pads */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {soundPads.map(pad => (
            <button
              key={pad.id}
              onClick={() => handlePadClick(pad)}
              className={`p-5 rounded-2xl border border-white/10 bg-gradient-to-br ${pad.color} hover:border-white/30 text-left transition-all duration-150 active:scale-95 group shadow-lg flex flex-col justify-between h-32`}
            >
              <div className="flex justify-between items-center">
                <span className="w-2 h-2 rounded-full bg-white/60 group-hover:bg-cyan-400 transition-colors" />
                <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-cyan-300 font-mono transition-colors">
                  {pad.label}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight">
                  {pad.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

      </HoloCard>

    </div>
  );
};
