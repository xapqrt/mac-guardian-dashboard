import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { sound } from '../utils/audio';

// ============================================================================
// 1. KNURLED ROTARY KNOB
// Teenage Engineering / Apple Pro inspired knurled metallic rotary dial
// ============================================================================

export interface KnurledKnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  label: string;
  unit?: string;
  onChange: (value: number) => void;
  detents?: number[];
  disabled?: boolean;
  className?: string;
  formatValue?: (val: number) => string;
  defaultValue?: number;
  bipolar?: boolean;
}

export const KnurledKnob: React.FC<KnurledKnobProps> = ({
  value,
  min,
  max,
  step = 1,
  size = 'md',
  label,
  unit = '',
  onChange,
  detents,
  disabled = false,
  className = '',
  formatValue,
  defaultValue,
  bipolar = false
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startValRef = useRef(value);
  const lastDetentRef = useRef<number | null>(null);

  // Sizing configurations
  const config = {
    sm: { dialSize: 46, svgSize: 64, strokeWidth: 3, radius: 24, fontSize: 'text-[10px]', textVal: 'text-xs' },
    md: { dialSize: 60, svgSize: 82, strokeWidth: 3.5, radius: 31, fontSize: 'text-xs', textVal: 'text-sm' },
    lg: { dialSize: 76, svgSize: 104, strokeWidth: 4, radius: 40, fontSize: 'text-xs', textVal: 'text-base' }
  }[size];

  // Map value to 270-degree arc: -135deg (min) to +135deg (max)
  const range = max - min || 1;
  const clampedValue = Math.min(max, Math.max(min, value));
  const fraction = (clampedValue - min) / range;
  const currentAngle = -135 + fraction * 270;

  // Arc math for SVG track
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const center = config.svgSize / 2;
  const bgArcD = describeArc(center, center, config.radius, -135, 135);

  // Active arc (bipolar starts at 0deg, standard starts at -135deg)
  let activeArcD = '';
  if (bipolar) {
    const zeroAngle = -135 + ((0 - min) / range) * 270;
    const startA = Math.min(zeroAngle, currentAngle);
    const endA = Math.max(zeroAngle, currentAngle);
    activeArcD = describeArc(center, center, config.radius, startA, endA);
  } else {
    activeArcD = describeArc(center, center, config.radius, -135, Math.max(-134.9, currentAngle));
  }

  // Check detent acoustic feedback
  const checkDetentHaptic = useCallback(
    (newVal: number) => {
      const activeDetents = detents && detents.length > 0
        ? detents
        : Array.from({ length: 11 }, (_, i) => min + (i / 10) * (max - min));

      for (const d of activeDetents) {
        if (Math.abs(newVal - d) <= (step || 1) * 0.75) {
          if (lastDetentRef.current !== d) {
            lastDetentRef.current = d;
            sound.playClick();
          }
          return;
        }
      }
      lastDetentRef.current = null;
    },
    [detents, min, max, step]
  );

  const updateValueFromDelta = useCallback(
    (deltaY: number, shiftKey: boolean) => {
      const sensitivity = shiftKey ? 0.2 : 1.0;
      const travelPixels = 180;
      const valueChange = ((-deltaY * sensitivity) / travelPixels) * range;
      let rawVal = startValRef.current + valueChange;

      // Snap to step
      if (step > 0) {
        rawVal = Math.round(rawVal / step) * step;
      }
      const clamped = Math.min(max, Math.max(min, rawVal));
      if (clamped !== value) {
        checkDetentHaptic(clamped);
        onChange(clamped);
      }
    },
    [checkDetentHaptic, max, min, onChange, range, step, value]
  );

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || disabled) return;
    e.preventDefault();
    const deltaY = e.clientY - startYRef.current;
    updateValueFromDelta(deltaY, e.shiftKey);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard stepping
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let delta = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      delta = e.shiftKey ? step * 5 : step;
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      delta = e.shiftKey ? -step * 5 : -step;
    } else if (e.key === 'PageUp') {
      delta = (max - min) * 0.1;
    } else if (e.key === 'PageDown') {
      delta = -(max - min) * 0.1;
    } else if (e.key === 'Home') {
      delta = min - value;
    } else if (e.key === 'End') {
      delta = max - value;
    }

    if (delta !== 0) {
      e.preventDefault();
      let next = value + delta;
      if (step > 0) next = Math.round(next / step) * step;
      const clamped = Math.min(max, Math.max(min, next));
      if (clamped !== value) {
        sound.playClick();
        onChange(clamped);
      }
    }
  };

  // Wheel interaction
  const handleWheel = (e: React.WheelEvent) => {
    if (disabled) return;
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const delta = direction * (e.shiftKey ? step * 2 : step);
    let next = value + delta;
    if (step > 0) next = Math.round(next / step) * step;
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) {
      sound.playClick();
      onChange(clamped);
    }
  };

  // Double-click reset
  const handleDoubleClick = () => {
    if (disabled) return;
    const target = defaultValue !== undefined ? defaultValue : bipolar ? 0 : min;
    sound.playClick();
    onChange(target);
  };

  // Formatted numeric readout
  const displayString = formatValue
    ? formatValue(clampedValue)
    : step < 1
    ? clampedValue.toFixed(step < 0.1 ? 2 : 1)
    : Math.round(clampedValue).toString();

  return (
    <div
      className={`inline-flex flex-col items-center select-none font-mono ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-ns-resize'} ${className}`}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* Label */}
      <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-1.5 text-center truncate max-w-[90px]">
        {label}
      </span>

      {/* Rotary Dial Unit */}
      <div
        ref={knobRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 active:scale-[0.98] transition-transform"
        style={{ width: config.svgSize, height: config.svgSize }}
      >
        {/* SVG Arc Track */}
        <svg
          width={config.svgSize}
          height={config.svgSize}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Background Track */}
          <path
            d={bgArcD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Highlight Arc */}
          <path
            d={activeArcD}
            fill="none"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-75"
          />

          {/* Render detent tick marks around perimeter if requested */}
          {detents &&
            detents.map((detentVal) => {
              const dFrac = (detentVal - min) / range;
              const dAngle = -135 + dFrac * 270;
              const pInner = polarToCartesian(center, center, config.radius - 4, dAngle);
              const pOuter = polarToCartesian(center, center, config.radius + 4, dAngle);
              return (
                <line
                  key={detentVal}
                  x1={pInner.x}
                  y1={pInner.y}
                  x2={pOuter.x}
                  y2={pOuter.y}
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="1.2"
                />
              );
            })}
        </svg>

        {/* Outer Knurled Grip Ring */}
        <div
          className="relative rounded-full flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.6)] border border-white/10"
          style={{
            width: config.dialSize,
            height: config.dialSize,
            background: 'radial-gradient(circle, #1a202c 0%, #0c1017 100%)'
          }}
        >
          {/* Knurled Circumferential Texture (Radial Teeth Overlay) */}
          <div
            className="absolute inset-0 rounded-full opacity-35 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.18) 0deg 3deg, transparent 3deg 10deg)'
            }}
          />

          {/* Machined Metallic Rotating Bezel */}
          <div
            className="relative rounded-full flex items-center justify-center transition-transform duration-75 ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.5)] border border-white/15"
            style={{
              width: config.dialSize - 8,
              height: config.dialSize - 8,
              transform: `rotate(${currentAngle}deg)`,
              background:
                'conic-gradient(from 0deg at 50% 50%, #202735 0deg, #0d121a 90deg, #2b3548 180deg, #0d121a 270deg, #202735 360deg)'
            }}
          >
            {/* Center Recessed Titanium Hub */}
            <div
              className="rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.1)] border border-white/10"
              style={{
                width: config.dialSize - 22,
                height: config.dialSize - 22,
                background: '#0a0d14'
              }}
            />

            {/* Laser-Engraved Indicator Line */}
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.6)]"
              style={{
                width: size === 'sm' ? 2 : 2.5,
                height: size === 'sm' ? 8 : 10,
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabular Numeric Readout */}
      <div className="mt-1.5 flex items-baseline justify-center gap-0.5">
        <span className={`font-mono tabular-nums font-semibold text-white tracking-tight ${config.textVal}`}>
          {displayString}
        </span>
        {unit && <span className="font-mono text-[10px] text-slate-400">{unit}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// 2. PRECISION LINEAR FADER
// Calibrated linear mixing console fader with machined aluminum thumb cap
// ============================================================================

export interface PrecisionFaderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  onChange: (value: number) => void;
  ticks?: Array<{ value: number; label: string }>;
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  length?: number;
  className?: string;
  formatValue?: (val: number) => string;
  defaultValue?: number;
}

export const PrecisionFader: React.FC<PrecisionFaderProps> = ({
  value,
  min,
  max,
  step = 1,
  label,
  unit = '',
  onChange,
  ticks,
  disabled = false,
  orientation = 'vertical',
  length = 160,
  className = '',
  formatValue,
  defaultValue
}) => {
  const isVertical = orientation === 'vertical';
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastStepRef = useRef<number | null>(null);

  const range = max - min || 1;
  const clampedValue = Math.min(max, Math.max(min, value));
  const fraction = (clampedValue - min) / range;

  // Generate standard ticks if not provided
  const resolvedTicks =
    ticks && ticks.length > 0
      ? ticks
      : [
          { value: max, label: `${max}` },
          { value: min + range * 0.75, label: `${Math.round(min + range * 0.75)}` },
          { value: min + range * 0.5, label: `${Math.round(min + range * 0.5)}` },
          { value: min + range * 0.25, label: `${Math.round(min + range * 0.25)}` },
          { value: min, label: `${min}` }
        ];

  // Update value from pointer coordinates
  const updateValueFromCoord = useCallback(
    (clientX: number, clientY: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let frac = 0;

      if (isVertical) {
        // Top = 1 (max), Bottom = 0 (min)
        const relY = clientY - rect.top;
        const clampedY = Math.max(0, Math.min(rect.height, relY));
        frac = 1 - clampedY / rect.height;
      } else {
        // Left = 0 (min), Right = 1 (max)
        const relX = clientX - rect.left;
        const clampedX = Math.max(0, Math.min(rect.width, relX));
        frac = clampedX / rect.width;
      }

      let rawVal = min + frac * range;
      if (step > 0) {
        rawVal = Math.round(rawVal / step) * step;
      }
      const nextVal = Math.min(max, Math.max(min, rawVal));

      if (nextVal !== value) {
        // Acoustic detent tick
        if (lastStepRef.current !== nextVal) {
          lastStepRef.current = nextVal;
          sound.playClick();
        }
        onChange(nextVal);
      }
    },
    [isVertical, max, min, onChange, range, step, value]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    updateValueFromCoord(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || disabled) return;
    e.preventDefault();
    updateValueFromCoord(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let delta = 0;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = step;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -step;
    else if (e.key === 'PageUp') delta = range * 0.1;
    else if (e.key === 'PageDown') delta = -range * 0.1;
    else if (e.key === 'Home') delta = min - value;
    else if (e.key === 'End') delta = max - value;

    if (delta !== 0) {
      e.preventDefault();
      let next = value + delta;
      if (step > 0) next = Math.round(next / step) * step;
      const clamped = Math.min(max, Math.max(min, next));
      if (clamped !== value) {
        sound.playClick();
        onChange(clamped);
      }
    }
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    const target = defaultValue !== undefined ? defaultValue : min;
    sound.playClick();
    onChange(target);
  };

  const displayString = formatValue
    ? formatValue(clampedValue)
    : step < 1
    ? clampedValue.toFixed(step < 0.1 ? 2 : 1)
    : Math.round(clampedValue).toString();

  return (
    <div
      className={`inline-flex font-mono select-none ${isVertical ? 'flex-col items-center' : 'flex-row items-center gap-4'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header Readout */}
      <div className={`flex justify-between items-baseline w-full mb-2 ${isVertical ? 'px-1' : 'flex-col mb-0 max-w-[100px]'}`}>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono tabular-nums text-xs font-semibold text-white">
            {displayString}
          </span>
          {unit && <span className="font-mono text-[9px] text-slate-400">{unit}</span>}
        </div>
      </div>

      {/* Main Fader & Scale Assembly */}
      <div className={`relative flex ${isVertical ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2'}`}>
        {/* Recessed Fader Track */}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative rounded-full bg-[#05070a] border border-white/10 shadow-[inset_0_2px_5px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.06)] cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40`}
          style={{
            width: isVertical ? 14 : length,
            height: isVertical ? length : 14
          }}
        >
          {/* Central Mechanical Guide Slit */}
          <div
            className={`absolute bg-white/[0.08] ${isVertical ? 'top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2px]' : 'left-2 right-2 top-1/2 -translate-y-1/2 h-[2px]'}`}
          />

          {/* Active Level Fill Bar */}
          <div
            className={`absolute rounded-full bg-gradient-to-t from-white/10 to-white/25 transition-all duration-75 ${
              isVertical
                ? 'bottom-1 left-1/2 -translate-x-1/2 w-[4px]'
                : 'left-1 top-1/2 -translate-y-1/2 h-[4px]'
            }`}
            style={{
              height: isVertical ? `${fraction * (length - 8)}px` : undefined,
              width: !isVertical ? `${fraction * (length - 8)}px` : undefined
            }}
          />

          {/* Machined Aluminum Thumb Cap */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md transition-transform duration-75 ease-out shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_0_0_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.8)] border border-white/25 cursor-grab active:cursor-grabbing hover:border-white/40"
            style={{
              width: isVertical ? 34 : 20,
              height: isVertical ? 20 : 34,
              left: isVertical ? '50%' : `${fraction * 100}%`,
              top: isVertical ? `${(1 - fraction) * 100}%` : '50%',
              background: 'linear-gradient(180deg, #2d3442 0%, #171d27 50%, #0d1117 100%)'
            }}
          >
            {/* Centerline High-Contrast Laser Groove */}
            <div
              className={`absolute bg-white/95 shadow-[0_0_4px_rgba(255,255,255,0.6)] ${
                isVertical
                  ? 'top-1/2 left-1.5 right-1.5 -translate-y-1/2 h-[2px] rounded-full'
                  : 'left-1/2 top-1.5 bottom-1.5 -translate-x-1/2 w-[2px] rounded-full'
              }`}
            />

            {/* Knurled Grip Micro-Ridges on Thumb Sides */}
            <div
              className={`absolute flex justify-between pointer-events-none ${
                isVertical ? 'top-1 bottom-1 left-1 right-1' : 'left-1 right-1 top-1 bottom-1 flex-col'
              }`}
            >
              <div className={`bg-white/10 ${isVertical ? 'w-[1.5px] h-full' : 'h-[1.5px] w-full'}`} />
              <div className={`bg-white/10 ${isVertical ? 'w-[1.5px] h-full' : 'h-[1.5px] w-full'}`} />
            </div>
          </div>
        </div>

        {/* Calibrated Rule Scale / Tick Marks */}
        <div
          className={`flex justify-between font-mono text-[9px] text-slate-500 tabular-nums select-none ${
            isVertical ? 'flex-col h-full py-1' : 'flex-row w-full px-1'
          }`}
          style={{
            height: isVertical ? length : undefined,
            width: !isVertical ? length : undefined
          }}
        >
          {resolvedTicks.map((t, idx) => {
            const tFrac = (t.value - min) / range;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 ${isVertical ? 'flex-row' : 'flex-col'}`}
              >
                <div
                  className={`bg-white/25 ${isVertical ? 'h-[1px] w-2' : 'w-[1px] h-2'} ${
                    idx === 0 || idx === resolvedTicks.length - 1 ? 'bg-white/50 w-3' : ''
                  }`}
                />
                <span className="leading-none text-[8px] font-mono text-slate-400">{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. MACHINED PHYSICAL BISTABLE SWITCH
// Teenage Engineering OB-4 / Apple Pro metallic toggle switch with micro-LED
// ============================================================================

export interface MachinedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  indicatorColor?: 'emerald' | 'amber' | 'titanium';
  disabled?: boolean;
  className?: string;
}

export const MachinedSwitch: React.FC<MachinedSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  indicatorColor = 'emerald',
  disabled = false,
  className = ''
}) => {
  const isSm = size === 'sm';

  const handleClick = () => {
    if (disabled) return;
    sound.playHapticRelay();
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  // Micro-LED styles
  const ledStyles = {
    emerald: checked
      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9),0_0_2px_#ffffff]'
      : 'bg-emerald-950/40 border border-emerald-900/40',
    amber: checked
      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9),0_0_2px_#ffffff]'
      : 'bg-amber-950/40 border border-amber-900/40',
    titanium: checked
      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.95),0_0_2px_#ffffff]'
      : 'bg-slate-900 border border-white/10'
  }[indicatorColor];

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-3 select-none ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group'} ${className}`}
    >
      {/* Switch Outer Assembly */}
      <div
        role="switch"
        tabIndex={disabled ? -1 : 0}
        aria-checked={checked}
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 border border-white/12 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.08)] bg-[#07090e] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${
          isSm ? 'w-11 h-6 p-0.5' : 'w-14 h-7 p-0.5'
        }`}
      >
        {/* Recessed Interior Slot Guide */}
        <div className="absolute inset-1 rounded-full bg-black/50 pointer-events-none" />

        {/* Machined Metal Sliding Actuator */}
        <div
          className={`relative rounded-full transition-transform duration-200 ease-out flex items-center justify-center border border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),inset_0_-1px_0_0_rgba(0,0,0,0.7),0_3px_6px_rgba(0,0,0,0.6)] ${
            isSm ? 'w-5 h-5' : 'w-6 h-6'
          } ${
            checked
              ? isSm
                ? 'translate-x-5'
                : 'translate-x-7'
              : 'translate-x-0'
          }`}
          style={{
            background: 'linear-gradient(180deg, #2f3644 0%, #1a202c 50%, #10141c 100%)'
          }}
        >
          {/* Tactile Micro-Grooves on Actuator */}
          <div className="flex flex-col gap-0.5 pointer-events-none">
            <span className="w-2.5 h-[1px] bg-white/40 rounded-full" />
            <span className="w-2.5 h-[1px] bg-white/20 rounded-full" />
          </div>
        </div>

        {/* Integrated Micro-Jewel LED */}
        <div
          className={`absolute rounded-full transition-all duration-200 pointer-events-none ${
            isSm ? 'w-1.5 h-1.5' : 'w-2 h-2'
          } ${checked ? (isSm ? 'left-2' : 'left-2.5') : isSm ? 'right-2' : 'right-2.5'} ${ledStyles}`}
        />
      </div>

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-xs font-mono font-medium text-slate-200 group-hover:text-white transition-colors">
              {label}
            </span>
          )}
          {description && (
            <span className="text-[10px] font-mono text-slate-500 leading-tight">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 4. LASER-ETCHED TITANIUM BADGE
// Recessed dark titanium plate with crisp monospaced laser engraving
// ============================================================================

export interface LaserBadgeProps {
  children: React.ReactNode;
  variant?: 'monochrome' | 'titanium' | 'live' | 'alert' | 'danger';
  size?: 'xs' | 'sm';
  icon?: React.ReactNode;
  className?: string;
}

export const LaserBadge: React.FC<LaserBadgeProps> = ({
  children,
  variant = 'monochrome',
  size = 'xs',
  icon,
  className = ''
}) => {
  const variantStyles = {
    monochrome:
      'bg-white/[0.04] text-slate-300 border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
    titanium:
      'bg-gradient-to-b from-white/[0.08] to-white/[0.02] text-white border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]',
    live:
      'bg-emerald-500/[0.06] text-emerald-400 border-emerald-500/20 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.1)]',
    alert:
      'bg-amber-500/[0.06] text-amber-400 border-amber-500/20 shadow-[inset_0_1px_0_0_rgba(245,158,11,0.1)]',
    danger:
      'bg-rose-500/[0.06] text-rose-400 border-rose-500/20 shadow-[inset_0_1px_0_0_rgba(239,68,68,0.1)]'
  }[variant];

  const sizeStyles =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2';

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider rounded border ${variantStyles} ${sizeStyles} ${className}`}
    >
      {/* Functional Status Dot */}
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] shrink-0" />
      )}
      {variant === 'alert' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24] shrink-0" />
      )}
      {variant === 'danger' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_4px_#f87171] shrink-0" />
      )}

      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};

