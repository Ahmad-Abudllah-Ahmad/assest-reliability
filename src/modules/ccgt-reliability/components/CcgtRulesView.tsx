import React, { useState } from 'react';
import { 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Edit3, 
  Save, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { useCcgtReliability } from '../CcgtReliabilityContext';
import { ReliabilityRule } from '../types';

export const CcgtRulesView: React.FC = () => {
  const { rules, toggleRule, updateRuleThreshold } = useCcgtReliability();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Edit form state
  const [editWarning, setEditWarning] = useState<number>(0);
  const [editCritical, setEditCritical] = useState<number>(0);
  const [editWarnImpact, setEditWarnImpact] = useState<number>(0);
  const [editCritImpact, setEditCritImpact] = useState<number>(0);

  const startEditing = (rule: ReliabilityRule) => {
    setEditingRuleId(rule.ruleId);
    setEditWarning(rule.warningThreshold);
    setEditCritical(rule.criticalThreshold);
    setEditWarnImpact(rule.warningRiskImpact);
    setEditCritImpact(rule.criticalRiskImpact);
  };

  const handleSaveEdit = (ruleId: string) => {
    updateRuleThreshold(ruleId, editWarning, editCritical, editWarnImpact, editCritImpact);
    setEditingRuleId(null);
  };

  const filteredRules = rules.filter(r => {
    return activeCategory === 'all' || r.category === activeCategory;
  });

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-2.5 2xl:gap-3 animate-fadeIn select-none">
      
      {/* Compact Category Navigation Bar (Page Title Banner Removed per Part C & H) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Reliability Rules Engine ({filteredRules.length} Rules)
          </span>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 p-0.5 rounded-lg text-xs font-semibold overflow-x-auto">
          {['all', 'thermal', 'performance', 'mechanical', 'electrical', 'history'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer capitalize ${
                activeCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Table */}
      <div className="flex-1 min-h-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xs overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/70 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="pb-2.5">Rule ID &amp; Name</th>
                <th className="pb-2.5">Asset Type</th>
                <th className="pb-2.5">Parameter</th>
                <th className="pb-2.5">Warning Threshold</th>
                <th className="pb-2.5">Critical Threshold</th>
                <th className="pb-2.5">Risk Impact</th>
                <th className="pb-2.5 text-center">Priority</th>
                <th className="pb-2.5 text-center">Rule Status</th>
                <th className="pb-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredRules.map((rule) => {
                const isEditing = editingRuleId === rule.ruleId;

                return (
                  <tr key={rule.ruleId} className="hover:bg-slate-50 dark:hover:bg-slate-750/50 transition">
                    <td className="py-3 font-semibold text-slate-900 dark:text-slate-100 max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1 rounded border border-blue-200 dark:border-blue-800">
                          {rule.ruleId}
                        </span>
                        <span className="truncate">{rule.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5 line-clamp-1">{rule.explanation}</p>
                    </td>

                    <td className="py-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {rule.assetType}
                    </td>

                    <td className="py-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                      {rule.parameterLabel}
                    </td>

                    <td className="py-3 font-mono text-[11px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editWarning}
                            onChange={(e) => setEditWarning(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                          />
                          <span className="text-[10px] text-slate-400">{rule.unit}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {rule.operator} {rule.warningThreshold} {rule.unit}
                        </span>
                      )}
                    </td>

                    <td className="py-3 font-mono text-[11px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editCritical}
                            onChange={(e) => setEditCritical(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono"
                          />
                          <span className="text-[10px] text-slate-400">{rule.unit}</span>
                        </div>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {rule.operator} {rule.criticalThreshold} {rule.unit}
                        </span>
                      )}
                    </td>

                    <td className="py-3 font-mono text-[11px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span>+{editWarnImpact} / +{editCritImpact}</span>
                        </div>
                      ) : (
                        <span className="text-slate-800 dark:text-slate-200">
                          +{rule.warningRiskImpact} / +{rule.criticalRiskImpact} Risk
                        </span>
                      )}
                    </td>

                    <td className="py-3 text-center">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rule.priorityImpact}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleRule(rule.ruleId)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${
                          rule.enabled
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(rule.ruleId)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Save Rule"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRuleId(null)}
                            className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(rule)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition flex items-center gap-1 ml-auto"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
