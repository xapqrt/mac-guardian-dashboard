import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Command, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from './utils/audio';

// Showcase Components & Persistent Shell
import { AppSidebar, DASHBOARD_NAV_ITEMS } from './components/AppSidebar';
import { AppleNavbar } from './components/AppleNavbar';
import { HeroShowcase } from './components/HeroShowcase';
import { ScrollStorySection } from './components/ScrollStorySection';
import { BentoSpecSheet } from './components/BentoSpecSheet';
import { AppleDynamicIsland } from './components/AppleDynamicIsland';
import { CosmicField } from './components/CosmicField';

// Detail Tabs & Tool Studios
import { EarbudsTab } from './components/EarbudsTab';
import { GazeSentryTab } from './components/GazeSentryTab';
import { ThermalTab } from './components/ThermalTab';
import { DevGhostHunter } from './components/DevGhostHunter';
import { PrivacyVaultTab } from './components/PrivacyVaultTab';
import { StorageTab } from './components/StorageTab';
import { ProcessesTab } from './components/ProcessesTab';
import { TweaksTab } from './components/TweaksTab';
import { StartupTab } from './components/StartupTab';

// Modals & Drawers
import { CommandPalette } from './components/CommandPalette';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { ActionHUD, ActionReceipt } from './components/ActionHUD';
import { SpecsModal } from './components/SpecsModal';
import { SupernovaModal } from './components/SupernovaModal';

