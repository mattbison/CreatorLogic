import React from 'react';
import { SearchHistoryItem } from '../types';
import { Clock, CheckCircle2, XCircle, ArrowRight, Loader2, BarChart3, Search } from 'lucide-react';

interface HistoryViewProps {
  history: SearchHistoryItem[];
  onSelectJob: (jobId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelectJob }) => {
  // Filter to only show discovery jobs for "Search History"
  const discoveryHistory = history.filter(h => h.type === 'discovery' || !h.type);

  if (discoveryHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Clock size={48} className="mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No search history</h3>
        <p className="text-sm">Run your first search to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Search History</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
              <th className="px-6 py-4 font-semibold w-24">Type</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Target Account</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Results</th>
              <th className="px-6 py-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {discoveryHistory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600" title="Discovery Job">
                    <Search size={16} />
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                  {new Date(item.date).toLocaleDateString()} <span className="text-slate-300 mx-1">•</span> {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">@</span>
                    {item.seedUsername}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex flex-col items-end">
                     <span className="font-medium text-slate-900">{item.resultsCount} Profiles</span>
                     {item.emailsFound > 0 && <span className="text-xs text-emerald-600 font-medium">{item.emailsFound} Emails</span>}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                    onClick={() => onSelectJob(item.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1 justify-end ml-auto"
                   >
                     View Report
                     <ArrowRight size={12} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 size={12} /> Completed
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
        <XCircle size={12} /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
      <Loader2 size={12} className="animate-spin" /> Processing
    </span>
  );
};