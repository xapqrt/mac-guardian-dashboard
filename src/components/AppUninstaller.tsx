import React, { useState } from 'react';
import {
  Package,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge } from './UIElements';
import { sound } from '../utils/audio';

interface InstalledAppItem {
  name: string;
  fileName: string;
  path: string;
  binarySize: string;
  debrisSize: string;
  debrisPath: string;
  hasDebris: boolean;
}

interface AppUninstallerProps {
  apps: InstalledAppItem[];
  onPurgeDebris: (app: InstalledAppItem) => void;
  onRevealApp: (path: string) => void;
  onRescan?: () => void;
  onUninstallApp?: (app: InstalledAppItem) => void;
}

export const AppUninstaller: React.FC<AppUninstallerProps> = ({
  apps = [],
  onPurgeDebris,
  onRevealApp,
  onRescan,
  onUninstallApp
}) => {
  const [search, setSearch] = useState('');
  const [purgedApps, setPurgedApps] = useState<string[]>([]);
  const [uninstalledApps, setUninstalledApps] = useState<string[]>([]);
  const [confirmApp, setConfirmApp] = useState<InstalledAppItem | null>(null);

  const filteredApps = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePurge = (app: InstalledAppItem) => {
    sound.playPurge();
    setPurgedApps((prev) => [...prev, app.name]);
    onPurgeDebris(app);
  };

  return (
    <HoloCard className="p-8 sm:p-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Package className="w-5 h-5 text-pink-400" /> App Leftover Debris Hunter
            </h3>
            <CyberBadge variant="purple" size="xs">CLEANMYMAC TIER</CyberBadge>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Identifies gigabytes of scattered application residue (<code className="text-purple-300">~/Library/Application Support</code>, offline caches, and preferences) left behind by installed applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRescan && (
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={onRescan}
            >
              ↻ Rescan Apps
            </TactileButton>
          )}
          <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/25"
          />
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => {
            const isPurged = purgedApps.includes(app.name);
            const isUninstalled = uninstalledApps.includes(app.name);

            return (
              <div
                key={app.name}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isPurged
                    ? 'bg-emerald-950/20 border-emerald-500/30 opacity-70'
                    : 'bg-black/30 border-white/[0.05] hover:border-white/15'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white truncate max-w-[190px]">{app.name}</span>
                    <button
                      onClick={() => onRevealApp(app.path)}
                      title="Reveal App in Finder"
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">App Binary: {app.binarySize}</div>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Library Debris</span>
                    <div className="text-xs font-mono font-bold text-pink-400">
                      {isPurged ? '0 MB (Clean)' : app.debrisSize}
                    </div>
                  </div>

                  {isUninstalled ? (
                    <span className="text-xs text-rose-400 font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> App Deleted
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {app.hasDebris && !isPurged && (
                        <button
                          onClick={() => handlePurge(app)}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 text-[11px] font-semibold transition-colors"
                        >
                          Purge Debris
                        </button>
                      )}
                      {onUninstallApp && (
                        <button
                          onClick={() => setConfirmApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors"
                        >
                          Delete App
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 col-span-3 font-mono">
            No matching applications found.
          </div>
        )}
      </div>
          {/* Confirmation Modal for Complete App Deletion */}
      {confirmApp && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setConfirmApp(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0e0e12] border border-white/10 p-8 space-y-6 shadow-[0_0_40px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete {confirmApp.name}?</h3>
                <p className="text-xs text-rose-300/70 mt-0.5">Move to Trash and erase library debris</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Application Binary:</span>
                <span className="text-white font-bold">{confirmApp.binarySize}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Library Residue:</span>
                <span className="text-pink-400 font-bold">{confirmApp.debrisSize}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setConfirmApp(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sound.playPurge();
                  setUninstalledApps((prev) => [...prev, confirmApp.name]);
                  if (onUninstallApp) onUninstallApp(confirmApp);
                  setConfirmApp(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </HoloCard>
  );
};
