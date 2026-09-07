import React, { useState } from 'react';
import { HardDrive, ExternalLink, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface SunburstItem {
  name: string;
  path: string;
  sizeGb: number;
  color: string;
}

interface SunburstDiskProps {
  data: SunburstItem[];
  totalDiskUsed?: string;
  onRevealPath: (path: string) => void;
  onRescan?: () => void;
}

export const SunburstDisk: React.FC<SunburstDiskProps> = ({
  data,
  totalDiskUsed = '59 GB',
  onRevealPath,
  onRescan
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalSize = data.reduce((acc, item) => acc + item.sizeGb, 0);

  // SVG dimensions
  const size = 320;
  const center = size / 2;
  const innerRadius = 55;
  const outerRadius = 125;

  let currentAngle = -Math.PI / 2;

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.sizeGb / totalSize) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = center + Math.cos(startAngle) * outerRadius;
    const y1 = center + Math.sin(startAngle) * outerRadius;
    const x2 = center + Math.cos(endAngle) * outerRadius;
    const y2 = center + Math.sin(endAngle) * outerRadius;

    const x3 = center + Math.cos(endAngle) * innerRadius;
    const y3 = center + Math.sin(endAngle) * innerRadius;
    const x4 = center + Math.cos(startAngle) * innerRadius;
    const y4 = center + Math.sin(startAngle) * innerRadius;

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    const percentage = Math.round((item.sizeGb / totalSize) * 100);

    return {
      ...item,
      pathData,
      percentage,
      idx
    };
  });

  const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)] relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 transition-colors duration-500"
        style={{ background: activeItem ? activeItem.color : '#38bdf8' }}
      />

      {/* Sunburst SVG Diagram */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="overflow-visible select-none">
          <g>
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.idx;

              return (
                <path
                  key={slice.idx}
                  d={slice.pathData}
                  fill={slice.color}
                  opacity={hoveredIndex === null ? 0.8 : isHovered ? 1.0 : 0.25}
                  stroke="#090b10"
                  strokeWidth="3"
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 16px ${slice.color})` : 'none',
                    transformOrigin: `${center}px ${center}px`,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  }}
                  onMouseEnter={() => {
                    sound.playClick();
                    setHoveredIndex(slice.idx);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onRevealPath(slice.path)}
                />
              );
            })}
          </g>

          {/* Center Hole Information */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 4}
            fill="#0b0d14"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Center Overlay Text */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {activeItem ? (
            <div className="animate-in fade-in zoom-in-90 duration-150">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {activeItem.percentage}% Drive
              </span>
              <div className="text-lg font-bold text-white tracking-tight">
                {activeItem.sizeGb} <span className="text-xs font-normal text-slate-400">GB</span>
              </div>
              <div className="text-xs font-semibold truncate max-w-[100px]" style={{ color: activeItem.color }}>
                {activeItem.name}
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Home Disk</span>
              <div className="text-lg font-bold text-white tracking-tight">~59 GB</div>
              <span className="text-[10px] text-emerald-400 font-mono">Sunburst</span>
            </div>
          )}
        </div>
      </div>

      {/* Directory Legend & Fast Reveal List */}
      <div className="flex-1 space-y-4 min-w-0 w-full">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-400" /> DaisyDisk-Style Sunburst Visualizer
            </h3>
            <p className="text-xs text-slate-400">
              Interactive radial space map. Hover to isolate wedges or click to reveal in Finder.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRescan && (
              <button
                onClick={() => {
                  sound.playClick();
                  onRescan();
                }}
                className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors flex items-center gap-1.5"
              >
                <span>↻</span>
                <span>Rescan Disk</span>
              </button>
            )}
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">Top Consumers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.idx;

            return (
              <div
                key={slice.idx}
                onMouseEnter={() => setHoveredIndex(slice.idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                  isHovered
                    ? 'bg-white/[0.08] border-white/20 scale-[1.02] shadow-lg'
                    : 'bg-black/30 border-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ background: slice.color }} />
                  <span className="font-semibold text-white truncate max-w-[110px]">{slice.name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="text-slate-300 font-bold">{slice.sizeGb} GB</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevealPath(slice.path);
                    }}
                    title="Reveal directory in Finder"
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
