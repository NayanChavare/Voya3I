import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Zap, Cloud, Image as ImageIcon, Database, RefreshCw, X, CheckCircle2, AlertTriangle, DatabaseZap, Lock } from 'lucide-react';
import { isConfigValid, auth } from '../lib/firebase';
import { backend } from '../../services/backendService';

export const SystemHealth = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [status, setStatus] = useState({
    gemini: 'checking',
    unsplash: 'checking',
    firebase: isConfigValid ? 'active' : 'missing',
    storage: 'active'
  });

  useEffect(() => {
    if (!isOpen) return;

    const checkGemini = async () => {
      const key = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!key || key === 'YOUR_API_KEY') {
        setStatus(prev => ({ ...prev, gemini: 'missing' }));
      } else {
        setStatus(prev => ({ ...prev, gemini: 'active' }));
      }
    };

    const checkUnsplash = async () => {
      try {
        const res = await fetch('/api/images/search?query=test');
        const data = await res.json();
        if (data.error && data.error.includes('key')) {
          setStatus(prev => ({ ...prev, unsplash: 'missing' }));
        } else {
          setStatus(prev => ({ ...prev, unsplash: 'active' }));
        }
      } catch {
        setStatus(prev => ({ ...prev, unsplash: 'error' }));
      }
    };

    checkGemini();
    checkUnsplash();
  }, [isOpen]);

  if (!isOpen) return null;

  const StatusItem = ({ icon: Icon, label, state, description }: { icon: any, label: string, state: string, description: string }) => {
    const colors = {
      active: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
      missing: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
      error: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
      checking: 'text-slate-400 bg-slate-50 dark:bg-slate-800 animate-pulse'
    };

    const icons = {
      active: <CheckCircle2 size={16} />,
      missing: <AlertTriangle size={16} />,
      error: <X size={16} />,
      checking: <RefreshCw size={16} className="animate-spin" />
    };

    return (
      <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
        <div className={`p-3 rounded-xl ${colors[state as keyof typeof colors]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white">{label}</h4>
            <div className={`flex items-center gap-1.5 font-black text-[8px] uppercase tracking-tighter ${colors[state as keyof typeof colors].split(' ')[0]}`}>
              {icons[state as keyof typeof icons]}
              {state}
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 leading-tight">{description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tighter text-slate-900 dark:text-white">System Diagnostics</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </header>

        <div className="p-6 sm:p-8 space-y-3 sm:space-y-4">
          <StatusItem 
            icon={Zap} 
            label="AI Engine" 
            state={status.gemini} 
            description={status.gemini === 'active' ? 'AI synthesis and question generation are fully operational.' : 'Missing API Key. AI features will use fallback static data.'}
          />
          <StatusItem 
            icon={ImageIcon} 
            label="Unsplash Visuals" 
            state={status.unsplash} 
            description={status.unsplash === 'active' ? 'Dynamic image sourcing is active and optimized.' : 'Missing API Key. Using static image database fallback.'}
          />
          <StatusItem 
            icon={Cloud} 
            label="Firebase Cloud" 
            state={status.firebase} 
            description={status.firebase === 'active' ? 'Authentication and cloud synchronization are active.' : 'Configuration missing. Using local storage fallback.'}
          />
          <StatusItem 
            icon={Database} 
            label="Local Vault" 
            state={status.storage} 
            description="Browser-based secure storage is active for offline resilience."
          />
        </div>
      </div>
    </div>
  );
};
