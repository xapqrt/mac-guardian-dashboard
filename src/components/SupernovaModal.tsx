import React, { useState } from 'react';
import {
  Skull,
  AlertTriangle,
  X,
  ShieldAlert,
  Radio,
  Trash2,
  Globe
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SupernovaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const SupernovaModal: React.FC<SupernovaModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-[#101010] border border-[#ff453a]/30 p-8 sm:p-10 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 relative overflow-hidden text-[#f5f5f7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ff453a]/15 border border-[#ff453a]/30 flex items-center justify-center text-[#ff453a]">
              <Skull className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#f5f5f7] tracking-tight">SUPERNOVA: EMERGENCY PURGE</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/30 text-[10px] font-mono font-medium tracking-wider">
                  EMERGENCY
                </span>
              </div>
              <p className="text-xs text-[#86868b] mt-0.5">System-wide resource reclamation & memory recovery</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning List */}
        <div className="space-y-3 relative z-10">
          <div className="p-4 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-2.5 text-xs">
            <div className="font-medium text-[#f5f5f7] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ff9f0a]" />
              Targeted for Immediate Termination:
            </div>
            <ul className="space-y-2 text-[#86868b] pl-1 font-mono text-[11px]">
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#f5f5f7] shrink-0" />
                <span>All background browser tabs & non-dashboard browsers</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#f5f5f7] shrink-0" />
                <span>Discord, Slack, Spotify, Steam, Zoom, Notion, Obsidian, Telegram</span>
              </li>
              <li className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#f5f5f7] shrink-0" />
                <span>Runaway development servers & background runtimes</span>
              </li>
              <li className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-[#ff453a] shrink-0" />
                <span>Zombie processes, transient buffers, Trash, & clipboard sanitized</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-[#86868b] leading-relaxed px-1">
            *This control center (<code className="text-[#f5f5f7]">localhost:3334</code>), Finder, and critical macOS kernel daemons will stay active.*
          </p>
        </div>

        {/* Safety Confirm Checkbox */}
        <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0a0a0c] border border-white/[0.06] cursor-pointer select-none relative z-10 text-xs text-[#86868b]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => {
              sound.playClick();
              setConfirmed(e.target.checked);
            }}
            className="w-4 h-4 rounded border-white/20 bg-black accent-white cursor-pointer"
          />
          <span>I understand all unpinned background tasks will be quit immediately.</span>
        </label>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              sound.playPurge();
              onConfirm();
            }}
            disabled={!confirmed || loading}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
              confirmed && !loading
                ? 'bg-[#ff453a] hover:bg-[#ff3b30] text-white shadow-lg shadow-[#ff453a]/25 cursor-pointer active:scale-95'
                : 'bg-white/[0.05] text-[#86868b] cursor-not-allowed border border-white/[0.06]'
            }`}
          >
            <Skull className="w-4 h-4" />
            <span>{loading ? 'Executing Supernova...' : 'Arm & Terminate Everything'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
