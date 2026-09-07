import React from 'react';
import { Shield, ShieldAlert, Mic, MicOff, Trash2, Key, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge, StatusLed } from './UIElements';
import { AudioSoundboardStudio } from './AudioSoundboardStudio';
import { sound } from '../utils/audio';

interface PrivacyVaultProps {
  stats: any;
  triggerAction: (action: string, payload: any, label: string) => Promise<void>;
  loadingAction: string | null;
}

export const PrivacyVaultTab: React.FC<PrivacyVaultProps> = ({ stats, triggerAction, loadingAction }) => {
  const clipboard = stats?.clipboard || { isSensitive: false, type: 'Clean / Plaintext', length: 0, preview: '', clean: true };
  const micMuted = !!stats?.micMuted;
  const browserCaches = stats?.browserCaches || { chrome: '1.6G', safari: '0 MB', edge: '0 MB' };

  const handleShredClipboard = () => {
    sound.playPurge();
    triggerAction('shred-clipboard', {}, 'Shred macOS Clipboard Memory');
  };

  const handleToggleMic = () => {
    sound.playClick();
    triggerAction('toggle-mic', {}, micMuted ? 'Unlock Hardware Microphone' : 'Lock Down Hardware Microphone');
  };

  const handlePurgeBrowsers = () => {
    sound.playPurge();
    triggerAction('purge-browsers', {}, 'Purge Multi-Browser Cache Artifacts');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 bg-[#000000] text-[#f5f5f7]">
      
      {/* Top Hero Banner */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#f5f5f7]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-[#f5f5f7]">Privacy Vault & Hygiene Cockpit</h1>
                <CyberBadge variant="slate">KERNEL DEFENSE</CyberBadge>
              </div>
              <p className="text-xs text-[#86868b] mt-1">
                Zero-trust hygiene: sanitize memory-resident pasteboards, lock down audio input, and erase tracking traces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a0a0c] border border-white/[0.08] text-xs font-mono text-[#f5f5f7]">
              <StatusLed color={micMuted ? 'red' : 'green'} size="sm" />
              <span>Mic: {micMuted ? 'LOCKED' : 'ONLINE'}</span>
            </div>
          </div>
        </div>
      </HoloCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Card 1: Clipboard Secret Sentry */}
        <HoloCard className="p-8 space-y-6 bg-[#101010] border border-white/[0.08] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-[#86868b]" />
                <h3 className="font-semibold text-sm text-[#f5f5f7]">Clipboard Privacy Sentry</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                clipboard.isSensitive
                  ? 'bg-[#ff453a]/20 text-[#ff453a] border-[#ff453a]/30'
                  : 'bg-white/[0.06] text-[#30d158] border-white/[0.08]'
              }`}>
                {clipboard.isSensitive ? 'LEAK DETECTED' : 'PASTEBOARD CLEAN'}
              </span>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed">
              Any installed macOS app can read your pasteboard without requesting user permission. Lingering API keys and passwords in clipboard represent a security vulnerability.
            </p>

            {/* Live Clipboard Status Box */}
            <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#86868b]">
                <span>Detected Content:</span>
                <span className="text-[#f5f5f7] font-medium">{clipboard.type}</span>
              </div>
              <div className="flex justify-between text-[#86868b]">
                <span>Length:</span>
                <span className="text-[#f5f5f7] font-medium">{clipboard.length} chars</span>
              </div>
              <div className="pt-2 border-t border-white/[0.04] flex justify-between items-center text-[#86868b]">
                <span>Masked Preview:</span>
                <span className="text-[#86868b] italic">{clipboard.preview || '(empty)'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-[#86868b]">Write zeros to pasteboard</span>
            <TactileButton
              onClick={handleShredClipboard}
              disabled={loadingAction === 'shred-clipboard'}
              variant="danger"
              size="sm"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span>{loadingAction === 'shred-clipboard' ? 'Shredding...' : 'Shred Clipboard'}</span>
            </TactileButton>
          </div>
        </HoloCard>

        {/* Card 2: Hardware Microphone Isolation */}
        <HoloCard className="p-8 space-y-6 bg-[#101010] border border-white/[0.08] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                {micMuted ? <MicOff className="w-4 h-4 text-[#ff453a]" /> : <Mic className="w-4 h-4 text-[#30d158]" />}
                <h3 className="font-semibold text-sm text-[#f5f5f7]">Hardware Microphone Isolation</h3>
              </div>
              <CyberBadge variant="slate" size="xs">
                {micMuted ? 'LOCKED' : 'ACTIVE'}
              </CyberBadge>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed">
              Air-gap your audio input. When locked, input volume is driven to 0% at the CoreAudio driver layer, preventing background processes or web renderers from eavesdropping.
            </p>

            <div className="p-4 rounded-xl bg-[#0a0a0c] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${micMuted ? 'bg-[#ff453a]' : 'bg-[#30d158]'}`} />
                <span className="text-xs font-mono text-[#f5f5f7]">
                  {micMuted ? 'Input Gain: 0% (Air-Gapped)' : 'Input Gain: Normal System Audio'}
                </span>
              </div>
              <span className="text-[11px] text-[#86868b] font-mono">CoreAudio</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-[#86868b]">Toggle input hardware state</span>
            <TactileButton
              onClick={handleToggleMic}
              disabled={loadingAction === 'toggle-mic'}
              variant={micMuted ? 'success' : 'secondary'}
              size="sm"
            >
              {micMuted ? <Mic className="w-3.5 h-3.5 mr-1.5 text-[#30d158]" /> : <MicOff className="w-3.5 h-3.5 mr-1.5" />}
              <span>{micMuted ? 'Unlock Microphone' : 'Lockdown Mic'}</span>
            </TactileButton>
          </div>
        </HoloCard>

      </div>

      {/* Audio Studio */}
      <AudioSoundboardStudio />

    </div>
  );
};
