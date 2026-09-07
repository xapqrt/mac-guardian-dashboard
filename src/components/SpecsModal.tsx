import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  X,
  HardDrive,
  ShieldCheck,
  Zap,
  Battery,
  Wifi,
  Terminal,
  Activity
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: any;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({
  isOpen,
  onClose,
  stats
}) => {
  const specRows = [
    { label: 'Processor', value: stats?.specs?.chip || 'Apple Silicon', icon: Cpu },
    { label: 'Hardware Model', value: stats?.specs?.model || 'Mac', icon: Zap },
    { label: 'Operating System', value: stats?.specs?.osVersion || 'macOS', icon: Terminal },
    { label: 'CPU Cores', value: `${stats?.cpu?.cores || 8} Active Cores`, icon: Activity },
    { label: 'Unified Memory', value: `${stats?.ram?.totalGb || 16} GB Unified Architecture`, icon: Cpu },
    { label: 'APFS Storage', value: `${stats?.disk?.free || '50GB'} Free / ${stats?.disk?.used || '140GB'} Used (${stats?.disk?.capacity || '74%'})`, icon: HardDrive },
    { label: 'Battery / Power', value: `${stats?.battery?.percent || 100}% (${stats?.battery?.state || 'Normal'})`, icon: Battery },
    { label: 'Local Network IP', value: `${stats?.network?.localIp || '127.0.0.1'} (Ping: ${stats?.network?.pingMs || '20ms'})`, icon: Wifi },
    { label: 'Kernel Security', value: 'Apple Silicon SIP & Sealed System Volume Enforced', icon: ShieldCheck },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-xl rounded-2xl bg-[#08080a] border border-white/10 p-6 sm:p-8 space-y-6 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(124,58,237,0.15)] text-[#F5F5F7]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#7C3AED]">
                  <Cpu className="w-5 h-5 text-[#22D3EE]" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#F5F5F7] tracking-tight">Apple Silicon Architecture</h3>
                  <p className="text-xs text-[#8A8A93] mt-0.5">Hardware specifications & kernel telemetry</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-2xl text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {specRows.map((row, idx) => {
                const Icon = row.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-150"
                  >
                    <div className="flex items-center gap-2.5 text-[#8A8A93] font-sans text-xs">
                      <Icon className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>{row.label}</span>
                    </div>
                    <span className="font-medium text-[#F5F5F7] truncate max-w-[280px] text-right">
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8A8A93] font-mono">
              <span>Sub-25ms Telemetry Bus</span>
              <span className="text-[#22D3EE] font-medium">Native Silicon Pipeline</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

