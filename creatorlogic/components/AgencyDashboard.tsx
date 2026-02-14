import React, { useEffect, useState } from 'react';
import { backend } from '../services/backend';
import { SearchHistoryItem } from '../types';
import { BarChart3, Search, CheckCircle2, XCircle, Loader2, Building2, UserCircle } from 'lucide-react';

export const AgencyDashboard = () => {
    const [allJobs, setAllJobs] = useState<SearchHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const jobs = await backend.getAgencyHistory();
            setAllJobs(jobs);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[50vh] flex items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mr-2" /> Loading Team Data...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-indigo-600" /> Agency Command Center
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Oversee all team activity and search history.</p>
                </div>
                <div className="bg-white px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm">
                    Total Jobs: {allJobs.length}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-xs">
                        <th className="px-6 py-4 font-semibold w-24">Type</th>
                        <th className="px-6 py-4 font-semibold">Team Member</th>
                        <th className="px-6 py-4 font-semibold">Target Account</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold text-right">Results</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {allJobs.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                        {item.type === 'analytics' ? (
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600" title="Analytics Job">
                                <BarChart3 size={16} />
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600" title="Discovery Job">
                                <Search size={16} />
                            </div>
                        )}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">
                            <div className="flex items-center gap-2">
                                <UserCircle size={16} className="text-slate-400" />
                                {item.userEmail}
                            </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 text-xs">
                            @{item.seedUsername}
                        </td>
                        <td className="px-6 py-4">
                            <StatusBadge status={item.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                            {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="font-bold text-slate-900">{item.resultsCount}</div>
                        </td>
                    </tr>
                    ))}
                    {allJobs.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-500">No activity recorded yet.</td></tr>
                    )}
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