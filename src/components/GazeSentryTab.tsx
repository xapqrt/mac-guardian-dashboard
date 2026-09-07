import React, { useState, useEffect } from 'react';
import {
  Eye,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Sparkles,
  Activity,
  Check,
  Radio,
  Clock,
  ThermometerSnowflake,
  Cpu,
  BatteryCharging,
  Gauge,
  Volume2
} from 'lucide-react';
import { HoloCard, CyberBadge } from './UIElements';
import { sound } from '../utils/audio';

export interface GazeTelemetry {
  rightTurnDelta: number;
  targetRightAngle?: number;
  targetLeftAngle?: number;
  rawYaw: number;
  browRaiseDeltaPercent?: number;
  browThreshold?: number;
  isBrowRaised?: boolean;
  time: number;
}

export interface GazeConfig {
  enableGazeTracking?: boolean;
  gazeYawAngle?: number;
  gazeRightAngle?: number;
  gazeLeftAngle?: number;
  gazeDwellMs?: number;
  gazeCooldownMs?: number;
  gazeBatteryEcoMode?: boolean;
  gazeBrowThreshold?: number;
  gazeTriggerMode?: 'eyebrow_yaw' | 'yaw_only' | 'eyebrow_only' | 'eyebrow_or_yaw';
  gazeDirection?: string;
  gazeAction?: string;
  gazeRightAction?: string;
  gazeLeftAction?: string;
  gazeBrowAction?: string;
}

const LOCAL_STORAGE_KEY = 'guardian_gaze_config_v4';

