import React, { useState } from 'react';
import { 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Edit3, 
  Save, 
  Check, 
  X 
} from 'lucide-react';
import { useSolarReliability } from '../SolarReliabilityContext';
import { ReliabilityRule } from '../types';

export const SolarRulesView: React.FC = () => {
  const { rules, toggleRule, updateRuleThreshold } = useSolarReliability();

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
      
      {/* Category Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 shadow-2xs shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Solar Reliability Rules Engine ({filteredRules.length} Configured Rules)
          </span>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/80 p-0.5 rounded-lg text-xs font-semibold overflow-x-auto">
          {['all', 'thermal', 'conversion_ac', 'performance', 'dc_electrical'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer capitalize ${
                activeCategory === cat
                  ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.replace('_', ' ')}
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
                        <span className="font-mono text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1 rounded border border-amber-200 dark:border-amber-800">
                          {rule.ruleId}
                        </span>
                        <span className="truncate">{rule.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{rule.description}</p>
                    </td>

                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[11px] font-mono">
                        {rule.assetType}
                      </span>
                    </td>

                    <td className="py-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {rule.parameterKey} ({rule.unit})
                    </td>

                    <td className="py-3 font-mono text-amber-600 font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editWarning}
                          onChange={(e) => setEditWarning(parseFloat(e.target.value) || 0)}
                          className="w-20 p-1 border rounded bg-white dark:bg-slate-900 border-amber-300 font-mono text-xs"
                        />
                      ) : (
                        `${rule.warningThreshold} ${rule.unit}`
                      )}
                    </td>

                    <td className="py-3 font-mono text-rose-600 font-bold">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editCritical}
                          onChange={(e) => setEditCritical(parseFloat(e.target.value) || 0)}
                          className="w-20 p-1 border rounded bg-white dark:bg-slate-900 border-rose-300 font-mono text-xs"
                        />
                      ) : (
                        `${rule.criticalThreshold} ${rule.unit}`
                      )}
                    </td>

                    <td className="py-3 font-mono text-[11px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editWarnImpact}
                            onChange={(e) => setEditWarnImpact(parseInt(e.target.value) || 0)}
                            className="w-12 p-1 border rounded bg-white dark:bg-slate-900 font-mono text-xs text-amber-600"
                            title="Warn Impact"
                          />
                          <span>/</span>
                          <input
                            type="number"
                            value={editCritImpact}
                            onChange={(e) => setEditCritImpact(parseInt(e.target.value) || 0)}
                            className="w-12 p-1 border rounded bg-white dark:bg-slate-900 font-mono text-xs text-rose-600"
                            title="Crit Impact"
                          />
                        </div>
                      ) : (
                        <span>+{rule.warningRiskImpact} / +{rule.criticalRiskImpact} pts</span>
                      )}
                    </td>

                    <td className="py-3 text-center">
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        rule.priority === 'P1' ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {rule.priority}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <button
                        onClick={() => toggleRule(rule.ruleId)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                          rule.isEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {rule.isEnabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>

                    <td className="py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleSaveEdit(rule.ruleId)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer"
                            title="Save Rule"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingRuleId(null)}
                            className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition cursor-pointer"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(rule)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Edit Thresholds"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
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
