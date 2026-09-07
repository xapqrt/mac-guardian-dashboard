import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Sliders, Volume2, Radio, Zap, Sparkles, Compass, Shield, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed, TactileSwitch } from './UIElements';
import { sound } from '../utils/audio';

interface AudiophileStudioProps {
  btStats?: {
    battery?: number;
    deviceName?: string;
    connected?: boolean;
    rate_kbps?: number;
    rssi_dbm?: number;
    codec?: string;
    snr_db?: number;
    jitter_ms?: number;
    retx_percent?: number;
  };
}

export const OnePlusAudiophileStudio: React.FC<AudiophileStudioProps> = ({ btStats }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeEqPreset, setActiveEqPreset] = useState<string>('harman');
  const [gamingMode, setGamingMode] = useState<boolean>(false);
  const [spatialAudio, setSpatialAudio] = useState<boolean>(true);
  const [headAngle, setHeadAngle] = useState<number>(0);

  // 6-Band EQ: 32Hz, 125Hz, 500Hz, 2kHz, 8kHz, 16kHz (in dB, -12 to +12)
  const [eqBands, setEqBands] = useState<number[]>([4, 2, 0, 1, 3, 5]);

  const presets: Record<string, { label: string; bands: number[]; desc: string }> = {
    harman: {
      label: 'Harman Target 2026',
      bands: [4, 2, 0, 1, 3, 5],
      desc: 'Scientifically tuned for natural, immersive sub-bass extension and clear vocal staging.'
    },
    bass: {
      label: 'Bass Cannon Extra-Deep',
      bands: [9, 7, 3, 0, 1, 2],
      desc: 'Pumps up the 12.4mm titanium dynamic driver for intense EDM and hip-hop sub-frequencies.'
    },
    vocal: {
      label: 'Crystal Vocal & Podcast',
      bands: [-2, 0, 3, 6, 4, 1],
      desc: 'Enhances speech intelligibility and crisp upper mids for podcasts, calls, and dialogues.'
    },
    flat: {
      label: 'Reference Studio Flat',
      bands: [0, 0, 0, 0, 0, 0],
      desc: 'Completely uncolored reference audio curve for music production and critical listening.'
    }
  };

  const handlePresetSelect = (key: string) => {
    sound.playClick();
    setActiveEqPreset(key);
    setEqBands([...presets[key].bands]);
  };

  const handleBandChange = (index: number, val: number) => {
    const updated = [...eqBands];
    updated[index] = val;
    setEqBands(updated);
    setActiveEqPreset('custom');
  };

  // 60FPS Live Waveform Canvas simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw background cyber grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw audio waveform paths
      const numBands = 36;
      const bandWidth = width / numBands;

      for (let i = 0; i < numBands; i++) {
        const x = i * bandWidth;
        const eqMultiplier = 1 + (eqBands[Math.min(5, Math.floor(i / 6))] || 0) * 0.08;
        const wave = Math.sin(phase + i * 0.3) * Math.cos(phase * 0.7 + i * 0.15);
        const barHeight = Math.max(4, Math.abs(wave) * 45 * eqMultiplier);

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
        if (gamingMode) {
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(0.5, '#fb923c');
          gradient.addColorStop(1, '#f43f5e');
        } else {
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#3b82f6');
          gradient.addColorStop(1, '#10b981');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 2, centerY - barHeight, bandWidth - 4, barHeight * 2);
      }

      phase += gamingMode ? 0.12 : 0.06;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [eqBands, gamingMode]);

  const deviceName = btStats?.deviceName || 'OnePlus Buds Nord 4';
  const battery = btStats?.battery || 60;
  const rssi = btStats?.rssi_dbm || -47;
  const bitrate = btStats?.rate_kbps || 224;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Audiophile Header Card */}
      <HoloCard className="p-8 sm:p-10 space-y-8 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.12)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white">{deviceName} Acoustic Studio</h2>
                <CyberBadge variant="slate">LHDC 5.0 / AAC-LC</CyberBadge>
                <CyberBadge variant="slate">12.4mm TITANIUM DRIVER</CyberBadge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Hardware Stem Control • 6-Band Parametric Graphic EQ • 360° Spatial Soundstage Compass
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <span className="text-xs font-mono text-slate-400">47ms Gaming Mode:</span>
              <TactileSwitch
                checked={gamingMode}
                onChange={(val) => {
                  sound.playClick();
                  setGamingMode(val);
                }}
              />
            </div>

            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center gap-2">
              <StatusLed color="green" size="sm" />
              <span>RF Link: {rssi} dBm (Active)</span>
            </div>
          </div>
        </div>

        {/* Studio Canvas + Nord 4 Photorealistic Hardware Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Photorealistic OnePlus Buds Nord 4 Dual Stems (5 cols) */}
          <div className="lg:col-span-5 bg-white/5 rounded-2xl border border-white/10 p-8 flex flex-col justify-between space-y-6 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Nord 4 Hardware Telemetry
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">{battery}% Battery</span>
              </div>

              {/* Nord 4 Twin Earbuds Graphic Rendering */}
              <div className="flex items-center justify-center gap-8 py-6">
                {/* Left Earbud */}
                <div className="flex flex-col items-center space-y-3 group cursor-pointer" onClick={() => sound.playClick()}>
                  <div className="relative w-20 h-32 rounded-2xl bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 border-2 border-white/30 p-2 shadow-2xl flex flex-col items-center justify-between group-hover:scale-105 transition-all">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-300">
                      L
                    </div>
                    {/* Stem Touch Sensor Groove */}
                    <div className="w-2.5 h-10 rounded-full bg-slate-800/80 border border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                    <div className="w-4 h-1.5 rounded-full bg-amber-400/80" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white font-mono">Left Stem</div>
                    <div className="text-[10px] text-cyan-400 font-mono">1x: Desktop Right</div>
                  </div>
                </div>

                {/* Charging Case Center */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-28 h-20 rounded-[28px] bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-white/20 flex flex-col items-center justify-center p-3 shadow-2xl relative">
                    <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold">ONEPLUS</div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] mt-2 animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400 mt-1">FAST CHARGE</span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white font-mono">Magnetic Case</div>
                    <div className="text-[10px] text-slate-400 font-mono">100% Stored Power</div>
                  </div>
                </div>

                {/* Right Earbud */}
                <div className="flex flex-col items-center space-y-3 group cursor-pointer" onClick={() => sound.playClick()}>
                  <div className="relative w-20 h-32 rounded-2xl bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 border-2 border-white/30 p-2 shadow-2xl flex flex-col items-center justify-between group-hover:scale-105 transition-all">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-300">
                      R
                    </div>
                    {/* Stem Touch Sensor Groove */}
                    <div className="w-2.5 h-10 rounded-full bg-slate-800/80 border border-rose-400/50 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                    <div className="w-4 h-1.5 rounded-full bg-amber-400/80" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-white font-mono">Right Stem</div>
                    <div className="text-[10px] text-rose-400 font-mono">2x: Panic Mute</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Audio Latency:</span>
              <span className="text-cyan-400 font-bold">{gamingMode ? '47ms Ultra-Low (Game Mode)' : '110ms Standard Hi-Fi'}</span>
            </div>
          </div>

          {/* Right: Real-time Spectrum Waveform + 6-Band Graphic EQ (7 cols) */}
          <div className="lg:col-span-7 bg-white/5 rounded-2xl border border-white/10 p-8 flex flex-col justify-between space-y-6 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
            
            {/* Live FFT Spectrum Analyzer Canvas */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Live 60fps FFT Audio Spectrum Analyzer
                </span>
                <span className="text-[11px] font-mono text-slate-400">32Hz – 16kHz Range</span>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-2 overflow-hidden shadow-inner">
                <canvas ref={canvasRef} width={520} height={120} className="w-full h-28 block" />
              </div>
            </div>

            {/* EQ Preset Selector Pills */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Master Sound Profile:</span>
                <span className="text-cyan-400 font-semibold">{presets[activeEqPreset]?.desc || 'Custom curve active.'}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(presets).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono transition-all text-center border ${
                      activeEqPreset === key
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-950/40'
                        : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {presets[key].label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* 6-Band Interactive Equalizer Sliders */}
            <div className="pt-2">
              <div className="grid grid-cols-6 gap-3 text-center">
                {['32Hz', '125Hz', '500Hz', '2kHz', '8kHz', '16kHz'].map((freq, idx) => {
                  const dbVal = eqBands[idx] || 0;
                  return (
                    <div key={freq} className="flex flex-col items-center space-y-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">
                        {dbVal > 0 ? `+${dbVal}` : dbVal}dB
                      </span>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        value={dbVal}
                        onChange={(e) => handleBandChange(idx, parseInt(e.target.value, 10))}
                        className="w-full h-20 -rotate-90 my-6 accent-cyan-400 cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{freq}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </HoloCard>

    </div>
  );
};
