import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Flame, Shield, Sparkles, Layers, Eye, RefreshCw, BarChart2 } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed } from './UIElements';
import { sound } from '../utils/audio';

interface M4DieProps {
  telemetry?: {
    chipBrand: string;
    totalCores: number;
    pCores: number;
    eCores: number;
    tempC: string;
    voltV: string;
    watts: string;
    thermalState: string;
    cycles: number;
    health: string;
    designCapacity?: number;
    rawMaxCapacity?: number;
  };
  loadAvg?: {
    load1: string;
    load5: string;
    load15: string;
  };
}

export const M4DieArchitectVisualizer: React.FC<M4DieProps> = ({ telemetry, loadAvg }) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>('p-cores');
  const [heatmapMode, setHeatmapMode] = useState<boolean>(false);
  const [activeFrequency, setActiveFrequency] = useState<number>(4.4);

  const m4 = telemetry || {
    chipBrand: 'Apple M4',
    totalCores: 10,
    pCores: 4,
    eCores: 6,
    tempC: '30.6',
    voltV: '12.74',
    watts: '3.8',
    thermalState: 'Nominal',
    cycles: 121,
    health: '100%'
  };

  const watts = parseFloat(m4.watts) || 3.8;
  const tempC = parseFloat(m4.tempC) || 30.6;
  const load1 = parseFloat(loadAvg?.load1 || '2.2');

  // Dynamic simulation of power distribution
  const cpuWatts = (watts * 0.55).toFixed(1);
  const gpuWatts = (watts * 0.25).toFixed(1);
  const aneWatts = (watts * 0.12).toFixed(1);
  const dramWatts = (watts * 0.08).toFixed(1);

  const blockDetails: Record<string, { title: string; subtitle: string; desc: string; specs: Array<{ k: string; v: string }> }> = {
    'p-cores': {
      title: '4x Performance Cores',
      subtitle: 'Apple Firestorm/Avalanche-class Compute Core Complex',
      desc: 'Super-wide out-of-order execution engine featuring ultra-deep reorder buffers, dedicated vector FP pipes, and hardware ray-tracing compute acceleration.',
      specs: [
        { k: 'Max Clock Speed', v: 'Up to 4.41 GHz' },
        { k: 'L1 Instruction Cache', v: '192 KB per core' },
        { k: 'L1 Data Cache', v: '128 KB per core' },
        { k: 'Shared L2 Cache', v: '16 MB High-Speed Pool' },
        { k: 'Current Load', v: `${Math.min(100, Math.round(load1 * 22))}% Active` }
      ]
    },
    'e-cores': {
      title: '6x Efficiency Cores',
      subtitle: 'Energy-Optimized Blizzard Compute Cluster',
      desc: 'Handles continuous background threads, kernel daemons, and system events with near-zero energy consumption, keeping battery drain under 2 Watts.',
      specs: [
        { k: 'Clock Range', v: '800 MHz – 2.85 GHz' },
        { k: 'Shared L2 Cache', v: '4 MB Low-Latency Pool' },
        { k: 'Architecture', v: 'Armv9.2-A with SME2' },
        { k: 'Energy Efficiency', v: '3.8x Performance per Watt' },
        { k: 'Dispatch State', v: 'Active (6/6 Cores Online)' }
      ]
    },
    'gpu': {
      title: '10-Core Apple Next-Gen GPU',
      subtitle: 'Dynamic Caching & Hardware Ray-Tracing Architecture',
      desc: 'Dynamically allocates local on-chip memory in hardware per task, ensuring peak execution unit utilization across 3D rendering and Metal compute shaders.',
      specs: [
        { k: 'Execution Cores', v: '10 Shader Clusters' },
        { k: 'Hardware Accelerators', v: 'Ray Tracing & Mesh Shading' },
        { k: 'Memory Bandwidth', v: '120 GB/s Unified Memory' },
        { k: 'Current Draw', v: `${gpuWatts} Watts` },
        { k: 'Metal Version', v: 'Metal 3 with Fast Resource Loading' }
      ]
    },
    'ane': {
      title: '16-Core Neural Engine (ANE)',
      subtitle: '38 Trillion Operations Per Second (TOPS)',
      desc: 'Dedicated matrix math accelerator built specifically for CoreML models, on-device generative AI, and real-time vision processing with zero CPU footprint.',
      specs: [
        { k: 'Throughput', v: '38 TOPS (Int8 / FP16)' },
        { k: 'Core Count', v: '16 High-Precision Tensor Cores' },
        { k: 'Hardware Acceleration', v: 'Apple Intelligence & Vision Engine' },
        { k: 'Power Draw', v: `${aneWatts} Watts` },
        { k: 'State', v: 'Armed & Low Latency' }
      ]
    },
    'uma': {
      title: 'Unified Memory Architecture (UMA)',
      subtitle: 'Zero-Copy Shared Silicon Fabric',
      desc: 'Direct, massive-bandwidth memory channel shared simultaneously by the CPU, GPU, and Neural Engine without duplicating data across separate memory pools.',
      specs: [
        { k: 'Bus Width', v: '128-bit LPDDR5X-7500' },
        { k: 'Peak Bandwidth', v: '120 GB/s Unified Throughput' },
        { k: 'Total RAM', v: '16 GB Unified Silicon Pool' },
        { k: 'Latency', v: 'Sub-18ns Access Latency' },
        { k: 'Bus Voltage', v: `${m4.voltV} Volts` }
      ]
    },
    'media': {
      title: 'Hardware Media Engine',
      subtitle: 'ProRes & AV1 Dual Hardware Codec',
      desc: 'Dedicated hardware encoding and decoding engines for 8K ProRes, H.264, HEVC, and energy-efficient AV1 streaming playback.',
      specs: [
        { k: 'Supported Formats', v: 'AV1, ProRes RAW, HEVC, H.264' },
        { k: 'Display Engine', v: 'ProMotion 120Hz & External 6K' },
        { k: 'Secure Enclave', v: 'Gen 3 Hardware Cryptographic Coprocessor' },
        { k: 'Decode Capability', v: 'Multiple 8K 60fps streams simultaneously' }
      ]
    }
  };

  const activeInfo = blockDetails[selectedBlock || 'p-cores'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Die Header Bar */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.12)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-white">Apple M4 Silicon Microarchitecture</h2>
                <CyberBadge variant="slate">3nm TSMC N3E</CyberBadge>
                <CyberBadge variant="slate">28B TRANSISTORS</CyberBadge>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Interactive Die Floorplan • Thermal Heatmap Layer • Real-Time Power Plane Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Heatmap Toggle Button */}
            <TactileButton
              variant={heatmapMode ? 'danger' : 'secondary'}
              onClick={() => {
                sound.playClick();
                setHeatmapMode(!heatmapMode);
              }}
              className="px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2"
            >
              <Flame className={`w-4 h-4 ${heatmapMode ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
              <span>{heatmapMode ? 'Thermal Heatmap: ON' : 'Thermal Heatmap: OFF'}</span>
            </TactileButton>

            <div className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2">
              <StatusLed color="green" size="sm" />
              <span>Silicon Temp: {tempC}°C</span>
            </div>
          </div>
        </div>

        {/* Die Floorplan & Sub-Block Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Die Silicon Layout Map (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Physical Die Floorplan (Click Block to Inspect)
              </span>
              <span className="text-cyan-400">Total Silicon Area: ~135 mm²</span>
            </div>

            {/* The Silicon Die Floorplan SVG Container */}
            <div className={`p-6 rounded-2xl border transition-all duration-500 relative overflow-hidden ${
              heatmapMode
                ? 'bg-gradient-to-br from-[#1a0808] via-[#240d0d] to-[#0c0404] border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                : 'bg-[#090d18]/90 border-white/10 shadow-inner'
            }`}>
              
              {/* Die Perimeter Frame */}
              <div className="grid grid-cols-12 gap-3 aspect-[16/10] p-4 rounded-2xl border border-white/[0.08] bg-black/40 relative">
                
                {/* 1. Performance Cores Complex (Top Left, 7 cols) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBlock('p-cores');
                  }}
                  className={`col-span-7 row-span-2 rounded-2xl p-4 text-left border transition-all duration-300 relative group overflow-hidden ${
                    selectedBlock === 'p-cores'
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                      : heatmapMode
                      ? 'border-amber-500/40 bg-amber-950/30 hover:border-amber-400'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> 4x P-Cores
                    </span>
                    <span className="text-[10px] text-cyan-400/80 font-mono">16MB L2 Pool</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 h-16">
                    {[1, 2, 3, 4].map(c => (
                      <div key={c} className="rounded-lg bg-black/40 border border-cyan-500/20 p-2 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-slate-300 font-bold">P{c}</span>
                        <div className="w-full bg-cyan-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-400 h-full animate-pulse" style={{ width: `${Math.min(100, Math.round(load1 * 20) + c * 5)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {heatmapMode && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-rose-500/15 to-transparent pointer-events-none" />
                  )}
                </button>

                {/* 2. Neural Engine 16-Core (Top Right, 5 cols) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBlock('ane');
                  }}
                  className={`col-span-5 row-span-2 rounded-2xl p-4 text-left border transition-all duration-300 relative group ${
                    selectedBlock === 'ane'
                      ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                      : heatmapMode
                      ? 'border-rose-500/30 bg-rose-950/20 hover:border-rose-400'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 16-Core ANE
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">38 TOPS</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-16">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="rounded bg-black/40 border border-purple-500/20 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      </div>
                    ))}
                  </div>
                </button>

                {/* 3. 10-Core GPU Cluster (Middle, 8 cols) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBlock('gpu');
                  }}
                  className={`col-span-8 row-span-2 rounded-2xl p-4 text-left border transition-all duration-300 relative group ${
                    selectedBlock === 'gpu'
                      ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400'
                      : heatmapMode
                      ? 'border-amber-500/30 bg-amber-950/20 hover:border-amber-400'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> 10-Core Next-Gen GPU
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Dynamic Caching</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 h-16">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="rounded bg-black/40 border border-emerald-500/20 p-1.5 flex flex-col justify-between">
                        <span className="text-[9px] font-mono text-emerald-300">G{i + 1}</span>
                        <div className="w-full bg-emerald-950 h-1 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </button>

                {/* 4. Efficiency Cores (Middle Right, 4 cols) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBlock('e-cores');
                  }}
                  className={`col-span-4 row-span-2 rounded-2xl p-4 text-left border transition-all duration-300 relative group ${
                    selectedBlock === 'e-cores'
                      ? 'border-sky-400 bg-sky-950/40 shadow-[0_0_20px_rgba(56,189,248,0.3)] ring-1 ring-sky-400'
                      : heatmapMode
                      ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-400'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="font-bold text-sky-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" /> 6x E-Cores
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">4MB L2</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-16">
                    {[1, 2, 3, 4, 5, 6].map(c => (
                      <div key={c} className="rounded bg-black/40 border border-sky-500/20 p-1 flex items-center justify-center">
                        <span className="text-[9px] font-mono text-sky-300 font-semibold">E{c}</span>
                      </div>
                    ))}
                  </div>
                </button>

                {/* 5. Unified Memory Architecture Controller (Bottom Left, 6 cols) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBlock('uma');
                  }}
                  className={`col-span-6 rounded-2xl p-3 text-left border transition-all duration-300 ${
                    selectedBlock === 'uma'
                      ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-amber-300">UMA Memory Controller</span>
                    <span className="text-[10px] text-amber-400 font-mono">120 GB/s</span>
                  </div>
                </button>

                {/* 6. Media Engine & Secure Enclave (Bottom Right, 6 cols) */}
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedBlock('media');
                  }}
                  className={`col-span-6 rounded-2xl p-3 text-left border transition-all duration-300 ${
                    selectedBlock === 'media'
                      ? 'border-rose-400 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-400'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-rose-300">Media Engine + SEP Gen 3</span>
                    <span className="text-[10px] text-rose-400 font-mono">AV1 / ProRes</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Micro Power Breakdown Bar */}
            <div className="p-4 rounded-2xl bg-[#0b0e19] border border-white/[0.06] space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Dynamic SoC Power Allocation:</span>
                <span className="text-white font-bold">{watts} Watts Total</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/[0.06] overflow-hidden flex">
                <div className="bg-cyan-400 h-full" style={{ width: `${(parseFloat(cpuWatts) / watts) * 100}%` }} title={`CPU: ${cpuWatts}W`} />
                <div className="bg-emerald-400 h-full" style={{ width: `${(parseFloat(gpuWatts) / watts) * 100}%` }} title={`GPU: ${gpuWatts}W`} />
                <div className="bg-purple-400 h-full" style={{ width: `${(parseFloat(aneWatts) / watts) * 100}%` }} title={`ANE: ${aneWatts}W`} />
                <div className="bg-amber-400 h-full" style={{ width: `${(parseFloat(dramWatts) / watts) * 100}%` }} title={`DRAM: ${dramWatts}W`} />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span className="text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> CPU {cpuWatts}W</span>
                <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> GPU {gpuWatts}W</span>
                <span className="text-purple-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> ANE {aneWatts}W</span>
                <span className="text-amber-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> DRAM {dramWatts}W</span>
              </div>
            </div>
          </div>

          {/* Right: Sub-Block Deep Inspector (5 cols) */}
          <div className="lg:col-span-5 bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{activeInfo.title}</h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5">{activeInfo.subtitle}</p>
                </div>
                <CyberBadge variant="cyan">SILICON TELEMETRY</CyberBadge>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activeInfo.desc}
              </p>

              <div className="space-y-2.5 pt-2">
                {activeInfo.specs.map(s => (
                  <div key={s.k} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{s.k}</span>
                    <span className="text-white font-semibold">{s.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] space-y-3">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Instruction Set:</span>
                <span className="text-white font-semibold">ARMv9.2-A (FEAT_SME2)</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Kernel Governance:</span>
                <span className="text-emerald-400 font-semibold">Darwin Apple Silicon Mach</span>
              </div>
            </div>
          </div>

        </div>
      </HoloCard>

    </div>
  );
};
