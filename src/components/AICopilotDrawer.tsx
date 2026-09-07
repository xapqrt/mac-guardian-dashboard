import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  Key,
  Settings,
  X,
  CheckCircle2,
  Zap,
  Chrome,
  ShieldAlert,
  Loader2,
  Trash2,
  RefreshCw,
  Search,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Play,
  Sparkles,
  Layers,
  HardDrive
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ActionRec {
  action: string;
  payload: Record<string, any>;
  label: string;
  desc: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: Array<{ action: string; message: string }>;
  recommendations?: ActionRec[];
  completedRecs?: string[];
  time: string;
}

interface OpenRouterModel {
  id: string;
  name: string;
  context: number;
  description: string;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdate: (stats: any) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onStatsUpdate,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openrouter_key') || '');
  const [model, setModel] = useState<string>(() => localStorage.getItem('openrouter_model') || 'openrouter/free');
  const [availableModels, setAvailableModels] = useState<OpenRouterModel[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(!localStorage.getItem('openrouter_key'));
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executingActionKey, setExecutingActionKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to Guardian AI Studio ⚡\nI have complete, non-invasive real-time visibility into your Mac's hardware & applications:\n- **Live Chrome Tabs** (titles & domains)\n- **Unified Memory & Swap Pressure**\n- **Project Ghost Folders** (\`node_modules\`, \`target\`, \`.venv\`)\n- **macOS Sleep Blockers & Wake Locks**\n\nAsk me anything! For example: *"What are my Chrome tabs?"*, *"Why is swap high?"*, or *"Give me a full health summary."*`,
      recommendations: [
        {
          action: 'boost-quick',
          payload: { action: 'boost-quick' },
          label: 'One-Click Memory Sweep',
          desc: 'Purge transient buffers and reclaim RAM'
        },
        {
          action: 'reap-chrome-tabs',
          payload: { action: 'reap-chrome-tabs' },
          label: 'Reap Heavy Chrome Tabs',
          desc: 'Sleep tabs >400MB without closing Chrome'
        },
        {
          action: 'boss-key-reap',
          payload: { action: 'boss-key-reap' },
          label: 'Focus Mode (Boss Key)',
          desc: 'Quit Discord, Slack, Spotify, Steam'
        }
      ],
      completedRecs: [],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchLiveModels = async () => {
    setIsFetchingModels(true);
    try {
      const res = await fetch('/api/ai/models');
      if (res.ok) {
        const data = await res.json();
        if (data.models && data.models.length > 0) {
          setAvailableModels(data.models);
          if (!data.models.some((m: OpenRouterModel) => m.id === model)) {
            const defaultModel = data.models.find((m: OpenRouterModel) => m.id === 'openrouter/free')?.id || data.models[0].id;
            setModel(defaultModel);
            localStorage.setItem('openrouter_model', defaultModel);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch models:', e);
    } finally {
      setIsFetchingModels(false);
    }
  };

  useEffect(() => {
    fetchLiveModels();
  }, []);

  useEffect(() => {
    if (isOpen) {
      sound.playClick();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveSettings = (newKey: string, newModel: string) => {
    sound.playClick();
    setApiKey(newKey);
    setModel(newModel);
    localStorage.setItem('openrouter_key', newKey);
    localStorage.setItem('openrouter_model', newModel);
    setIsSettingsOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const executeRecommendation = async (rec: ActionRec, msgId: string) => {
    sound.playClick();
    const actionKey = `${msgId}_${rec.action}`;
    setExecutingActionKey(actionKey);

    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: rec.action, ...rec.payload }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        sound.playSuccess();
        if (data.stats) {
          onStatsUpdate(data.stats);
        }

        setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return {
              ...m,
              completedRecs: [...(m.completedRecs || []), rec.action],
              actions: [...(m.actions || []), { action: rec.action, message: data.message }]
            };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingActionKey(null);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    sound.playClick();
    setInput('');
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: history,
          apiKey,
          model,
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const assistantMsg: Message = {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: data.reply,
          actions: data.executedActions || [],
          recommendations: data.recommendations || [],
          completedRecs: [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
        if (data.executedActions && data.executedActions.length > 0) {
          sound.playSuccess();
        }
        if (data.stats) {
          onStatsUpdate(data.stats);
        }
      } else {
        throw new Error(data.error || 'Failed to get response from OpenRouter.');
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: `⚠️ **Error:** ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = availableModels.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const selectedModelObj = availableModels.find(m => m.id === model);

  const quickPrompts = [
    { label: '🌐 What are my Chrome tabs?', prompt: 'What are my open Chrome tabs right now? List their titles and domains clearly.' },
    { label: '📊 Summarize Mac Health', prompt: 'Give me an in-depth, transparent system health summary right now. Break down my RAM, swap pressure, CPU load, top memory-hogging processes, sleep blockers, and project ghost folders.' },
    { label: '🧹 Clean Ghost Directories', prompt: 'Check if I have any abandoned node_modules, target, or .venv folders and what size they are.' },
    { label: '🎯 Focus Mode', prompt: 'Activate Focus Mode and terminate secondary chat & media apps.' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200" onClick={onClose}>
      <div
        className={`w-full transition-all duration-300 bg-[#090b10] border-l border-white/[0.08] h-full flex flex-col shadow-2xl shadow-black animate-in slide-in-from-right duration-200 ${
          isExpanded ? 'max-w-6xl' : 'max-w-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spacious Header */}
        <div className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between bg-[#0e1017]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-base text-white tracking-tight">Guardian AI Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold tracking-wider uppercase">
                  100% FREE TIER
                </span>
              </div>
              <p className="text-xs text-[#86868b] font-mono truncate max-w-md mt-0.5">
                {selectedModelObj ? selectedModelObj.name : model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(prev => !prev)}
              title={isExpanded ? 'Standard view' : 'Widescreen view'}
              className="p-2.5 rounded-xl hover:bg-white/[0.06] text-[#86868b] hover:text-white transition-colors border border-white/[0.04]"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsSettingsOpen(prev => !prev)}
              title="API Key & Free Model Settings"
              className={`p-2.5 rounded-xl transition-colors border ${
                isSettingsOpen ? 'bg-white/15 text-white border-white/20' : 'hover:bg-white/[0.06] text-[#86868b] hover:text-white border-white/[0.04]'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-white/[0.06] text-[#86868b] hover:text-white transition-colors border border-white/[0.04]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spacious Settings Panel */}
        {isSettingsOpen && (
          <div className="p-6 bg-[#0c0e14] border-b border-white/[0.08] space-y-4 text-xs animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-300" /> OpenRouter Key & Live Free Models
              </span>
              <button
                onClick={fetchLiveModels}
                disabled={isFetchingModels}
                className="text-xs text-slate-300 hover:text-white font-mono flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} /> Refresh ({availableModels.length} Models)
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#86868b] text-xs font-medium">OpenRouter API Key:</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f5f7] placeholder-slate-600 focus:outline-none focus:border-white/25 font-mono"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#86868b]">
                <span className="font-medium">Select Free Model:</span>
                <span className="font-mono text-emerald-400">Filtered for 100% Free Tier</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#86868b]" />
                <input
                  type="text"
                  placeholder="Filter 21+ free models..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-[#f5f5f7] placeholder-slate-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 border border-white/[0.06] rounded-2xl p-2 bg-black/30">
                {filteredModels.map((m) => {
                  const isSelected = m.id === model;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-colors flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-white text-slate-950 font-bold shadow-md'
                          : 'text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="truncate max-w-lg">
                        <div className="truncate font-semibold">{m.name}</div>
                        <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-slate-700' : 'text-[#86868b]'}`}>{m.id}</div>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 ml-3 ${isSelected ? 'text-slate-900 font-bold' : 'text-[#86868b]'}`}>
                        {Math.round(m.context / 1000)}k ctx
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => handleSaveSettings(apiKey, model)}
              className="w-full py-2.5 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors shadow-lg"
            >
              Save Configuration & Activate
            </button>
          </div>
        )}

        {/* Spacious Quick Prompts Chips */}
        <div className="px-8 py-3.5 border-b border-white/[0.04] bg-[#0c0e14] flex items-center gap-2.5 overflow-x-auto text-xs font-medium">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.prompt)}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/[0.06] text-slate-300 hover:text-white shrink-0 transition-all shadow-sm"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Conversation Stream (Spacious, Airy, Beautiful) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 space-y-8">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-3xl p-6 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-white text-slate-950 font-medium rounded-br-none shadow-xl'
                    : 'bg-[#12141c] border border-white/[0.08] text-[#f5f5f7] rounded-bl-none shadow-2xl shadow-black/70'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="space-y-4">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-3 tracking-tight">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold text-white mb-2 mt-4 tracking-tight">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold text-[#f5f5f7] mb-1.5 mt-3 tracking-tight">{children}</h3>,
                        p: ({ children }) => <p className="mb-3 leading-relaxed text-slate-300">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1.5 my-3 text-slate-300 pl-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1.5 my-3 text-slate-300 pl-1">{children}</ol>,
                        li: ({ children }) => <li className="text-slate-300 leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="px-2 py-0.5 rounded-lg bg-black/50 text-[#f5f5f7] font-mono text-xs border border-white/10">
                              {children}
                            </code>
                          ) : (
                            <div className="my-3 rounded-2xl bg-black/60 p-4 font-mono text-xs border border-white/10 overflow-x-auto text-[#f5f5f7] shadow-inner">
                              <code>{children}</code>
                            </div>
                          );
                        },
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-3 border border-white/10 rounded-2xl shadow-sm">
                            <table className="w-full text-left border-collapse text-xs font-mono">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => <th className="p-3 border-b border-white/10 bg-white/[0.04] text-white font-semibold">{children}</th>,
                        td: ({ children }) => <td className="p-3 border-b border-white/[0.04] text-slate-300">{children}</td>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {/* DYNAMIC 1-CLICK ACTION RECOMMENDATION BUTTONS */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-white/[0.08] space-y-3">
                        <div className="flex items-center justify-between text-xs text-[#86868b] font-medium">
                          <span className="flex items-center gap-2 text-white font-semibold">
                            <Sparkles className="w-4 h-4 text-amber-300" /> Recommended 1-Click Actions:
                          </span>
                          <span className="text-xs font-mono text-[#86868b]">Autonomous Execution</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {msg.recommendations.map((rec, i) => {
                            const isCompleted = msg.completedRecs?.includes(rec.action);
                            const isRunning = executingActionKey === `${msg.id}_${rec.action}`;

                            return (
                              <button
                                key={i}
                                onClick={() => executeRecommendation(rec, msg.id)}
                                disabled={isRunning || isCompleted}
                                className={`p-4 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between space-y-1.5 shadow-md ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border-white/[0.08] hover:border-white/20 text-[#f5f5f7]'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-xs tracking-tight text-white flex items-center gap-2">
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Play className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                                    )}
                                    {rec.label}
                                  </span>
                                  {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-white shrink-0" />}
                                </div>
                                <p className="text-[11px] text-[#86868b] font-mono leading-relaxed">
                                  {isCompleted ? '✓ Executed successfully' : rec.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Autonomous Action Badges */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
                        {msg.actions.map((act, i) => (
                          <div key={i} className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{act.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>

              <div className="flex items-center gap-2.5 mt-1.5 px-2">
                <span className="text-[11px] text-[#86868b] font-mono">{msg.time}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    title="Copy response"
                    className="text-[#86868b] hover:text-slate-300 transition-colors"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-300 p-4 bg-[#12141c] border border-white/[0.08] rounded-2xl w-fit shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing live Mac telemetry & formulating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Spacious Input Bar */}
        <div className="p-6 border-t border-white/[0.06] bg-[#0c0e14]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-3"
          >
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about your Mac (e.g. 'what are my chrome tabs?')..."
              className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/20 resize-none font-sans leading-relaxed"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 disabled:opacity-40 transition-colors shrink-0 shadow-lg font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-xs text-[#86868b] font-mono mt-2.5 px-1">
            <span>Model: {selectedModelObj?.name || model}</span>
            <span>Enter to send • Shift+Enter for newline</span>
          </div>
        </div>
      </div>
    </div>
  );
};
