import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Skull,
  AlertTriangle,
  X,
  ShieldAlert,
  Radio,
  Trash2,
  Globe,
  Loader2
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-xl rounded-2xl bg-[#08080a] border border-[#EF4444]/30 p-6 sm:p-8 space-y-6 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(239,68,68,0.2)] relative overflow-hidden text-[#F5F5F7]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.25)]">
                  <Skull className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-[#F5F5F7] tracking-tight">SUPERNOVA: EMERGENCY PURGE</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 text-[10px] font-mono font-medium tracking-wider">
                      EMERGENCY
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8A93] mt-0.5">System-wide resource reclamation & memory recovery</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-2xl text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning List */}
            <div className="space-y-3 relative z-10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
                <div className="font-medium text-[#F5F5F7] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                  Targeted for Immediate Termination:
                </div>
                <ul className="space-y-2 text-[#8A8A93] pl-1 font-mono text-[11px]">
                  <li className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                    <span>All background browser tabs & non-dashboard browsers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <span>Discord, Slack, Spotify, Steam, Zoom, Notion, Obsidian, Telegram</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                    <span>Runaway development servers & background runtimes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                    <span>Zombie processes, transient buffers, Trash, & clipboard sanitized</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-[#8A8A93] leading-relaxed px-1">
                *This control center (<code className="text-[#22D3EE]">localhost:3334</code>), Finder, and critical macOS kernel daemons will stay active.*
              </p>
            </div>

            {/* Safety Confirm Checkbox */}
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer select-none relative z-10 text-xs text-[#8A8A93] hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => {
                  sound.playClick();
                  setConfirmed(e.target.checked);
                }}
                className="w-4 h-4 rounded-lg border-white/20 bg-black accent-[#EF4444] cursor-pointer"
              />
              <span className="text-[#F5F5F7]">I understand all unpinned background tasks will be quit immediately.</span>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 relative z-10">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-2xl text-xs text-[#8A8A93] hover:text-[#F5F5F7] hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playPurge();
                  onConfirm();
                }}
                disabled={!confirmed || loading}
                className={`min-w-[190px] px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  confirmed && !loading
                    ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-[0_0_24px_rgba(239,68,68,0.4)] cursor-pointer active:scale-95'
                    : 'bg-white/5 text-[#8A8A93] cursor-not-allowed border border-white/10'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Skull className="w-4 h-4" />
                    <span>Arm & Terminate Everything</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

