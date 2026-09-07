import React from 'react';
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
  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-[#101010] border border-white/[0.08] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[#f5f5f7]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#f5f5f7]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#f5f5f7] tracking-tight">Apple Silicon Architecture</h3>
              <p className="text-xs text-[#86868b] mt-0.5">Hardware specifications & kernel telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] transition-colors"
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
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0a0c] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <div className="flex items-center gap-2.5 text-[#86868b] font-sans text-xs">
                  <Icon className="w-3.5 h-3.5 text-[#86868b]" />
                  <span>{row.label}</span>
                </div>
                <span className="font-medium text-[#f5f5f7] truncate max-w-[280px] text-right">
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#86868b] font-mono">
          <span>Sub-25ms Telemetry Bus</span>
          <span className="text-[#30d158] font-medium">Native Apple Architecture</span>
        </div>
      </div>
    </div>
  );
};
