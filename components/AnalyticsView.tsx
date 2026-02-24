import React, { useState, useMemo } from 'react';
import { InstagramPost } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  MessageCircle, 
  Heart, 
  Hash, 
  PlayCircle,
  Calculator,
  ThumbsUp,
  Search,
  Plus,
  Info,
  Calendar,
  ExternalLink,
  Send,
  ArrowUpDown
} from 'lucide-react';

interface AnalyticsViewProps {
  posts: InstagramPost[];
  username: string;
  onReset: () => void;
  onRefresh: () => void;
  onOpenCompare?: () => void;
}

type SortOption = 'date_desc' | 'date_asc' | 'views_desc' | 'views_asc';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ posts, username, onReset, onRefresh, onOpenCompare }) => {
  const [costPerPostInput, setCostPerPostInput] = useState<string>('500');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');

  // --- HELPERS ---
  const formatBigNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  const handleExport = () => {
      window.print();
  };

  // --- SORTING ---
  const sortedPosts = useMemo(() => {
      const sorted = [...posts];
      return sorted.sort((a, b) => {
          if (sortOption === 'date_desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          if (sortOption === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          if (sortOption === 'views_desc') return (b.videoPlayCount || 0) - (a.videoPlayCount || 0);
          if (sortOption === 'views_asc') return (a.videoPlayCount || 0) - (b.videoPlayCount || 0);
          return 0;
      });
  }, [posts, sortOption]);

  // --- CALCULATIONS ---
  const stats = useMemo(() => {
    if (!posts || posts.length === 0) {
        return { totalPlayCount: 0, totalEngagement: 0, avgPlays: 0, avgEngagement: 0, engagementRate: '0' };
    }
    const totalPlayCount = posts.reduce((acc, curr) => acc + (curr.videoPlayCount || curr.videoViewCount || 0), 0);
    const totalEngagement = posts.reduce((acc, curr) => acc + curr.likesCount + curr.commentsCount + (curr.sharesCount || 0), 0);
    const avgPlays = Math.round(totalPlayCount / posts.length);
    const avgEngagement = Math.round(totalEngagement / posts.length);
    const engagementRate = avgPlays > 0 ? ((avgEngagement / avgPlays) * 100).toFixed(2) : '0';

    return {
      totalPlayCount,
      totalEngagement,
      avgPlays,
      avgEngagement,
      engagementRate
    };
  }, [posts]);

  // --- DEAL METRICS ---
  const dealMetrics = useMemo(() => {
    const cost = parseInt(costPerPostInput) || 0;
    const cpv = stats.avgPlays > 0 ? cost / stats.avgPlays : 0;
    const cpe = stats.avgEngagement > 0 ? cost / stats.avgEngagement : 0;
    
    // Deal Score Logic
    let score = 'C';
    let color = 'text-red-500';
    let label = 'Expensive';
    
    if (stats.avgPlays === 0) { score = '-'; color = 'text-slate-500'; label = 'No Data'; }
    else if (cpv < 0.03) { score = 'S'; color = 'text-emerald-500'; label = 'Insane Value'; }
    else if (cpv < 0.06) { score = 'A'; color = 'text-indigo-500'; label = 'Great Deal'; }
    else if (cpv < 0.12) { score = 'B'; color = 'text-blue-500'; label = 'Fair Price'; }

    return { cpv, cpe, score, color, label };
  }, [costPerPostInput, stats]);

  // --- HASHTAG ANALYSIS ---
  const topHashtags = useMemo(() => {
    const tags: Record<string, number> = {};
    posts.forEach(p => {
        if (p.hashtags) {
            p.hashtags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
        }
    });
    return Object.entries(tags).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [posts]);

  // Extract real user info if available from first post, otherwise minimal fallback
  const displayUser = {
      username: username,
      fullName: username 
  };

  return (
    <div className="min-h-screen bg-slate-50">
        
        {/* TOP BAR */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-8 print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div onClick={onReset} className="font-bold text-xl tracking-tighter text-indigo-600 cursor-pointer">
                        CollabFlow
                    </div>
                    <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
                        <BarChart3 size={14} />
                        <span>Analysis: @{username}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                    onClick={onRefresh}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:border-slate-300"
                    title="Refresh Data"
                    >
                    <ArrowUpDown size={16} className="text-slate-400" />
                    <span className="hidden sm:inline">Refresh</span>
                    </button>

                    {onOpenCompare && (
                        <button 
                        onClick={onOpenCompare}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:border-slate-300"
                        title="Compare Creators"
                        >
                        <BarChart3 size={16} className="text-indigo-600" />
                        <span className="hidden sm:inline">Compare</span>
                        </button>
                    )}

                    <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:border-slate-300"
                    title="Export to PDF"
                    >
                    <ExternalLink size={16} className="text-slate-400" />
                    <span className="hidden sm:inline">Share</span>
                    </button>

                    <button 
                    onClick={onReset}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                    <Plus size={16} className="text-indigo-200" />
                    New Analysis
                    </button>
                </div>
            </div>
        </div>

      <div className="flex flex-col lg:flex-row gap-8 pb-20 max-w-7xl mx-auto px-4">
        
        {/* LEFT COLUMN: Controls & Calculator */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${displayUser.username}&background=random`} 
                        className="w-full h-full object-cover" 
                        alt={displayUser.username}
                      />
                  </div>
                  <div>
                      <h2 className="font-bold text-slate-900 text-lg truncate w-40">{displayUser.username}</h2>
                      <p className="text-slate-500 text-sm">@{displayUser.username}</p>
                  </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                  {topHashtags.map(([tag]) => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">#{tag}</span>
                  ))}
              </div>
          </div>

          {/* DEAL CALCULATOR */}
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator size={100} />
              </div>

              <h3 className="text-slate-300 font-medium text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                  <DollarSign size={16} /> Deal Calculator
              </h3>

              <div className="mb-8">
                  <label className="text-xs text-slate-400 mb-2 block font-medium">YOUR OFFER (USD)</label>
                  <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-light text-xl">$</span>
                      <input 
                          type="number" 
                          value={costPerPostInput}
                          onChange={(e) => setCostPerPostInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-2xl font-bold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder-slate-600"
                          placeholder="0"
                      />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 relative group">
                      <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                          Est. CPV
                          <Info size={10} className="cursor-help" />
                      </div>
                      <div className="text-xl font-bold text-emerald-400">${dealMetrics.cpv.toFixed(3)}</div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-black text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          Cost Per View: How much you pay for every unique view. Target {"<"}$0.03.
                      </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 relative group">
                      <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                          Est. CPE
                          <Info size={10} className="cursor-help" />
                      </div>
                      <div className="text-xl font-bold text-indigo-400">${dealMetrics.cpe.toFixed(2)}</div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-black text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          Cost Per Engagement: Cost per like or comment. Target {"<"}$0.10.
                      </div>
                  </div>
              </div>

              <div className="border-t border-slate-700 pt-6 mb-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <div className="text-slate-400 text-xs font-medium uppercase">Deal Score</div>
                          <div className={`text-sm font-bold mt-1 ${dealMetrics.color}`}>{dealMetrics.label}</div>
                      </div>
                      <div className={`text-4xl font-black ${dealMetrics.color} drop-shadow-lg`}>
                          {dealMetrics.score}
                      </div>
                  </div>
              </div>

              {/* EXPECTED RESULTS SECTION */}
              <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-500/30">
                  <div className="text-indigo-200 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                      <TrendingUp size={14} /> Estimated Delivery
                  </div>
                  <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Expected Views</span>
                          <span className="font-mono font-bold text-white">{formatBigNumber(stats.avgPlays)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">Expected Eng.</span>
                          <span className="font-mono font-bold text-white">{formatBigNumber(stats.avgEngagement)}</span>
                      </div>
                  </div>
                  <div className="mt-3 text-[10px] text-indigo-300/60 leading-tight">
                      *Based on paying ${costPerPostInput} for 1 post with current average performance.
                  </div>
              </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Stats & Charts */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <KpiCard label="Avg Views" value={formatBigNumber(stats.avgPlays)} icon={<Eye className="text-blue-500"/>} />
              <KpiCard label="Avg Engagement" value={formatBigNumber(stats.avgEngagement)} icon={<Heart className="text-rose-500"/>} />
              <KpiCard label="Engagement Rate" value={stats.engagementRate + '%'} icon={<TrendingUp className="text-emerald-500"/>} />
              <KpiCard label="Total Views (L10)" value={formatBigNumber(stats.totalPlayCount)} icon={<PlayCircle className="text-slate-500"/>} />
              <KpiCard label="Total Eng (L10)" value={formatBigNumber(stats.totalEngagement)} icon={<ThumbsUp className="text-slate-500"/>} />
              <KpiCard label="Posts Analyzed" value={posts.length.toString()} icon={<Hash className="text-slate-500"/>} />
          </div>

          {/* Trend Chart (Line) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">Performance Trend</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-3 h-0.5 bg-indigo-500"></div> Views per Post
                  </div>
              </div>
              <TrendLineChart posts={posts} />
          </div>

          {/* Content Gallery */}
          <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 size={18} />
                      Recent Content Performance
                  </h3>
                  
                  {/* SORT DROPDOWN */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sort by:</span>
                    <div className="relative">
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 pr-8 appearance-none cursor-pointer"
                        >
                            <option value="date_desc">Latest Posts</option>
                            <option value="date_asc">Oldest Posts</option>
                            <option value="views_desc">Views (High to Low)</option>
                            <option value="views_asc">Views (Low to High)</option>
                        </select>
                        <ArrowUpDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedPosts.map((post) => (
                      <a 
                          key={post.id} 
                          href={post.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[160px] relative overflow-hidden"
                      >
                          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink size={16} className="text-indigo-500" />
                          </div>

                          <div className="space-y-3">
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                  <Calendar size={12} />
                                  {new Date(post.timestamp).toLocaleDateString()}
                              </div>
                              <p className="text-sm text-slate-700 font-medium line-clamp-3 leading-relaxed">
                                  {post.caption || <span className="italic text-slate-300">No caption provided...</span>}
                              </p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Views</span>
                                  <span className="text-lg font-bold text-slate-900 flex items-center gap-1">
                                      {formatBigNumber(post.videoPlayCount || 0)}
                                  </span>
                              </div>
                              
                              <div className="flex flex-col items-center px-4 border-x border-slate-50">
                                   <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Shares</span>
                                   <span className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                                      <Send size={12} /> {formatBigNumber(post.sharesCount || 0)}
                                   </span>
                              </div>

                              <div className="flex flex-col items-end">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Likes</span>
                                  <span className="text-lg font-bold text-slate-700">
                                      {formatBigNumber(post.likesCount)}
                                  </span>
                              </div>
                          </div>
                      </a>
                  ))}
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, icon }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</span>
            {icon}
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
);

// SVG Line Chart Component
const TrendLineChart = ({ posts }: { posts: InstagramPost[] }) => {
    // Reverse because API usually gives newest first, we want chronological left-to-right on the chart
    const data = useMemo(() => {
        return [...posts].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [posts]);

    const values = data.map(p => p.videoPlayCount || 0);
    const maxVal = Math.max(...values) || 1000;
    
    // Chart dimensions
    const width = 800;
    const height = 250;
    const paddingX = 40;
    const paddingY = 30;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    // Generate points
    const points = values.map((val, i) => {
        const x = paddingX + (i / (values.length - 1)) * chartWidth;
        // Invert Y because SVG 0 is top
        const y = height - paddingY - ((val - 0) / (maxVal - 0)) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    const formatYLabel = (val: number) => {
        if (val >= 1000000) return (val/1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val/1000).toFixed(0) + 'k';
        return val.toString();
    }

    return (
        <div className="w-full h-64 relative group">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                
                {/* Grid Lines & Y-Labels */}
                <g className="text-xs text-slate-300">
                     {/* Top Line (100%) */}
                    <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={paddingX - 10} y={paddingY + 4} textAnchor="end" fill="#94a3b8" fontSize="12">{formatYLabel(maxVal)}</text>

                    {/* Mid Line (50%) */}
                    <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                    <text x={paddingX - 10} y={height/2 + 4} textAnchor="end" fill="#94a3b8" fontSize="12">{formatYLabel(maxVal/2)}</text>

                    {/* Base Line (0%) */}
                    <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="1" />
                    <text x={paddingX - 10} y={height - paddingY + 4} textAnchor="end" fill="#94a3b8" fontSize="12">0</text>
                </g>

                 {/* X-Labels (Posts) */}
                 <g>
                    {values.map((_, i) => {
                         const x = paddingX + (i / (values.length - 1)) * chartWidth;
                         // Only show first, middle, last to avoid crowding
                         if (i === 0 || i === values.length - 1 || i === Math.floor(values.length/2)) {
                            return (
                                <text key={i} x={x} y={height - 5} textAnchor="middle" fill="#94a3b8" fontSize="10">
                                    {i === 0 ? 'Oldest' : i === values.length - 1 ? 'Latest' : '•'}
                                </text>
                            )
                         }
                         return null;
                    })}
                 </g>

                {/* The Line */}
                <polyline 
                    fill="none" 
                    stroke="#2a42a6" 
                    strokeWidth="3" 
                    points={points} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />

                {/* Area Under Line */}
                 <polygon 
                    fill="url(#chartGradient)" 
                    points={`${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`} 
                    opacity="0.1"
                />
                
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2a42a6" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Interactive Points */}
                {values.map((val, i) => {
                    const x = paddingX + (i / (values.length - 1)) * chartWidth;
                    const y = height - paddingY - ((val - 0) / (maxVal - 0)) * chartHeight;
                    return (
                        <g key={i} className="group/point">
                            <circle cx={x} cy={y} r="4" fill="white" stroke="#2a42a6" strokeWidth="2" className="opacity-100 transition-all hover:r-6 cursor-pointer" />
                            <title>{val.toLocaleString()} Views</title>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};