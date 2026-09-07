import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  X,
  FileCheck2
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface ActionReceipt {
  id: string;
  action: string;
  label: string;
  message: string;
  timestamp: string;
  status: 'success' | 'error';
  details?: string;
}

interface ActionHUDProps {
  latestReceipt: ActionReceipt | null;
  allReceipts: ActionReceipt[];
  onDismiss: () => void;
  onClearReceipts: () => void;
}


export const ActionHUD: React.FC<ActionHUDProps> = ({
  latestReceipt,
  allReceipts,
  onDismiss,
  onClearReceipts
}) => {
  const [isReceiptsOpen, setIsReceiptsOpen] = useState(false);

  return (
    <>
      {/* 1. Top-Right Toast Stack */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {latestReceipt && (
            <motion.div
              key={latestReceipt.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto p-4 rounded-2xl bg-[#08080a]/90 border border-white/10 text-[#F5F5F7] shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_30px_rgba(124,58,237,0.2)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  latestReceipt.status === 'success'
                    ? 'bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30'
                    : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                }`}>
                  {latestReceipt.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[#F5F5F7] tracking-tight truncate">
                      {latestReceipt.label}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium uppercase ${
                      latestReceipt.status === 'success'
                        ? 'bg-[#22D3EE]/20 text-[#22D3EE]'
                        : 'bg-[#EF4444]/20 text-[#EF4444]'
                    }`}>
                      {latestReceipt.status === 'success' ? 'COMPLETED' : 'FAILED'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8A93] mt-1 leading-relaxed line-clamp-2">
                    {latestReceipt.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                    <span className="text-[#8A8A93] font-mono">{latestReceipt.timestamp}</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setIsReceiptsOpen(true);
                      }}
                      className="text-[#22D3EE] hover:text-[#38BDF8] transition-colors flex items-center gap-0.5 font-medium cursor-pointer"
                    >
                      <span>Audit log</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={onDismiss}
                  className="p-1 rounded-2xl text-[#8A8A93] hover:text-white transition-colors cursor-pointer"
                  title="Dismiss toast"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Execution Receipts Audit Drawer / Modal */}
      <AnimatePresence>
        {isReceiptsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsReceiptsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl rounded-2xl bg-[#08080a] border border-white/10 p-6 sm:p-8 space-y-6 shadow-[0_24px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(124,58,237,0.15)] flex flex-col max-h-[85vh] text-[#F5F5F7]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-[#7C3AED]">
                    <FileCheck2 className="w-5 h-5 text-[#22D3EE]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#F5F5F7] tracking-tight">Execution Receipts Log</h3>
                    <p className="text-xs text-[#8A8A93]">Immutable client record of system execution receipts</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClearReceipts}
                    className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#8A8A93] hover:text-[#F5F5F7] transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={() => setIsReceiptsOpen(false)}
                    className="p-1.5 rounded-2xl text-[#8A8A93] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Receipt list */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 font-mono text-xs">
                {allReceipts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8A8A93]">
                    No execution receipts recorded yet. Run any sweep, kill, or cleanup action to verify telemetry.
                  </div>
                ) : (
                  allReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-white/20 transition-all duration-150"
                    >
                      <div className="flex items-center justify-between font-sans">
                        <div className="flex items-center gap-2">
                          {receipt.status === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
                          ) : (
                            <XCircle className="w-4 h-4 text-[#EF4444]" />
                          )}
                          <span className="font-semibold text-xs text-[#F5F5F7]">{receipt.label}</span>
                        </div>
                        <span className="text-[11px] text-[#8A8A93] font-mono">{receipt.timestamp}</span>
                      </div>

                      <p className="text-xs text-[#8A8A93] font-mono pl-6 leading-relaxed">
                        {receipt.message}
                      </p>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8A8A93] pl-6">
                        <span>Action API: <code className="text-[#22D3EE]">{receipt.action}</code></span>
                        <span className="text-[#22D3EE] uppercase font-semibold">VERIFIED</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

