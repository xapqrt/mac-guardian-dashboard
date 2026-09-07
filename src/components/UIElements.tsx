import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { sound } from '../utils/audio';
import { useCountUp } from '../hooks/useCountUp';

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
// 1. TACTILE TOGGLE SWITCH
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
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-out focus:outline-none ${
          isSm ? 'w-9 h-5 p-0.5' : 'w-11 h-6 p-0.5'
        } ${
          checked
            ? 'bg-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.5)]'
            : 'bg-white/10 hover:bg-white/20'
        } ${disabled ? 'cursor-not-allowed' : 'active:scale-95'}`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-[#F5F5F7] transition-transform duration-200 ease-out shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${
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
        <span className="text-xs font-medium text-[#8A8A93] group-hover:text-[#F5F5F7] transition-colors">
          {label}
        </span>
      )}
    </div>
  );
};

// ============================================================================
// 2. GLASSMORPHISM BENTO CARD (HoloCard)
// Hover: lift 4px, glow shadow appears, border brightens white/10 -> white/20
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
      className={`relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-200 text-[#F5F5F7] ${
        hoverGlow
          ? 'hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)]'
          : ''
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 3. CVA-POWERED ACTION BUTTON (TactileButton)
// Primary: gradient violet→cyan, scale 0.97 on press, glow intensifies on hover
// Secondary: glass style (bg-white/5 backdrop-blur-xl border border-white/10)
// Loading state: spinner replaces label, fixed min-width
// ============================================================================

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-2xl tracking-tight disabled:opacity-40 disabled:pointer-events-none select-none focus:outline-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white shadow-sm hover:shadow-[0_0_24px_rgba(124,58,237,0.45)] active:scale-[0.97]',
        secondary:
          'bg-white/5 backdrop-blur-xl text-[#F5F5F7] border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] active:scale-[0.97]',
        danger:
          'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/25 hover:shadow-[0_0_24px_rgba(239,68,68,0.3)] active:scale-[0.97]',
        success:
          'bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 hover:bg-[#22D3EE]/25 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] active:scale-[0.97]',
        ghost:
          'bg-transparent text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/5 active:scale-[0.97]'
      },
      size: {
        sm: 'px-3 py-1.5 text-xs gap-1.5 min-w-[80px]',
        md: 'px-4 py-2 text-xs gap-2 min-w-[100px]',
        lg: 'px-6 py-2.5 text-sm gap-2.5 min-w-[130px]'
      }
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md'
    }
  }
);

export interface TactileButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const TactileButton: React.FC<TactileButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'secondary',
  size = 'md',
  className = '',
  icon
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      sound.playClick();
      onClick();
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleClick}
      className={buttonVariants({ variant, size, className })}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

// ============================================================================
// 4. HARDWARE STATUS INDICATOR (StatusLed)
// ============================================================================

export interface StatusLedProps {
  color?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'cyan';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusLed: React.FC<StatusLedProps> = ({
  color = 'cyan',
  pulse = false,
  size = 'md'
}) => {
  const colorMap = {
    cyan: 'bg-[#22D3EE]',
    green: 'bg-[#22D3EE]',
    amber: 'bg-[#F59E0B]',
    red: 'bg-[#EF4444]',
    blue: 'bg-[#7C3AED]',
    purple: 'bg-[#7C3AED]'
  };

  const dimSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className="relative inline-flex items-center justify-center">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${colorMap[color]}`}
        />
      )}
      <span className={`relative inline-block rounded-full ${dimSize} ${colorMap[color]}`} />
    </span>
  );
};

// ============================================================================
// 5. REFINED PILL BADGE (CyberBadge)
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
    blue: 'bg-[#7C3AED]/15 text-[#C4B5FD] border-[#7C3AED]/30',
    purple: 'bg-[#7C3AED]/15 text-[#C4B5FD] border-[#7C3AED]/30',
    indigo: 'bg-[#7C3AED]/15 text-[#C4B5FD] border-[#7C3AED]/30',
    cyan: 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30',
    emerald: 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30',
    sky: 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30',
    amber: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
    rose: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
    slate: 'bg-white/5 text-[#8A8A93] border-white/10'
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
// 6. METRIC PROGRESS RING
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
  color = '#7C3AED',
  label,
  unit = '%',
  sublabel
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedValue = useCountUp(value, 800);
  const progress = Math.min(100, Math.max(0, (animatedValue / max) * 100));
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
          style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <div className="text-xl font-semibold tracking-tight text-[#F5F5F7] leading-none">
          {label !== undefined ? label : Math.round(animatedValue)}
          <span className="text-xs font-normal text-[#8A8A93] ml-0.5">{unit}</span>
        </div>
        {sublabel && (
          <span className="text-[10px] text-[#8A8A93] mt-1 font-medium tracking-wide">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 7. BENTO KPI CARD (GlassKpiCard)
// Numbers count up from 0 on mount (~800ms)
// Card hover: lift 4px, glow shadow appears, border brightens
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
  const isNumeric = typeof value === 'number' || (!isNaN(parseFloat(String(value))) && isFinite(Number(value)));
  const animatedNumber = useCountUp(isNumeric ? parseFloat(String(value)) : 0, 800);

  const displayValue = isNumeric
    ? typeof value === 'number' && Number.isInteger(value)
      ? Math.round(animatedNumber)
      : animatedNumber.toFixed(1)
    : value;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] ${
        onClick ? 'cursor-pointer active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-[#8A8A93] mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#22D3EE]">{icon}</span>}
          <span className="font-medium tracking-wide uppercase text-[11px] text-[#8A8A93]">{title}</span>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#22D3EE] font-mono">
            {badge}
          </span>
        )}
      </div>

      <div className="text-3xl font-semibold text-[#F5F5F7] tracking-tight">{displayValue}</div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-[#8A8A93]">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className={`font-mono ${trendPositive ? 'text-[#22D3EE]' : 'text-[#EF4444]'}`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

