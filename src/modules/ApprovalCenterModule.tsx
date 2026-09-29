import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Play, 
  FileSearch, 
  AlertTriangle, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  CheckSquare, 
  Square,
  Clock,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Recommendation } from '../types';

export const ApprovalCenterModule: React.FC = () => {
  const { 
    recommendations, 
    approveRecommendation, 
    rejectRecommendation, 
    simulateRecommendation, 
    batchApprove, 
    openEvidenceModal,
    addToast
  } = useApp();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredRecommendations = recommendations.filter(r => {
    if (filterCategory === 'ALL') return true;
    return r.category === filterCategory;
  });

  const toggleSelectAll = () => {
    const pendingIds = filteredRecommendations
      .filter(r => r.status === 'NEEDS_APPROVAL')
      .map(r => r.id);

    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    batchApprove(selectedIds);
    setSelectedIds([]);
  };

  const handleBatchReject = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => rejectRecommendation(id));
    setSelectedIds([]);
  };

  const handleBatchSimulate = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => simulateRecommendation(id));
    setSelectedIds([]);
  };

  const totalPotentialSavings = recommendations
    .filter(r => r.status === 'NEEDS_APPROVAL')
    .reduce((acc, curr) => acc + curr.totalProjectedSavings, 0);

  const pendingCount = recommendations.filter(r => r.status === 'NEEDS_APPROVAL').length;
  const approvedCount = recommendations.filter(r => r.status === 'APPROVED').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Module Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-indigo-400" />
              AI Recommendation Hub & Approval Center
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60 uppercase">
              Operator In-The-Loop Governance
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Review transparent AI reasoning, simulate transient grid impact, and approve or reject dispatch actions.
          </p>
        </div>

        {/* Batch Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleBatchSimulate}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 border border-gray-700 text-gray-200 transition"
          >
            <Play className="h-3.5 w-3.5 text-blue-400" />
            <span>Simulate ({selectedIds.length})</span>
          </button>

          <button
            onClick={handleBatchReject}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-40 border border-rose-500/30 text-rose-600 dark:text-rose-300 transition"
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Reject ({selectedIds.length})</span>
          </button>

          <button
            onClick={handleBatchApprove}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white shadow-md shadow-blue-600/30 transition"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Approve Selected ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Top 3 High-Signal Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
            Pending Dispatch Actions
          </div>
          <div className="text-2xl font-black text-amber-500 font-mono mt-1 flex items-baseline gap-2">
            {pendingCount} Proposals
            <span className="text-xs font-medium text-slate-400">Awaiting Sign-off</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
            Projected Value at Stake
          </div>
          <div className="text-2xl font-black text-emerald-500 font-mono mt-1">
            +${totalPotentialSavings.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
            Approved & Executed
          </div>
          <div className="text-2xl font-black text-blue-500 font-mono mt-1 flex items-baseline gap-2">
            {approvedCount} Dispatched
            <span className="text-xs font-medium text-emerald-500">100% Stability</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'DISPATCH', 'MAINTENANCE', 'EFFICIENCY'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-gray-900/80 hover:bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Approval Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <button 
                    onClick={toggleSelectAll} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredRecommendations.filter(r => r.status === 'NEEDS_APPROVAL').length ? (
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Proposal / Target Asset</th>
                <th className="p-4">Proposed Intervention</th>
                <th className="p-4 text-right">Arbitrage / Savings</th>
                <th className="p-4">Reliability & Grid Impact</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredRecommendations.map((rec) => {
                const isSelected = selectedIds.includes(rec.id);
                const isPending = rec.status === 'NEEDS_APPROVAL';
                const isApproved = rec.status === 'APPROVED';
                const isSimulating = rec.status === 'SIMULATING';
                const isRejected = rec.status === 'REJECTED';

                return (
                  <tr 
                    key={rec.id} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-750/50 transition ${isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                  >
                    {/* Select Checkbox */}
                    <td className="p-4">
                      {isPending && (
                        <button
                          onClick={() => toggleSelectOne(rec.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </td>

                    {/* ID & Asset */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                          {rec.id}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {rec.category}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white mt-1">
                        {rec.assetName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {rec.timestamp} • {rec.confidenceScore}% AI Confidence
                      </div>
                    </td>

                    {/* Action Proposed */}
                    <td className="p-4 max-w-xs">
                      <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                        {rec.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-mono">
                        {rec.actionProposed}
                      </div>
                    </td>

                    {/* Financial Savings */}
                    <td className="p-4 text-right font-mono">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        +${rec.financialSavingsPerHour.toLocaleString()}/hr
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Total: +${rec.totalProjectedSavings.toLocaleString()}
                      </div>
                    </td>

                    {/* Grid Impact */}
                    <td className="p-4 max-w-xs">
                      <div className="text-xs font-semibold text-blue-600 dark:text-blue-300">
                        {rec.gridReliabilityImpact}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Risk Score: <strong className={rec.riskScore > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{rec.riskScore}/100</strong>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : isSimulating
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 animate-pulse'
                          : isRejected
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                      }`}>
                        {isApproved && <CheckCircle2 className="h-3 w-3" />}
                        {isSimulating && <Clock className="h-3 w-3 animate-spin" />}
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEvidenceModal(rec)}
                          className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition"
                          title="Review Explainable Evidence Dossier"
                        >
                          <FileSearch className="h-3.5 w-3.5" />
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => simulateRecommendation(rec.id)}
                              className="p-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/80 border border-blue-800/60 text-blue-300 transition"
                              title="Simulate Grid Impact"
                            >
                              <Play className="h-3.5 w-3.5" />
                            </button>
                            
                            <button
                              onClick={() => approveRecommendation(rec.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/30 transition"
                              title="Approve & Execute"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
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