// ============================================================================
// 5. TITANIUM OLED CHASSIS CARD
// Luxury hardware card with brushed titanium border and micro-specular chamfer
// ============================================================================

export interface TitaniumCardProps {
  children: React.ReactNode;
  className?: string;
  knurledHeader?: boolean;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  hoverGlow?: boolean;
}

export const TitaniumCard: React.FC<TitaniumCardProps> = ({
  children,
  className = '',
  knurledHeader = false,
  title,
  subtitle,
  badge,
  action,
  onClick,
  hoverGlow = true
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl bg-[#0a0d14] border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_0_0_rgba(0,0,0,0.5),0_12px_36px_-8px_rgba(0,0,0,0.8)] transition-all duration-200 ${
        hoverGlow ? 'hover:border-white/20' : ''
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {/* Top Specular Sheen Rim */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Optional Knurled Header Strip */}
      {knurledHeader && (
        <div
          className="h-1.5 w-full border-b border-white/[0.06] opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)',
            backgroundSize: '4px 4px'
          }}
        />
      )}

      {/* Card Header if title or controls provided */}
      {(title || badge || action) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div>
            {title && (
              <h3 className="text-sm font-mono font-semibold text-white tracking-tight uppercase">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] font-mono text-slate-400 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className={title || badge || action ? 'px-6 pb-6' : 'p-6'}>{children}</div>
    </div>
  );
};