export default function App() {
  const [stats, setStats] = useState<any>(null);

  // URL Hash-based Client-Side Routing
  const getInitialView = () => {
    if (typeof window === 'undefined') return 'overview';
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    const validViews = ['overview', 'sentry', 'thermal', 'storage', 'processes', 'dev', 'privacy', 'tweaks', 'startup'];
    if (validViews.includes(hash)) return hash;
    if (hash === 'developer') return 'dev';
    if (hash === 'controls') return 'tweaks';
    return 'overview';
  };

  const [currentView, setCurrentView] = useState<string>(getInitialView);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(2000);
  const [perfMode, setPerfMode] = useState<'snappy' | 'balanced' | 'default'>('snappy');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isReceiptsModalOpen, setIsReceiptsModalOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isSupernovaOpen, setIsSupernovaOpen] = useState(false);

  // Receipts
  const [receipts, setReceipts] = useState<ActionReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('guardian_receipts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [latestReceipt, setLatestReceipt] = useState<ActionReceipt | null>(null);

  const [logs, setLogs] = useState<Array<{ id: string; time: string; text: string; type: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), text: 'Apple Silicon Velocity Engine active. Sub-25ms response time.', type: 'info' }
  ]);

  const addLog = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setLogs(prev => [
      { id: Math.random().toString(36).substring(7), time: new Date().toLocaleTimeString(), text, type },
      ...prev.slice(0, 30)
    ]);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Sync route with URL hash on external changes (back/forward)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim().toLowerCase();
      const validViews = ['overview', 'sentry', 'thermal', 'storage', 'processes', 'dev', 'privacy', 'tweaks', 'startup'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      } else if (hash === 'developer') {
        setCurrentView('dev');
      } else if (hash === 'controls') {
        setCurrentView('tweaks');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateToView = (view: string) => {
    let mapped = view;
    if (view === 'developer') mapped = 'dev';
    if (view === 'controls') mapped = 'tweaks';
    if (view === 'studio') mapped = 'processes';
    if (view === 'specs' || view === 'story') mapped = 'overview';
    setCurrentView(mapped);
    window.location.hash = mapped;
  };

  // Global Keyboard Shortcuts (⌘K, ⌘J, ?, ⌘B, 1-9)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        sound.playClick();
        setIsAIOpen(prev => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        sound.playClick();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key.toLowerCase() === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        triggerAction('boost-quick', {}, 'Instant Mac Sweep');
      } else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        const viewMap: Record<string, string> = {
          '1': 'overview',
          '2': 'sentry',
          '3': 'thermal',
          '4': 'storage',
          '5': 'processes',
          '6': 'dev',
          '7': 'privacy',
          '8': 'tweaks',
          '9': 'startup',
        };
        const target = viewMap[e.key];
        if (target) {
          sound.playClick();
          navigateToView(target);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const triggerAction = async (action: string, payload: Record<string, any> = {}, label: string) => {
    sound.playClick();
    const actionKey = action + (payload.pid || payload.port || payload.agentName || payload.tweakKey || (typeof payload.filePath === 'string' ? payload.filePath : '') || '');
    setLoadingAction(actionKey);
    addLog(`Executing: ${label}...`, 'info');

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newReceipt: ActionReceipt = {
          id: Math.random().toString(36).substring(7),
          action,
          label,
          message: data.message,
          timestamp: new Date().toLocaleTimeString(),
          status: 'success',
        };

        setLatestReceipt(newReceipt);
        setReceipts(prev => {
          const updated = [newReceipt, ...prev.slice(0, 49)];
          localStorage.setItem('guardian_receipts', JSON.stringify(updated));
          return updated;
        });

        addLog(data.message, 'success');
        if (data.stats) setStats(data.stats);

        if (action === 'clean-ghost-folder' || action.includes('delete') || action.includes('purge')) {
          sound.playPurge();
        } else if (action === 'reap-chrome-tabs') {
          sound.playReap();
        } else if (action.includes('boost') || action.includes('clean') || action.includes('prune')) {
          sound.playSuccess();
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.82 },
              colors: ['#7C3AED', '#22D3EE', '#F5F5F7', '#EF4444'],
              disableForReducedMotion: true,
            });
          } catch (e) {}
        } else {
          sound.playClick();
        }

        setTimeout(() => {
          setLatestReceipt(prev => (prev?.id === newReceipt.id ? null : prev));
        }, 6500);
      } else {
        throw new Error(data.error || 'Action execution failed');
      }
    } catch (err: any) {
      addLog(`Error: ${err.message}`, 'error');
      const errorReceipt: ActionReceipt = {
        id: Math.random().toString(36).substring(7),
        action,
        label,
        message: `Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'error',
      };
      setLatestReceipt(errorReceipt);
    } finally {
      setLoadingAction(null);
    }
  };

  const clearAllReceipts = () => {
    setReceipts([]);
    localStorage.removeItem('guardian_receipts');
    setLatestReceipt(null);
  };

  const healthScore = useMemo(() => {
    if (!stats) return 98;
    let score = 100;
    if (stats.ram?.percent > 75) score -= 8;
    if (stats.ram?.percent > 90) score -= 14;
    if (stats.ram?.swapUsedMb > 1000) score -= 10;
    if (parseInt(stats.disk?.capacity || '0', 10) > 85) score -= 10;
    return Math.max(50, score);
  }, [stats]);

  return (
    <div className="min-h-screen bg-[#08080a] text-[#F5F5F7] flex flex-row font-sans selection:bg-[#7C3AED]/30 relative selection:text-white overflow-hidden">
      {/* Subtle Apple Ambient Backlight Glow */}
      <CosmicField />

      {/* 1. Left Sidebar: Fixed Width (w-64), Full Height, Always Visible Persistent Nav */}
      <AppSidebar
        currentView={currentView}
        onSelectView={navigateToView}
        stats={stats}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenReceipts={() => setIsReceiptsModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        receiptCount={receipts.length}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* 2. Main Dashboard Content Area: flex-1, Full Remaining Width, Internal Scroll, Unconstrained Viewport */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto flex flex-col relative z-10">
        {/* Top Header with Global Search (⌘K) */}
        <AppleNavbar
          chipName={stats?.specs?.chip || 'Apple M4'}
          activeSection={currentView}
          onNavigate={navigateToView}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenCmd={() => setIsCmdOpen(true)}
          onOpenReceipts={() => setIsReceiptsModalOpen(true)}
          onOpenSpecs={() => setIsSpecsOpen(true)}
          onQuickSweep={() => triggerAction('boost-quick', {}, 'Instant Mac Sweep')}
          isSweeping={loadingAction === 'boost-quick'}
          receiptCount={receipts.length}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onRescan={() => triggerAction('rescan-all', {}, 'Complete System Rescan')}
          isScanning={loadingAction === 'rescan-all' || !!stats?.isScanningStorage}
        />

        {/* Top Island Action Verification HUD */}
        <ActionHUD
          latestReceipt={latestReceipt}
          allReceipts={receipts}
          onDismiss={() => setLatestReceipt(null)}
          onClearReceipts={clearAllReceipts}
        />

        {/* Morphing Dynamic Island Floating Cockpit */}
        <div className="pt-2 sticky top-20 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <AppleDynamicIsland
              stats={stats}
              healthScore={healthScore}
              triggerAction={triggerAction}
              loadingAction={loadingAction}
              onOpenSpecs={() => setIsSpecsOpen(true)}
            />
          </div>
        </div>

        {/* View Route Container: Full Width, No Max-W Constraint */}
        <div className="flex-1 w-full px-4 sm:px-8 py-6 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full space-y-8"
            >
              {/* VIEW: OVERVIEW */}
              {currentView === 'overview' && (
                <div className="space-y-12 w-full">
                  <HeroShowcase
                    stats={stats}
                    healthScore={healthScore}
                    triggerAction={triggerAction}
                    loadingAction={loadingAction}
                    onOpenSpecs={() => setIsSpecsOpen(true)}
                    onOpenAI={() => setIsAIOpen(true)}
                  />
                  <BentoSpecSheet
                    stats={stats}
                    triggerAction={triggerAction}
                    loadingAction={loadingAction}
                    onOpenSpecs={() => setIsSpecsOpen(true)}
                    onNavigateTab={navigateToView}
                  />
                  <ScrollStorySection
                    stats={stats}
                    onExploreFeature={navigateToView}
                  />
                </div>
              )}

              {/* VIEW: SENTRY (GHOSTKEY & GAZE) */}
              {currentView === 'sentry' && (
                <div className="w-full space-y-8">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#22D3EE]">Spatial Sentry</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      GhostKey & Gaze Studio.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Fine-tune stem squeeze thresholds, headphone acoustics, and on-device gaze estimation with local Neural Engine acceleration.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                      <h3 className="text-sm font-semibold text-[#F5F5F7] mb-4 flex items-center justify-between">
                        <span>OnePlus Buds 4 Stem Controls</span>
                        <span className="text-xs text-[#22D3EE] font-mono">Connected</span>
                      </h3>
                      <EarbudsTab />
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                      <h3 className="text-sm font-semibold text-[#F5F5F7] mb-4 flex items-center justify-between">
                        <span>Gaze & Bezel Sentry</span>
                        <span className="text-xs text-[#7C3AED] font-mono">Local Neural Engine</span>
                      </h3>
                      <GazeSentryTab />
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: THERMAL & BATTERY */}
              {currentView === 'thermal' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#7C3AED]">Thermal Telemetry</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Thermal & Battery Studio.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Real-time Apple Silicon die temperatures, cooling fans, and Li-ion degradation analytics.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <ThermalTab stats={stats} triggerAction={triggerAction} loadingAction={loadingAction} />
                  </div>
                </div>
              )}

              {/* VIEW: APFS STORAGE */}
              {currentView === 'storage' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#22D3EE]">APFS Storage Engine</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Storage & Sunburst Explorer.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Interactive sunburst disk allocation, developer ghost folders, and heavy downloads hunter with surgical filtering.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <StorageTab stats={stats} triggerAction={triggerAction} />
                  </div>
                </div>
              )}

              {/* VIEW: PROCESSES & RAM */}
              {currentView === 'processes' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#7C3AED]">Kernel Activity Monitor</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Processes & Safety Inspector.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Apple kernel protection guards, RAM compression rings, and surgical thread termination with reusable multi-criteria filtering.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <ProcessesTab stats={stats} triggerAction={triggerAction} />
                  </div>
                </div>
              )}

              {/* VIEW: DEV GHOST HUNTER & PORTS */}
              {currentView === 'dev' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#22D3EE]">Developer Tools</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Dev Ghost Hunter & Port Sentry.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Detect stuck Node/Python compilers, nuke rogue listening sockets, and inspect compiler matrices.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <DevGhostHunter stats={stats} triggerAction={triggerAction} loadingAction={loadingAction} />
                  </div>
                </div>
              )}

              {/* VIEW: PRIVACY VAULT */}
              {currentView === 'privacy' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#EF4444]">Kernel Defense</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Privacy Vault & Hygiene Cockpit.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Memory-resident clipboard shredder, hardware microphone lockdown, and browser tracking artifact purges.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <PrivacyVaultTab stats={stats} triggerAction={triggerAction} loadingAction={loadingAction} />
                  </div>
                </div>
              )}

              {/* VIEW: TITANIUM TWEAKS */}
              {currentView === 'tweaks' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#7C3AED]">System Optimization</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Titanium Controls & Audio Studio.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      CoreAudio latency repair, performance governors, and appearance toggles.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <TweaksTab stats={stats} perfMode={perfMode} setPerfMode={setPerfMode} triggerAction={triggerAction} />
                  </div>
                </div>
              )}

              {/* VIEW: STARTUP DAEMONS */}
              {currentView === 'startup' && (
                <div className="w-full space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#22D3EE]">Boot Acceleration</span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#F5F5F7]">
                      Startup LaunchAgents Manager.
                    </h2>
                    <p className="text-[#8A8A93] text-sm max-w-2xl">
                      Audit and disable background login items, updater daemons, and memory-hogging background applications.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.12)]">
                    <StartupTab stats={stats} triggerAction={triggerAction} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Frosted Glass Footer */}
        <footer className="border-t border-white/10 bg-[#08080a]/90 backdrop-blur-xl px-6 sm:px-12 py-6 text-xs text-[#8A8A93] flex flex-wrap items-center justify-between gap-4 mt-auto">
          <div className="flex items-center gap-2.5">
            <span className="text-[#F5F5F7] font-medium">Mac Guardian Pro</span>
            <span>•</span>
            <span>{stats?.specs?.chip || 'Apple Silicon'} ({stats?.specs?.model || 'MacBook Pro'})</span>
            <span>•</span>
            <span className="text-[#22D3EE] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
              Kernel Active
            </span>
          </div>
          <div className="flex items-center gap-5 text-[#8A8A93]">
            <button
              onClick={() => setIsReceiptsModalOpen(true)}
              className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Receipts</span>
              <span className="px-1.5 py-0.2 rounded-2xl bg-white/10 text-[10px] text-white border border-white/10">{receipts.length}</span>
            </button>
            <button
              onClick={() => setIsAIOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              AI Studio (⌘J)
            </button>
            <button onClick={() => setIsShortcutsOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Shortcuts (?)
            </button>
            <button onClick={() => setIsSpecsOpen(true)} className="hover:text-white transition-colors cursor-pointer">
              Die Specs
            </button>
          </div>
        </footer>
      </main>

      {/* Global Modals & Dialogs */}
      <SupernovaModal
        isOpen={isSupernovaOpen}
        onClose={() => setIsSupernovaOpen(false)}
        onConfirm={() => {
          setIsSupernovaOpen(false);
          triggerAction('supernova-kill-everything', {}, 'SUPERNOVA: Nuclear Purge');
        }}
        loading={loadingAction === 'supernova-kill-everything'}
      />

      <SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
        stats={stats}
      />

      {isReceiptsModalOpen && (
        <ActionHUD
          latestReceipt={null}
          allReceipts={receipts}
          onDismiss={() => {}}
          onClearReceipts={clearAllReceipts}
        />
      )}

      <AICopilotDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onStatsUpdate={(newStats) => setStats(newStats)}
      />

      {/* Global Search & Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        triggerAction={triggerAction}
        setActiveTab={navigateToView}
        stats={stats}
      />

      {/* Keyboard Shortcuts Modal (?) */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4" 
            onClick={() => setIsShortcutsOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl bg-[#0e0e12] border border-white/10 p-6 space-y-4 shadow-[0_0_40px_rgba(124,58,237,0.2)] text-xs" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="font-semibold text-sm text-[#F5F5F7] flex items-center gap-2">
                  <Command className="w-4 h-4 text-[#7C3AED]" /> Keyboard Shortcuts
                </h3>
                <button 
                  onClick={() => setIsShortcutsOpen(false)} 
                  className="text-[#8A8A93] hover:text-white transition-colors p-1 rounded-xl hover:bg-white/5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-[#8A8A93]">Global Search / Command Palette</span>
                  <kbd className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono border border-white/10 text-[11px]">⌘K</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-[#8A8A93]">Guardian AI Studio</span>
                  <kbd className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono border border-white/10 text-[11px]">⌘J</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-[#8A8A93]">Instant Mac Sweep</span>
                  <kbd className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono border border-white/10 text-[11px]">⌘B</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                  <span className="text-[#8A8A93]">Direct View Switch</span>
                  <kbd className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono border border-white/10 text-[11px]">1 - 9</kbd>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#8A8A93]">Close Overlays</span>
                  <kbd className="px-2 py-0.5 rounded-lg bg-white/10 text-white font-mono border border-white/10 text-[11px]">ESC</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
