import React, { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => Promise<void>;
  onBack?: () => void; // New prop
  loading?: boolean;
  waitingForMagicLink?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack, loading = false, waitingForMagicLink = false }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 p-2 flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      )}

      <div className="mb-8 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 mb-6">
          <span className="text-3xl font-bold">C</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to CollabFlow</h1>
        <p className="text-slate-500 max-w-md">Automated influencer discovery for high-performance agencies.</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 animate-fade-in-up delay-75">
        <div className="space-y-6">
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Sign in with email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com" 
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400">By continuing, you agree to CollabFlow's Terms & Conditions.</p>

    </div>
  );
};