import React, { useEffect, useRef } from 'react';
import { JobStatus } from '../types';
import { Loader2, CheckCircle2, Terminal } from 'lucide-react';

interface TerminalLoaderProps {
  status: JobStatus;
}

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({ status }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [status.logs]);

  // Simplified Steps
  const getStepStatus = (step: string) => {
    // Only discovery and completed exist now
    if (status.status === 'completed') return 'complete';
    if (status.status === 'discovery') return 'active';
    return 'pending';
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 text-center text-xs font-mono text-slate-500">
          creator_logic_worker.ts — {status.jobId}
        </div>
      </div>

      <div className="p-6 grid gap-6 md:grid-cols-2">
        {/* Progress Steps */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Workflow Status</h3>
          
          <StepItem 
            label="Discovery Phase" 
            subLabel="Scraping related profiles"
            status={getStepStatus('discovery')} 
          />
          <StepItem 
            label="Finalizing" 
            subLabel="Formatting results"
            status={status.status === 'completed' ? 'complete' : 'pending'} 
          />
        </div>

        {/* Terminal Output */}
        <div className="bg-slate-900 rounded-md shadow-inner border border-slate-800 p-3 font-mono text-xs h-48 flex flex-col">
          <div className="flex items-center gap-2 text-slate-500 mb-2 pb-2 border-b border-slate-800/50">
            <Terminal size={12} />
            <span>Console Output</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-slate-300" ref={scrollRef}>
            {status.logs.map((log, i) => (
              <div key={i} className="break-all opacity-90 hover:opacity-100 transition-opacity">
                <span className="text-emerald-500 mr-2">➜</span>
                {log}
              </div>
            ))}
            {status.status !== 'completed' && (
              <div className="animate-pulse text-emerald-500">_</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100 w-full">
        <div 
          className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)] transition-all duration-300 ease-out"
          style={{ width: `${status.progress}%` }}
        />
      </div>
    </div>
  );
};

const StepItem = ({ label, subLabel, status }: { label: string; subLabel: string; status: 'pending' | 'active' | 'complete' }) => {
  return (
    <div className={`flex items-start gap-3 transition-colors ${status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
      <div className="mt-0.5">
        {status === 'complete' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : status === 'active' ? (
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
        )}
      </div>
      <div>
        <div className={`text-sm font-semibold ${status === 'active' ? 'text-indigo-700' : 'text-slate-800'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-500">{subLabel}</div>
      </div>
    </div>
  );
};
