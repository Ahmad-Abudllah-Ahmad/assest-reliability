import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Zap, 
  ChevronRight,
  Flame,
  ShieldAlert,
  Terminal,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AiDispatcherDrawer: React.FC = () => {
  const { 
    isAiDrawerOpen, 
    setIsAiDrawerOpen, 
    chatMessages, 
    sendChatMessage, 
    executeAction 
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Analyze Transformer T-04 temperature spike',
    'Optimize peak shaving for tomorrow 18:00',
    'Check Scope 1 emissions compliance risk'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;
    sendChatMessage(query);
    setInputQuery('');
  };

  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiDrawerOpen]);

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      {!isAiDrawerOpen && (
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-2xl shadow-blue-600/40 border border-blue-400/40 hover:scale-105 active:scale-95 transition-all duration-200 group"
          title="Open AI Power Dispatcher Assistant"
        >
          <div className="relative">
            <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-300 animate-ping" />
          </div>
          <span className="tracking-wide">AI Power Dispatcher</span>
        </button>
      )}

      {/* Drawer Overlay & Panel */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full sm:w-[480px] md:w-[540px] h-full bg-[#0B0F19] border-l border-gray-800 flex flex-col shadow-2xl animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-wide">
                      AI Power Dispatcher
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                      LIVE INGESTION
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Transparent Multi-Signal Reasoning & SCADA Actuation
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 border-b border-gray-800/80 bg-gray-900/30">
              <div className="text-[10px] font-semibold uppercase text-gray-500 mb-2 flex items-center gap-1">
                <Terminal className="h-3 w-3 text-blue-400" />
                Operational Presets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-gray-900/90 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 text-gray-300 hover:text-blue-300 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-gray-500 mb-1 px-1 font-mono">
                      {isUser ? 'Operator Dispatcher' : 'Autonomous AI Companion'} • {msg.timestamp}
                    </div>

                    <div
                      className={`max-w-[92%] rounded-2xl p-3.5 ${
                        isUser
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-gray-900/90 border border-gray-800 text-gray-200 space-y-3'
                      }`}
                    >
                      {/* Reasoning Steps Progression Block */}
                      {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                        <div className="bg-black/50 rounded-xl p-3 border border-gray-800/80 space-y-2 font-mono text-[11px]">
                          <div className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-cyan-400" />
                            Multi-Step Agent Reasoning Engine
                          </div>
                          <div className="space-y-1.5 pt-1">
                            {msg.reasoningSteps.map((step) => (
                              <div
                                key={step.step}
                                className={`flex items-start gap-2 ${
                                  step.status === 'done'
                                    ? 'text-emerald-300'
                                    : step.status === 'active'
                                    ? 'text-blue-300 font-semibold'
                                    : 'text-gray-600'
                                }`}
                              >
                                <span className="mt-0.5">
                                  {step.status === 'done' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                                  ) : step.status === 'active' ? (
                                    <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin flex-shrink-0" />
                                  ) : (
                                    <span className="h-3.5 w-3.5 inline-block rounded-full border border-gray-700 flex-shrink-0" />
                                  )}
                                </span>
                                <span>{step.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Synthesis Text */}
                      {msg.text && (
                        <div className="leading-relaxed whitespace-pre-line prose prose-invert prose-xs">
                          {msg.text}
                        </div>
                      )}

                      {/* Action Buttons Rendered directly in response */}
                      {msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="pt-2 border-t border-gray-800/80 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Actionable SCADA Interventions:
                          </div>
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                            {msg.actionButtons.map((btn, idx) => {
                              const isExecuted = msg.executedAction === btn.actionId;

                              return (
                                <button
                                  key={idx}
                                  disabled={isExecuted}
                                  onClick={() => executeAction(btn.actionId, btn.payload)}
                                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                    isExecuted
                                      ? 'bg-gray-800 text-gray-500 border border-gray-700/50 cursor-not-allowed'
                                      : btn.variant === 'warning'
                                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm shadow-amber-600/30'
                                      : btn.variant === 'emerald'
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30'
                                      : btn.variant === 'secondary'
                                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30'
                                  }`}
                                >
                                  {isExecuted ? (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                      <span>Action Dispatched</span>
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="h-3.5 w-3.5" />
                                      <span>{btn.label}</span>
                                    </>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-gray-800 bg-gray-950">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask dispatch question or request asset telemetry..."
                  className="flex-1 bg-gray-900 border border-gray-800 focus:border-blue-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition shadow-md shadow-blue-600/20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
