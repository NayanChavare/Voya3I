import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Globe, LayoutDashboard, Home, ClipboardCheck, LogOut, 
  ArrowRight, ShieldCheck, GraduationCap, Briefcase, 
  ChevronLeft, ChevronRight, CheckCircle2, Rocket, 
  Target, Info, Sparkles, Download, Users2,
  BookOpen, RefreshCw, ExternalLink, Lightbulb,
  RotateCcw, ArrowLeft, Bookmark, PlayCircle, Trophy,
  Lock, Mail, Eye, EyeOff, UserPlus, User as UserIcon, Check, Zap,
  Atom, FlaskConical, Building2, Scale, HeartPulse, Palette, Landmark,
  MoreHorizontal, Trash2, Calendar, History, Shield, Upload, Save, FileText,
  BrainCircuit, Database, Moon, Sun, Flag, Activity, Layers, Cloud, CloudUpload, AlertTriangle, BarChart3,
  UserCircle, Award, TrendingUp, Sparkle, MessageSquareQuote, ShieldAlert, Search, Filter, Image as ImageIcon,
  CloudCheck, X
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, Radar as RadarComponent,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';
import { Role, Question, AssessmentScores, AssessmentResult, AIInsights, User, CloudSyncStatus } from './types';
import { DEPARTMENTS } from './constants';
import { generateSDGQuestions, getAIImprovementPlan, getSetupSuggestions, fetchSearchImage, shuffleArray } from './services/geminiService';
import { backend } from './services/backendService';
import { vault } from './services/vault';
import { initPython } from './services/pythonBackend';
import { calculateScoresInPython } from './services/pythonBackend';

// --- UI COMPONENTS ---

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' | 'danger', className?: string }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

