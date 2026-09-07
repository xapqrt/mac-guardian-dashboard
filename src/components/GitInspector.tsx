import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { HoloCard, TactileButton, CyberBadge } from './UIElements';
import { sound } from '../utils/audio';

interface GitRepoItem {
  name: string;
  path: string;
  branch: string;
  dirtyCount: number;
  gitSize: string;
  isDirty: boolean;
}

interface GitInspectorProps {
  repos: GitRepoItem[];
  onCompactRepo: (repoPath: string, name: string) => void;
  onRevealRepo: (path: string) => void;
  onRescan?: () => void;
}

export const GitInspector: React.FC<GitInspectorProps> = ({
  repos = [],
  onCompactRepo,
  onRevealRepo,
  onRescan
}) => {
  const [compactedRepos, setCompactedRepos] = useState<string[]>([]);

  const handleCompact = (repo: GitRepoItem) => {
    sound.playSuccess();
    setCompactedRepos((prev) => [...prev, repo.name]);
    onCompactRepo(repo.path, repo.name);
  };

  return (
    <HoloCard className="p-8 sm:p-12 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <GitBranch className="w-5 h-5 text-amber-400" /> Git Repository Health & Object Optimizer
            </h3>
            <CyberBadge variant="amber" size="xs">DEV ENGINE</CyberBadge>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Audits local repositories for uncommitted changes, dangling stashes, and oversized <code className="text-amber-300">.git/objects</code> directories. Run garbage collection (<code className="text-amber-300">git gc</code>) to shrink repository sizes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRescan && (
            <TactileButton
              variant="secondary"
              size="sm"
              onClick={onRescan}
            >
              ↻ Rescan Git
            </TactileButton>
          )}
          <span className="text-xs font-mono text-slate-400">
            {repos.length} Repositories Monitored
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        {repos.length > 0 ? (
          repos.map((repo) => {
            const isCompacted = compactedRepos.includes(repo.name);

            return (
              <div
                key={repo.name}
                className="p-5 rounded-2xl bg-black/30 border border-white/[0.05] hover:border-white/15 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white truncate max-w-[190px]">{repo.name}</span>
                    <button
                      onClick={() => onRevealRepo(repo.path)}
                      title="Reveal Repo in Finder"
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <GitBranch className="w-3 h-3 text-amber-400" />
                    <span>{repo.branch}</span>
                    <span>•</span>
                    <span className="text-slate-500 truncate max-w-[120px]">{repo.path}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <div>
                    {repo.isDirty ? (
                      <span className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {repo.dirtyCount} modified
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Clean Tree
                      </span>
                    )}
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">.git size: {repo.gitSize}</div>
                  </div>

                  {isCompacted ? (
                    <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Compacted
                    </span>
                  ) : (
                    <TactileButton
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCompact(repo)}
                    >
                      Compact .git
                    </TactileButton>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 col-span-3 font-mono">
            Scanning for Git repositories in ~/Developer and ~/Documents...
          </div>
        )}
      </div>
    </HoloCard>
  );
};
