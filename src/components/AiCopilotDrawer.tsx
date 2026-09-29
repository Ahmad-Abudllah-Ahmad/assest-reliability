import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  Loader2, 
  Wrench, 
  Bot, 
  ArrowRight, 
  Package, 
  UserCheck, 
  Download, 
  Flag, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  reasoningSteps?: { label: string; done: boolean }[];
  actionButtons?: { 
    label: string; 
    toastMsg: string; 
    actionType: 'log_case' | 'assign_engineer' | 'export_package' | 'flag_outage';
    casePayload?: any;
  }[];
}

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction: (
    actionType: 'log_case' | 'assign_engineer' | 'export_package' | 'flag_outage',
    actionLabel: string, 
    toastMsg: string,
    casePayload?: any
  ) => void;
  onOpenJargonGuide?: () => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
  onOpenJargonGuide
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 **Hello! I am your Spark AI Assistant.**\n\nI monitor both your Power Plant and Offshore Oil & Gas platform, translating complex sensor readings into **simple, plain-English advice**.\n\nAsk me anything about equipment health, fuel efficiency, or pending maintenance in everyday words!",
      timestamp: 'Just now'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Why is Turbine 2 running hot?",
    "Why are we burning extra fuel gas?",
    "Is Offshore Compressor K-101 safe?",
    "What parts are needed for CAS-003?"
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleAskQuestion = (questionText: string) => {
    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let steps = [
      { label: 'Checking live sensor readings...', done: false },
      { label: 'Comparing against safety baseline limits...', done: false },
      { label: 'Calculating financial impact ($/hour)...', done: false },
      { label: 'Formulating plain-English recommendation...', done: false }
    ];

    let answerText = '';
    let buttons: CopilotMessage['actionButtons'] = [
      { 
        label: 'Create Work Order (CAS-001)', 
        toastMsg: 'Logged investigation work order CAS-001 on Cases Board.', 
        actionType: 'log_case',
        casePayload: {
          id: 'CAS-001',
          title: 'Exhaust gas cylinder temperature variance check',
          equipment: 'Gas Turbine GT-2',
          severity: 'High'
        }
      },
      { 
        label: 'Assign Technician (Bob Smith)', 
        toastMsg: 'Bob Smith assigned as lead investigator for Turbine 2.', 
        actionType: 'assign_engineer' 
      }
    ];

    const qLower = questionText.toLowerCase();

    if (qLower.includes('heat rate') || qLower.includes('fuel') || qLower.includes('condenser') || qLower.includes('efficiency')) {
      steps = [
        { label: 'Analyzing fuel gas flow vs electricity generated...', done: false },
        { label: 'Checking steam turbine cooling tube temperature...', done: false },
        { label: 'Calculating wasted natural gas cost ($380/hr)...', done: false },
        { label: 'Drafting tube cleaning recommendation...', done: false }
      ];
      answerText = "### 💡 Plain-English Summary: Fuel Efficiency Drop\n\n- **What is happening**: The plant is burning more natural gas than normal to generate electricity. This is caused by dirt and algae buildup in the steam condenser cooling tubes for Steam Turbine 1.\n- **Money Impact**: Wasting **$380 every hour** in extra fuel costs.\n- **Simple Fix**: Schedule an automated water tube flush during tonight's low-demand hours. This will restore normal fuel efficiency without taking the plant offline.";
      buttons = [
        { 
          label: 'Schedule Tube Cleaning (CAS-005)', 
          toastMsg: 'Investigation work order created for Steam Turbine 1 condenser cleaning.', 
          actionType: 'log_case',
          casePayload: {
            id: 'CAS-005',
            title: 'Steam Turbine 1 condenser tube cleaning & efficiency recovery',
            equipment: 'Steam Turbine ST-1',
            severity: 'Medium'
          }
        },
        { 
          label: 'Export Engineering Package', 
          toastMsg: 'Performance summary package exported for shift handover.', 
          actionType: 'export_package' 
        }
      ];
    } else if (qLower.includes('k-101') || qLower.includes('compressor') || qLower.includes('offshore') || qLower.includes('seal')) {
      steps = [
        { label: 'Connecting to FPSO Leviathan Alpha telemetry...', done: false },
        { label: 'Reading LP Booster Gas Compressor K-101 seal leak sensor...', done: false },
        { label: 'Checking Remaining Useful Life (RUL: 74%)...', done: false },
        { label: 'Verifying spare seal cartridge in platform storeroom...', done: false }
      ];
      answerText = "### 💡 Plain-English Summary: Gas Compressor K-101 Health\n\n- **What is happening**: Compressor K-101 has a tiny seal gas leak (1.28 cubic ft/min). The machine is running safely right now, but its health score (RUL) has dipped to 74%.\n- **Downtime Risk**: You have approximately **18 days** of safe runtime before the seal requires replacement. If neglected, it would trigger an emergency platform shutdown costing $140,000.\n- **Simple Fix**: Technicians Marcus Vance and Sarah Jenkins should replace the dry gas seal cartridge during the scheduled Wednesday window.";
      buttons = [
        { 
          label: 'Review Offshore Work Order (OG-001)', 
          toastMsg: 'Opened offshore safety permit for Compressor K-101 seal replacement.', 
          actionType: 'log_case',
          casePayload: {
            id: 'OG-001',
            title: 'LP Booster Gas Compressor (K-101) Seal Ring Replacement',
            equipment: 'LP Booster Gas Compressor (K-101)',
            severity: 'Critical'
          }
        }
      ];
    } else if (qLower.includes('cas-003') || qLower.includes('parts') || qLower.includes('lube') || qLower.includes('wear')) {
      steps = [
        { label: 'Checking warehouse parts inventory...', done: false },
        { label: 'Verifying lube oil filter replacement kits...', done: false },
        { label: 'Scheduling 8-hour maintenance slot...', done: false }
      ];
      answerText = "### 💡 Parts & Tools Required for Lube Oil Service (CAS-003)\n\n1. **Oil Filter Cartridges**: 4 filter elements reserved in Warehouse 2 (Part #HYD-6M).\n2. **Bearing Replacement Shells**: Verified in stock on shelf B-4.\n3. **Oil Sampling Bottles**: Ready for lab testing.\n4. **Estimated Job Time**: 8.0 hours planned maintenance.";
      buttons = [
        { 
          label: 'Flag for Next Outage Window', 
          toastMsg: 'CAS-003 marked for priority execution during next maintenance window.', 
          actionType: 'flag_outage' 
        },
        { 
          label: 'Assign Technician (Charlie Davis)', 
          toastMsg: 'Charlie Davis assigned to lead lube filter replacement.', 
          actionType: 'assign_engineer' 
        }
      ];
    } else {
      // Default: GT-2 Hot Exhaust Temperature
      answerText = "### 💡 Plain-English Summary: Turbine 2 Running Hot\n\n- **What is happening**: Burner chamber Can #4 is running 26°C hotter than the other burners around the jet turbine. This happens when a gas nozzle has dirt or soot buildup.\n- **Money & Safety Impact**: To protect the turbine blades, the computer automatically reduced power output by 18 MW. This could cause up to **$29,500 in lost revenue** during the evening peak.\n- **Simple Fix**: Send technician Bob Smith to recalibrate fuel nozzle #4 before 17:00.";
    }

    const assistantMsgId = `asst-${Date.now()}`;
    const initialAssistantMsg: CopilotMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reasoningSteps: steps
    };

    setMessages(prev => [...prev, userMsg, initialAssistantMsg]);

    // Animate reasoning steps
    steps.forEach((_, idx) => {
      setTimeout(() => {
        setMessages(current => current.map(m => {
          if (m.id !== assistantMsgId) return m;
          const updated = (m.reasoningSteps || []).map((s, i) => ({
            ...s,
            done: i <= idx
          }));
          return { ...m, reasoningSteps: updated };
        }));
      }, (idx + 1) * 350);
    });

    // Output final answer
    setTimeout(() => {
      setMessages(current => current.map(m => {
        if (m.id !== assistantMsgId) return m;
        return {
          ...m,
          text: answerText,
          actionButtons: buttons
        };
      }));
    }, (steps.length + 1) * 350);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full sm:w-[520px] h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl animate-slideLeft text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/90">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Spark AI Assistant
                </h3>
                <span className="text-[10px] font-bold bg-blue-500/10 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/20">
                  Plain-English Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ask questions in plain English & receive 1-click action recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenJargonGuide && (
              <button
                onClick={onOpenJargonGuide}
                title="View terms glossary"
                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Questions Strip */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-700/80">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
            💡 Tap a simple question to test:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(q)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 transition shadow-2xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-xs' 
                    : 'bg-slate-100 dark:bg-slate-750/90 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {/* Reasoning Steps Animation */}
                {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="mb-3 space-y-1.5 pb-2.5 border-b border-slate-200 dark:border-slate-600">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      AI Investigation Process:
                    </span>
                    {msg.reasoningSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px]">
                        {step.done ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Loader2 className="h-3 w-3 text-blue-500 animate-spin shrink-0" />
                        )}
                        <span className={step.done ? 'text-slate-600 dark:text-slate-300' : 'text-blue-600 dark:text-blue-400 font-medium'}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Text Content */}
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Actionable Direct Buttons */}
                {msg.actionButtons && msg.actionButtons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Recommended 1-Click Action:
                    </span>
                    {msg.actionButtons.map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onExecuteAction(btn.actionType, btn.label, btn.toastMsg, btn.casePayload);
                          onClose();
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5" />
                          <span>{btn.label}</span>
                        </div>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputVal.trim()) return;
              handleAskQuestion(inputVal.trim());
              setInputVal('');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Spark AI in plain words (e.g. Is Turbine 2 safe?)..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
