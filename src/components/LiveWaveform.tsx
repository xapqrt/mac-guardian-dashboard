import React, { useEffect, useRef } from 'react';

interface Props {
  isStreaming: boolean;
  rate: number;
  rssi: number;
}

export const LiveWaveform: React.FC<Props> = ({ isStreaming, rate, rssi }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Audio waveform line
      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      if (isStreaming) {
        gradient.addColorStop(0, '#0284c7');
        gradient.addColorStop(0.5, '#38bdf8');
        gradient.addColorStop(1, '#00f2fe');
      } else {
        gradient.addColorStop(0, '#64748b');
        gradient.addColorStop(1, '#475569');
      }
      ctx.strokeStyle = gradient;

      ctx.beginPath();
      const midY = h / 2;
      const amplitude = isStreaming ? Math.min(26, Math.max(10, (rate / 224) * 20)) : 2;
      const freq = isStreaming ? 0.04 : 0.01;

      for (let x = 0; x < w; x++) {
        const y = midY + Math.sin(x * freq + phase) * amplitude * Math.sin((x / w) * Math.PI);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glowing aura
      if (isStreaming) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#38bdf8';
        phase += 0.08;
      } else {
        ctx.shadowBlur = 0;
        phase += 0.01;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isStreaming, rate, rssi]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <canvas
        ref={canvasRef}
        width={480}
        height={70}
        style={{ width: '100%', height: '70px', display: 'block', backgroundColor: '#020617' }}
      />
      <div style={{
        position: 'absolute',
        top: '6px',
        left: '10px',
        fontSize: '0.65rem',
        fontFamily: 'monospace',
        color: isStreaming ? '#38bdf8' : '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        pointerEvents: 'none'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '9999px',
          backgroundColor: isStreaming ? '#38bdf8' : '#64748b',
          boxShadow: isStreaming ? '0 0 6px #38bdf8' : 'none'
        }} />
        <span>{isStreaming ? `A2DP AUDIO WAVEFORM // ${rate} KBPS` : 'STREAM IDLE'}</span>
      </div>
    </div>
  );
};
