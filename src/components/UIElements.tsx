import React from 'react';
import { sound } from '../utils/audio';

// Re-export hardware controls for unified developer ergonomics
export {
  KnurledKnob,
  PrecisionFader,
  MachinedSwitch,
  LaserBadge,
  TitaniumCard
} from './TitaniumControls';
export type {
  KnurledKnobProps,
  PrecisionFaderProps,
  MachinedSwitchProps,
  LaserBadgeProps,
  TitaniumCardProps
} from './TitaniumControls';

// ============================================================================
// 1. APPLE PHYSICAL TOGGLE SWITCH
// Strictly monochrome/Apple design tokens (#000000 base, #101010 card, #f5f5f7 text)
// ============================================================================

export interface TactileSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export const TactileSwitch: React.FC<TactileSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md'
}) => {
  const isSm = size === 'sm';

  const handleClick = () => {
    if (!disabled) {
      sound.playClick();
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer group'
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-250 ease-out focus:outline-none ${
          isSm ? 'w-9 h-5 p-0.5' : 'w-11 h-6 p-0.5'
        } ${
          checked
            ? 'bg-[#30d158]'
            : 'bg-white/[0.16] hover:bg-white/[0.22]'
        } ${disabled ? 'cursor-not-allowed' : 'active:scale-95'}`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-[#f5f5f7] transition-transform duration-250 ease-out shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
            isSm ? 'w-4 h-4' : 'w-5 h-5'
          } ${
            checked
              ? isSm
                ? 'translate-x-4'
                : 'translate-x-5'
              : 'translate-x-0'
          }`}
        />
      </button>

      {label && (
        <span className="text-xs font-medium text-[#86868b] group-hover:text-[#f5f5f7] transition-colors">
          {label}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// 2. APPLE-GRADE FROSTED BENTO CARD (HoloCard)
// Strictly #101010 primary cards with border: 1px solid rgba(255, 255, 255, 0.08)
// ============================================================================

export interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
  onClick?: () => void;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  children,
  className = '',
  hoverGlow = true,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-[#101010] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-2xl transition-all duration-200 text-[#f5f5f7] ${
        hoverGlow ? 'hover:border-white/[0.16]' : ''
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 3. APPLE PILL ACTION BUTTON (TactileButton)
// Strictly monochrome/metallic sheen & Apple high-contrast tokens
// ============================================================================

export interface TactileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  className = '',
  icon
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      sound.playClick();
      onClick();
    }
  };

  const variantStyles = {
    primary:
      'bg-[#f5f5f7] hover:bg-white text-black font-semibold shadow-[0_2px_8px_rgba(255,255,255,0.15)] active:bg-zinc-200',
    secondary:
      'bg-white/[0.08] hover:bg-white/[0.12] text-[#f5f5f7] border border-white/[0.08] active:bg-white/[0.16]',
    danger:
      'bg-[#ff453a]/15 hover:bg-[#ff453a]/25 text-[#ff453a] border border-[#ff453a]/20 active:bg-[#ff453a]/30',
    success:
      'bg-[#30d158]/15 hover:bg-[#30d158]/25 text-[#30d158] border border-[#30d158]/20 active:bg-[#30d158]/30',
    ghost:
      'bg-transparent hover:bg-white/[0.06] text-[#86868b] hover:text-[#f5f5f7] border border-transparent'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-full gap-1.5',
    md: 'px-4 py-2 text-xs rounded-full gap-2',
    lg: 'px-6 py-2.5 text-sm rounded-full gap-2.5 font-medium'
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex items-center justify-center transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none tracking-tight font-medium ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

// ============================================================================
// 4. APPLE HARDWARE STATUS INDICATOR (StatusLed)
// ============================================================================

export interface StatusLedProps {
  color?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusLed: React.FC<StatusLedProps> = ({
  color = 'green',
  pulse = false,
  size = 'md'
}) => {
  const colorMap = {
    green: 'bg-[#30d158]',
    amber: 'bg-[#ff9f0a]',
    red: 'bg-[#ff453a]',
    blue: 'bg-[#f5f5f7]',
    purple: 'bg-[#bf5af2]'
  };

  const dimSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className="relative inline-flex items-center justify-center">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-50 animate-ping ${colorMap[color]}`}
        />
      )}
      <span className={`relative inline-block rounded-full ${dimSize} ${colorMap[color]}`} />
    </span>
  );
};

// ============================================================================
// 5. APPLE REFINED PILL BADGE (CyberBadge)
// Strictly #86868b subtext and silver/metallic hues
// ============================================================================

export interface CyberBadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'sky' | 'purple' | 'amber' | 'rose' | 'slate' | 'cyan' | 'indigo' | 'blue';
  size?: 'xs' | 'sm';
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  variant = 'slate',
  size = 'xs'
}) => {
  const styles = {
    blue: 'bg-white/[0.08] text-[#f5f5f7] border-white/[0.12]',
    emerald: 'bg-[#30d158]/12 text-[#30d158] border-[#30d158]/20',
    amber: 'bg-[#ff9f0a]/12 text-[#ff9f0a] border-[#ff9f0a]/20',
    rose: 'bg-[#ff453a]/12 text-[#ff453a] border-[#ff453a]/20',
    sky: 'bg-white/[0.08] text-[#f5f5f7] border-white/[0.12]',
    cyan: 'bg-white/[0.08] text-[#f5f5f7] border-white/[0.12]',
    indigo: 'bg-white/[0.08] text-[#f5f5f7] border-white/[0.12]',
    purple: 'bg-white/[0.08] text-[#f5f5f7] border-white/[0.12]',
    slate: 'bg-white/[0.05] text-[#86868b] border-white/[0.08]'
  };

  const sizeStyles =
    size === 'xs' ? 'px-2.5 py-0.5 text-[11px] gap-1' : 'px-3 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-normal ${styles[variant]} ${sizeStyles}`}
    >
      <span className="truncate">{children}</span>
    </span>
  );
};

// ============================================================================
// 6. APPLE ACTIVITY RING GAUGE (MetricProgressRing)
// ============================================================================

export interface MetricProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  unit?: string;
  sublabel?: string;
}

export const MetricProgressRing: React.FC<MetricProgressRingProps> = ({
  value,
  max = 100,
  size = 110,
  strokeWidth = 7,
  color = '#f5f5f7',
  label,
  unit = '%',
  sublabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="text-xl font-semibold tracking-tight text-[#f5f5f7] leading-none">
          {label !== undefined ? label : Math.round(value)}
          <span className="text-xs font-normal text-[#86868b] ml-0.5">{unit}</span>
        </div>
        {sublabel && (
          <span className="text-[10px] text-[#86868b] mt-1 font-medium tracking-wide">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 7. APPLE BENTO KPI CARD (GlassKpiCard)
// Strictly #101010 primary cards, #f5f5f7 text, #86868b subtext
// ============================================================================

export interface GlassKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose';
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const GlassKpiCard: React.FC<GlassKpiCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon,
  trend,
  trendPositive,
  className = '',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-[#101010] border border-white/[0.08] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-200 hover:border-white/[0.16] ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-[#86868b] mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#f5f5f7]">{icon}</span>}
          <span className="font-medium tracking-wide uppercase text-[11px] text-[#86868b]">{title}</span>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] text-[#86868b]">
            {badge}
          </span>
        )}
      </div>

      <div className="text-3xl font-semibold text-[#f5f5f7] tracking-tight">{value}</div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-[#86868b]">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`font-mono ${trendPositive ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
