import React from 'react';
import { Settings, Zap, Database } from 'lucide-react';

interface SettingsModalProps {
  config: {
    token: string;
    discoveryActorId: string;
    supabaseUrl: string;
    supabaseKey: string;
  };
  setConfig: (config: any) => void;
  onSave: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ config, setConfig, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 animate-fade-in-up overflow-y-auto max-h-[90vh]">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Settings className="text-indigo-600" />
          <h3 className="text-lg font-bold">System Configuration</h3>
        </div>
        
        <div className="space-y-6">
          
          {/* Apify Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Zap size={16} className="text-amber-500" />
                Apify Scraper Settings
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">API Token</label>
              <input 
                type="password" 
                value={config.token}
                onChange={(e) => setConfig({...config, token: e.target.value})}
                placeholder="apify_api_..."
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Discovery Actor ID</label>
              <input 
                type="text" 
                value={config.discoveryActorId}
                onChange={(e) => setConfig({...config, discoveryActorId: e.target.value})}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Supabase Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Database size={16} className="text-emerald-500" />
                Supabase Database
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Project URL</label>
              <input 
                type="text" 
                value={config.supabaseUrl}
                onChange={(e) => setConfig({...config, supabaseUrl: e.target.value})}
                placeholder="https://xyz.supabase.co"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Anon / Public Key</label>
              <input 
                type="password" 
                value={config.supabaseKey}
                onChange={(e) => setConfig({...config, supabaseKey: e.target.value})}
                placeholder="eyJh..."
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};