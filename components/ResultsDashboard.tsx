import React, { useState, useMemo } from 'react';
import { Creator, SearchFilters } from '../types';
import { Download, Users, Mail, BarChart3, TrendingUp, BadgeCheck, Filter, Search, ChevronLeft, ChevronRight, ExternalLink, Image, Plus } from 'lucide-react';

interface ResultsDashboardProps {
  data: Creator[];
  seedUrl: string; // This is actually seedUsername
  onReset: () => void;
}

const ITEMS_PER_PAGE = 10;

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, seedUrl, onReset }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    showVerifiedOnly: false,
    hidePrivate: false,
    hasEmail: false,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Filtering Logic
  const filteredData = useMemo(() => {
    setCurrentPage(1); 
    return data.filter(creator => {
      if (filters.showVerifiedOnly && !creator.isVerified) return false;
      if (filters.hidePrivate && creator.isPrivate) return false;
      if (filters.hasEmail && !creator.email) return false;
      return true;
    });
  }, [data, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // --- NEW METRICS ---
  const totalProfiles = filteredData.length;
  const totalFollowers = filteredData.reduce((acc, curr) => acc + (curr.followerCount || 0), 0);
  const emailsFound = filteredData.filter(c => !!c.email).length;
  const averageFollowers = totalProfiles > 0 ? Math.round(totalFollowers / totalProfiles) : 0;
  
  // Format large numbers (e.g. 1.2M)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleExport = () => {
    const headers = ['Username', 'Full Name', 'Followers', 'Posts', 'Email', 'Category', 'Bio', 'Is Verified', 'Is Business', 'Profile Link'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(c => [
        c.username,
        `"${c.fullName.replace(/"/g, '""')}"`,
        c.followerCount || 0,
        c.mediaCount || 0,
        c.email || '',
        `"${(c.category || '').replace(/"/g, '""')}"`,
        `"${(c.biography || '').replace(/"/g, '""')}"`,
        c.isVerified ? 'Yes' : 'No',
        c.isBusiness ? 'Yes' : 'No',
        c.link,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `collabflow_enriched_${seedUrl}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full min-h-screen pb-20 bg-slate-50 text-slate-900">
      
      {/* Top Bar / Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div 
              onClick={onReset}
              className="font-bold text-xl tracking-tighter text-indigo-600 cursor-pointer"
            >
              CollabFlow
            </div>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
               <Search size={14} />
               <span>Source: @{seedUrl}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={onReset}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:border-slate-300 group"
             >
               <Plus size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
               New Search
             </button>

             <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
             >
               <Download size={16} />
               Export CSV
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Enriched Stats Deck */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Total Profiles" 
            value={totalProfiles.toString()} 
            icon={<Users className="text-slate-500" />} 
          />
          <StatCard 
            label="Total Followers" 
            value={formatNumber(totalFollowers)} 
            icon={<BarChart3 className="text-indigo-500" />} 
          />
           <StatCard 
            label="Emails Found" 
            value={emailsFound.toString()} 
            icon={<Mail className="text-emerald-500" />} 
          />
          <StatCard 
            label="Avg Follower" 
            value={formatNumber(averageFollowers)} 
            icon={<TrendingUp className="text-purple-500" />} 
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 space-y-6 shrink-0">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-slate-800 font-semibold">
                <Filter size={18} />
                <h3>Refine Results</h3>
              </div>

              <div className="space-y-4">
                <div className="pt-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-700 font-medium">Has Email</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          type="checkbox" 
                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-5 checked:bg-indigo-600 checked:border-indigo-600"
                          checked={filters.hasEmail}
                          onChange={(e) => setFilters(prev => ({ ...prev, hasEmail: e.target.checked }))}
                        />
                        <div className={`block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${filters.hasEmail ? 'bg-indigo-100' : 'bg-slate-200'}`}></div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-700 font-medium">Verified Only</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          type="checkbox" 
                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-5 checked:bg-indigo-600 checked:border-indigo-600"
                          checked={filters.showVerifiedOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, showVerifiedOnly: e.target.checked }))}
                        />
                        <div className={`block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${filters.showVerifiedOnly ? 'bg-indigo-100' : 'bg-slate-200'}`}></div>
                    </div>
                  </label>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-700 font-medium">Hide Private</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          type="checkbox" 
                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 border-slate-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out transform translate-x-0 checked:translate-x-5 checked:bg-indigo-600 checked:border-indigo-600"
                          checked={filters.hidePrivate}
                          onChange={(e) => setFilters(prev => ({ ...prev, hidePrivate: e.target.checked }))}
                        />
                        <div className={`block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${filters.hidePrivate ? 'bg-indigo-100' : 'bg-slate-200'}`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                     <th className="p-4 font-semibold w-[250px]">Profile</th>
                     <th className="p-4 font-semibold">Bio / Category</th>
                     <th className="p-4 font-semibold w-[100px]">Followers</th>
                     <th className="p-4 font-semibold w-[80px]">Posts</th>
                     <th className="p-4 font-semibold w-[150px]">Contact</th>
                     <th className="p-4 font-semibold w-[50px]"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {paginatedData.map(creator => (
                     <tr key={creator.id} className="hover:bg-slate-50/80 transition-colors group text-sm">
                       <td className="p-4 align-top">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 relative">
                             <img 
                              src={creator.avatarUrl} 
                              alt={creator.username} 
                              className="w-full h-full object-cover" 
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${creator.username}&background=random`
                              }}
                             />
                           </div>
                           <div>
                             <div className="font-bold text-slate-900 flex items-center gap-1">
                               {creator.username}
                               {creator.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />}
                             </div>
                             <div className="text-xs text-slate-500 truncate max-w-[150px]">{creator.fullName}</div>
                           </div>
                         </div>
                       </td>
                       
                       <td className="p-4 align-top">
                         <div className="space-y-1">
                           {creator.category && (
                             <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded uppercase tracking-wide border border-indigo-100">
                               {creator.category}
                             </span>
                           )}
                           <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-mono">
                             {creator.biography || <span className="text-slate-300 italic">No biography</span>}
                           </p>
                         </div>
                       </td>

                       <td className="p-4 align-top">
                         {creator.followerCount !== undefined ? (
                           <div className="font-mono text-slate-700 font-medium">
                             {formatNumber(creator.followerCount)}
                           </div>
                         ) : (
                           <span className="text-slate-400">-</span>
                         )}
                       </td>

                        <td className="p-4 align-top">
                         {creator.mediaCount !== undefined ? (
                           <div className="flex items-center gap-1 text-slate-600 font-mono">
                             <Image size={12} className="text-slate-400"/>
                             {creator.mediaCount}
                           </div>
                         ) : (
                           <span className="text-slate-400">-</span>
                         )}
                       </td>

                       <td className="p-4 align-top">
                         {creator.email ? (
                           <button 
                             onClick={() => handleCopyEmail(creator.email!)}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-md hover:border-indigo-300 hover:text-indigo-600 transition-all text-xs font-medium shadow-sm active:scale-95"
                           >
                             {copiedEmail === creator.email ? (
                               <span className="text-emerald-600 font-bold">Copied!</span>
                             ) : (
                               <>
                                 <Mail size={12} />
                                 Email
                               </>
                             )}
                           </button>
                         ) : (
                           <span className="text-slate-400 text-xs italic">N/A</span>
                         )}
                       </td>

                       <td className="p-4 text-right align-top">
                         <a 
                           href={creator.link} 
                           target="_blank" 
                           rel="noreferrer"
                           className="text-slate-400 hover:text-indigo-600 transition-colors"
                         >
                           <ExternalLink size={16} />
                         </a>
                       </td>
                     </tr>
                   ))}
                   {paginatedData.length === 0 && (
                     <tr>
                       <td colSpan={6} className="p-12 text-center text-slate-500">
                         No creators found matching these filters.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination Footer */}
             {totalPages > 1 && (
               <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                    >
                      <ChevronLeft size={16} className="text-slate-600" />
                    </button>
                    <span className="text-sm font-medium text-slate-700 px-2">Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                    >
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  </div>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <div className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
      {icon}
    </div>
  </div>
);