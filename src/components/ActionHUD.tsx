import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  FileCheck2,
  ArrowUpRight
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
      {/* 1. Dynamic Island Top HUD */}
      {latestReceipt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 px-5 py-3 rounded-full bg-[#101010] border border-white/[0.12] text-[#f5f5f7] shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
            <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-[#30d158] shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#f5f5f7] tracking-tight">{latestReceipt.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-white/[0.08] text-[#30d158] border border-white/[0.1] text-[9px] font-mono font-medium uppercase">
                    COMPLETED
                  </span>
                </div>
                <div className="text-xs text-[#86868b] font-medium truncate max-w-sm mt-0.5">
                  {latestReceipt.message}
                </div>
              </div>

              <div className="h-4 w-px bg-white/10 mx-1" />

              <button
                onClick={() => {
                  sound.playClick();
                  setIsReceiptsOpen(true);
                }}
                className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-[#f5f5f7] transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Audit</span>
                <ChevronRight className="w-3 h-3" />
              </button>

              <button
                onClick={onDismiss}
                className="p-1 rounded-full text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Execution Receipts Audit Drawer / Modal */}
      {isReceiptsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsReceiptsOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-[#101010] border border-white/[0.08] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] text-[#f5f5f7]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/[0.1] text-[#f5f5f7]">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-[#f5f5f7]">Execution Receipts Log</h3>
                  <p className="text-xs text-[#86868b]">Immutable client record of system execution receipts</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClearReceipts}
                  className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                >
                  Clear History
                </button>
                <button
                  onClick={() => setIsReceiptsOpen(false)}
                  className="p-1.5 rounded-full text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Receipt list */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 font-mono text-xs">
              {allReceipts.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868b]">
                  No execution receipts recorded yet. Run any sweep, kill, or cleanup action to verify telemetry.
                </div>
              ) : (
                allReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] space-y-2 hover:border-white/[0.12] transition-colors"
                  >
                    <div className="flex items-center justify-between font-sans">
                      <div className="flex items-center gap-2">
                        {receipt.status === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ff453a]" />
                        )}
                        <span className="font-semibold text-xs text-[#f5f5f7]">{receipt.label}</span>
                      </div>
                      <span className="text-[11px] text-[#86868b] font-mono">{receipt.timestamp}</span>
                    </div>

                    <p className="text-xs text-[#86868b] font-mono pl-6 leading-relaxed">
                      {receipt.message}
                    </p>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-[#86868b] pl-6">
                      <span>Action API: <code className="text-[#f5f5f7]">{receipt.action}</code></span>
                      <span className="text-[#30d158] uppercase font-semibold">VERIFIED</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
