import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  Camera,
  FileCode,
  FolderOpen,
  AppWindow,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckSquare,
  Square,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge } from './UIElements';
import { FilterBar } from './FilterBar';
import { SunburstDisk } from './SunburstDisk';
import { AppUninstaller } from './AppUninstaller';
import { GitInspector } from './GitInspector';

interface GhostDirItem {
  path: string;
  project: string;
  type: string;
  size: string;
}

interface StorageTabProps {
  stats: any;
  triggerAction: (action: string, payload: Record<string, any>, label: string) => void;
}

export const StorageTab: React.FC<StorageTabProps> = ({
  stats,
  triggerAction
}) => {
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'dmg' | 'zip' | 'app'>('all');
  const [fileSearch, setFileSearch] = useState('');
  const [fileSort, setFileSort] = useState<'size' | 'name'>('size');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [purgedPaths, setPurgedPaths] = useState<string[]>([]);
  const [deletedFilePaths, setDeletedFilePaths] = useState<string[]>([]);

  const filteredFiles = useMemo(() => {
    if (!stats?.largeFiles) return [];
    let list = stats.largeFiles.filter((f: any) => {
      if (fileSearch) {
        const q = fileSearch.toLowerCase();
        if (!f.name.toLowerCase().includes(q) && !f.path.toLowerCase().includes(q)) return false;
      }
      if (fileTypeFilter === 'dmg' && !f.name.endsWith('.dmg')) return false;
      if (fileTypeFilter === 'zip' && !f.name.endsWith('.zip') && !f.name.endsWith('.tar') && !f.name.endsWith('.gz')) return false;
      if (fileTypeFilter === 'app' && !f.name.endsWith('.app') && !f.path.includes('.app')) return false;
      return true;
    });

    if (fileSort === 'name') {
      list = [...list].sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
    return list;
  }, [stats?.largeFiles, fileTypeFilter, fileSearch, fileSort]);

  const toggleSelectFile = (path: string) => {
    setSelectedFiles(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const selectAllFilteredFiles = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f: any) => f.path));
    }
  };

  const handlePurgeGhost = (dir: GhostDirItem) => {
    setPurgedPaths(prev => [...prev, dir.path]);
    triggerAction('clean-ghost-folder', { filePath: dir.path }, `Purge ${dir.project}/${dir.type}`);
  };

  const handleDeleteFile = (filePath: string, name: string) => {
    setDeletedFilePaths(prev => [...prev, filePath]);
    triggerAction('delete-file', { filePath }, `Delete ${name}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 bg-[#000000] text-[#f5f5f7]">
      {/* 0. DaisyDisk-Style Sunburst Disk Visualizer */}
      {stats?.sunburstData && (
        <SunburstDisk
          data={stats.sunburstData}
          totalDiskUsed={stats?.disk?.used}
          onRevealPath={(p) => triggerAction('reveal-file', { filePath: p }, 'Reveal ' + p)}
          onRescan={() => triggerAction('rescan-sunburst', {}, 'Rescan Disk Storage Allocation')}
        />
      )}

      {/* 1. Developer Ghost Directory Hunter */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#86868b]" /> Developer Ghost Directory Hunter
              </h3>
              <CyberBadge variant="slate" size="xs">SSD RECOVERY</CyberBadge>
            </div>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
              Scans projects for heavy abandoned dependency folders (<code className="text-[#f5f5f7]">node_modules</code>, <code className="text-[#f5f5f7]">target</code>, <code className="text-[#f5f5f7]">.venv</code>). 1-click purge reclaims 10–50 GB instantly.
            </p>
          </div>

          <TactileButton
            variant="secondary"
            size="sm"
            disabled={stats?.isScanningStorage}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${stats?.isScanningStorage ? 'animate-spin' : ''}`} />}
            onClick={() => triggerAction('scan-storage', {}, 'Rescan Ghost Directories')}
          >
            {stats?.isScanningStorage ? 'Scanning Projects...' : 'Scan Projects'}
          </TactileButton>
        </div>

        {/* Inline success banner if folders were purged */}
        {purgedPaths.length > 0 && (
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-[#f5f5f7] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
            <span>
              <strong>Purge Complete:</strong> {purgedPaths.length} ghost dependency folders purged.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {stats?.ghostDirs && stats.ghostDirs.length > 0 ? (
            stats.ghostDirs.map((dir: GhostDirItem, idx: number) => {
              const isPurged = purgedPaths.includes(dir.path);
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isPurged
                      ? 'bg-transparent border-white/[0.04] opacity-50'
                      : 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-xs truncate max-w-[180px] ${isPurged ? 'line-through text-[#86868b]' : 'text-[#f5f5f7]'}`}>
                        {dir.project}
                      </span>
                      <CyberBadge variant="slate" size="xs">
                        {isPurged ? 'PURGED' : dir.type}
                      </CyberBadge>
                    </div>
                    <div className="text-[11px] text-[#86868b] font-mono truncate">{dir.path}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <span className="font-mono text-xs text-[#f5f5f7] font-semibold">{dir.size}</span>
                    
                    {isPurged ? (
                      <span className="text-[11px] text-[#30d158] font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reclaimed
                      </span>
                    ) : (
                      <TactileButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePurgeGhost(dir)}
                      >
                        Purge
                      </TactileButton>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-2xl bg-[#0a0a0c] border border-white/[0.04] text-center text-xs text-[#86868b] col-span-3">
              Click "Scan Projects" to search your Developer & Documents folders for abandoned ghost folders.
            </div>
          )}
        </div>
      </HoloCard>

      {/* CleanMyMac Tier App Debris Hunter */}
      {stats?.installedApps && stats.installedApps.length > 0 && (
        <AppUninstaller
          apps={stats.installedApps}
          onPurgeDebris={(app) => triggerAction('uninstall-app-debris', { debrisPath: app.debrisPath }, 'Purge debris for ' + app.name)}
          onRevealApp={(appPath) => triggerAction('reveal-file', { filePath: appPath }, 'Reveal ' + appPath)}
          onUninstallApp={(app) => triggerAction('uninstall-app-complete', { appPath: app.path, debrisPath: app.debrisPath }, 'Delete Application ' + app.name)}
          onRescan={() => triggerAction('rescan-apps', {}, 'Rescan Applications & Debris')}
        />
      )}

      {/* Developer Git Repositories Health & Compaction */}
      {stats?.gitRepos && stats.gitRepos.length > 0 && (
        <GitInspector
          repos={stats.gitRepos}
          onCompactRepo={(rPath, rName) => triggerAction('git-gc-repo', { repoPath: rPath }, 'Compact Git Repo ' + rName)}
          onRevealRepo={(rPath) => triggerAction('reveal-file', { filePath: rPath }, 'Reveal ' + rPath)}
          onRescan={() => triggerAction('rescan-git', {}, 'Rescan Developer Git Repositories')}
        />
      )}

      {/* 2. APFS Local Snapshots Manager */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#86868b]" /> APFS Local Snapshots Manager
              </h3>
              <CyberBadge variant="slate" size="xs">TIME MACHINE</CyberBadge>
            </div>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">
              Hidden Time Machine and OS snapshots consuming disk capacity silently in the background. Pruning them reclaims 10–30 GB without deleting any user documents.
            </p>
          </div>

          <TactileButton
            variant="secondary"
            size="sm"
            onClick={() => triggerAction('prune-apfs-snapshots', {}, 'Prune APFS Snapshots')}
          >
            Prune Local Snapshots
          </TactileButton>
        </div>

        <div className="space-y-2 pt-2">
          {stats?.apfsSnapshots && stats.apfsSnapshots.length > 0 ? (
            stats.apfsSnapshots.map((snap: string, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0a0a0c] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <span className="font-mono text-[#f5f5f7] text-xs truncate max-w-xl">{snap}</span>
                <CyberBadge variant="slate" size="xs">APFS SNAPSHOT</CyberBadge>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-xl bg-[#0a0a0c] border border-white/[0.04] text-center text-xs text-[#86868b] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
              <span>All local APFS snapshots are clean. No hidden backup storage held.</span>
            </div>
          )}
        </div>
      </HoloCard>

      {/* 3. Developer Build Caches */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#86868b]" /> Package Manager & Tool Caches
            </h3>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">Persistent packages cached by Homebrew, NPM, UV, and Xcode DerivedData</p>
          </div>

          <TactileButton
            variant="primary"
            size="sm"
            onClick={() => triggerAction('clean-dev-caches', {}, 'Flush Developer Caches')}
          >
            Flush All Package Caches
          </TactileButton>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[
            { label: 'NPM Cache', size: stats?.devCaches?.npm || '0B' },
            { label: 'Homebrew Cache', size: stats?.devCaches?.brew || '0B' },
            { label: 'UV / Pip Cache', size: stats?.devCaches?.uv || '0B' },
            { label: 'Xcode DerivedData', size: stats?.devCaches?.xcode || '0B' },
          ].map((c) => (
            <div key={c.label} className="p-5 rounded-2xl bg-[#0a0a0c] border border-white/[0.06] space-y-1">
              <span className="text-xs text-[#86868b] font-medium">{c.label}</span>
              <div className="text-xl font-semibold text-[#f5f5f7] font-mono">{c.size}</div>
            </div>
          ))}
        </div>
      </HoloCard>

      {/* 4. Large Downloads Hunter */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#86868b]" /> Heavy Downloads Hunter
            </h3>
            <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">Heavy installers (.dmg, .zip) sitting in your Downloads folder</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedFiles.length > 0 && (
              <TactileButton
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => triggerAction('batch-delete-files', { filePath: selectedFiles }, `Batch Delete ${selectedFiles.length} files`)}
              >
                Delete Selected ({selectedFiles.length})
              </TactileButton>
            )}
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={() => triggerAction('empty-trash', {}, 'Empty Trash')}
            >
              Empty Trash
            </TactileButton>
          </div>
        </div>

        {/* Filters Toolbar */}
        <FilterBar
          search={fileSearch}
          onSearchChange={setFileSearch}
          searchPlaceholder="Search files by name or path..."
          categories={[
            { id: 'all', label: 'All Files' },
            { id: 'dmg', label: 'DMG Installers' },
            { id: 'zip', label: 'Archives' },
            { id: 'app', label: 'Applications' },
          ]}
          selectedCategory={fileTypeFilter}
          onCategoryChange={(c) => setFileTypeFilter(c as any)}
          sortOptions={[
            { id: 'size', label: 'SIZE' },
            { id: 'name', label: 'NAME' },
          ]}
          selectedSort={fileSort}
          onSortChange={(s) => setFileSort(s as any)}
          rightActions={
            filteredFiles.length > 0 ? (
              <button
                onClick={selectAllFilteredFiles}
                className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#8A8A93] hover:text-[#F5F5F7] font-medium transition-all cursor-pointer"
              >
                {selectedFiles.length === filteredFiles.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#22D3EE]" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-[#8A8A93]" />
                )}
                <span>Select All ({filteredFiles.length})</span>
              </button>
            ) : null
          }
        />

        {/* File List */}
        <div className="space-y-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file: any, idx: number) => {
              const isSelected = selectedFiles.includes(file.path);
              const isDeleted = deletedFilePaths.includes(file.path);

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isDeleted
                      ? 'bg-transparent border-white/[0.04] opacity-50'
                      : isSelected
                      ? 'bg-white/[0.06] border-white/20'
                      : 'bg-[#0a0a0c] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                    <button onClick={() => toggleSelectFile(file.path)} className="shrink-0" disabled={isDeleted}>
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#f5f5f7]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#86868b]" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium text-xs truncate ${isDeleted ? 'line-through text-[#86868b]' : 'text-[#f5f5f7]'}`}>
                        {file.name}
                      </div>
                      <div className="text-[11px] text-[#86868b] font-mono truncate mt-0.5">{file.path}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#f5f5f7] font-semibold border border-white/[0.06]">
                      {file.size}
                    </span>
                    <button
                      onClick={() => triggerAction('reveal-file', { filePath: file.path }, `Reveal ${file.name}`)}
                      title="Reveal in Finder"
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {isDeleted ? (
                      <span className="text-xs text-[#ff453a] font-mono font-medium px-2">Deleted</span>
                    ) : (
                      <TactileButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteFile(file.path, file.name)}
                      >
                        Delete
                      </TactileButton>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-xl bg-[#0a0a0c] border border-white/[0.04] text-center text-xs text-[#86868b]">
              No files found matching the current filter.
            </div>
          )}
        </div>
      </HoloCard>

      {/* 5. App Data Inspector */}
      <HoloCard className="p-8 sm:p-10 space-y-6 bg-[#101010] border border-white/[0.08]">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#f5f5f7] flex items-center gap-2">
            <AppWindow className="w-4 h-4 text-[#86868b]" /> App Storage Inspector (~/Library/Application Support)
          </h3>
          <p className="text-xs text-[#86868b] max-w-2xl leading-relaxed">Heavy offline caches and persistent data stores</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats?.appStorage && stats.appStorage.length > 0 ? (
            stats.appStorage.map((app: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#0a0a0c] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="font-medium text-xs text-[#f5f5f7] truncate">{app.name}</div>
                  <div className="text-[11px] text-[#86868b] font-mono truncate mt-0.5">{app.path}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#86868b] border border-white/[0.06]">
                    {app.size}
                  </span>
                  <TactileButton
                    variant="secondary"
                    size="sm"
                    onClick={() => triggerAction('clean-app-support', { filePath: app.path }, `Purge ${app.name}`)}
                  >
                    Purge
                  </TactileButton>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#86868b] py-4">Scanning application support storage...</div>
          )}
        </div>
      </HoloCard>
    </div>
  );
};
