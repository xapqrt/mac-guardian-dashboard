import React, { useState } from 'react';
import {
  Sliders,
  Gauge,
  Zap,
  Sparkles,
  Activity,
  Eye,
  EyeOff,
  Moon,
  Monitor,
  Volume2,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { HoloCard, TactileButton, TactileSwitch, CyberBadge } from './UIElements';

interface TweaksTabProps {
  stats: any;
  perfMode: 'snappy' | 'balanced' | 'default';
  setPerfMode: (mode: 'snappy' | 'balanced' | 'default') => void;
  triggerAction: (action: string, payload: Record<string, any>, label: string) => void;
}

export const TweaksTab: React.FC<TweaksTabProps> = ({
  stats,
  perfMode,
  setPerfMode,
  triggerAction
}) => {
  const [lastTweakKey, setLastTweakKey] = useState<string | null>(null);

  const handleToggleTweak = (key: string, val: boolean, label: string) => {
    setLastTweakKey(key);
    triggerAction('toggle-macos-tweak', { tweakKey: key, tweakVal: val }, label);
    setTimeout(() => setLastTweakKey(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 bg-[#000000] text-[#f5f5f7]">
      {/* 1. Hidden macOS Defaults Switchboard with Tactile Switches */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#86868b]" /> Hidden macOS Defaults Switchboard
            </h3>
            <CyberBadge variant="slate" size="xs">KERNEL DEFAULTS</CyberBadge>
          </div>
          <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
            Toggle native hidden macOS system behaviors with physical tactile switches. Automatically restarts relevant daemon processes (Finder, Dock, SystemUIServer).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* Show Hidden Files */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/[0.12] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#f5f5f7]">Show Hidden Files</h4>
                <TactileSwitch
                  checked={!!stats?.macosTweaks?.showHiddenFiles}
                  onChange={() => handleToggleTweak('showHiddenFiles', stats?.macosTweaks?.showHiddenFiles, 'Toggle Show Hidden Files')}
                />
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">Permanently reveals dotfiles (.env, .git) in Finder.</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#86868b]">AppleShowAllFiles</span>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${stats?.macosTweaks?.showHiddenFiles ? 'bg-white/[0.08] text-[#30d158] border border-white/[0.08]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                {stats?.macosTweaks?.showHiddenFiles ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Full Path in Title */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/[0.12] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#f5f5f7]">POSIX Path in Title Bar</h4>
                <TactileSwitch
                  checked={!!stats?.macosTweaks?.showPathInTitle}
                  onChange={() => handleToggleTweak('showPathInTitle', stats?.macosTweaks?.showPathInTitle, 'Toggle Path in Title')}
                />
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">Displays exact directory path at top of Finder windows.</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#86868b]">_FXShowPosixPath</span>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${stats?.macosTweaks?.showPathInTitle ? 'bg-white/[0.08] text-[#30d158] border border-white/[0.08]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                {stats?.macosTweaks?.showPathInTitle ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Skip DMG Verify */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/[0.12] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#f5f5f7]">Instant DMG Opening</h4>
                <TactileSwitch
                  checked={!!stats?.macosTweaks?.skipDmgVerify}
                  onChange={() => handleToggleTweak('skipDmgVerify', stats?.macosTweaks?.skipDmgVerify, 'Toggle Skip DMG Verify')}
                />
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">Bypasses slow disk image verification check.</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#86868b]">skip-verify</span>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${stats?.macosTweaks?.skipDmgVerify ? 'bg-white/[0.08] text-[#30d158] border border-white/[0.08]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                {stats?.macosTweaks?.skipDmgVerify ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Instant Dock Animation */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/[0.12] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#f5f5f7]">Zero-Delay Dock Autohide</h4>
                <TactileSwitch
                  checked={!!stats?.macosTweaks?.fastDock}
                  onChange={() => handleToggleTweak('fastDock', stats?.macosTweaks?.fastDock, 'Toggle Fast Dock')}
                />
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">Removes the 0.5s hesitation delay when hovering near Dock edge.</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#86868b]">autohide-delay 0</span>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${stats?.macosTweaks?.fastDock ? 'bg-white/[0.08] text-[#30d158] border border-white/[0.08]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                {stats?.macosTweaks?.fastDock ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Clean Screenshots */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/[0.12] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#f5f5f7]">Window Screenshots (No Shadow)</h4>
                <TactileSwitch
                  checked={!!stats?.macosTweaks?.noShadowScreenshot}
                  onChange={() => handleToggleTweak('noShadowScreenshot', stats?.macosTweaks?.noShadowScreenshot, 'Toggle Screenshot Shadows')}
                />
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">Removes large drop shadow on window screenshots.</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#86868b]">disable-shadow</span>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${stats?.macosTweaks?.noShadowScreenshot ? 'bg-white/[0.08] text-[#30d158] border border-white/[0.08]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                {stats?.macosTweaks?.noShadowScreenshot ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] flex flex-col justify-between space-y-4 hover:border-white/[0.12] transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#f5f5f7]">Desktop Icons & Stacks</h4>
                <TactileSwitch
                  checked={!!stats?.macosTweaks?.desktopIcons}
                  onChange={() => handleToggleTweak('desktopIcons', stats?.macosTweaks?.desktopIcons, 'Toggle Desktop Icons')}
                />
              </div>
              <p className="text-xs text-[#86868b] leading-relaxed">Show or hide all icons on desktop for clean screen sharing.</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#86868b]">CreateDesktop</span>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${stats?.macosTweaks?.desktopIcons ? 'bg-white/[0.08] text-[#30d158] border border-white/[0.08]' : 'bg-white/[0.03] text-[#86868b]'}`}>
                {stats?.macosTweaks?.desktopIcons ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </HoloCard>

      {/* Encrypted DNS Shield */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#86868b]" /> Encrypted DNS Shield & Resolver
              </h3>
              <CyberBadge variant="slate" size="xs">SYSTEM NETWORK LAYER</CyberBadge>
            </div>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
              Enforce system-wide ad, tracker, and malware blocking at the macOS network resolver level via AdGuard DNS or Cloudflare 1.1.1.1.
            </p>
          </div>

          <span className="text-xs font-mono text-[#f5f5f7] font-medium px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
            Active: {stats?.dnsProfile === 'adguard' ? 'AdGuard' : stats?.dnsProfile === 'cloudflare' ? 'Cloudflare 1.1.1.1' : 'Standard DHCP'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { id: 'adguard', name: 'AdGuard DNS', desc: 'Blocks ads, tracking cookies, and phishing domains system-wide.' },
            { id: 'cloudflare', name: 'Cloudflare 1.1.1.1', desc: 'Fastest DNS resolution with zero IP logging for maximum browsing speed.' },
            { id: 'default', name: 'Standard DHCP', desc: 'Restores standard ISP / router provided DNS configuration.' },
          ].map((profile) => (
            <button
              key={profile.id}
              onClick={() => triggerAction('set-dns-profile', { profile: profile.id }, 'Set DNS to ' + profile.name)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                (stats?.dnsProfile || 'default') === profile.id
                  ? 'bg-white/[0.08] border-white/20 text-[#f5f5f7]'
                  : 'bg-[#0a0a0c] border-white/[0.06] text-[#86868b] hover:border-white/[0.12]'
              }`}
            >
              <div>
                <div className="font-medium text-xs text-[#f5f5f7] flex items-center justify-between">
                  <span>{profile.name}</span>
                  {(stats?.dnsProfile || 'default') === profile.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
                  )}
                </div>
                <div className="text-[11px] text-[#86868b] mt-1 leading-relaxed">{profile.desc}</div>
              </div>
              <span className="text-[10px] font-mono text-[#86868b]">1-Click Switch</span>
            </button>
          ))}
        </div>
      </HoloCard>

      {/* 2. Apple Native Speedometer */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#86868b]" /> Native Network Speedometer
            </h3>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
              Measures download, upload, bufferbloat, and network responsiveness natively via <code className="text-[#f5f5f7]">/usr/bin/networkQuality</code>
            </p>
          </div>

          <TactileButton
            variant="secondary"
            size="sm"
            onClick={() => triggerAction('run-speed-test', {}, 'Run Apple Speed Test')}
          >
            Run Speedometer Test
          </TactileButton>
        </div>

        {stats?.networkQuality ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] text-center space-y-1">
              <span className="text-xs text-[#86868b]">Download</span>
              <div className="text-2xl font-bold text-[#f5f5f7] font-mono">{stats.networkQuality.dlMbps} <span className="text-xs text-[#86868b] font-normal">Mbps</span></div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] text-center space-y-1">
              <span className="text-xs text-[#86868b]">Upload</span>
              <div className="text-2xl font-bold text-[#f5f5f7] font-mono">{stats.networkQuality.ulMbps} <span className="text-xs text-[#86868b] font-normal">Mbps</span></div>
            </div>
            <div className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] text-center space-y-1">
              <span className="text-xs text-[#86868b]">Responsiveness</span>
              <div className="text-2xl font-bold text-[#f5f5f7] font-mono">{stats.networkQuality.responsivenessRpm} <span className="text-xs text-[#86868b] font-normal">RPM</span></div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#0a0a0c] border border-white/[0.04] text-center text-xs text-[#86868b]">
            Click "Run Speedometer Test" to benchmark your current Wi-Fi throughput and bufferbloat.
          </div>
        )}
      </HoloCard>

      {/* 3. Performance Profiles */}
      <HoloCard className="p-8 sm:p-10 space-y-5 bg-[#101010] border border-white/[0.08]">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#86868b]" /> macOS Animation & Performance Profiles
          </h3>
          <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">Control window animations and UI responsiveness curves</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { id: 'snappy', name: 'Snappy Mode', desc: '0ms delay, instant Finder, zero animation curves', icon: Zap },
            { id: 'balanced', name: 'Balanced Mode', desc: 'Subtle high-refresh animations, responsive feel', icon: Sparkles },
            { id: 'default', name: 'Default Mode', desc: 'Original macOS animations and delays', icon: Activity },
          ].map((prof) => (
            <button
              key={prof.id}
              onClick={() => {
                setPerfMode(prof.id as any);
                triggerAction('set-perf-mode', { duration: prof.id }, `Apply ${prof.name}`);
              }}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                perfMode === prof.id
                  ? 'bg-white/[0.08] border-white/20 text-[#f5f5f7]'
                  : 'bg-[#0a0a0c] border-white/[0.06] text-[#86868b] hover:border-white/[0.12]'
              }`}
            >
              <div>
                <prof.icon className={`w-4 h-4 mb-2.5 ${perfMode === prof.id ? 'text-[#f5f5f7]' : 'text-[#86868b]'}`} />
                <div className="font-semibold text-xs text-[#f5f5f7]">{prof.name}</div>
                <div className="text-[11px] text-[#86868b] mt-0.5 leading-relaxed">{prof.desc}</div>
              </div>
              {perfMode === prof.id && (
                <span className="text-[10px] font-mono text-[#30d158] font-semibold flex items-center gap-1 pt-2 border-t border-white/[0.06]">
                  <CheckCircle2 className="w-3 h-3" /> Enforced Active
                </span>
              )}
            </button>
          ))}
        </div>
      </HoloCard>

      {/* 4. Quick Toggle Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Desktop Icons */}
        <HoloCard className="p-6 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#f5f5f7]">
              {stats?.desktopIconsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </div>
            <CyberBadge variant="slate" size="xs">
              {stats?.desktopIconsHidden ? 'HIDDEN' : 'VISIBLE'}
            </CyberBadge>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f7]">Desktop Icons</h4>
            <p className="text-[11px] text-[#86868b] mt-0.5">Toggle desktop file icons for clean presentations.</p>
          </div>
          <TactileButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => triggerAction('toggle-desktop-icons', {}, 'Toggle Desktop Icons')}
          >
            {stats?.desktopIconsHidden ? 'Show Icons' : 'Hide Icons'}
          </TactileButton>
        </HoloCard>

        {/* Dark Mode */}
        <HoloCard className="p-6 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#f5f5f7]">
              <Moon className="w-4 h-4" />
            </div>
            <CyberBadge variant="slate" size="xs">THEME</CyberBadge>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f7]">Appearance Mode</h4>
            <p className="text-[11px] text-[#86868b] mt-0.5">Instantly toggle macOS Dark or Light mode.</p>
          </div>
          <TactileButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => triggerAction('toggle-dark-mode', {}, 'Toggle Appearance')}
          >
            Toggle Appearance
          </TactileButton>
        </HoloCard>

        {/* Sleep Display */}
        <HoloCard className="p-6 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#f5f5f7]">
              <Monitor className="w-4 h-4" />
            </div>
            <CyberBadge variant="slate" size="xs">DISPLAY</CyberBadge>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f7]">Sleep Display</h4>
            <p className="text-[11px] text-[#86868b] mt-0.5">Turn off screens immediately without sleeping Mac.</p>
          </div>
          <TactileButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => triggerAction('sleep-display', {}, 'Turn Off Display')}
          >
            Sleep Screen
          </TactileButton>
        </HoloCard>

        {/* Restart Audio */}
        <HoloCard className="p-6 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[#f5f5f7]">
              <Volume2 className="w-4 h-4" />
            </div>
            <CyberBadge variant="slate" size="xs">AUDIO</CyberBadge>
          </div>
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f7]">Restart CoreAudio</h4>
            <p className="text-[11px] text-[#86868b] mt-0.5">Fix crackling audio or Bluetooth headphone latency.</p>
          </div>
          <TactileButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => triggerAction('restart-audio', {}, 'Restart CoreAudio')}
          >
            Restart Audio
          </TactileButton>
        </HoloCard>
      </div>

      {/* 5. Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HoloCard className="p-6 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f7]">Spotlight Application Re-Index</h4>
            <p className="text-[11px] text-[#86868b] mt-0.5 leading-relaxed">
              Forces macOS to re-scan `/Applications` and restarts Spotlight daemons if apps don't show up in search.
            </p>
          </div>
          <TactileButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => triggerAction('fix-spotlight', {}, 'Spotlight Repair')}
          >
            Repair Spotlight
          </TactileButton>
        </HoloCard>

        <HoloCard className="p-6 flex flex-col justify-between space-y-4 bg-[#101010] border border-white/[0.08]">
          <div>
            <h4 className="font-semibold text-xs text-[#f5f5f7]">Flush DNS Resolver Cache</h4>
            <p className="text-[11px] text-[#86868b] mt-0.5 leading-relaxed">
              Flushes `mDNSResponder` if websites, local domains, or staging environments fail to resolve.
            </p>
          </div>
          <TactileButton
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => triggerAction('flush-dns', {}, 'Flush DNS Cache')}
          >
            Flush DNS Resolver
          </TactileButton>
        </HoloCard>
      </div>
    </div>
  );
};