const ContextImage = ({ prompt, className = "", overlay = true }: { prompt: string, className?: string, overlay?: boolean }) => {
  const [data, setData] = useState<{url: string, source?: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      setLoading(true);
      try {
        const result = await fetchSearchImage(prompt);
        if (active) setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchImage();
    return () => { active = false; };
  }, [prompt]);

  return (
    <div className={`relative group overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}>
      {loading ? (
        <div className="flex flex-col items-center gap-2 opacity-20 animate-pulse text-center p-4">
          <ImageIcon size={24} />
          <span className="text-[7px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">Sourcing...</span>
        </div>
      ) : (
        <>
          <img 
            src={data?.url || ""} 
            alt={prompt} 
            className="w-full h-full object-cover animate-in fade-in duration-1000 group-hover:scale-110 transition-transform duration-[2000ms]" 
            onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800")}
          />
        </>
      )}
      {overlay && <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply transition-opacity group-hover:opacity-0" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

const AdminDashboard = ({ allResults, allUsers, onDeleteResult, adminUser }: { allResults: AssessmentResult[], allUsers: User[], onDeleteResult: (id: string) => void, adminUser: User }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    (allUsers || []).forEach(u => { map[u.id] = u; });
    return map;
  }, [allUsers]);

  const resultsForAdmin = useMemo(() => {
    return (allResults || []).filter(r => {
      const user = userMap[r.userId];
      if (!user) return false;
      // Exclude guests
      if (user.role === 'Guest') return false;
      // Must match institution
      return user.institution === adminUser.institution;
    });
  }, [allResults, userMap, adminUser.institution]);

  const departmentalStats = useMemo(() => {
    const stats: Record<string, { total: number, count: number }> = {};
    resultsForAdmin.forEach(r => {
      if (!stats[r.dept]) stats[r.dept] = { total: 0, count: 0 };
      stats[r.dept].total += r.scores.total;
      stats[r.dept].count += 1;
    });
    return Object.entries(stats).map(([name, data]) => ({
      name,
      average: Math.round(data.total / data.count)
    })).sort((a, b) => b.average - a.average);
  }, [resultsForAdmin]);

  const aggregateDimensions = useMemo(() => {
    if (resultsForAdmin.length === 0) return [];
    const sum = { knowledge: 0, attitude: 0, engagement: 0, exposure: 0 };
    resultsForAdmin.forEach(r => {
      sum.knowledge += r.scores.knowledge;
      sum.attitude += r.scores.attitude;
      sum.engagement += r.scores.engagement;
      sum.exposure += r.scores.exposure;
    });
    const len = resultsForAdmin.length;
    return [
      { subject: 'Knowledge', A: Math.round(sum.knowledge / len) },
      { subject: 'Attitude', A: Math.round(sum.attitude / len) },
      { subject: 'Engagement', A: Math.round(sum.engagement / len) },
      { subject: 'Exposure', A: Math.round(sum.exposure / len) }
    ];
  }, [resultsForAdmin]);

  const filteredResults = resultsForAdmin.filter(r => {
    const user = userMap[r.userId];
    const searchString = `${r.dept} ${user?.fullName || ''} ${user?.email || ''} ${user?.institution || ''}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const exportToCSV = () => {
    const headers = ['FullName', 'Email', 'Institution', 'Role', 'Department', 'Knowledge', 'Attitude', 'Engagement', 'Exposure', 'Total', 'Date'];
    const rows = filteredResults.map(r => {
      const user = userMap[r.userId];
      return [
        user?.fullName || 'Guest User',
        user?.email || 'N/A',
        user?.institution || 'N/A',
        user?.role || 'Guest',
        r.dept,
        r.scores.knowledge,
        r.scores.attitude,
        r.scores.engagement,
        r.scores.exposure,
        r.scores.total,
        new Date(r.timestamp).toLocaleDateString()
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sdg_assessment_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
        <div>
          <Badge variant="info">Admin Center</Badge>
          <h1 className="text-4xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 font-bold mt-1">Global analytics and dataset management.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToCSV}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
          >
            <Download size={18} /> Export CSV
          </button>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Records</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{resultsForAdmin.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Avg. Index</span>
                <span className="text-xl font-black text-emerald-500">
                  {resultsForAdmin.length > 0 ? Math.round(resultsForAdmin.reduce((acc, r) => acc + r.scores.total, 0) / resultsForAdmin.length) : 0}
                </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><BarChart3 className="text-emerald-500" /> Departmental Benchmark</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentalStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="average" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><Activity className="text-blue-500" /> Global Dimension Averages</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={aggregateDimensions}>
                <PolarGrid stroke="#334155" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }} />
                <RadarComponent name="Aggregate" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><History className="text-emerald-500" /> Assessment Ledger</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter database..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold outline-none focus:ring-2 ring-emerald-500/20 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Participant</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Index</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => {
                const user = userMap[r.userId];
                return (
                  <tr key={r.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                    <td className="py-6 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-emerald-500">
                          {user?.fullName?.charAt(0) || 'G'}
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white">{user?.fullName || 'Guest User'}</div>
                          <div className="text-[10px] font-bold text-slate-400">{user?.email || 'session-based'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-xs font-bold text-slate-500">{user?.institution || 'N/A'}</span>
                    </td>
                    <td className="py-6">
                      <Badge variant="info">{r.dept}</Badge>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{r.scores.total}</span>
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden md:block">
                          <div className="h-full bg-emerald-50" style={{ width: `${r.scores.total}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="text-xs font-bold text-slate-500">{new Date(r.timestamp).toLocaleDateString()}</div>
                    </td>
                    <td className="py-6 pr-4 text-right">
                       <button 
                        onClick={() => onDeleteResult(r.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
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

const Dashboard = ({ user, results, onReset, onAcceptPathway, onDeleteResult, aiInsights, loadingInsights }: { user: User, results: AssessmentResult[], onReset: () => void, onAcceptPathway: (i: AIInsights) => void, onDeleteResult: (id: string) => void, aiInsights: AIInsights | null, loadingInsights: boolean }) => {
  const result = (results || [])[0] || null;
  const radarData = result ? [
    { subject: 'Knowledge', A: result.scores.knowledge },
    { subject: 'Attitude', A: result.scores.attitude },
    { subject: 'Engagement', A: result.scores.engagement },
    { subject: 'Exposure', A: result.scores.exposure }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Personal SDG Insight</h1>
          <p className="text-slate-500 font-bold mt-1">Institutional metrics for {user.fullName}.</p>
          {user.institution && <Badge variant="info" className="mt-3">{user.institution}</Badge>}
        </div>
        <div className="flex gap-4 no-print flex-wrap">
          <button onClick={() => onAcceptPathway(aiInsights!)} className="px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95">
            <FileText size={18} /> Export Full Report
          </button>
          <button onClick={onReset} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black flex items-center gap-2 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
            <RotateCcw size={18} /> New Assessment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Performance Index</h3>
          {result ? (
            <>
              <div className="text-9xl font-black leading-none tracking-tighter mb-10 text-slate-900 dark:text-white">{result.scores.total}</div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }} />
                    <RadarComponent name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : <p className="py-20 text-slate-400 italic font-bold">No data found.</p>}
        </div>

        <div className="lg:col-span-2 bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
          {loadingInsights ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <RefreshCw className="animate-spin text-emerald-500" size={48} />
              <p className="font-bold text-xl">AI Engine Synthesizing...</p>
            </div>
          ) : aiInsights ? (
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400 shadow-lg"><BrainCircuit size={32} /></div>
                <h3 className="text-3xl font-black tracking-tight">AI Strategy Insight</h3>
              </div>
              <p className="text-xl text-slate-300 italic mb-10">"{aiInsights.summary}"</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {(aiInsights?.improvementSteps || []).slice(0, 4).map((step, i) => {
                  const parts = step.split(':');
                  // Robust parsing: use content before colon as title, if no colon use fallback
                  const title = parts.length > 1 ? parts[0].trim() : 'Strategic Objective';
                  const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : parts[0].trim();
                  return (
                    <div key={i} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col items-start gap-2 hover:bg-slate-800 transition-all group">
                      <div className="flex items-center gap-3">
                        <Target className="text-emerald-500 shrink-0" size={18} />
                        <span className="font-black text-slate-100 text-sm uppercase tracking-tight">{title}</span>
                      </div>
                      {desc && <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{desc}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto pt-8 border-t border-slate-800 flex justify-between items-center no-print">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Tactical Focus</span>
                  <span className="text-sm font-black text-slate-300 uppercase tracking-tighter max-w-[200px] truncate">{aiInsights.quickSuggestions[0] || 'Strategic Alignment'}</span>
                </div>
                <button onClick={() => onAcceptPathway(aiInsights)} className="px-10 py-5 bg-emerald-600 rounded-2xl font-black hover:bg-emerald-700 active:scale-95 transition-all shadow-xl flex items-center gap-2">
                  Growth Center <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ) : <div className="h-full flex items-center justify-center text-slate-500 italic text-center px-10">
                <Lightbulb size={48} className="mx-auto mb-4 opacity-20" />
                Complete an assessment for AI directives.
              </div>}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
             <ContextImage prompt="high-tech sustainability lab academic building" className="w-full h-full" overlay={false} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-black mb-10 flex items-center gap-3 text-slate-900 dark:text-white"><History className="text-emerald-500" /> Historical Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(results || []).map((res) => (
              <div key={res.id} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 group relative hover:border-emerald-500 transition-all overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div>
                     <h4 className="font-black text-lg text-slate-900 dark:text-white">{res.dept}</h4>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> {new Date(res.timestamp).toLocaleDateString()}</span>
                   </div>
                   <div className="text-2xl font-black text-emerald-500">{res.scores.total}</div>
                </div>
                <button onClick={() => onDeleteResult(res.id)} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all absolute bottom-6 right-6 hover:scale-110 no-print"><Trash2 size={18} /></button>
              </div>
            ))}
            {results.length === 0 && (
               <div className="col-span-full py-12 text-center text-slate-400 italic font-bold">No sessions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultSummary = ({ result, insights, onContinue }: { result: AssessmentResult, insights: AIInsights | null, onContinue: () => void }) => {
  const radarData = [
    { subject: 'Knowledge', A: result.scores.knowledge },
    { subject: 'Attitude', A: result.scores.attitude },
    { subject: 'Engagement', A: result.scores.engagement },
    { subject: 'Exposure', A: result.scores.exposure }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-slide-up">
      <div className="text-center mb-16 relative">
        <div className="inline-block p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-8 text-emerald-500 animate-bounce shadow-xl">
          <Award size={72} />
        </div>
        <h1 className="text-7xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">Success Unlocked</h1>
        <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-tight">Your SDG impact profile for <span className="text-emerald-500">{result.dept}</span> has been synthesized.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
        {/* Left Card: Radar Chart */}
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
          <Badge variant="success">SDG Alignment Matrix</Badge>
          <div className="relative mt-8 mb-8 w-full h-80 flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: '900' }} />
                <RadarComponent name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-8 rounded-full shadow-2xl border-[6px] border-emerald-500 scale-110">
              <div className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{result.scores.total}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Index</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            {radarData.map(d => (
              <div key={d.subject} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{d.subject}</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{d.A}/25</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Combined AI Insights with Expanded Suggestions */}
        <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group flex flex-col max-h-[800px]">
          <div className="absolute inset-0 opacity-40 pointer-events-none group-hover:scale-105 transition-transform duration-[4000ms]">
            <ContextImage prompt={`cinematic sustainable ${result.dept} vision`} className="w-full h-full" overlay={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          </div>
          
          <div className="relative z-10 flex flex-col flex-grow overflow-hidden">
            <div className="flex items-center gap-4 mb-10 shrink-0">
              <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400 shadow-lg backdrop-blur-md"><Sparkle size={32} /></div>
              <h3 className="text-4xl font-black tracking-tight">AI Strategy</h3>
            </div>

            {!insights ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-6">
                <RefreshCw className="animate-spin text-emerald-500" size={48} />
                <p className="font-black text-xl text-emerald-400 animate-pulse">SYNTHESIZING MATRIX...</p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar pr-4">
                <div className="p-8 bg-white/5 backdrop-blur-lg rounded-[2.5rem] border border-white/10 mb-8 shrink-0">
                  <p className="text-2xl text-slate-100 italic leading-relaxed font-bold">"{insights.summary}"</p>
                </div>
                
                <div className="space-y-4 pb-8">
                  <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={16} /> AI Tactical Recommendations
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {(insights.quickSuggestions || []).slice(0, 12).map((suggestion, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 backdrop-blur-sm hover:bg-white/10 transition-all">
                        <Zap size={20} className="text-amber-400 shrink-0" />
                        <p className="text-sm font-bold text-slate-100 leading-snug">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-12">
        <button onClick={onContinue} className="w-full max-w-lg mx-auto py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-4 group">
          View Full Report & Roadmap <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const Assessment = ({ user, onComplete }: { user: User | null, onComplete: (q: Question[], a: Record<number, string>, dept: string) => void }) => {
  const [dept, setDept] = useState('');
  const [customDept, setCustomDept] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [suggestedSlogan, setSuggestedSlogan] = useState('');
  const prefetchTriggered = useRef(false);

  const finalDept = dept === 'Other' ? (customDept || 'Specified Domain') : dept;

  const startAssessment = async () => {
    if (!dept || !user) return;
    if (dept === 'Other' && !customDept.trim()) {
      alert("Specify your domain.");
      return;
    }
    setLoading(true);
    try {
      const difficultyMap: Record<Role, 'Easy' | 'Medium' | 'Hard'> = {
        'Guest': 'Easy',
        'Student': 'Medium',
        'Faculty/Staff': 'Hard',
        'Admin': 'Hard'
      };
      const difficulty = difficultyMap[user.role];
      const qs = await generateSDGQuestions(finalDept, user.role, difficulty);
      setQuestions(qs);
    } catch (e) {
      alert("AI node busy. Resetting connection...");
    } finally {
      setLoading(false);
    }
  };
  
  const startImagePrefetch = async (insights: AIInsights) => {
    const imagePrompts: string[] = [];
    (insights.impactAnalysis || []).forEach(item => {
        if(item.visualPrompt) imagePrompts.push(item.visualPrompt);
    });
    (insights.riskMitigation || []).forEach(item => {
        if(item.visualPrompt) imagePrompts.push(item.visualPrompt);
    });

    for (const prompt of imagePrompts) {
      fetchSearchImage(prompt); 
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  useEffect(() => {
    const totalQs = questions.length;
    if (totalQs > 0 && currentIdx > totalQs * 0.6 && !prefetchTriggered.current && user) {
      prefetchTriggered.current = true;
      calculateScoresInPython(questions, answers).then(scores => {
        getAIImprovementPlan(scores, user.role, finalDept)
          .then(startImagePrefetch)
          .catch(err => console.error("Failed to pre-fetch insights:", err));
      });
    }
  }, [currentIdx, questions, answers, user, finalDept]);

  useEffect(() => {
    if (dept) {
      getSetupSuggestions(finalDept).then(setSuggestedSlogan);
    }
  }, [dept, customDept]);

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  // Shuffle options for the current question
  const shuffledOptions = useMemo(() => {
    if (!q) return [];
    return shuffleArray([...q.options]);
  }, [q?.id, q?.options]);

  if (!dept || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 animate-slide-up">
        <div className="text-center mb-16">
          <Badge variant="warning">Institutional Selection</Badge>
          <h2 className="text-6xl font-black tracking-tighter mt-4 mb-4 text-slate-900 dark:text-white">Choose Your Domain</h2>
          <p className="text-xl text-slate-500 font-bold">The framework will adapt its logic to your specific academic field.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map(d => (
                <button key={d} onClick={() => setDept(d)} className={`group relative overflow-hidden p-8 rounded-[2rem] border-2 transition-all text-left font-black text-sm uppercase tracking-tight ${dept === d ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-50 border-transparent hover:border-slate-200 dark:bg-slate-800 dark:hover:border-slate-700 text-slate-500'}`}>
                  <span className="relative z-10">{d}</span>
                  {dept === d && <Zap size={14} className="absolute top-4 right-4 text-emerald-500 animate-pulse" />}
                </button>
              ))}
            </div>

            {dept === 'Other' && (
              <div className="mt-8 animate-slide-up">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Specified Field</label>
                <input required type="text" value={customDept} onChange={e => setCustomDept(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-3xl font-bold outline-none transition-all shadow-inner text-xl text-slate-900 dark:text-white" placeholder="e.g. Theoretical Physics..." />
              </div>
            )}

            {dept && (
              <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 group-hover:opacity-40 transition-opacity">
                    <ContextImage prompt={`${finalDept} academic research`} className="w-full h-full" overlay={false} />
                </div>
                <div className="p-6 bg-emerald-500/20 rounded-[2rem] text-emerald-400 backdrop-blur-md relative z-10"><Sparkles size={40} /></div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Institutional Mandate</span>
                  <p className="text-2xl font-bold leading-tight italic">"{suggestedSlogan || 'Analyzing domain potential...'}"</p>
                </div>
              </div>
            )}

            <button disabled={!dept || (dept === 'Other' && !customDept.trim()) || loading} onClick={startAssessment} className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group">
              {loading ? <RefreshCw className="animate-spin" size={32} /> : (
                <>Deploy Framework <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswer = (opt: string) => {
    const newAnswers = { ...answers, [q.id]: opt };
    setAnswers(newAnswers);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(questions, newAnswers, finalDept);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
      <div className="flex justify-between items-end mb-12">
        <div>
          <Badge variant="info">{q.type}</Badge>
<<<<<<< HEAD
          <h2 className="text-4xl font-black tracking-tight mt-4 text-slate-900 dark:text-white">Question {currentIdx + 1}/{questions.length}</h2>
=======
          <h2 className="text-4xl font-black tracking-tight mt-4 text-slate-900 dark:text-white">Directive {currentIdx + 1}/{questions.length}</h2>
>>>>>>> 2307c67b3b0dcc92e6b492346a34e2a3b641739d
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-emerald-500 tracking-widest">{Math.round(progress)}%</span>
          <div className="w-48 h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="h-full sdg-gradient transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-16 rounded-[4.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden min-h-[550px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <ContextImage prompt={`${finalDept} concept`} className="w-full h-full" overlay={false} />
        </div>
        <h3 className="text-4xl font-black leading-tight mb-16 tracking-tight text-slate-900 dark:text-white relative z-10">{q.text}</h3>
        <div className="grid grid-cols-1 gap-4 relative z-10">
          {shuffledOptions.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="group p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left flex items-center gap-8 shadow-sm hover:shadow-xl">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-700 flex items-center justify-center font-black text-2xl text-slate-400 group-hover:text-emerald-500 transition-all border border-slate-100 dark:border-slate-600 group-hover:scale-110">
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-xl font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ImprovementCenter = ({ insights, user, result, onBack }: { insights: AIInsights | null, user: User, result: AssessmentResult | null, onBack: () => void }) => {
  if (!insights) return (
    <div className="flex flex-col items-center justify-center py-60 gap-4">
      <RefreshCw className="animate-spin text-emerald-500" size={64} />
      <p className="font-black text-slate-400 tracking-widest uppercase">Initializing Strategy Engine...</p>
    </div>
  );

  const radarData = result ? [
    { subject: 'Knowledge', A: result.scores.knowledge },
    { subject: 'Attitude', A: result.scores.attitude },
    { subject: 'Engagement', A: result.scores.engagement },
    { subject: 'Exposure', A: result.scores.exposure }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-slide-up">
      <div className="flex justify-between items-center mb-10 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-all hover:translate-x-[-6px]"><ArrowLeft size={20} /> Dashboard</button>
        <button onClick={() => window.print()} className="px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-emerald-700 transition-all active:scale-95">
          <FileText size={24} /> Export Full Report
        </button>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-12 border-b-4 border-emerald-500 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">SDG-INSIGHT REPORT</h1>
            <p className="text-xl font-bold text-slate-500 mt-2">Comprehensive Sustainability Assessment</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Generated On</div>
            <div className="text-xl font-black text-slate-900">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-10">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Participant</span>
            <span className="text-lg font-black text-slate-900">{user.fullName}</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Institution</span>
            <span className="text-lg font-black text-slate-900">{user.institution || 'N/A'}</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Department</span>
            <span className="text-lg font-black text-slate-900">{result?.dept || 'N/A'}</span>
          </div>
        </div>
      </div>

      <header className="mb-16">
        <Badge variant="success">Institutional Growth Roadmap</Badge>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">Strategic Horizon</h1>
        <p className="text-2xl text-slate-500 mt-2 font-medium max-w-3xl">An AI-driven tactical analysis of sustainability integration and risk mitigation.</p>
      </header>

      {/* Performance Overview Section for PDF */}
      <section className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Performance Index</h3>
          {result ? (
            <div className="flex flex-col items-center">
              <div className="text-8xl font-black text-slate-900 dark:text-white mb-6">{result.scores.total}</div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: '800' }} />
                    <RadarComponent name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : <p className="py-10 text-slate-400 italic">No data.</p>}
        </div>
        <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[4rem] shadow-2xl text-white flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-6">
            <Sparkle className="text-emerald-400" size={32} />
            <h3 className="text-2xl font-black tracking-tight">Executive Summary</h3>
          </div>
          <p className="text-xl text-slate-300 italic leading-relaxed">"{insights.summary}"</p>
          <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-sm text-slate-400 font-bold leading-relaxed">{insights.peerBenchmarking}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white dark:bg-slate-900/50 p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white"><Activity className="text-emerald-500" size={32} /> Impact Matrix</h2>
                <Badge variant="info">Contextual Findings</Badge>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(insights?.impactAnalysis || []).map((finding, i) => (
                  <div key={i} className="group p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-2xl transition-all">
                    <ContextImage prompt={finding.visualPrompt || finding.area} className="w-full h-48 rounded-[2rem] mb-6 shrink-0" />
                    <Badge variant={finding.status === 'Excelled' ? 'success' : finding.status === 'Developing' ? 'info' : 'danger'}>
                      {finding.status}
                    </Badge>
                    <h4 className="font-black text-xl mt-6 mb-3 tracking-tight text-slate-900 dark:text-white">{finding.area}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-bold flex-grow italic">"{finding.finding}"</p>
                  </div>
                ))}
             </div>
          </section>

          <section className="bg-white dark:bg-slate-900/50 p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white"><AlertTriangle className="text-rose-500" size={32} /> Tactical Improvement Protocol</h2>
                <Badge variant="info">Strategic Response</Badge>
             </div>
             <div className="space-y-6">
                {(insights?.improvementSteps || []).map((step, i) => {
                  const parts = step.split(':');
                  const title = parts.length > 1 ? parts[0].trim() : 'Strategic Milestone';
                  const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : parts[0].trim();
                  return (
                    <div key={i} className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex items-start gap-6 group hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 group-hover:scale-110 transition-transform">{i + 1}</div>
                      <div className="flex-1">
                        <h4 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white mb-2">{title}</h4>
                        {desc && <p className="text-base text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{desc}</p>}
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>

          <section className="bg-white dark:bg-slate-900/50 p-12 rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white"><AlertTriangle className="text-rose-500" size={32} /> Risk Mitigation Layer</h2>
                <Badge variant="danger">Security Integrity</Badge>
             </div>
             <div className="space-y-6">
                {(insights?.riskMitigation || []).map((risk, i) => (
                  <div key={i} className="p-8 bg-rose-50/30 dark:bg-rose-900/10 rounded-[3rem] border border-rose-100 dark:border-rose-900/30 flex flex-col md:flex-row gap-8 group hover:shadow-lg transition-all">
                     <ContextImage prompt={risk.visualPrompt || risk.risk} className="w-full md:w-48 h-48 rounded-[2.5rem] shrink-0" />
                    <div className="flex-1 py-2">
                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant="danger">{risk.impactLevel} Impact</Badge>
                        <h4 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white">{risk.risk}</h4>
                      </div>
                      <div className="p-6 bg-white dark:bg-slate-900/40 rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
                        <span className="text-[10px] uppercase font-black text-rose-500 block mb-2 tracking-widest">Protocol Response</span>
                        <p className="text-base text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        <aside className="space-y-10">
          <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-full h-full opacity-10 group-hover:scale-110 transition-transform duration-[5000ms]">
                <ContextImage prompt="interconnected global network bioluminescent" className="w-full h-full" overlay={false} />
             </div>
             <div className="relative z-10">
               <Layers className="text-emerald-500 mb-8" size={56} />
               <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">{insights.trajectory}</h3>
               <p className="text-slate-400 font-bold text-lg leading-relaxed">System-wide alignment achieved with global sustainability leadership protocols.</p>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><Flag className="text-amber-500" /> Key Milestones</h2>
             <div className="space-y-8">
                {(insights?.milestones || []).map((m, i) => (
                  <div key={i} className="pl-8 border-l-4 border-slate-100 dark:border-slate-800 ml-4 py-2 hover:border-amber-500 transition-all relative">
                     <div className="absolute -left-2.5 top-2 w-4 h-4 bg-white dark:bg-slate-900 border-4 border-amber-500 rounded-full" />
                     <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{m.timeframe}</span>
                     <h4 className="text-xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">{m.label}</h4>
                     <p className="text-sm text-slate-500 font-bold mt-2 leading-relaxed">{m.objective}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><BookOpen className="text-blue-500" /> Academic Citations</h2>
             <div className="space-y-4">
                {(insights?.resources || []).map((res, i) => (
                  <a 
                    key={i} 
                    href={res.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block p-6 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 transition-all shadow-md hover:border-blue-500 group"
                  >
                    <h4 className="text-sm font-black mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2 group-hover:underline">
                      {res.title} <ExternalLink size={14} className="shrink-0" />
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed line-clamp-4 italic">"{res.description}"</p>
                  </a>
                ))}
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Presentation = () => {
  const [current, setCurrent] = useState(0);
  const slides = [
    { 
      title: "Institutional Hub", 
      content: "A high-fidelity framework to quantify institutional footprint across four vital dimensions.", 
      icon: <Building2 size={72} className="text-emerald-600" /> 
    },
    { 
      title: "Generative Logic", 
      content: "Dynamic academic assessments powered by AI to ensure session uniqueness and rigor.", 
      icon: <BrainCircuit size={72} className="text-blue-500" /> 
    },
    { 
      title: "Scoring Protocol", 
      content: "Knowledge, Attitude, Engagement, and Exposure are calculated via WASM-based Python engines for maximum precision.", 
      icon: <Scale size={72} className="text-amber-500" />,
      details: [
        { label: "Knowledge (25%)", desc: "Measures factual understanding of SDG targets and global indicators." },
        { label: "Attitude (25%)", desc: "Evaluates institutional values and individual commitment to sustainability." },
        { label: "Engagement (25%)", desc: "Tracks active participation in sustainability-driven initiatives and projects." },
        { label: "Exposure (25%)", desc: "Assesses the frequency and depth of sustainability topics in the curriculum." }
      ]
    },
    { 
      title: "Vault Integrity", 
      content: "Local-first cryptographic storage ensures full identity sovereignty and data privacy.", 
      icon: <Database size={72} className="text-emerald-500" /> 
    }
  ];
  return (
    <div className="max-w-5xl mx-auto py-24 px-6 animate-slide-up">
      <div className="bg-white dark:bg-slate-900/50 rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[700px] flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-20 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 opacity-30" />
          <div className="mb-12 p-14 bg-slate-50 dark:bg-slate-800 rounded-full shadow-inner ring-8 ring-slate-100 dark:ring-slate-800/50 transition-all">{slides[current].icon}</div>
          <h2 className="text-6xl font-black mb-8 tracking-tighter leading-none text-slate-900 dark:text-white">{slides[current].title}</h2>
          <p className="text-2xl text-slate-500 font-bold max-w-2xl leading-relaxed italic mb-8">"{slides[current].content}"</p>
          
          {slides[current].details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-4">
              {slides[current].details.map((d, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
                  <h4 className="font-black text-emerald-500 text-sm uppercase tracking-widest mb-2">{d.label}</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-12 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-t border-slate-100 dark:border-slate-800 no-print">
          <div className="flex gap-2">
            {slides.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${current === i ? 'w-12 bg-emerald-500' : 'w-4 bg-slate-300 dark:bg-slate-700'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(p => (p + 1) % slides.length)} className="px-14 py-6 bg-slate-900 dark:bg-emerald-600 text-white rounded-3xl font-black text-xl flex items-center gap-4 hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-xl active:scale-95 group">
            {current === slides.length - 1 ? 'RESTART' : 'CONTINUE'} <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ view, setView, user, logout, isDark, toggleTheme }: { view: string, setView: (v: string) => void, user: User | null, logout: () => void, isDark: boolean, toggleTheme: () => void }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-8 py-5 flex justify-between items-center no-print">
      <div className="flex items-center gap-10">
        <button onClick={() => setView('landing')} className="flex items-center gap-3 group">
          <div className="p-2.5 bg-emerald-500 rounded-xl text-white group-hover:rotate-[15deg] transition-transform duration-500 shadow-lg shadow-emerald-500/20">
            <Globe size={24} />
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white">SDG<span className="text-emerald-500">INSIGHT</span></span>
        </button>

        {user && (
          <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            {user.role === 'Admin' ? (
              <button 
                onClick={() => setView('admin-dashboard')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'admin-dashboard' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Oversight
              </button>
            ) : (
              <button 
                onClick={() => setView('dashboard')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Insights
              </button>
            )}
            <button 
              onClick={() => setView('assessment')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'assessment' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Questions
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <button onClick={toggleTheme} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
             <button onClick={() => user.role === 'Guest' ? setView('role-select') : setView('profile')} className="flex items-center gap-4 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:rotate-12 transition-transform">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-black leading-none text-slate-900 dark:text-white">{user.fullName}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{user.role}</div>
                </div>
             </button>
             <button onClick={logout} className="p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95" title="Logout">
                <LogOut size={24} />
             </button>
          </div>
        ) : (
          <button onClick={() => setView('role-select')} className="px-8 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
<<<<<<< HEAD
            Get Started
=======
            Deploy Node
>>>>>>> 2307c67b3b0dcc92e6b492346a34e2a3b641739d
          </button>
        )}
      </div>
    </nav>
  );
};

const Landing = ({ onStart, onOverview }: { onStart: () => void, onOverview: () => void }) => {
  return (
    <div className="relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute top-0 right-0 w-2/3 h-full bg-emerald-500/[0.03] -skew-x-12 translate-x-1/4" />
      <div className="max-w-7xl mx-auto px-8 py-24 relative z-10 flex flex-col lg:flex-row items-center gap-20">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter leading-[0.8] mb-10 text-slate-900 dark:text-white">
            DECODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">IMPACT</span> <br />
            NOW.
          </h1>
          <p className="text-2xl text-slate-500 font-bold max-w-xl mb-14 leading-tight">
            The global standard in higher education SDG benchmarking and institutional impact analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
            <button onClick={onStart} className="px-12 py-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-2xl hover:translate-y-[-6px] active:translate-y-0 group">
              Get Started <ArrowRight className="group-hover:translate-x-3 transition-transform" size={32} />
            </button>
            <button onClick={onOverview} className="px-12 py-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
              Protocol <Info size={32} />
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
           <div className="grid grid-cols-2 gap-6 scale-110 lg:rotate-2">
              <div className="space-y-6">
                <ContextImage prompt="modern university campus sustainability garden architecture" className="w-full h-80 rounded-[4rem] shadow-2xl z-10" overlay={false} />
                <ContextImage prompt="international students collaborating sustainability project" className="w-full h-64 rounded-[4rem] shadow-2xl" overlay={false} />
              </div>
              <div className="space-y-6 pt-20">
                <ContextImage prompt="science student laboratory research innovation" className="w-full h-80 rounded-[4rem] shadow-2xl" overlay={false} />
                <ContextImage prompt="clean renewable energy wind turbines sunset" className="w-full h-64 rounded-[4rem] shadow-2xl" overlay={false} />
              </div>
           </div>
           

        </div>
      </div>
    </div>
  );
};

const RoleSelect = ({ onSelect, excludeGuest = false }: { onSelect: (r: Role) => void, excludeGuest?: boolean }) => {
  const allRoles: { id: Role, icon: React.ReactNode, desc: string, img: string }[] = [
    { id: 'Student', icon: <GraduationCap size={48} />, desc: "Quantify personal academic SDG alignment and career readiness.", img: "university students graduation" },
    { id: 'Faculty/Staff', icon: <Briefcase size={48} />, desc: "Institutional leadership, research metrics, and curriculum mapping.", img: "professor teaching classroom" },
    { id: 'Admin', icon: <ShieldCheck size={48} />, desc: "Global dataset oversight, departmental benchmarking, and policy.", img: "business strategy meeting" },
    { id: 'Guest', icon: <UserCircle size={48} />, desc: "Anonymous rapid probe assessment for institutional visitors.", img: "digital connection abstract" }
  ];

  const roles = allRoles.filter(r => !excludeGuest || r.id !== 'Guest');

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 animate-slide-up">
      <div className="text-center mb-20">
        <Badge variant="info">Profile Initialization</Badge>
        <h2 className="text-7xl font-black tracking-tighter mt-4 mb-6 leading-none text-slate-900 dark:text-white">Identify Yourself</h2>
        <p className="text-2xl text-slate-500 font-bold max-w-2xl mx-auto">Select your institutional status to deploy specialized framework parameters.</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${roles.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-8`}>
        {roles.map(r => (
          <button key={r.id} onClick={() => onSelect(r.id)} className="group relative bg-white dark:bg-slate-900 p-12 rounded-[4.5rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all shadow-xl text-left flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
                <ContextImage prompt={r.img} className="w-full h-full" overlay={false} />
            </div>
            <div className="mb-10 p-8 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all shadow-inner group-hover:scale-110 relative z-10">
              {r.icon}
            </div>
            <h3 className="text-3xl font-black tracking-tight mb-4 relative z-10 text-slate-900 dark:text-white">{r.id}</h3>
            <p className="text-base text-slate-500 font-bold leading-relaxed relative z-10">{r.desc}</p>
          </button>
        ))}
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6">
              <ContextImage prompt="modern laboratory research" className="w-24 h-24 rounded-2xl shrink-0" overlay={false} />
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Research Driven</h4>
                  <p className="text-xs text-slate-500 font-bold">Metrics backed by institutional data.</p>
              </div>
          </div>
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6">
              <ContextImage prompt="renewable energy solar panels" className="w-24 h-24 rounded-2xl shrink-0" overlay={false} />
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Eco Aligned</h4>
                  <p className="text-xs text-slate-500 font-bold">SDG compliance in every dimension.</p>
              </div>
          </div>
          <div className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6">
              <ContextImage prompt="global network technology" className="w-24 h-24 rounded-2xl shrink-0" overlay={false} />
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white">AI Integrated</h4>
                  <p className="text-xs text-slate-500 font-bold">Advanced logic for unique insights.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

const AuthForm = ({ role, onBack, onLogin }: { role: Role, onBack: () => void, onLogin: (u: User) => void }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (isSignup) {
        user = await backend.signup(email, fullName, role, password, institution);
      } else {
        user = await backend.login(email, password);
      }
      onLogin(user);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-24 animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest mb-12 transition-all hover:translate-x-[-8px]"><ArrowLeft size={24} /> Back to Roles</button>
      
      <div className="bg-white dark:bg-slate-900 p-16 rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-[0.03] pointer-events-none">
            <ContextImage prompt="secure digital technology network" className="w-full h-full" overlay={false} />
        </div>
        <header className="mb-14 text-center">
          <Badge variant="info">{role} Profile</Badge>
          <h2 className="text-5xl font-black tracking-tighter mt-6 text-slate-900 dark:text-white">{isSignup ? 'Secure Signup' : 'Identity Verification'}</h2>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {isSignup && (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Full Identity</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" placeholder="Full Name" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Affiliation</label>
                <input required type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" placeholder="University Name" />
              </div>
            </>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Institutional Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" placeholder="email@institution.edu" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Access Phrase</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" placeholder="Password" />
          </div>

          <button disabled={loading} type="submit" className="w-full py-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-black dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 active:scale-95 group">
            {loading ? <RefreshCw className="animate-spin" size={32} /> : (
                <>{isSignup ? 'CREATE PROFILE' : 'VERIFY IDENTITY'} <Shield size={32} /></>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button onClick={() => setIsSignup(!isSignup)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors border-b border-slate-200 dark:border-slate-800 pb-1">
            {isSignup ? 'Already registered? Verify access' : 'No account? Create identity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [allResults, setAllResults] = useState<AssessmentResult[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [lastResult, setLastResult] = useState<AssessmentResult | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const init = async () => {
      try { await initPython(); } catch (e) {}
      const currentUser = await backend.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.role === 'Admin') {
          const res = await backend.getAllResults();
          const usrs = await backend.getAllUsers();
          setAllResults(res || []);
          setAllUsers(usrs || []);
          setView('admin-dashboard');
        } else {
          const history = await backend.getHistory(currentUser.id);
          setResults(history || []);
          setView('dashboard');
        }
      }
    };
    init();
  }, []);

  const handleLogin = async (u: User) => {
    setUser(u);
    if (u.role === 'Admin') {
      const res = await backend.getAllResults();
      const usrs = await backend.getAllUsers();
      setAllResults(res || []);
      setAllUsers(usrs || []);
      setView('admin-dashboard');
    } else {
      const history = await backend.getHistory(u.id);
      setResults(history || []);
      setView('dashboard');
    }
  };

  const handleLogout = async () => {
    await backend.logout();
    setUser(null);
    setResults([]);
    setAllResults([]);
    setAllUsers([]);
    setAiInsights(null);
    setLastResult(null);
    setView('landing');
  };

  const handleAssessmentComplete = async (questions: Question[], answers: Record<number, string>, dept: string) => {
    if (!user) return;
    setLoadingInsights(true);
    try {
      const res = await backend.processAndSaveAssessment(user.id, dept, questions, answers);
      setResults([res, ...results]);
      setLastResult(res);
      setView('result-summary');
      
      const freshInsights = await getAIImprovementPlan(res.scores, user.role, dept);
      setAiInsights(freshInsights);
    } catch (e) {
      alert("AI profiling timed out. The system will retry background generation.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    await backend.deleteResult(id);
    if (user?.role === 'Admin') {
      setAllResults(prev => prev.filter(r => r.id !== id));
    } else {
      setResults(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-300">
      <Navigation view={view} setView={setView} user={user} logout={handleLogout} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      <main className="flex-grow">
        {view === 'landing' && <Landing onStart={() => setView('role-select')} onOverview={() => setView('presentation')} />}
        {view === 'role-select' && <RoleSelect excludeGuest={user?.role === 'Guest'} onSelect={(r) => { setSelectedRole(r); if (r === 'Guest') { setUser({ id: 'guest_' + Math.random().toString(36).slice(2, 11), email: 'guest@session.local', fullName: 'Guest User', role: 'Guest', createdAt: new Date().toISOString() }); setView('assessment'); } else setView('auth'); }} />}
        {view === 'auth' && selectedRole && <AuthForm role={selectedRole} onBack={() => setView('role-select')} onLogin={handleLogin} />}
        {view === 'profile' && user && <ProfileView user={user} onUpdate={setUser} onBack={() => setView(user.role === 'Admin' ? 'admin-dashboard' : 'dashboard')} />}
        {view === 'assessment' && <Assessment user={user} onComplete={handleAssessmentComplete} />}
        {view === 'result-summary' && lastResult && <ResultSummary result={lastResult} insights={aiInsights} onContinue={() => setView('improvement')} />}
        {view === 'admin-dashboard' && user?.role === 'Admin' && <AdminDashboard allResults={allResults} allUsers={allUsers} onDeleteResult={handleDeleteResult} adminUser={user} />}
        {view === 'dashboard' && user && <Dashboard user={user} results={results} onReset={() => setView('assessment')} onAcceptPathway={(i) => { if(i) setAiInsights(i); setView('improvement'); }} onDeleteResult={handleDeleteResult} aiInsights={aiInsights} loadingInsights={loadingInsights} />}
        {view === 'improvement' && user && <ImprovementCenter insights={aiInsights} user={user} result={results[0] || null} onBack={() => setView('dashboard')} />}
        {view === 'presentation' && <Presentation />}
      </main>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-8 text-center text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase no-print">
        © 2026 SDG-INSIGHT FRAMEWORK
      </footer>
    </div>
  );
}

const ProfileView = ({ user, onUpdate, onBack }: { user: User, onUpdate: (u: User) => void, onBack: () => void }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [institution, setInstitution] = useState(user.institution || '');
  const [role, setRole] = useState<Role>(user.role);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await backend.updateUser(user.id, { fullName, email, role, institution });
      onUpdate(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-24 animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest mb-12 transition-all hover:translate-x-[-8px]"><ArrowLeft size={24} /> Back</button>
      <div className="bg-white dark:bg-slate-900 p-16 rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <header className="mb-12 text-center">
          <div className="w-32 h-32 sdg-gradient rounded-[2.5rem] mx-auto flex items-center justify-center text-white text-5xl font-black mb-8 shadow-2xl ring-8 ring-slate-100 dark:ring-slate-800">{fullName.charAt(0).toUpperCase()}</div>
          <h2 className="text-5xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white">Institutional Identity</h2>
        </header>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Full Name</label>
            <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Affiliation</label>
            <input required type="text" value={institution} onChange={e => setInstitution(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xl text-slate-900 dark:text-white" />
          </div>
          <button disabled={loading} type="submit" className={`w-full py-6 rounded-3xl font-black text-xl shadow-2xl transition-all active:scale-95 ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-black'}`}>
            {loading ? <RefreshCw className="animate-spin" size={32} /> : success ? 'IDENTITY SYNCHRONIZED' : 'UPDATE IDENTITY'}
          </button>
        </form>
      </div>
    </div>
  );
};