export const GazeSentryTab: React.FC = () => {
  const [config, setConfig] = useState<GazeConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      enableGazeTracking: true,
      gazeYawAngle: 15,
      gazeRightAngle: 25,
      gazeLeftAngle: 25,
      gazeDwellMs: 0,
      gazeCooldownMs: 100,
      gazeBatteryEcoMode: true,
      gazeBrowThreshold: 14,
      gazeTriggerMode: 'eyebrow_only',
      gazeDirection: 'both',
      gazeAction: 'switch_right',
      gazeRightAction: 'switch_right',
      gazeLeftAction: 'switch_left',
      gazeBrowAction: 'switch_right'
    };
  });

  const [gazeTelemetry, setGazeTelemetry] = useState<GazeTelemetry>({
    rightTurnDelta: 0,
    targetRightAngle: 25,
    targetLeftAngle: 25,
    rawYaw: 0,
    browRaiseDeltaPercent: 0,
    browThreshold: 14,
    isBrowRaised: false,
    time: Date.now()
  });

  const [calibrating, setCalibrating] = useState(false);
  const [triggerFlash, setTriggerFlash] = useState<{ direction: string; action: string; time: number } | null>(null);

  useEffect(() => {
    // Initial fetch of current settings from server
    fetch('/api/earbuds/status')
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          // Merge server config with existing local storage (local storage has user priority)
          setConfig(prev => {
            const merged = {
              enableGazeTracking: prev.enableGazeTracking ?? (data.config.enableGazeTracking !== false),
              gazeYawAngle: prev.gazeYawAngle ?? data.config.gazeYawAngle ?? 15,
              gazeRightAngle: prev.gazeRightAngle ?? data.config.gazeRightAngle ?? 25,
              gazeLeftAngle: prev.gazeLeftAngle ?? data.config.gazeLeftAngle ?? 25,
              gazeDwellMs: prev.gazeDwellMs ?? data.config.gazeDwellMs ?? 0,
              gazeCooldownMs: prev.gazeCooldownMs ?? data.config.gazeCooldownMs ?? 100,
              gazeBatteryEcoMode: prev.gazeBatteryEcoMode ?? (data.config.gazeBatteryEcoMode !== false),
              gazeBrowThreshold: prev.gazeBrowThreshold ?? data.config.gazeBrowThreshold ?? 14,
              gazeTriggerMode: prev.gazeTriggerMode ?? data.config.gazeTriggerMode ?? 'eyebrow_only',
              gazeDirection: prev.gazeDirection ?? data.config.gazeDirection ?? 'both',
              gazeAction: prev.gazeAction ?? data.config.gazeAction ?? 'switch_right',
              gazeRightAction: prev.gazeRightAction ?? data.config.gazeRightAction ?? 'switch_right',
              gazeLeftAction: prev.gazeLeftAction ?? data.config.gazeLeftAction ?? 'switch_left',
              gazeBrowAction: prev.gazeBrowAction ?? data.config.gazeBrowAction ?? 'switch_right'
            };
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      })
      .catch(() => {});

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host || 'localhost:3334';
      ws = new WebSocket(`${protocol}//${host}`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init' && data.config) {
            setConfig(prev => {
              const updated = {
                ...prev,
                enableGazeTracking: prev.enableGazeTracking ?? (data.config.enableGazeTracking !== false),
                gazeYawAngle: prev.gazeYawAngle ?? data.config.gazeYawAngle ?? 15,
                gazeRightAngle: prev.gazeRightAngle ?? data.config.gazeRightAngle ?? 25,
                gazeLeftAngle: prev.gazeLeftAngle ?? data.config.gazeLeftAngle ?? 25,
                gazeDwellMs: prev.gazeDwellMs ?? data.config.gazeDwellMs ?? 0,
                gazeCooldownMs: prev.gazeCooldownMs ?? data.config.gazeCooldownMs ?? 100,
                gazeBatteryEcoMode: prev.gazeBatteryEcoMode ?? (data.config.gazeBatteryEcoMode !== false),
                gazeBrowThreshold: prev.gazeBrowThreshold ?? data.config.gazeBrowThreshold ?? 14,
                gazeTriggerMode: prev.gazeTriggerMode ?? data.config.gazeTriggerMode ?? 'eyebrow_only',
                gazeDirection: prev.gazeDirection ?? data.config.gazeDirection ?? 'both',
                gazeAction: prev.gazeAction ?? data.config.gazeAction ?? 'switch_right',
                gazeRightAction: prev.gazeRightAction ?? data.config.gazeRightAction ?? 'switch_right',
                gazeLeftAction: prev.gazeLeftAction ?? data.config.gazeLeftAction ?? 'switch_left',
                gazeBrowAction: prev.gazeBrowAction ?? data.config.gazeBrowAction ?? 'switch_right'
              };
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          } else if (data.type === 'config_update' && data.config) {
            setConfig(prev => {
              const updated = {
                ...prev,
                enableGazeTracking: data.config.enableGazeTracking !== false,
                gazeYawAngle: data.config.gazeYawAngle ?? prev.gazeYawAngle ?? 15,
                gazeRightAngle: data.config.gazeRightAngle ?? prev.gazeRightAngle ?? 25,
                gazeLeftAngle: data.config.gazeLeftAngle ?? prev.gazeLeftAngle ?? 25,
                gazeDwellMs: data.config.gazeDwellMs ?? prev.gazeDwellMs ?? 0,
                gazeCooldownMs: data.config.gazeCooldownMs ?? prev.gazeCooldownMs ?? 100,
                gazeBatteryEcoMode: data.config.gazeBatteryEcoMode !== undefined ? data.config.gazeBatteryEcoMode : prev.gazeBatteryEcoMode,
                gazeBrowThreshold: data.config.gazeBrowThreshold ?? prev.gazeBrowThreshold ?? 14,
                gazeTriggerMode: data.config.gazeTriggerMode ?? prev.gazeTriggerMode ?? 'eyebrow_only',
                gazeDirection: data.config.gazeDirection ?? prev.gazeDirection ?? 'both',
                gazeAction: data.config.gazeAction ?? prev.gazeAction ?? 'switch_right',
                gazeRightAction: data.config.gazeRightAction ?? prev.gazeRightAction ?? 'switch_right',
                gazeLeftAction: data.config.gazeLeftAction ?? prev.gazeLeftAction ?? 'switch_left',
                gazeBrowAction: data.config.gazeBrowAction ?? prev.gazeBrowAction ?? 'switch_right'
              };
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          } else if (data.type === 'gaze_telemetry' && data.telemetry) {
            setGazeTelemetry(data.telemetry);
          } else if (data.type === 'gaze_trigger') {
            sound.playPanic();
            setTriggerFlash({ direction: data.direction || 'brow', action: data.action || 'switch_right', time: Date.now() });
            setTimeout(() => {
              setTriggerFlash(prev => (prev && Date.now() - prev.time >= 1200 ? null : prev));
            }, 1300);
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWs, 2000);
      };
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const updateConfig = async (partial: Partial<GazeConfig>) => {
    const updated = { ...config, ...partial };
    setConfig(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    try {
      await fetch('/api/earbuds/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial)
      });
    } catch (e) {
      console.error('Failed to sync gaze config:', e);
    }
  };

  const handleToggleActive = () => {
    sound.playClick();
    const nextState = !config.enableGazeTracking;
    updateConfig({ enableGazeTracking: nextState });
  };

  const handleCalibrate = async () => {
    sound.playClick();
    setCalibrating(true);
    try {
      await fetch('/api/earbuds/calibrate-gaze', { method: 'POST' });
    } catch (e) {}
    setTimeout(() => setCalibrating(false), 800);
  };

  const leftThreshold = config.gazeLeftAngle || 25;
  const rightThreshold = config.gazeRightAngle || 25;
  const browThreshold = config.gazeBrowThreshold || 14;
  const currentBrowRaise = gazeTelemetry.browRaiseDeltaPercent ?? 0;
  const isBrowRaised = gazeTelemetry.isBrowRaised ?? (currentBrowRaise >= browThreshold);
  const triggerMode = config.gazeTriggerMode || 'eyebrow_only';

  const isYawRightExceeded = gazeTelemetry.rightTurnDelta >= rightThreshold;
  const isYawLeftExceeded = gazeTelemetry.rightTurnDelta <= -leftThreshold;

  let isTriggerFired = false;
  let triggerDirection = '';
  if (triggerMode === 'eyebrow_yaw') {
    if (isYawRightExceeded && isBrowRaised) {
      isTriggerFired = true;
      triggerDirection = 'right';
    } else if (isYawLeftExceeded && isBrowRaised) {
      isTriggerFired = true;
      triggerDirection = 'left';
    }
  } else if (triggerMode === 'eyebrow_only') {
    if (isBrowRaised) {
      isTriggerFired = true;
      triggerDirection = 'brow';
    }
  } else if (triggerMode === 'eyebrow_or_yaw') {
    if (isBrowRaised) {
      isTriggerFired = true;
      triggerDirection = 'brow';
    } else if (isYawRightExceeded) {
      isTriggerFired = true;
      triggerDirection = 'right';
    } else if (isYawLeftExceeded) {
      isTriggerFired = true;
      triggerDirection = 'left';
    }
  } else {
    // yaw_only
    if (isYawRightExceeded) {
      isTriggerFired = true;
      triggerDirection = 'right';
    } else if (isYawLeftExceeded) {
      isTriggerFired = true;
      triggerDirection = 'left';
    }
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto text-white">
      {/* 1. Header Banner */}
      <HoloCard className="p-8 border-white/10 bg-black shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight">Social Acknowledgment Eyebrow & Head Sentry</h2>
                <CyberBadge variant="blue" size="xs">Apple Silicon Vision</CyberBadge>
              </div>
              <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
                Hands-free emergency switch engineered for desk writing. Combine a subtle <strong>right glance towards the door with a natural eyebrow raise</strong> to switch desktops instantly with zero false triggers.
              </p>
            </div>
          </div>

          {/* Master Arming Button and Recalibrate */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-blue-400 ${calibrating ? 'animate-spin' : ''}`} />
              {calibrating ? 'Calibrating...' : 'Recalibrate Baseline'}
            </button>

            {/* Big Pill ARM / DISARM Button */}
            <button
              onClick={handleToggleActive}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                config.enableGazeTracking
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-blue-600/30'
                  : 'bg-black text-white/50 border-white/20 hover:border-white/40'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${config.enableGazeTracking ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
              {config.enableGazeTracking ? 'ARMED & ACTIVE' : 'DISABLED (CLICK TO ARM)'}
            </button>
          </div>
        </div>

        {/* Live Visual Telemetry Grid: Yaw Track + Eyebrow Elevation Track */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Yaw Angle Gauge */}
          <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                Live Head Yaw Glance
              </span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px]">
                  L: -{leftThreshold}°
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30 text-xs">
                  {gazeTelemetry.rightTurnDelta > 0.5
                    ? `+${gazeTelemetry.rightTurnDelta.toFixed(1)}° Right`
                    : gazeTelemetry.rightTurnDelta < -0.5
                    ? `${gazeTelemetry.rightTurnDelta.toFixed(1)}° Left`
                    : `0.0° Center`}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px]">
                  R: +{rightThreshold}°
                </span>
              </div>
            </div>

            {/* Dynamic Meter Track */}
            <div className="space-y-1.5">
              <div className="relative h-8 bg-black rounded-full overflow-hidden border border-white/20 flex items-center shadow-inner">
                {/* Center Zero Reference Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-20 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

                {/* Independent Left Trigger Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-400 z-20 shadow-[0_0_10px_rgba(96,165,250,1)]"
                  style={{ left: `${Math.max(0, 50 - (leftThreshold / 90) * 50)}%` }}
                />

                {/* Independent Right Trigger Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-400 z-20 shadow-[0_0_10px_rgba(96,165,250,1)]"
                  style={{ left: `${Math.min(100, 50 + (rightThreshold / 90) * 50)}%` }}
                />

                {/* Live Left-Turn Fill */}
                {gazeTelemetry.rightTurnDelta < 0 && (
                  <div
                    className={`h-full transition-all duration-75 absolute right-1/2 rounded-l-full ${
                      isYawLeftExceeded
                        ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]'
                        : 'bg-blue-700/60'
                    }`}
                    style={{
                      width: `${Math.min(50, (Math.abs(gazeTelemetry.rightTurnDelta) / 90) * 50)}%`
                    }}
                  />
                )}

                {/* Live Right-Turn Fill */}
                {gazeTelemetry.rightTurnDelta > 0 && (
                  <div
                    className={`h-full transition-all duration-75 absolute left-1/2 rounded-r-full ${
                      isYawRightExceeded
                        ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]'
                        : 'bg-blue-700/60'
                    }`}
                    style={{
                      width: `${Math.min(50, (gazeTelemetry.rightTurnDelta / 90) * 50)}%`
                    }}
                  />
                )}
              </div>

              <div className="flex justify-between text-[10px] font-mono text-white/50 px-1">
                <span>-90° (Left)</span>
                <span>Gate: -{leftThreshold}°</span>
                <span>0° Rest</span>
                <span>Gate: +{rightThreshold}°</span>
                <span>+90° (Right)</span>
              </div>
            </div>
          </div>

          {/* Eyebrow Raise Elevation Meter */}
          <div className="p-5 rounded-2xl bg-[#0b0c10] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white/80 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Eyebrow Elevation Ratio (Landmark Distance)
              </span>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px]">
                  Threshold: +{browThreshold}%
                </span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold shadow-sm text-xs ${
                  isBrowRaised
                    ? 'bg-blue-500 text-white shadow-blue-500/40 animate-pulse'
                    : currentBrowRaise < -5
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-white/80'
                }`}>
                  {currentBrowRaise > 0 ? `+${currentBrowRaise.toFixed(1)}%` : `${currentBrowRaise.toFixed(1)}%`}
                  {isBrowRaised ? ' (RAISED)' : currentBrowRaise < -5 ? ' (FROWNING / REST)' : ' (REST)'}
                </span>
              </div>
            </div>

            {/* Dynamic Eyebrow Meter Track */}
            <div className="space-y-1.5">
              <div className="relative h-8 bg-black rounded-full overflow-hidden border border-white/20 flex items-center shadow-inner">
                {/* 0% Baseline */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/40 z-20" />

                {/* Threshold Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-blue-400 z-20 shadow-[0_0_10px_rgba(96,165,250,1)]"
                  style={{ left: `${Math.min(100, Math.max(0, (browThreshold / 50) * 100))}%` }}
                />

                {/* Elevation Fill */}
                <div
                  className={`h-full transition-all duration-75 rounded-r-full ${
                    isBrowRaised
                      ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]'
                      : currentBrowRaise < -5
                      ? 'bg-amber-600/40'
                      : 'bg-blue-700/60'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentBrowRaise / 50) * 100))}%`
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-white/50 px-1">
                <span>0% Resting</span>
                <span>Subtle (12%)</span>
                <span className="text-blue-400 font-bold">Target Gate: +{browThreshold}%</span>
                <span>Exaggerated (30%)</span>
                <span>+50% Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Trigger Status HUD */}
        <div className="text-center py-2.5 px-4 rounded-xl bg-white/5 border border-white/10">
          {triggerFlash ? (
            <span className="text-xs font-bold text-white bg-blue-600 px-5 py-2.5 rounded-full shadow-lg shadow-blue-600/50 animate-pulse inline-flex items-center gap-2">
              <Zap className="w-4 h-4 text-white" />
              ⚡ TRIGGER EXECUTED: SWITCHED DESKTOP ({triggerFlash.direction === 'brow' ? 'Eyebrows' : triggerFlash.direction === 'left' ? 'Left Glance' : 'Right Glance'} → {triggerFlash.action})
            </span>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isYawRightExceeded || isYawLeftExceeded ? 'bg-blue-400' : 'bg-white/30'}`} />
                Glance: {isYawRightExceeded ? 'Right Exceeded' : isYawLeftExceeded ? 'Left Exceeded' : 'Centered'}
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isBrowRaised ? 'bg-blue-400 animate-pulse' : currentBrowRaise < -5 ? 'bg-amber-400' : 'bg-white/30'}`} />
                Eyebrows: {isBrowRaised ? 'Raised (Above Threshold)' : currentBrowRaise < -5 ? 'Frowning' : 'Resting'}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-white/90 font-medium">
                {triggerMode === 'eyebrow_yaw'
                  ? `Turn head ≥ ${rightThreshold}° and raise eyebrows ≥ ${browThreshold}% to trigger`
                  : triggerMode === 'eyebrow_only'
                  ? `Raise eyebrows ≥ ${browThreshold}% to trigger (Instant 1ms switch, zero hold required)`
                  : triggerMode === 'eyebrow_or_yaw'
                  ? `Either raise eyebrows ≥ ${browThreshold}% OR turn head to trigger`
                  : `Turn head past threshold to trigger`}
              </span>
            </div>
          )}
        </div>
      </HoloCard>

      {/* 2. TRIGGER LOGIC SELECTOR & EYEBROW SENSITIVITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trigger Mode Architecture Card */}
        <HoloCard className="p-7 border-white/10 bg-black space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                Detection Trigger Mode
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                Choose the gesture mechanism required to execute desktop evasion.
              </p>
            </div>
            <CyberBadge variant="blue" size="xs">
              {triggerMode === 'eyebrow_only' ? 'Instant 1ms' : triggerMode === 'eyebrow_yaw' ? 'Recommended' : 'Active'}
            </CyberBadge>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'eyebrow_only',
                title: 'Eyebrow Raise Only',
                subtitle: 'Raise eyebrows while looking straight at display. Instant 1ms trigger, auto-rearms on lower.',
                badge: '⚡ 1ms Reaction • Zero Hold Required'
              },
              {
                id: 'eyebrow_or_yaw',
                title: 'Universal (Eyebrows OR Head Glance)',
                subtitle: 'Either raise eyebrows or turn head to switch desktop instantly.',
                badge: 'Dual Hands-Free Flexibility'
              },
              {
                id: 'eyebrow_yaw',
                title: 'Social Acknowledgment (Eyebrows + Turn)',
                subtitle: 'Look right towards person + raise eyebrows instinctively.',
                badge: 'Zero False Triggers • Best for Desk Writing'
              },
              {
                id: 'yaw_only',
                title: 'Head Turn Only',
                subtitle: 'Glance left or right past threshold angle alone.',
                badge: 'Traditional Yaw'
              }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => updateConfig({ gazeTriggerMode: item.id as any })}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                  triggerMode === item.id
                    ? 'bg-blue-600/15 text-white border-blue-500 shadow-md shadow-blue-600/10'
                    : 'bg-black text-white/70 border-white/10 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    {item.title}
                    {item.id === 'eyebrow_only' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500 text-white font-semibold">
                        INSTANT 1MS
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/60">{item.subtitle}</div>
                  <div className="text-[10px] font-mono text-blue-400">{item.badge}</div>
                </div>
                {triggerMode === item.id && (
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </HoloCard>

        {/* Eyebrow Sensitivity & Baseline Calibration Card */}
        <HoloCard className="p-7 border-white/10 bg-black space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Eyebrow Elevation Sensitivity (+{browThreshold}%)
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                Percentage increase above resting baseline required to trigger.
              </p>
            </div>
            <div className="font-mono text-base font-bold text-blue-400 bg-blue-600/15 px-3 py-1 rounded-xl border border-blue-500/30">
              +{browThreshold}%
            </div>
          </div>

          {/* Slider for Eyebrow Threshold */}
          <div className="space-y-3">
            <input
              type="range"
              min="10"
              max="40"
              step="1"
              value={browThreshold}
              onChange={(e) => updateConfig({ gazeBrowThreshold: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/50">
              <span className="text-blue-400 font-bold">10% (Micro-Lift)</span>
              <span>15% (Subtle)</span>
              <span className="text-white font-bold">18% (Natural)</span>
              <span>25% (Deliberate)</span>
              <span className="text-white font-bold">40% (Exaggerated)</span>
            </div>
          </div>

          {/* Eyebrow Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">Eyebrow Elevation Presets</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { pct: 10, label: '10% Sensitive', desc: 'Micro-lift' },
                { pct: 14, label: '14% Natural', desc: 'Recommended' },
                { pct: 20, label: '20% Obvious', desc: 'Clear raise' }
              ].map(preset => (
                <button
                  key={preset.pct}
                  onClick={() => updateConfig({ gazeBrowThreshold: preset.pct })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    browThreshold === preset.pct
                      ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-600/30'
                      : 'bg-black text-white/80 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[10px] text-white/60">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Eyebrow Action Selector */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="text-xs font-semibold text-white/80">Action on Eyebrow Raise</label>
            <div className="space-y-1.5">
              {[
                { id: 'smart', label: 'Smart Bounce (Switch Right, bounce Left at edge)' },
                { id: 'switch_right', label: 'Move 1 Desktop Right (Default)' },
                { id: 'switch_left', label: 'Move 1 Desktop Left' },
                { id: 'panic', label: 'Trigger Panic' },
                { id: 'mute_toggle', label: 'Toggle Mute' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => updateConfig({ gazeBrowAction: item.id })}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    (config.gazeBrowAction || 'switch_right') === item.id
                      ? 'bg-blue-600 text-white border-blue-400 font-semibold shadow-sm'
                      : 'bg-black text-white/70 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span>{item.label}</span>
                  {(config.gazeBrowAction || 'switch_right') === item.id && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/30 text-xs text-white/80 leading-relaxed">
            ⚡ <strong>Instant 1ms Reaction:</strong> Zero hold required. The instant eyebrows cross the threshold, the desktop switches immediately, and it re-arms instantly the moment eyebrows return below threshold so you can rapidly pump gestures without delay.
          </div>
        </HoloCard>
      </div>

      {/* 2. SEPARATE ADJUSTMENTS: LEFT TURN vs RIGHT TURN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Turn Degree Customization Card */}
        <HoloCard className="p-7 border-white/10 bg-black space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                Left Turn Sensitivity (5° to 90°)
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                Angle required when glancing left to switch desktops.
              </p>
            </div>
            <div className="font-mono text-base font-bold text-blue-400 bg-blue-600/15 px-3 py-1 rounded-xl border border-blue-500/30">
              -{leftThreshold}°
            </div>
          </div>

          {/* Slider for Left Turn */}
          <div className="space-y-3">
            <input
              type="range"
              min="5"
              max="90"
              step="1"
              value={leftThreshold}
              onChange={(e) => updateConfig({ gazeLeftAngle: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/50">
              <span className="text-blue-400 font-bold">5° (Micro Glance)</span>
              <span>15° (Natural)</span>
              <span>30° (Firm)</span>
              <span>45° (Side)</span>
              <span className="text-white font-bold">90° (Full)</span>
            </div>
          </div>

          {/* Left Angle Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">Left Glance Presets</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { deg: 8, label: '8° Feather', desc: 'Minimal glance' },
                { deg: 15, label: '15° Natural', desc: 'Recommended' },
                { deg: 30, label: '30° Deliberate', desc: 'Clear turn' },
                { deg: 45, label: '45° Look', desc: 'Half-turn' },
                { deg: 60, label: '60° Wide', desc: 'Wide look' },
                { deg: 90, label: '90° Full', desc: 'Right angle' }
              ].map(preset => (
                <button
                  key={preset.deg}
                  onClick={() => updateConfig({ gazeLeftAngle: preset.deg })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    leftThreshold === preset.deg
                      ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-600/30'
                      : 'bg-black text-white/80 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[10px] text-white/60">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Left Action Selector */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="text-xs font-semibold text-white/80">Action on Left Look</label>
            <div className="space-y-1.5">
              {[
                { id: 'switch_left', label: 'Move 1 Desktop Left (Default)' },
                { id: 'switch_right', label: 'Move 1 Desktop Right' },
                { id: 'panic', label: 'Trigger Panic' },
                { id: 'mute_toggle', label: 'Toggle Mute' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => updateConfig({ gazeLeftAction: item.id })}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    (config.gazeLeftAction || 'switch_left') === item.id
                      ? 'bg-blue-600 text-white border-blue-400 font-semibold shadow-sm'
                      : 'bg-black text-white/70 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span>{item.label}</span>
                  {(config.gazeLeftAction || 'switch_left') === item.id && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </HoloCard>

        {/* Right Turn Degree Customization Card */}
        <HoloCard className="p-7 border-white/10 bg-black space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                Right Turn Sensitivity (5° to 90°)
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                Angle required when glancing right to switch desktops.
              </p>
            </div>
            <div className="font-mono text-base font-bold text-blue-400 bg-blue-600/15 px-3 py-1 rounded-xl border border-blue-500/30">
              +{rightThreshold}°
            </div>
          </div>

          {/* Slider for Right Turn */}
          <div className="space-y-3">
            <input
              type="range"
              min="5"
              max="90"
              step="1"
              value={rightThreshold}
              onChange={(e) => updateConfig({ gazeRightAngle: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/50">
              <span className="text-blue-400 font-bold">5° (Micro Glance)</span>
              <span>15° (Natural)</span>
              <span>30° (Firm)</span>
              <span>45° (Side)</span>
              <span className="text-white font-bold">90° (Full)</span>
            </div>
          </div>

          {/* Right Angle Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/80">Right Glance Presets</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { deg: 8, label: '8° Feather', desc: 'Minimal glance' },
                { deg: 15, label: '15° Natural', desc: 'Recommended' },
                { deg: 30, label: '30° Deliberate', desc: 'Clear turn' },
                { deg: 45, label: '45° Look', desc: 'Half-turn' },
                { deg: 60, label: '60° Wide', desc: 'Wide look' },
                { deg: 90, label: '90° Full', desc: 'Right angle' }
              ].map(preset => (
                <button
                  key={preset.deg}
                  onClick={() => updateConfig({ gazeRightAngle: preset.deg })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    rightThreshold === preset.deg
                      ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-600/30'
                      : 'bg-black text-white/80 border-white/10 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[10px] text-white/60">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Selector */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="text-xs font-semibold text-white/80">Action on Right Look</label>
            <div className="space-y-1.5">
              {[
                { id: 'switch_right', label: 'Move 1 Desktop Right (Default)' },
                { id: 'switch_left', label: 'Move 1 Desktop Left' },
                { id: 'panic', label: 'Trigger Panic' },
                { id: 'mute_toggle', label: 'Toggle Mute' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => updateConfig({ gazeRightAction: item.id, gazeAction: item.id })}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                    (config.gazeRightAction || 'switch_right') === item.id
                      ? 'bg-blue-600 text-white border-blue-400 font-semibold shadow-sm'
                      : 'bg-black text-white/70 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span>{item.label}</span>
                  {(config.gazeRightAction || 'switch_right') === item.id && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </HoloCard>
      </div>

      {/* 3. Anti-Jitter Dwell Confirmation & Thermal Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HoloCard className="p-7 border-white/10 bg-black space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Dwell Confirmation Filter ({config.gazeDwellMs ?? 0} ms)
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                Glance hold requirement. Set to 0ms for instantaneous 1ms trigger with zero hold!
              </p>
            </div>
            <div className="font-mono text-base font-bold text-blue-400 bg-blue-600/15 px-3 py-1 rounded-xl border border-blue-500/30">
              {config.gazeDwellMs ?? 0} ms
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={config.gazeDwellMs ?? 0}
              onChange={(e) => updateConfig({ gazeDwellMs: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-white/50">
              <span className="text-blue-400 font-bold">0ms (Instantaneous)</span>
              <span>50ms (Micro)</span>
              <span>100ms (Hold)</span>
              <span>250ms (Firm)</span>
              <span className="text-white font-bold">500ms</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { ms: 0, label: '0 ms (Instant)', desc: 'Recommended (Zero hold)' },
              { ms: 50, label: '50 ms', desc: 'Micro hold' },
              { ms: 100, label: '100 ms', desc: 'Anti-jitter filter' }
            ].map(item => (
              <button
                key={item.ms}
                onClick={() => updateConfig({ gazeDwellMs: item.ms })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  (config.gazeDwellMs ?? 0) === item.ms
                    ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-600/30'
                    : 'bg-black text-white/80 border-white/10 hover:border-white/30 hover:bg-white/5'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-white/60">{item.desc}</div>
              </button>
            ))}
          </div>
        </HoloCard>

        <HoloCard className="p-7 border-white/10 bg-black space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Dynamic Battery Eco Engine</h4>
                    <CyberBadge variant="blue" size="xs">Auto Duty-Cycle</CyberBadge>
                  </div>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Drops sensor inference to <strong>8 FPS</strong> during resting gaze, and instantly boosts to <strong>15 FPS</strong> during active head glances. Saves up to 50% battery drain.
                  </p>
                </div>
              </div>

              {/* Eco Mode Toggle Switch */}
              <button
                onClick={() => {
                  sound.playClick();
                  updateConfig({ gazeBatteryEcoMode: config.gazeBatteryEcoMode === false });
                }}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  config.gazeBatteryEcoMode !== false
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${config.gazeBatteryEcoMode !== false ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
                {config.gazeBatteryEcoMode !== false ? 'ECO ACTIVE' : 'ALWAYS 15FPS'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/50">Tracking Engine</div>
                <div className="text-white font-bold text-xs mt-0.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-blue-400" />
                  1-Euro Adaptive
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-white/50">Battery Saver</div>
                <div className="text-white font-bold text-xs mt-0.5 flex items-center gap-1.5">
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-blue-400" />
                  -50% Wattage
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-white/60 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              Settings Storage
            </span>
            <span className="text-white font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Local Storage + SSD Synced
            </span>
          </div>
        </HoloCard>
      </div>

      {/* 4. Apple Quality Guarantee Card */}
      <HoloCard className="p-6 border-white/10 bg-black flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Apple Neural Engine Vision Architecture</h4>
          <p className="text-xs text-white/70 leading-relaxed">
            The Eyebrow and Head Sentry runs locally via Apple Vision framework with hardware acceleration. Zero external audio access, complete privacy, and zero Bluetooth interference with your headphones.
          </p>
        </div>
      </HoloCard>
    </div>
  );
};
