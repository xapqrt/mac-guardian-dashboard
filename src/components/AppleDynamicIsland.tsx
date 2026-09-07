import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Headphones, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Mic, 
  MicOff, 
  Layers,
  Activity,
  Shield,
  Trash2,
  Terminal,
  Cpu
} from 'lucide-react';
import { StatusLed } from './UIElements';
import { sound } from '../utils/audio';

interface AppleDynamicIslandProps {
  stats: any;
  healthScore: number;
  triggerAction: (action: string, payload: any, label: string) => void;
  loadingAction: string | null;
  onOpenSpecs: () => void;
}

export const AppleDynamicIsland: React.FC<AppleDynamicIslandProps> = ({
  stats,
  healthScore,
  triggerAction,
  loadingAction,
  onOpenSpecs,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const m4 = stats?.m4Telemetry || { watts: '3.8', tempC: '30.6', chipBrand: 'Apple Silicon' };
  const buds = stats?.onePlusBuds || { deviceName: 'OnePlus Buds 4', battery: 60, connected: true, rssi: -47 };
  const micMuted = !!stats?.micMuted;

  const handleToggleExpand = () => {
    sound.playClick();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 z-40 relative">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className={`mx-auto bg-[#08080a]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-colors overflow-hidden rounded-2xl ${
          isExpanded
            ? 'p-6 border-white/15'
            : 'px-5 py-2.5 hover:border-[#7C3AED]/40 max-w-3xl'
        }`}
      >
        {/* Compact Island Pill (Always visible) */}
        <div className="flex items-center justify-between gap-3 text-xs">
          {/* Left: Chip and Health */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                onOpenSpecs();
              }}
              className="flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-white/5 hover:bg-white/10 text-[#F5F5F7] font-medium transition-all active:scale-95 border border-white/10"
            >
              <StatusLed color="green" size="sm" />
              <span>{stats?.specs?.chip || 'Apple Silicon'}</span>
              <span className="text-[#8A8A93] font-normal">{m4.watts}W</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5 text-[#8A8A93]">
              <span className="text-[#22D3EE] font-medium">{healthScore}%</span>
              <span>Health</span>
            </div>
          </div>

          {/* Center: Live Memory & Earbuds */}
          <div className="flex items-center gap-3">
            {/* RAM */}
            <div className="hidden md:flex items-center gap-1.5 text-[#8A8A93]">
              <Layers className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="text-[#F5F5F7]">
                {stats?.ram?.usedGb || '6.0'} / {stats?.ram?.totalGb || '12'} GB
              </span>
            </div>

            {/* Earbuds status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-white/5 text-[#F5F5F7] border border-white/10">
              <Headphones className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="font-medium text-white">{buds.battery || 60}%</span>
            </div>

            {/* Mic indicator */}
            <button
              onClick={() => triggerAction('toggle-mic', {}, 'Toggle Hardware Microphone')}
              title="Click to toggle mic lockdown"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-2xl text-[11px] transition-all active:scale-95 ${
                micMuted
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'bg-white/5 text-[#8A8A93] hover:text-[#F5F5F7] border border-white/10'
              }`}
            >
              {micMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-[#22D3EE]" />}
              <span>{micMuted ? 'Muted' : 'Mic'}</span>
            </button>
          </div>

          {/* Right: Quick Sweep & Expand */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerAction('boost-quick', {}, 'Instant Mac Sweep')}
              disabled={loadingAction === 'boost-quick'}
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white font-semibold text-xs shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3" />
              <span>{loadingAction === 'boost-quick' ? 'Sweeping...' : 'Sweep (⌘B)'}</span>
            </button>

            <button
              onClick={handleToggleExpand}
              className="p-1.5 rounded-2xl text-[#8A8A93] hover:text-white hover:bg-white/10 transition-colors active:scale-90"
              title={isExpanded ? 'Collapse Island' : 'Expand Island'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Island Control Center */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-5 mt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
            >
              {/* Column 1: Power & Battery */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-[#86868b]">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#ff9f0a]" /> SoC Power
                  </span>
                  <span>{m4.tempC}°C</span>
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight">
                  {m4.watts} <span className="text-xs text-[#86868b] font-normal">Watts Draw</span>
                </div>
                <div className="text-[11px] text-[#86868b] space-y-0.5 pt-1">
                  <div className="flex justify-between">
                    <span>Battery Health:</span>
                    <span className="text-[#30d158] font-medium">{m4.health || '100%'} ({m4.cycles || 121} cyc)</span>
                  </div>
                </div>
              </div>

              {/* Column 2: OnePlus Earbuds RF */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <div className="flex justify-between items-center text-[#86868b]">
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#22D3EE]" /> OnePlus Buds 4
                  </span>
                  <span>{buds.rssi || -47} dBm</span>
                </div>
                <div className="text-2xl font-semibold text-white tracking-tight">
                  {buds.battery || 60}% <span className="text-xs text-[#86868b] font-normal">Charge</span>
                </div>
                <div className="text-[11px] text-[#86868b] space-y-0.5 pt-1">
                  <div className="flex justify-between">
                    <span>Codec & Bitrate:</span>
                    <span className="text-[#a1a1a6]">{buds.codec || 'AAC'} • {buds.bitrate || 224}k</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Quick Operations */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col justify-between space-y-2">
                <span className="text-[#86868b] font-medium">Quick Operations</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => triggerAction('boss-key-reap', {}, 'Focus Mode')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white transition-colors text-left active:scale-95"
                  >
                    Focus Mode
                  </button>
                  <button
                    onClick={() => triggerAction('clean-dev-caches', {}, 'Flush Caches')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white transition-colors text-left active:scale-95"
                  >
                    Flush Caches
                  </button>
                  <button
                    onClick={() => triggerAction('shred-clipboard', {}, 'Shred Clipboard')}
                    className="p-2 rounded-xl bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] transition-colors text-left active:scale-95"
                  >
                    Shred Clip
                  </button>
                  <button
                    onClick={() => triggerAction('flush-dns', {}, 'Flush DNS')}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#30d158] transition-colors text-left active:scale-95"
                  >
                    Flush DNS
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
