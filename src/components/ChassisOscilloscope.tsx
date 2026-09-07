import React, { useEffect, useRef } from 'react';

interface Props {
  peak: number;
  threshold: number;
  baseline: number;
  enabled: boolean;
}

export const ChassisOscilloscope: React.FC<Props> = ({ peak, threshold, baseline, enabled }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>(new Array(80).fill(0));
  const latestPeakRef = useRef(peak);
  const thresholdRef = useRef(threshold);
  const baselineRef = useRef(baseline);

  latestPeakRef.current = peak;
  thresholdRef.current = threshold;
  baselineRef.current = baseline;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Slide history
      const hist = historyRef.current;
      hist.shift();
      hist.push(latestPeakRef.current);

      // Grid background
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      const currentThreshold = thresholdRef.current;
      const currentBaseline = baselineRef.current;

      // Draw threshold line
      const thresholdY = Math.max(10, h - (currentThreshold / 0.3) * (h - 20) - 10);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, thresholdY);
      ctx.lineTo(w, thresholdY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw baseline fan noise zone
      const baselineHeight = Math.min(h - 5, (currentBaseline / 0.3) * (h - 20));
      ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
      ctx.fillRect(0, h - baselineHeight - 10, w, baselineHeight + 10);

      // Draw dynamic impulses
      const barWidth = w / hist.length;
      for (let i = 0; i < hist.length; i++) {
        const val = hist[i];
        const barH = Math.min(h - 15, (val / 0.3) * (h - 20));
        const isTrigger = val >= currentThreshold && enabled;

        if (isTrigger) {
          ctx.fillStyle = '#10b981'; // Emerald spike
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 10;
        } else if (val > currentBaseline * 2) {
          ctx.fillStyle = '#38bdf8'; // Sky pulse
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.35)'; // Ambient noise floor
          ctx.shadowBlur = 0;
        }

        ctx.fillRect(i * barWidth + 1, h - barH - 8, barWidth - 2, barH);
      }
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [enabled]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950/80 border border-white/[0.08]">
      <canvas
        ref={canvasRef}
        width={560}
        height={90}
        className="w-full h-[90px] block"
      />
      <div className="absolute top-2 left-3 flex items-center gap-3 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Trigger Threshold: {(threshold * 100).toFixed(0)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-400/50 inline-block" />
          Fan/Ambient Baseline: {(baseline * 1000).toFixed(1)} mU
        </span>
      </div>
      <div className="absolute top-2 right-3 text-[10px] font-mono">
        {peak >= threshold && enabled ? (
          <span className="text-emerald-400 font-bold animate-pulse">TRANSIENT SPIKE DETECTED</span>
        ) : (
          <span className="text-slate-500">FILTERING NOISE FLOOR</span>
        )}
      </div>
    </div>
  );
};
