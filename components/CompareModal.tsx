import React, { useState, useMemo } from 'react';
import { X, ArrowRight, BarChart3, Check, AlertCircle, Calculator } from 'lucide-react';
import { SearchHistoryItem, InstagramPost } from '../types';
import { backend } from '../services/backend';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchHistoryItem[];
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, history }) => {
  const [selectedId1, setSelectedId1] = useState<string>('');
  const [selectedId2, setSelectedId2] = useState<string>('');
  const [data1, setData1] = useState<InstagramPost[] | null>(null);
  const [data2, setData2] = useState<InstagramPost[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter valid analytics jobs
  const availableCreators = useMemo(() => {
    return history
    .filter(h => h.type === 'analytics' && h.status === 'completed')
    // Deduplicate by username (take latest)
    .reduce((acc, current) => {
        const x = acc.find(item => item.seedUsername === current.seedUsername);
        if (!x) {
            return acc.concat([current]);
        }
        return acc;
    }, [] as SearchHistoryItem[]);
  }, [history]);

  const handleCompare = async () => {
      if (!selectedId1 || !selectedId2) return;
      setLoading(true);
      setError(null);
      try {
          const res1 = await backend.checkJobStatus(selectedId1);
          const res2 = await backend.checkJobStatus(selectedId2);
          setData1(res1.data || []);
          setData2(res2.data || []);
      } catch (e) {
          console.error(e);
          setError("Failed to load comparison data.");
      } finally {
          setLoading(false);
      }
  };

  const calculateStats = (posts: InstagramPost[]) => {
      if (!posts.length) return { avgViews: 0, avgEng: 0, cpv: 0, cpe: 0 };
      
      const totalViews = posts.reduce((acc, p) => acc + (p.videoPlayCount || p.videoViewCount || 0), 0);
      const totalEng = posts.reduce((acc, p) => acc + p.likesCount + p.commentsCount, 0);
      
      const avgViews = Math.round(totalViews / posts.length);
      const avgEng = Math.round(totalEng / posts.length);
      
      // Assume $500 cost for comparison baseline
      const BASE_COST = 500;
      const cpv = avgViews > 0 ? BASE_COST / avgViews : 0;
      const cpe = avgEng > 0 ? BASE_COST / avgEng : 0;

      return { avgViews, avgEng, cpv, cpe };
  };

  const stats1 = data1 ? calculateStats(data1) : null;
  const stats2 = data2 ? calculateStats(data2) : null;

  const getCreatorName = (id: string) => availableCreators.find(c => c.id === id)?.seedUsername || 'Unknown';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" />
                    Compare Creators
                </h2>
                <p className="text-sm text-slate-500">Analyze performance metrics side-by-side</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
            
            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end mb-8">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Creator A</label>
                    <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        value={selectedId1}
                        onChange={(e) => setSelectedId1(e.target.value)}
                    >
                        <option value="">Select Creator...</option>
                        {availableCreators.map(c => (
                            <option key={c.id} value={c.id} disabled={c.id === selectedId2}>@{c.seedUsername}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-center pb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">VS</div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Creator B</label>
                    <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        value={selectedId2}
                        onChange={(e) => setSelectedId2(e.target.value)}
                    >
                        <option value="">Select Creator...</option>
                        {availableCreators.map(c => (
                            <option key={c.id} value={c.id} disabled={c.id === selectedId1}>@{c.seedUsername}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Button */}
            {!data1 && (
                <div className="text-center">
                    <button 
                        onClick={handleCompare}
                        disabled={!selectedId1 || !selectedId2 || loading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:shadow-none inline-flex items-center gap-2"
                    >
                        {loading ? 'Analyzing...' : 'Run Comparison'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                    {(!selectedId1 || !selectedId2) && (
                        <p className="text-xs text-slate-400 mt-3">
                            Select two creators from your history to compare. <br/>
                            <span className="text-indigo-500">Don't see them? Run an analysis first.</span>
                        </p>
                    )}
                </div>
            )}

            {/* Results Table */}
            {stats1 && stats2 && (
                <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold text-center">
                                <th className="py-4 px-6 text-left w-1/3">Metric</th>
                                <th className="py-4 px-6 w-1/3 text-indigo-700">@{getCreatorName(selectedId1)}</th>
                                <th className="py-4 px-6 w-1/3 text-indigo-700">@{getCreatorName(selectedId2)}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            <ComparisonRow 
                                label="Avg Views" 
                                val1={stats1.avgViews} 
                                val2={stats2.avgViews} 
                                format={(v) => v.toLocaleString()} 
                                winner={stats1.avgViews > stats2.avgViews ? 1 : 2}
                            />
                            <ComparisonRow 
                                label="Avg Engagement" 
                                val1={stats1.avgEng} 
                                val2={stats2.avgEng} 
                                format={(v) => v.toLocaleString()} 
                                winner={stats1.avgEng > stats2.avgEng ? 1 : 2}
                            />
                            <ComparisonRow 
                                label="Est. CPV ($500)" 
                                val1={stats1.cpv} 
                                val2={stats2.cpv} 
                                format={(v) => '$' + v.toFixed(3)} 
                                winner={stats1.cpv < stats2.cpv ? 1 : 2} // Lower is better
                                inverse
                            />
                            <ComparisonRow 
                                label="Est. CPE ($500)" 
                                val1={stats1.cpe} 
                                val2={stats2.cpe} 
                                format={(v) => '$' + v.toFixed(2)} 
                                winner={stats1.cpe < stats2.cpe ? 1 : 2} // Lower is better
                                inverse
                            />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

interface ComparisonRowProps {
    label: string;
    val1: number;
    val2: number;
    format: (v: number) => string;
    winner: 1 | 2;
    inverse?: boolean;
}

const ComparisonRow = ({ label, val1, val2, format, winner, inverse }: ComparisonRowProps) => {
    const isWin1 = winner === 1;
    const isWin2 = winner === 2;
    
    return (
        <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="py-4 px-6 font-medium text-slate-700">{label}</td>
            <td className={`py-4 px-6 text-center font-bold ${isWin1 ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-600'}`}>
                {format(val1)}
                {isWin1 && <Check size={14} className="inline ml-2 text-emerald-500" />}
            </td>
            <td className={`py-4 px-6 text-center font-bold ${isWin2 ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-600'}`}>
                {format(val2)}
                {isWin2 && <Check size={14} className="inline ml-2 text-emerald-500" />}
            </td>
        </tr>
    )
}
