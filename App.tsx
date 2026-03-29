import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Home, ClipboardCheck, LogOut, 
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
  CloudCheck, X, HelpCircle
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, Radar as RadarComponent,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';
import { Role, Question, AssessmentScores, AssessmentResult, AIInsights, User, CloudSyncStatus } from './types';
import { DEPARTMENTS, COUNTRIES, OTHER_DEPARTMENTS } from './constants';
import { generateSDGQuestions, getAIImprovementPlan, fetchSearchImage, shuffleArray } from './services/geminiService';
import { backend } from './services/backendService';
import { vault } from './services/vault';
import { initPython } from './services/pythonBackend';
import { calculateScoresInPython } from './services/pythonBackend';
import unsplashCacheData from './data/unsplash_cache.json';

import { SystemHealth } from './src/components/SystemHealth';

// --- UI COMPONENTS ---

const Logo = ({ size = 24, className = "" }: { size?: number, className?: string }) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      <img src="/favicon.svg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
};

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
  const [data, setData] = useState<{url: string, source?: string, photographer?: string, photographerUrl?: string, downloadLocation?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Simple Safari detection
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariBrowser = /safari/.test(userAgent) && !/chrome|android|crios|fxios/.test(userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchImage = async () => {
      setLoading(true);
      setDownloadTriggered(false);
      try {
        const result = await fetchSearchImage(prompt);
        console.log(`[ContextImage] Result for "${prompt}":`, result);
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

  const handleImageLoad = async () => {
    if (data?.downloadLocation && !downloadTriggered) {
      setDownloadTriggered(true);
      try {
        await fetch('/api/images/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ downloadLocation: data.downloadLocation })
        });
      } catch (e) {
        console.error("Failed to trigger Unsplash download:", e);
      }
    }
  };

  return (
    <div className={`relative group overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}>
      {loading ? (
        <div className="flex flex-col items-center gap-2 opacity-20 animate-pulse text-center p-4">
          <ImageIcon size={24} />
          <span className="text-[7px] font-black uppercase tracking-tighter text-slate-900 dark:text-white">Sourcing...</span>
        </div>
      ) : (
        <img 
          src={data?.url || ""} 
          alt={prompt} 
          className="w-full h-full object-cover animate-in fade-in duration-1000" 
          onLoad={handleImageLoad}
          referrerPolicy="no-referrer"
          onError={(e) => (e.currentTarget.src = "https://picsum.photos/seed/nature/800/600")}
        />
      )}
      
      {/* Decorative Overlays - set to pointer-events-none so they don't block hover */}
      {overlay && <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply pointer-events-none" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      
      {/* Attribution - Conditional based on browser */}
      {!loading && data?.photographer && (data?.source?.toLowerCase() === 'unsplash' || !data?.source) && (
        isSafari ? (
          /* Safari Style: Floating Pill (as requested) */
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div 
              className="bg-black/70 px-4 py-2 rounded-full border border-white/10 shadow-2xl flex items-center justify-center"
              style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <p className="text-[10px] font-bold text-white/90 whitespace-nowrap">
                Photo by <a href={`${data.photographerUrl}?utm_source=sdg_insight&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white transition-all">{data.photographer}</a> on <a href="https://unsplash.com/?utm_source=sdg_insight&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white transition-all">Unsplash</a>
              </p>
            </div>
          </div>
        ) : (
          /* Other Browsers Style: Bottom Bar */
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-[2px] py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-[8px] font-medium text-white/90 truncate">
              Photo by <a href={`${data.photographerUrl}?utm_source=sdg_insight&utm_medium=referral`} target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white transition-all">{data.photographer}</a> on <a href="https://unsplash.com/?utm_source=sdg_insight&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline decoration-white/30 hover:decoration-white transition-all">Unsplash</a>
            </p>
          </div>
        )
      )}
    </div>
  );
};

const AdminDashboard = ({ allResults, allUsers, onDeleteResult, onDeleteUser, adminUser, onRefreshUsers }: { allResults: AssessmentResult[], allUsers: User[], onDeleteResult: (id: string) => void, onDeleteUser: (id: string) => void, adminUser: User, onRefreshUsers: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'results' | 'users'>('results');
  
  // Create/Edit User States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    email: '',
    fullName: '',
    role: 'Student' as Role,
    password: '',
    institution: adminUser.institution,
    country: adminUser.country
  });
  const [loading, setLoading] = useState(false);

  const userMap = useMemo(() => {
    const map: Record<string, User> = {};
    (allUsers || []).forEach(u => { map[u.id] = u; });
    return map;
  }, [allUsers]);

  const resultsForAdmin = useMemo(() => {
    return (allResults || []).filter(r => {
      const user = userMap[r.userId];
      if (!user) return false;
      if (user.role === 'Guest') return false;
      return user.institution === adminUser.institution;
    });
  }, [allResults, userMap, adminUser.institution]);

  const usersInInstitution = useMemo(() => {
    return (allUsers || []).filter(u => u.institution === adminUser.institution && u.role !== 'Guest' && u.id !== adminUser.id);
  }, [allUsers, adminUser.institution, adminUser.id]);

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

  const filteredUsers = usersInInstitution.filter(u => {
    const searchString = `${u.fullName} ${u.email} ${u.role}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await backend.adminUpdateUser(adminUser.id, editingUser.id, userForm);
      } else {
        await backend.adminCreateUser(adminUser.id, userForm);
      }
      setShowUserModal(false);
      onRefreshUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUserClick = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      onDeleteUser(userId);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      password: '', // Don't show password, only allow reset
      institution: user.institution,
      country: user.country
    });
    setShowUserModal(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserForm({
      email: '',
      fullName: '',
      role: 'Student',
      password: '',
      institution: adminUser.institution,
      country: adminUser.country
    });
    setShowUserModal(true);
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-slide-up">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
        <div>
          <Badge variant="info">Admin Center</Badge>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-2 text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-500 font-bold mt-1">Global analytics and dataset management.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-0 sm:mr-4">
            <button 
              onClick={() => setActiveTab('results')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'results' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Results
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 sm:px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Users
            </button>
          </div>
          {activeTab === 'results' && (
            <button 
              onClick={exportToCSV}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
            >
              <Download size={18} /> Export CSV
            </button>
          )}
          {activeTab === 'users' && (
            <button 
              onClick={openCreateModal}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
            >
              <UserPlus size={18} /> Create User
            </button>
          )}
        </div>
      </header>

      {activeTab === 'results' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black mb-6 sm:mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><BarChart3 className="text-emerald-500" /> Departmental Benchmark</h3>
              <div className="h-64 sm:h-80 w-full">
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

            <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black mb-6 sm:mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><Activity className="text-blue-500" /> Global Dimension Averages</h3>
              <div className="h-64 sm:h-80 w-full">
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

          <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><History className="text-emerald-500" /> Assessment Ledger</h3>
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
                    <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Participant</th>
                    <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</th>
                    <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Index</th>
                    <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map(r => {
                    const user = userMap[r.userId];
                    return (
                      <tr key={r.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                        <td className="py-4 sm:py-6 pl-4">
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
                        <td className="py-4 sm:py-6">
                          <span className="text-xs font-bold text-slate-500">{user?.institution || 'N/A'}</span>
                        </td>
                        <td className="py-4 sm:py-6">
                          <Badge variant="info">{r.dept}</Badge>
                        </td>
                        <td className="py-4 sm:py-6">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-slate-900 dark:text-white">{r.scores.total}</span>
                            <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden hidden md:block">
                              <div className="h-full bg-emerald-500" style={{ width: `${r.scores.total}%` }} />
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
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white"><Users2 className="text-blue-500" /> User Directory</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold outline-none focus:ring-2 ring-blue-500/20 transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">User</th>
                  <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</th>
                  <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="pb-4 sm:pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                    <td className="py-4 sm:py-6 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-black text-blue-500">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white">{u.fullName}</div>
                          <div className="text-[10px] font-bold text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 sm:py-6">
                      <Badge variant={u.role === 'Admin' ? 'danger' : u.role === 'Faculty/Staff' ? 'info' : 'success'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 sm:py-6">
                      <span className="text-xs font-bold text-slate-500">{u.institution}</span>
                    </td>
                    <td className="py-4 sm:py-6">
                      <div className="text-xs font-bold text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="py-4 sm:py-6 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(u)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-all"
                          title="Edit User"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUserClick(u.id, u.fullName)}
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-slide-up">
            <header className="p-6 sm:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{editingUser ? 'Update User' : 'Create New User'}</h3>
                <p className="text-xs text-slate-500 font-bold mt-1">Manage institutional access.</p>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 sm:p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X size={24} />
              </button>
            </header>
            
            <form onSubmit={handleSaveUser} className="p-6 sm:p-10 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={userForm.fullName}
                  onChange={e => setUserForm({...userForm, fullName: e.target.value})}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={userForm.email}
                  onChange={e => setUserForm({...userForm, email: e.target.value})}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                  placeholder="john@institution.edu"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Role</label>
                <select 
                  value={userForm.role}
                  onChange={e => setUserForm({...userForm, role: e.target.value as Role})}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty/Staff">Faculty/Staff</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Initial Password'}
                </label>
                <input 
                  required={!editingUser}
                  type="password" 
                  value={userForm.password}
                  onChange={e => setUserForm({...userForm, password: e.target.value})}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                disabled={loading}
                type="submit" 
                className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-2xl font-black text-base sm:text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" /> : (editingUser ? 'Update Profile' : 'Create Profile')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ user, results, onReset, onAcceptPathway, onDeleteResult, onViewResult, aiInsights, loadingInsights }: { user: User, results: AssessmentResult[], onReset: () => void, onAcceptPathway: (i: AIInsights) => void, onDeleteResult: (id: string) => void, onViewResult: (res: AssessmentResult) => void, aiInsights: AIInsights | null, loadingInsights: boolean }) => {
  const result = (results || [])[0] || null;
  const currentInsights = aiInsights || result?.aiInsights || null;

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center animate-slide-up">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 dark:text-slate-600 mb-8 shadow-inner">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">No Assessment Data</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-md mb-10">
          You haven't completed any SDG assessments yet. Complete one to unlock personalized AI insights and strategic roadmaps.
        </p>
        <button 
          onClick={onReset}
          className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 active:scale-95 transition-all shadow-xl flex items-center gap-3"
        >
          <Sparkles size={24} /> Start Assessment Now
        </button>
      </div>
    );
  }

  const radarData = [
    { subject: 'Knowledge', A: result.scores.knowledge },
    { subject: 'Attitude', A: result.scores.attitude },
    { subject: 'Engagement', A: result.scores.engagement },
    { subject: 'Exposure', A: result.scores.exposure }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-slide-up">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Personal SDG Insight</h1>
          <p className="text-slate-500 font-bold mt-1">Institutional metrics for {user.fullName}.</p>
          {user.institution && <Badge variant="info" className="mt-3">{user.institution}</Badge>}
        </div>
        <div className="flex gap-4 no-print flex-wrap">
          <button onClick={() => onAcceptPathway(currentInsights!)} className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 text-sm sm:text-base">
            <FileText size={18} /> Export Full Report
          </button>
          <button onClick={onReset} className="px-4 sm:px-6 py-2 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-black flex items-center gap-2 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 text-sm sm:text-base">
            <RotateCcw size={18} /> New Assessment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
        <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 sm:mb-10">Performance Index</h3>
          {result ? (
            <>
              <div className="text-7xl sm:text-9xl font-black leading-none tracking-tighter mb-6 sm:mb-10 text-slate-900 dark:text-white">{result.scores.total}</div>
              <div className="h-48 sm:h-64 mt-4">
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

        <div className="lg:col-span-2 bg-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
          {loadingInsights ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <RefreshCw className="animate-spin text-emerald-500" size={48} />
              <p className="font-bold text-xl">AI Engine Synthesizing...</p>
            </div>
          ) : currentInsights ? (
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 bg-emerald-500/20 rounded-2xl text-emerald-400 shadow-lg"><BrainCircuit size={32} /></div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight">AI Strategy Insight</h3>
              </div>
              <p className="text-lg sm:text-xl text-slate-300 italic mb-6 sm:mb-10">"{currentInsights.summary}"</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 sm:mb-10">
                {(currentInsights?.improvementSteps || []).slice(0, 4).map((step, i) => {
                  const stepStr = typeof step === 'string' ? step : '';
                  const parts = stepStr.split(':');
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
              <div className="mt-auto pt-6 sm:pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 no-print">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Tactical Focus</span>
                  <span className="text-sm font-black text-slate-300 uppercase tracking-tighter max-w-[200px] truncate">{currentInsights.quickSuggestions[0] || 'Strategic Alignment'}</span>
                </div>
                <button onClick={() => onAcceptPathway(currentInsights)} className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-5 bg-emerald-600 rounded-2xl font-black hover:bg-emerald-700 active:scale-95 transition-all shadow-xl flex items-center justify-center sm:justify-start gap-2">
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

      <div className="grid grid-cols-1 gap-6 sm:gap-8">
        <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-black mb-6 sm:mb-10 flex items-center gap-3 text-slate-900 dark:text-white"><History className="text-emerald-500" /> Historical Timeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(results || []).map((res) => (
              <div 
                key={res.id} 
                onClick={() => onViewResult(res)}
                className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 group relative hover:border-emerald-500 transition-all overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/10 group-hover:bg-emerald-500 transition-colors" />
                <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
                   <div>
                     <h4 className="font-black text-base sm:text-lg text-slate-900 dark:text-white">{res.dept}</h4>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> {new Date(res.timestamp).toLocaleDateString()}</span>
                   </div>
                   <div className="text-xl sm:text-2xl font-black text-emerald-500">{res.scores.total}</div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteResult(res.id);
                  }} 
                  className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all absolute bottom-4 sm:bottom-6 right-4 sm:right-6 hover:scale-110 no-print"
                >
                  <Trash2 size={18} />
                </button>
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

const ResultSummary = ({ result, insights, onContinue, onReview, loading }: { result: AssessmentResult | null, insights: AIInsights | null, onContinue: () => void, onReview: () => void, loading?: boolean }) => {
  if (loading || !result) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 flex flex-col items-center justify-center text-center animate-slide-up">
        <div className="relative mb-10 sm:mb-16">
          <div className="w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/10 rounded-full animate-ping absolute inset-0" />
          <div className="w-32 h-32 sm:w-48 sm:h-48 bg-emerald-500/20 rounded-full animate-pulse absolute inset-0" />
          <div className="relative w-32 h-32 sm:w-48 sm:h-48 bg-white dark:bg-slate-900 rounded-full shadow-2xl flex items-center justify-center border-4 border-emerald-500/30">
            <BrainCircuit size={48} className="sm:w-20 sm:h-20 text-emerald-500 animate-bounce" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 sm:mb-6 text-slate-900 dark:text-white">
          AI Analysis in Progress
        </h1>
        <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
          <p className="text-lg sm:text-xl text-slate-500 font-bold leading-tight">
            Our strategic engine is synthesizing your responses to map your institutional SDG alignment...
          </p>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="h-full sdg-gradient animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
          </div>
          <div className="flex justify-center gap-4 sm:gap-8 pt-6 sm:pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500 shadow-sm">
                <Database size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scoring</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 shadow-sm">
                <Sparkles size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insights</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500 shadow-sm">
                <Target size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Knowledge', A: result.scores.knowledge },
    { subject: 'Attitude', A: result.scores.attitude },
    { subject: 'Engagement', A: result.scores.engagement },
    { subject: 'Exposure', A: result.scores.exposure }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-slide-up">
      <div className="text-center mb-10 sm:mb-16 relative">
        <div className="inline-block p-6 sm:p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-6 sm:mb-8 text-emerald-500 animate-bounce shadow-xl">
          <Award size={48} className="sm:w-[72px] sm:h-[72px]" />
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white">
          Success Unlocked
        </h1>
        <p className="text-xl sm:text-2xl text-slate-500 font-bold max-w-2xl mx-auto leading-tight">
          Your SDG impact profile for <span className="text-emerald-500">{result.dept}</span> has been synthesized.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch mb-8 sm:mb-12">
        {/* Left Card: Radar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center">
          <Badge variant="success">SDG Alignment Matrix</Badge>
          <div className="relative mt-6 sm:mt-8 mb-6 sm:mb-8 w-full h-64 sm:h-80 flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: '900' }} />
                <RadarComponent name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-full shadow-2xl border-4 sm:border-[6px] border-emerald-500 scale-100 sm:scale-110">
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{result.scores.total}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Index</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
            {radarData.map(d => (
              <div key={d.subject} className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl sm:rounded-3xl text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{d.subject}</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{d.A}/25</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card: Combined AI Insights with Expanded Suggestions */}
        <div className="bg-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-2xl text-white relative overflow-hidden group flex flex-col max-h-[800px]">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <ContextImage prompt={`cinematic sustainable ${result.dept} vision`} className="w-full h-full" overlay={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          </div>
          
          <div className="relative z-10 flex flex-col flex-grow overflow-hidden">
            <div className="flex items-center gap-4 mb-6 sm:mb-10 shrink-0">
              <div className="p-3 sm:p-4 bg-emerald-500/20 rounded-xl sm:rounded-2xl text-emerald-400 shadow-lg backdrop-blur-md"><Sparkle size={32} /></div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight">AI Strategy</h3>
            </div>

            {!insights ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-6">
                <RefreshCw className="animate-spin text-emerald-500" size={48} />
                <p className="font-black text-xl text-emerald-400 animate-pulse">SYNTHESIZING MATRIX...</p>
              </div>
            ) : (
              <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar pr-4">
                <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-lg rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 mb-8 shrink-0">
                  <p className="text-xl sm:text-2xl text-slate-100 italic leading-relaxed font-bold">"{insights.summary}"</p>
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

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12">
        <button onClick={onContinue} className="flex-1 py-6 sm:py-8 bg-emerald-600 text-white rounded-[2rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-2xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-4 group">
          View Full Report <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
        </button>
        <button onClick={onReview} className="flex-1 py-6 sm:py-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-4">
          Review Answers <CheckCircle2 size={32} />
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

      // Rule-based question count
      let count = 10;
      if (user.role !== 'Guest') {
        const rand = Math.random();
        if (rand < 0.1) {
          count = 20; // Rare case
        } else {
          count = Math.floor(Math.random() * 5) + 11; // 11 to 15
        }
      }

      try {
        const qs = await generateSDGQuestions(finalDept, user.role, difficulty, count);
        setQuestions(qs);
        
        // Automatic Background Saving to Firestore
        if (user && user.role !== 'Admin') {
          backend.saveAiInteraction(user.id, `AI Question Generation: ${finalDept}`, qs);
        }
      } catch (e) {
        alert("AI node busy. Resetting connection...");
      }
    } catch (e) {
      alert("AI node busy. Resetting connection...");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!dept) return;
    
    const slogans: Record<string, string> = {
      'Computer Science': 'Architecting sustainable algorithms for a carbon-neutral digital future.',
      'Environmental Science': 'Pioneering ecological resilience through data-driven conservation strategies.',
      'Business Administration': 'Redefining corporate value through triple-bottom-line institutional leadership.',
      'Social Sciences': 'Empowering equitable communities through systemic socio-economic transformation.',
      'Mechanical Engineering': 'Engineering the next generation of circular industrial systems.',
      'Medicine': 'Advancing planetary health through sustainable clinical innovation.',
      'Arts & Humanities': 'Cultivating cultural narratives for a regenerative global consciousness.',
      'Law': 'Advocating for climate justice through robust institutional legal frameworks.',
      'Other': 'Driving localized SDG impact through specialized academic excellence.'
    };

    setSuggestedSlogan(slogans[dept] || slogans['Other']);
  }, [dept]);

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  // Shuffle options for the current question
  const shuffledOptions = useMemo(() => {
    if (!q) return [];
    return shuffleArray([...q.options]);
  }, [q?.id, q?.options]);

  if (!dept || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24 animate-slide-up">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="warning">Institutional Selection</Badge>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mt-4 mb-4 text-slate-900 dark:text-white">Choose Your Domain</h2>
          <p className="text-lg sm:text-xl text-slate-500 font-bold">The framework will adapt its logic to your specific academic field.</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map(d => (
                <button key={d} onClick={() => setDept(d)} className={`group relative overflow-hidden p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 transition-all text-left font-black text-xs sm:text-sm uppercase tracking-tight ${dept === d ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-50 border-transparent hover:border-slate-200 dark:bg-slate-800 dark:hover:border-slate-700 text-slate-500'}`}>
                  <span className="relative z-10">{d}</span>
                  {dept === d && <Zap size={14} className="absolute top-4 right-4 text-emerald-500 animate-pulse" />}
                </button>
              ))}
            </div>

            {dept === 'Other' && (
              <div className="mt-8 animate-slide-up">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block">Specified Field</label>
                <select 
                  required 
                  value={customDept} 
                  onChange={e => setCustomDept(e.target.value)} 
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 rounded-2xl sm:rounded-3xl font-bold outline-none transition-all shadow-inner text-lg sm:text-xl text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="" disabled>Select your specialized domain...</option>
                  {OTHER_DEPARTMENTS.map(od => (
                    <option key={od} value={od}>{od}</option>
                  ))}
                </select>
              </div>
            )}

            {dept && (
              <div className="space-y-8 animate-slide-up">
                <div className="p-6 sm:p-10 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-1/3 h-full opacity-20 transition-opacity">
                      <ContextImage prompt={`${finalDept} academic research`} className="w-full h-full" overlay={false} />
                  </div>
                  <div className="p-4 sm:p-6 bg-emerald-500/20 rounded-2xl sm:rounded-[2rem] text-emerald-400 backdrop-blur-md relative z-10"><Sparkles size={40} /></div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Institutional Mandate</span>
                    <p className="text-xl sm:text-2xl font-bold leading-tight italic">"{suggestedSlogan}"</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <button disabled={!dept || (dept === 'Other' && !customDept.trim()) || loading} onClick={startAssessment} className="w-full py-6 sm:py-8 bg-emerald-600 text-white rounded-[2rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 group">
                    {loading ? <RefreshCw className="animate-spin" size={32} /> : (
                      <>Deploy Framework <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-slide-up">
      <div className="flex justify-between items-end mb-8 sm:mb-12">
        <div>
          <Badge variant="info">{q.type}</Badge>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mt-2 sm:mt-4 text-slate-900 dark:text-white">Question {currentIdx + 1}/{questions.length}</h2>
        </div>
        <div className="text-right">
          <span className="text-base sm:text-lg font-black text-emerald-500 tracking-widest">{Math.round(progress)}%</span>
          <div className="w-32 sm:w-48 h-2 sm:h-3 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 sm:mt-3 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="h-full sdg-gradient transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-16 rounded-[2rem] sm:rounded-[4.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden min-h-[400px] sm:min-h-[550px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <ContextImage prompt={`${finalDept} concept`} className="w-full h-full" overlay={false} />
        </div>
        <h3 className="text-2xl sm:text-4xl font-black leading-tight mb-8 sm:mb-16 tracking-tight text-slate-900 dark:text-white relative z-10">{q.text}</h3>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 relative z-10">
          {shuffledOptions.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} className="group p-4 sm:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl sm:rounded-[2.5rem] border-2 border-transparent hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-all text-left flex items-center gap-4 sm:gap-8 shadow-sm hover:shadow-xl">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-white dark:bg-slate-700 flex items-center justify-center font-black text-xl sm:text-2xl text-slate-400 group-hover:text-emerald-500 transition-all border border-slate-100 dark:border-slate-600 group-hover:scale-110 shrink-0">
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ImprovementCenter = ({ insights, user, result, onBack }: { insights: AIInsights | null, user: User, result: AssessmentResult | null, onBack: () => void }) => {
  if (!result) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center animate-slide-up">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 dark:text-slate-600 mb-8 shadow-inner">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Pathway Locked</h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg max-w-md mb-10">
          Strategic pathways require assessment data. Please complete an assessment to generate your tactical roadmap.
        </p>
        <button 
          onClick={onBack}
          className="px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl flex items-center gap-3"
        >
          <ArrowLeft size={24} /> Back to Insights
        </button>
      </div>
    );
  }

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

      {/* --- PDF REPORT START (Print Only) --- */}
      <div className="hidden print:block">
        {/* PAGE 1: COVER PAGE */}
        <div className="pdf-page bg-slate-950 flex flex-col justify-between p-20 relative overflow-visible">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] -mr-96 -mt-96 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] -ml-64 -mb-64 rounded-full" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-20">
              <Logo size={64} className="rounded-2xl" />
              <span className="text-2xl font-black tracking-tighter text-white">SDG-INSIGHT</span>
            </div>
            
            <div className="space-y-4">
              <div className="h-1 w-32 bg-emerald-500 mb-8" />
              <h1 className="text-[110px] font-black leading-[0.8] tracking-tighter text-white break-words">
                STRATEGIC<br />
                <span className="text-emerald-500">HORIZON</span>
              </h1>
              <p className="text-4xl font-bold text-slate-400 max-w-2xl leading-tight mt-12 break-words">
                Comprehensive Sustainability Assessment & Institutional Growth Roadmap
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-20 border-t border-white/10 pt-16">
            <div className="overflow-visible">
              <div className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">Prepared For</div>
              <div className="text-5xl font-black text-white mb-3 break-words leading-tight">{user.fullName}</div>
              <div className="text-2xl font-bold text-slate-400 break-words">{user.institution || 'Institutional Partner'}</div>
              <div className="text-xl font-medium text-slate-500 mt-2">{result?.dept} Department</div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">Report Metadata</div>
              <div className="text-3xl font-black text-white mb-2 uppercase">ID: {result?.id.slice(0, 12)}</div>
              <div className="text-xl font-bold text-slate-400">Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="text-lg font-medium text-slate-500 mt-2">Classification: Confidential / Level 4</div>
            </div>
          </div>
        </div>

        {/* PAGE 2: EXECUTIVE SUMMARY */}
        <div className="pdf-page bg-slate-950 p-20">
          <div className="flex justify-between items-center mb-20">
            <h2 className="text-4xl font-black text-white tracking-tighter">01. EXECUTIVE SUMMARY</h2>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Strategic Horizon Report</div>
          </div>

          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-4">
              <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/10 text-center">
                <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-8">Performance Index</div>
                <div className="text-[120px] font-black text-white leading-none mb-4">{result?.scores.total}</div>
                <div className="text-xl font-bold text-slate-400">Composite Score</div>
                
                <div className="mt-12 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: '800' }} />
                      <RadarComponent name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="col-span-8 space-y-12">
              <div className="bg-emerald-500/5 p-12 rounded-[4rem] border border-emerald-500/20 relative overflow-visible">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
                <Sparkle className="text-emerald-500 mb-8" size={48} />
                <h3 className="text-3xl font-black text-white mb-6">Synthesis Overview</h3>
                <p className="text-2xl text-slate-300 italic leading-relaxed font-medium break-words">
                  "{insights.summary}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-slate-900/50 rounded-[3rem] border border-white/10">
                  <div className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Benchmarking</div>
                  <p className="text-lg text-slate-400 font-bold leading-relaxed">
                    {insights.peerBenchmarking}
                  </p>
                </div>
                <div className="p-8 bg-slate-900/50 rounded-[3rem] border border-white/10">
                  <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4">Trajectory</div>
                  <p className="text-lg text-slate-400 font-bold leading-relaxed">
                    {insights.trajectory}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
              <Activity className="text-emerald-500" /> Impact Matrix Analysis
            </h3>
            <div className="grid grid-cols-3 gap-8">
              {(insights?.impactAnalysis || []).map((finding, i) => (
                <div key={i} className="p-8 bg-slate-900/30 rounded-[2.5rem] border border-white/5 flex flex-col">
                  <ContextImage prompt={finding.visualPrompt || `${finding.area} ${finding.status}`} className="w-full h-32 rounded-2xl mb-6 shrink-0" />
                  <Badge variant={finding.status === 'Excelled' ? 'success' : finding.status === 'Developing' ? 'info' : 'danger'} className="mb-4 self-start">
                    {finding.status}
                  </Badge>
                  <h4 className="font-black text-xl text-white mb-3">{finding.area}</h4>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed italic">"{finding.finding}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PAGE 3: TACTICAL ROADMAP */}
        <div className="pdf-page bg-slate-950 p-20">
          <div className="flex justify-between items-center mb-20">
            <h2 className="text-4xl font-black text-white tracking-tighter">02. TACTICAL ROADMAP</h2>
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Strategic Horizon Report</div>
          </div>

          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-7 space-y-8">
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                <Target className="text-emerald-500" /> Improvement Protocol
              </h3>
              {(insights?.improvementSteps || []).map((step, i) => {
                const stepStr = typeof step === 'string' ? step : '';
                const parts = stepStr.split(':');
                const title = parts.length > 1 ? parts[0].trim() : 'Strategic Milestone';
                const desc = parts.length > 1 ? parts.slice(1).join(':').trim() : parts[0].trim();
                return (
                  <div key={i} className="p-8 bg-slate-900/50 rounded-[2.5rem] border border-white/10 flex items-start gap-8">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shrink-0">{i + 1}</div>
                    <div>
                      <h4 className="font-black text-2xl text-white mb-2 tracking-tight">{title}</h4>
                      <p className="text-lg text-slate-400 font-bold leading-relaxed break-words">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="col-span-5 space-y-12">
              <div className="bg-slate-900/80 p-10 rounded-[4rem] border border-white/10 relative overflow-visible">
                <div className="absolute top-0 right-0 w-full h-full opacity-10">
                  <ContextImage prompt="abstract tech network emerald" className="w-full h-full" overlay={false} />
                </div>
                <div className="relative z-10">
                  <Flag className="text-amber-500 mb-6" size={48} />
                  <h3 className="text-2xl font-black text-white mb-8">Key Milestones</h3>
                  <div className="space-y-8">
                    {(insights?.milestones || []).map((m, i) => (
                      <div key={i} className="pl-6 border-l-2 border-white/10 relative">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 bg-amber-500 rounded-full" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">{m.timeframe}</span>
                        <h4 className="text-lg font-black text-white leading-tight">{m.label}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1">{m.objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 bg-blue-500/5 rounded-[3rem] border border-blue-500/20">
                <BookOpen className="text-blue-500 mb-6" size={40} />
                <h3 className="text-xl font-black text-white mb-6">Academic Citations</h3>
                <div className="space-y-4">
                  {(insights?.resources || []).slice(0, 3).map((res, i) => (
                    <div key={i} className="p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-black text-blue-400 mb-1 truncate">{res.title}</h4>
                      <p className="text-[10px] text-slate-500 font-bold leading-tight line-clamp-2 italic">"{res.description}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 4: RISK ASSESSMENT & SIGN-OFF */}
        <div className="pdf-page bg-slate-950 p-20 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-20">
              <h2 className="text-4xl font-black text-white tracking-tighter">03. RISK & VALIDATION</h2>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Strategic Horizon Report</div>
            </div>

            <div className="space-y-8 max-w-5xl">
              <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                <ShieldAlert className="text-rose-500" /> Risk Mitigation Layer
              </h3>
              {(insights?.riskMitigation || []).map((risk, i) => (
                <div key={i} className="p-10 bg-rose-500/5 rounded-[3rem] border border-rose-500/20 flex gap-10 items-center">
                  <ContextImage prompt={risk.visualPrompt || `${risk.risk} ${risk.impactLevel === 'High' ? 'critical risk' : 'warning'}`} className="w-32 h-32 rounded-3xl shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="danger">{risk.impactLevel} Impact</Badge>
                      <h4 className="text-2xl font-black text-white">{risk.risk}</h4>
                    </div>
                    <p className="text-lg text-slate-400 font-bold leading-relaxed break-words">
                      {risk.mitigation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-20 pt-20 border-t border-white/10">
            <div className="grid grid-cols-12 gap-20 items-end">
              <div className="col-span-8">
                <h3 className="text-3xl font-black text-white mb-6">Final Validation</h3>
                <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-2xl">
                  This report serves as a formal baseline for institutional sustainability growth. The findings are generated through a combination of rule-based logic and real-time AI synthesis, verified against global SDG frameworks.
                </p>
              </div>
              <div className="col-span-4 text-right">
                <div className="mb-12">
                  <div className="h-16 w-64 border-b-2 border-white/20 ml-auto mb-4" />
                  <div className="text-lg font-black text-white uppercase tracking-widest">Institutional Lead</div>
                  <div className="text-sm font-bold text-slate-500">{user.fullName}</div>
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Verified By</div>
                  <div className="text-lg font-black text-white">SDG-INSIGHT ENGINE v2.5</div>
                </div>
              </div>
            </div>
            
            <div className="mt-20 flex justify-between items-center text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">
              <span>© 2026 SDG-INSIGHT FRAMEWORK</span>
              <span>CONFIDENTIAL DOCUMENT</span>
              <span>PAGE 04 / 04</span>
            </div>
          </div>
        </div>
      </div>
      {/* --- PDF REPORT END --- */}

      {/* SCREEN VIEW START */}
      <div className="no-print">
        <header className="mb-10 sm:mb-16">
          <Badge variant="success">Institutional Growth Roadmap</Badge>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mt-4">Strategic Horizon</h1>
          <p className="text-lg sm:text-2xl text-slate-500 mt-2 font-medium max-w-3xl">An AI-driven tactical analysis of sustainability integration and risk mitigation.</p>
        </header>

        <section className="mb-10 sm:mb-16 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Performance Index</h3>
            {result ? (
              <div className="flex flex-col items-center">
                <div className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-white mb-6">{result.scores.total}</div>
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
          <div className="lg:col-span-2 bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[4rem] shadow-2xl text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <Sparkle className="text-emerald-400" size={32} />
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Executive Summary</h3>
            </div>
            <p className="text-lg sm:text-xl text-slate-300 italic leading-relaxed relative z-10">"{insights.summary}"</p>
            <div className="mt-8 p-4 sm:p-6 bg-white/5 rounded-[1.5rem] sm:rounded-3xl border border-white/10 relative z-10">
              <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed">{insights.peerBenchmarking}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            <section className="bg-white dark:bg-slate-900/50 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-black flex flex-wrap items-center gap-2 sm:gap-4 text-slate-900 dark:text-white"><Activity className="text-emerald-500" size={32} /> Impact Matrix</h2>
                  <Badge variant="info">Contextual Findings</Badge>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                  {(insights?.impactAnalysis || []).map((finding, i) => (
                    <div key={i} className="group p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-700 flex flex-col h-full hover:shadow-2xl transition-all">
                      <ContextImage prompt={finding.visualPrompt || `${finding.area} ${finding.status}`} className="w-full h-40 sm:h-48 rounded-[1.5rem] sm:rounded-[2rem] mb-6 shrink-0" />
                      <Badge variant={finding.status === 'Excelled' ? 'success' : finding.status === 'Developing' ? 'info' : 'danger'}>
                        {finding.status}
                      </Badge>
                      <h4 className="font-black text-xl mt-6 mb-3 tracking-tight text-slate-900 dark:text-white">{finding.area}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed font-bold flex-grow italic">"{finding.finding}"</p>
                    </div>
                  ))}
               </div>
            </section>

            <section className="bg-white dark:bg-slate-900/50 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-black flex flex-wrap items-center gap-2 sm:gap-4 text-slate-900 dark:text-white"><AlertTriangle className="text-rose-500" size={32} /> Tactical Improvement Protocol</h2>
                  <Badge variant="info">Strategic Response</Badge>
               </div>
               <div className="space-y-6">
                  {(insights?.improvementSteps || []).map((step, i) => {
                    let title = 'Strategic Milestone';
                    let desc = '';
                    
                    if (typeof step === 'string') {
                      const parts = step.split(':');
                      title = parts.length > 1 ? parts[0].trim() : 'Strategic Milestone';
                      desc = parts.length > 1 ? parts.slice(1).join(':').trim() : parts[0].trim();
                    } else if (typeof step === 'object' && step !== null) {
                      title = (step as any).title || (step as any).area || 'Strategic Milestone';
                      desc = (step as any).desc || (step as any).description || (step as any).finding || '';
                    }

                    return (
                      <div key={i} className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 group hover:shadow-lg transition-all">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shrink-0 group-hover:scale-110 transition-transform">{i + 1}</div>
                        <div className="flex-1">
                          <h4 className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white mb-2">{title}</h4>
                          {desc && <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{desc}</p>}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </section>

            <section className="bg-white dark:bg-slate-900/50 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-xl border border-slate-100 dark:border-slate-800">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-black flex flex-wrap items-center gap-2 sm:gap-4 text-slate-900 dark:text-white"><ShieldAlert className="text-rose-500" size={32} /> Risk Mitigation Layer</h2>
                  <Badge variant="danger">Security Integrity</Badge>
               </div>
               <div className="space-y-6">
                  {(insights?.riskMitigation || []).map((risk, i) => (
                    <div key={i} className="p-6 sm:p-8 bg-rose-50/30 dark:bg-rose-900/10 rounded-[2rem] sm:rounded-[3rem] border border-rose-100 dark:border-rose-900/30 flex flex-col md:flex-row gap-6 sm:gap-8 group hover:shadow-lg transition-all">
                       <ContextImage prompt={risk.visualPrompt || `${risk.risk} ${risk.impactLevel === 'High' ? 'critical risk' : 'warning'}`} className="w-full md:w-48 h-40 sm:h-48 rounded-[1.5rem] sm:rounded-[2.5rem] shrink-0" />
                      <div className="flex-1 py-2">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                          <Badge variant="danger">{risk.impactLevel} Impact</Badge>
                          <h4 className="font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white">{risk.risk}</h4>
                        </div>
                        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900/40 rounded-[1.5rem] sm:rounded-[2rem] border border-rose-100 dark:border-rose-900/20">
                          <span className="text-[10px] uppercase font-black text-rose-500 block mb-2 tracking-widest">Protocol Response</span>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                            {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
            </section>
          </div>

          <aside className="space-y-8 sm:space-y-10">
            <div className="bg-slate-900 p-8 sm:p-12 rounded-[2rem] sm:rounded-[4rem] shadow-2xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-full h-full opacity-10">
                  <ContextImage prompt="interconnected global network bioluminescent" className="w-full h-full" overlay={false} />
               </div>
               <div className="relative z-10">
                 <Layers className="text-emerald-500 mb-6 sm:mb-8" size={48} />
                 <h3 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight leading-tight">{insights.trajectory}</h3>
                 <p className="text-slate-400 font-bold text-base sm:text-lg leading-relaxed">System-wide alignment achieved with global sustainability leadership protocols.</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
               <h2 className="text-xl sm:text-2xl font-black mb-6 sm:mb-8 flex items-center gap-3 text-slate-900 dark:text-white"><Flag className="text-amber-500" /> Key Milestones</h2>
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
                      className="block p-6 bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all shadow-md group"
                    >
                      <h4 className="text-sm font-black mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2 group-hover:underline">
                        {res.title} <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed line-clamp-4 italic">"{res.description}"</p>
                    </a>
                  ))}
               </div>
            </div>
          </aside>
        </div>
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
    <div className="max-w-5xl mx-auto py-12 sm:py-24 px-4 sm:px-6 animate-slide-up">
      <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] sm:rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[500px] sm:min-h-[700px] flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 sm:p-20 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 opacity-30" />
          <div className="mb-8 sm:mb-12 p-8 sm:p-14 bg-slate-50 dark:bg-slate-800 rounded-full shadow-inner ring-8 ring-slate-100 dark:ring-slate-800/50 transition-all">{slides[current].icon}</div>
          <h2 className="text-4xl sm:text-6xl font-black mb-6 sm:mb-8 tracking-tighter leading-none text-slate-900 dark:text-white">{slides[current].title}</h2>
          <p className="text-lg sm:text-2xl text-slate-500 font-bold max-w-2xl leading-relaxed italic mb-6 sm:mb-8">"{slides[current].content}"</p>
          
          {slides[current].details && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mt-4">
              {slides[current].details.map((d, i) => (
                <div key={i} className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[1.5rem] sm:rounded-3xl border border-slate-100 dark:border-slate-700 text-left">
                  <h4 className="font-black text-emerald-500 text-xs sm:text-sm uppercase tracking-widest mb-2">{d.label}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 sm:p-12 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 border-t border-slate-100 dark:border-slate-800 no-print">
          <div className="flex gap-2">
            {slides.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-500 ${current === i ? 'w-8 sm:w-12 bg-emerald-500' : 'w-3 sm:w-4 bg-slate-300 dark:bg-slate-700'}`} />
            ))}
          </div>
          <button onClick={() => setCurrent(p => (p + 1) % slides.length)} className="w-full sm:w-auto px-8 py-4 sm:px-14 sm:py-6 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-3xl font-black text-base sm:text-xl flex items-center justify-center gap-3 sm:gap-4 hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-xl active:scale-95 group">
            {current === slides.length - 1 ? 'RESTART' : 'CONTINUE'} <ArrowRight size={24} className="sm:w-8 sm:h-8 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Navigation = ({ view, setView, user, logout, isDark, toggleTheme }: { view: string, setView: (v: string) => void, user: User | null, logout: () => void, isDark: boolean, toggleTheme: () => void }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center no-print">
      <div className="flex items-center gap-4 sm:gap-10">
        <button onClick={() => setView('landing')} className="flex items-center gap-2 sm:gap-3 group">
          <Logo size={36} className="sm:w-[42px] sm:h-[42px] group-hover:rotate-[15deg] transition-transform duration-500 shadow-lg" />
          <span className="font-black text-xl sm:text-2xl tracking-tighter text-slate-900 dark:text-white">SDG<span className="text-emerald-500">INSIGHT</span></span>
        </button>

        <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          {user && (
            <>
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
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'assessment' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'} ${user.role === 'Admin' ? 'hidden' : ''}`}
              >
                Questions
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-5">
        <button onClick={toggleTheme} className="p-2 sm:p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 hidden dark:block" />
          <Moon className="w-5 h-5 sm:w-6 sm:h-6 block dark:hidden" />
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-4">
             <button onClick={() => user.role === 'Guest' ? setView('role-select') : setView('profile')} className="flex items-center gap-2 sm:gap-4 px-3 py-2 sm:px-5 sm:py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md group-hover:rotate-12 transition-transform">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-black leading-none text-slate-900 dark:text-white">{user.fullName}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{user.role}</div>
                </div>
             </button>
             <button onClick={logout} className="p-2 sm:p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95" title="Logout">
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
             </button>
          </div>
        ) : (
          <button onClick={() => setView('role-select')} className="px-4 py-2 sm:px-8 sm:py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
            Get Started
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-24 relative z-10 flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-6 sm:mb-10 text-slate-900 dark:text-white">
            DECODE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">IMPACT</span> <br />
            NOW.
          </h1>
          <p className="text-lg sm:text-2xl text-slate-500 font-bold max-w-xl mb-10 sm:mb-14 leading-tight">
            The global standard in higher education SDG benchmarking and institutional impact analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
            <button onClick={onStart} className="px-8 py-4 sm:px-12 sm:py-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-[2rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl flex items-center justify-center gap-4 hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-2xl hover:translate-y-[-6px] active:translate-y-0 group">
              Get Started <ArrowRight className="group-hover:translate-x-3 transition-transform w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <button onClick={onOverview} className="px-8 py-4 sm:px-12 sm:py-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl flex items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95">
              Protocol <Info className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 relative w-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 scale-100 sm:scale-110 lg:rotate-2">
              <div className="space-y-4 sm:space-y-6">
                <ContextImage prompt="modern university campus sustainability garden architecture" className="w-full h-48 sm:h-80 rounded-[2rem] sm:rounded-[4rem] shadow-2xl z-10" overlay={false} />
                <ContextImage prompt="international students collaborating sustainability project" className="w-full h-40 sm:h-64 rounded-[2rem] sm:rounded-[4rem] shadow-2xl" overlay={false} />
              </div>
              <div className="space-y-4 sm:space-y-6 pt-0 sm:pt-20">
                <ContextImage prompt="science student laboratory research innovation" className="w-full h-48 sm:h-80 rounded-[2rem] sm:rounded-[4rem] shadow-2xl" overlay={false} />
                <ContextImage prompt="clean renewable energy wind turbines sunset" className="w-full h-40 sm:h-64 rounded-[2rem] sm:rounded-[4rem] shadow-2xl" overlay={false} />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-24 animate-slide-up">
      <div className="text-center mb-12 sm:mb-20">
        <Badge variant="info">Profile Initialization</Badge>
        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mt-4 mb-6 leading-none text-slate-900 dark:text-white">Identify Yourself</h2>
        <p className="text-lg sm:text-2xl text-slate-500 font-bold max-w-2xl mx-auto">Select your institutional status to deploy specialized framework parameters.</p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${roles.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6 sm:gap-8`}>
        {roles.map(r => (
          <div key={r.id} onClick={() => onSelect(r.id)} className="group relative bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3rem] sm:rounded-[4.5rem] border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 transition-all shadow-xl text-left flex flex-col items-center text-center overflow-hidden cursor-pointer">
            <div className="absolute inset-0 opacity-10 transition-opacity">
                <ContextImage prompt={r.img} className="w-full h-full" overlay={false} />
            </div>
            <div className="mb-6 sm:mb-10 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-all shadow-inner group-hover:scale-110 relative z-10">
              {r.icon}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-4 relative z-10 text-slate-900 dark:text-white">{r.id}</h3>
            <p className="text-sm sm:text-base text-slate-500 font-bold leading-relaxed relative z-10">{r.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-4 sm:gap-6">
              <ContextImage prompt="modern laboratory research" className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl shrink-0" overlay={false} />
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Research Driven</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold">Metrics backed by institutional data.</p>
              </div>
          </div>
          <div className="p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-4 sm:gap-6">
              <ContextImage prompt="renewable energy solar panels" className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl shrink-0" overlay={false} />
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Eco Aligned</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold">SDG compliance in every dimension.</p>
              </div>
          </div>
          <div className="p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-4 sm:gap-6">
              <ContextImage prompt="global network technology" className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl shrink-0" overlay={false} />
              <div>
                  <h4 className="font-black text-slate-900 dark:text-white">AI Integrated</h4>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold">Advanced logic for unique insights.</p>
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
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  
  // University Search States
  const [universities, setUniversities] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidUniversity, setIsValidUniversity] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUniName, setNewUniName] = useState('');
  const [newUniAddress, setNewUniAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUniversities = async (query: string, selectedCountry: string) => {
    if (!query || !selectedCountry) {
      setUniversities([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`/api/universities?name=${encodeURIComponent(query)}&country=${encodeURIComponent(selectedCountry)}`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error(data.error || 'Invalid response format');
      }

      const names = data.map((u: any) => u.name);
      setUniversities(names);
      
      // Track if it's a verified match
      const exactMatch = names.some((name: string) => name.toLowerCase() === query.toLowerCase());
      setIsValidUniversity(exactMatch); 
    } catch (err: any) {
      console.warn('University search service unreachable.');
      setUniversities([]);
      setIsValidUniversity(false);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (isSignup && institution.length >= 1) {
      const timer = setTimeout(() => {
        searchUniversities(institution, country);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [institution, country, isSignup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignup) {
      // Check if the university is in the verified list
      const isVerified = universities.some(u => u.toLowerCase() === institution.toLowerCase());
      if (!isVerified) {
        alert(`${institution} is not yet registered with us...`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        await backend.signup(email, fullName, role, password, institution, country);
        setVerificationSent(true);
      } else {
        const user = await backend.login(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await backend.resendVerificationEmail();
      alert("Verification email resent! Please check your inbox.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 sm:py-24 animate-slide-up">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6 sm:mb-8 animate-bounce">
            <Mail className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Verify Your Email</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-base sm:text-lg mb-8 sm:mb-10">
            We've sent a verification link to <span className="text-emerald-500">{email}</span>. 
            Please check your inbox (and spam folder) and click the link to activate your account.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => { setVerificationSent(false); setIsSignup(false); }}
              className="w-full py-4 sm:py-6 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-3xl font-black text-base sm:text-xl shadow-xl hover:bg-black transition-all active:scale-95"
            >
              PROCEED TO LOGIN
            </button>
            <button 
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full py-4 sm:py-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[1.5rem] sm:rounded-3xl font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <><RefreshCw size={18} /> RESEND EMAIL</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniName || !country) return;
    
    setIsAdding(true);
    try {
      const response = await fetch('/api/universities/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUniName,
          country: country,
          address: newUniAddress,
          role: role
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("University added successfully to our dataset!");
        setShowAddForm(false);
        setNewUniName('');
        setNewUniAddress('');
        // Refresh search
        searchUniversities(institution, country);
      } else {
        alert(data.error);
      }
    } catch (err: any) {
      alert("Failed to add university");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 sm:py-24 animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest mb-8 sm:mb-12 transition-all hover:translate-x-[-8px]"><ArrowLeft size={24} /> Back to Roles</button>
      
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-[0.03] pointer-events-none">
            <ContextImage prompt="secure digital technology network" className="w-full h-full" overlay={false} />
        </div>
        <header className="mb-10 sm:mb-14 text-center">
          <Badge variant="info">{role} Profile</Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mt-6 text-slate-900 dark:text-white">{isSignup ? 'Secure Signup' : 'Identity Verification'}</h2>
        </header>

        {error && (
          <div className="mb-6 sm:mb-10 p-6 sm:p-8 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-900/30 rounded-[2rem] sm:rounded-[2.5rem] flex items-center gap-4 sm:gap-6 animate-shake shadow-lg">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] sm:text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Security Alert</h4>
              <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 leading-tight">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-3 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-2xl transition-all">
              <X size={20} className="text-rose-500" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {isSignup && (
            <>
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 sm:ml-6">Full Identity</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" placeholder="Full Name" />
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 sm:ml-6">Country</label>
                <select 
                  required 
                  value={country} 
                  onChange={e => {
                    setCountry(e.target.value);
                    setInstitution('');
                    setIsValidUniversity(false);
                  }} 
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white appearance-none"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2 sm:space-y-3 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 sm:ml-6">Affiliation</label>
                <div className="relative">
                  <input 
                    required 
                    type="text" 
                    value={institution} 
                    disabled={!country}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={e => {
                      setInstitution(e.target.value);
                      setShowSuggestions(true);
                    }} 
                    className={`w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-3xl font-bold outline-none border-2 transition-all text-lg sm:text-xl text-slate-900 dark:text-white ${!country ? 'opacity-50 cursor-not-allowed' : 'focus:border-emerald-500'} border-transparent`} 
                    placeholder={country ? "Start typing university name..." : "Select country first"} 
                  />
                  {searching && <RefreshCw className="absolute right-6 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" size={24} />}
                </div>
                
                {showSuggestions && universities.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto custom-scrollbar">
                    {universities.map((u, i) => (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => {
                          setInstitution(u);
                          setIsValidUniversity(true);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-6 sm:px-8 py-3 sm:py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-slate-700 last:border-0"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}

                {isSignup && role === 'Admin' && !showAddForm && (
                  <div className="mt-4 text-right">
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(true)}
                      className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
                    >
                      + Add New University to Dataset
                    </button>
                  </div>
                )}

                {showAddForm && (
                  <div className="mt-4 sm:mt-6 p-6 sm:p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-emerald-100 dark:border-emerald-800 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 sm:mb-6">Register New Institution</h4>
                    <div className="space-y-3 sm:space-y-4">
                      <input 
                        type="text" 
                        placeholder="University Name" 
                        value={newUniName}
                        onChange={e => setNewUniName(e.target.value)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xs sm:text-sm"
                      />
                      <input 
                        type="text" 
                        placeholder="Address (Optional)" 
                        value={newUniAddress}
                        onChange={e => setNewUniAddress(e.target.value)}
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-xs sm:text-sm"
                      />
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button 
                          type="button"
                          onClick={handleAddUniversity}
                          disabled={isAdding || !newUniName}
                          className="flex-1 py-3 sm:py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-50"
                        >
                          {isAdding ? 'ADDING...' : 'CONFIRM ADD'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-300 transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 sm:ml-6">Institutional Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" placeholder="email@institution.edu" />
          </div>
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 sm:ml-6">Access Phrase</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" placeholder="Password" />
          </div>

          <button disabled={loading || (isSignup && !isValidUniversity)} type="submit" className="w-full py-6 sm:py-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-[2rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-2xl hover:bg-black dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 sm:gap-4 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <RefreshCw className="animate-spin" size={24} /> : (
                <>{isSignup ? 'CREATE PROFILE' : 'VERIFY IDENTITY'} <Shield size={24} className="sm:w-8 sm:h-8" /></>
            )}
          </button>
        </form>

        <div className="mt-8 sm:mt-12 text-center">
          <button onClick={() => setIsSignup(!isSignup)} className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors border-b border-slate-200 dark:border-slate-800 pb-1">
            {isSignup ? 'Already registered? Verify access' : 'No account? Create identity'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Help = ({ onShowSystemHealth }: { onShowSystemHealth: () => void }) => {
  const faqs = [
    {
      q: "What is SDG-INSIGHT?",
      a: "SDG-INSIGHT is a comprehensive framework designed to benchmark and analyze institutional impact based on the UN's Sustainable Development Goals (SDGs). It provides personalized AI insights and strategic roadmaps for academic departments."
    },
    {
      q: "How do I take an assessment?",
      a: "Once you log in or proceed as a guest, navigate to the 'Questions' section. Select your domain or department, and the AI engine will generate a tailored set of questions to evaluate your SDG alignment."
    },
    {
      q: "Who can use this platform?",
      a: "The platform is built for higher education institutions, including students, faculty, staff, and administrators. Guests can also take a simplified assessment to understand their personal impact."
    },
    {
      q: "How are the AI insights generated?",
      a: "Our advanced AI engine analyzes your assessment scores across four dimensions: Knowledge, Attitude, Engagement, and Exposure. It then synthesizes a personalized strategic roadmap with actionable steps."
    },
    {
      q: "Can I export my results?",
      a: "Yes! After completing an assessment, you can view your full report and use the 'Export Full Report' button to save or print a detailed PDF of your performance index and AI strategy."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24 animate-slide-up">
      <div className="text-center mb-10 sm:mb-16">
        <Badge variant="info">Support Center</Badge>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mt-4 mb-4 text-slate-900 dark:text-white">Help & FAQ</h2>
        <p className="text-lg sm:text-xl text-slate-500 font-bold">Everything you need to know about the SDG-INSIGHT framework.</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-500">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-3 flex items-start gap-3">
              <span className="text-emerald-500 mt-1 shrink-0"><HelpCircle size={20} /></span>
              {faq.q}
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-bold leading-relaxed ml-8">
              {faq.a}
            </p>
          </div>
        ))}

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-emerald-100 dark:border-emerald-800/50 text-center mt-8 sm:mt-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-3 sm:mb-4">System Integrity Check</h3>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-bold mb-6 sm:mb-8 max-w-md mx-auto">Verify the operational status of our AI engine, image sourcing, and cloud synchronization services.</p>
          <button 
            onClick={onShowSystemHealth}
            className="px-6 sm:px-10 py-4 sm:py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3 mx-auto shadow-2xl w-full sm:w-auto"
          >
            <Zap size={18} /> OPEN SYSTEM DIAGNOSTICS
          </button>
        </div>
      </div>
    </div>
  );
};

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending email
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 sm:py-24 animate-slide-up">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 opacity-[0.03] pointer-events-none">
            <ContextImage prompt="customer support communication network" className="w-full h-full" overlay={false} />
        </div>
        <header className="mb-10 sm:mb-14 text-center">
          <Badge variant="info">Get in Touch</Badge>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mt-6 text-slate-900 dark:text-white">Contact Us</h2>
          <p className="text-sm sm:text-base text-slate-500 font-bold mt-4">Need counseling or assistance? Send us an email and our team will help you out.</p>
        </header>

        {success ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl text-center border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mb-2">Message Sent!</h3>
            <p className="text-emerald-600 dark:text-emerald-500 font-bold">We've received your inquiry and will get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Your Name</label>
              <input required type="text" className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" placeholder="John Doe" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Email Address</label>
              <input required type="email" className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" placeholder="john@example.com" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Message</label>
              <textarea required rows={4} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <button disabled={loading} type="submit" className="w-full py-6 sm:py-8 bg-slate-900 dark:bg-emerald-600 text-white rounded-[2.5rem] font-black text-xl sm:text-2xl shadow-2xl hover:bg-black dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 active:scale-95 group">
              {loading ? <RefreshCw className="animate-spin" size={32} /> : (
                  <>SEND MESSAGE <Mail className="w-6 h-6 sm:w-8 sm:h-8" /></>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24 animate-slide-up">
      <div className="text-center mb-10 sm:mb-16">
        <Badge variant="info">Our Mission</Badge>
        <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mt-4 mb-4 text-slate-900 dark:text-white">About SDG-INSIGHT</h2>
        <p className="text-lg sm:text-xl text-slate-500 font-bold">Empowering higher education institutions to drive sustainable global impact.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden mb-8 sm:mb-12">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none">
            <ContextImage prompt="global sustainability education network" className="w-full h-full" overlay={false} />
        </div>
        <div className="relative z-10 space-y-6 sm:space-y-8 text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-base sm:text-lg">
          <p>
            SDG-INSIGHT was founded with a singular vision: to bridge the gap between academic intent and measurable sustainable impact. We recognize that higher education institutions are uniquely positioned to be the catalysts for achieving the United Nations' Sustainable Development Goals (SDGs).
          </p>
          <p>
            Our framework leverages advanced AI and data analytics to provide a standardized, yet highly personalized, benchmarking system. By evaluating Knowledge, Attitude, Engagement, and Exposure across various academic disciplines, we help universities transform abstract goals into concrete, actionable strategies.
          </p>
          <p>
            Whether you are a student exploring your personal impact, a faculty member integrating sustainability into your curriculum, or an administrator steering institutional policy, SDG-INSIGHT provides the clarity and direction needed to make a real difference.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-center border border-slate-100 dark:border-slate-700">
          <Logo size={48} className="mx-auto mb-4" />
          <h3 className="font-black text-slate-900 dark:text-white mb-2">Global Standard</h3>
          <p className="text-sm text-slate-500 font-bold">Aligned with UN directives for universal applicability.</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-center border border-slate-100 dark:border-slate-700">
          <BrainCircuit className="mx-auto mb-4 text-blue-500 w-8 h-8 sm:w-10 sm:h-10" />
          <h3 className="font-black text-slate-900 dark:text-white mb-2">AI-Driven</h3>
          <p className="text-sm text-slate-500 font-bold">Intelligent synthesis of complex institutional data.</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-center border border-slate-100 dark:border-slate-700">
          <Target className="mx-auto mb-4 text-amber-500 w-8 h-8 sm:w-10 sm:h-10" />
          <h3 className="font-black text-slate-900 dark:text-white mb-2">Actionable</h3>
          <p className="text-sm text-slate-500 font-bold">Translating metrics into clear strategic roadmaps.</p>
        </div>
      </div>
    </div>
  );
};

const ReviewAssessment = ({ onBack }: { onBack: () => void }) => {
  const [reviewData, setReviewData] = useState<{ question: string, type: string, userAnswer: string, correctAnswer: string, isCorrect: boolean }[]>([]);

  useEffect(() => {
    const data = sessionStorage.getItem('last_assessment_review');
    if (data) {
      setReviewData(JSON.parse(data));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest transition-all hover:translate-x-[-6px]"><ArrowLeft size={20} /> Back to Summary</button>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Assessment Review</h2>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {reviewData.map((item, i) => (
          <div key={i} className={`p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-2 transition-all ${item.isCorrect ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30'}`}>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${item.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {item.isCorrect ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <X className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight">{item.question}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Your Answer</span>
                    <p className={`text-sm font-black ${item.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{item.userAnswer}</p>
                  </div>
                  {!item.isCorrect && (
                    <div className="p-4 sm:p-5 bg-emerald-500/10 rounded-xl sm:rounded-2xl border border-emerald-500/20 shadow-sm">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">
                        {item.type === 'knowledge' ? 'Correct Answer' : 'Target/Ideal Answer'}
                      </span>
                      <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{item.correctAnswer}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
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
  const [showSystemHealth, setShowSystemHealth] = useState(false);
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
          const res = await backend.getAllResults(currentUser.id);
          const usrs = await backend.getAllUsers(currentUser.id);
          setAllResults(res || []);
          setAllUsers(usrs || []);
          setView('admin-dashboard');
        } else {
          const history = await backend.getHistory(currentUser.id);
          setResults(history || []);
          if (history && history.length > 0 && history[0].aiInsights) {
            setAiInsights(history[0].aiInsights);
          }
          setView('dashboard');
        }
      }
    };
    init();
  }, []);

  const handleLogin = async (u: User) => {
    setUser(u);
    if (u.role === 'Admin') {
      const res = await backend.getAllResults(u.id);
      const usrs = await backend.getAllUsers(u.id);
      setAllResults(res || []);
      setAllUsers(usrs || []);
      setView('admin-dashboard');
    } else {
      const history = await backend.getHistory(u.id);
      setResults(history || []);
      if (history && history.length > 0 && history[0].aiInsights) {
        setAiInsights(history[0].aiInsights);
      }
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

  const handleViewHistoricalResult = (res: AssessmentResult) => {
    setLastResult(res);
    if (res.aiInsights) {
      setAiInsights(res.aiInsights);
    } else {
      setAiInsights(null);
    }
    setView('result-summary');
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleAssessmentComplete = async (questions: Question[], answers: Record<number, string>, dept: string) => {
    if (!user) return;
    setLoadingInsights(true);
    setLastResult(null); // Clear previous result to show loading state
    setView('result-summary');
    
    try {
      // Store assessment review data in sessionStorage
      const reviewData = questions.map(q => ({
        question: q.text,
        type: q.type,
        userAnswer: answers[q.id],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id] === q.correctAnswer
      }));
      sessionStorage.setItem('last_assessment_review', JSON.stringify(reviewData));

      // 1. Calculate Scores
      const scores = await calculateScoresInPython(questions, answers);
      
      // 2. Generate AI Insights
      const freshInsights = await getAIImprovementPlan(scores, user.role, dept);
      setAiInsights(freshInsights);

      // 3. Create a temporary result object for preview
      const tempResult: AssessmentResult = {
        id: 'preview', // Temporary ID
        userId: user.id,
        dept,
        scores,
        timestamp: new Date().toISOString(),
        aiInsights: freshInsights
      };
      
      setLastResult(tempResult);

      setIsSaving(true);
      try {
        const res = await backend.processAndSaveAssessment(user.id, dept, scores, freshInsights);
        setResults(prev => [res, ...prev]);
        setLastResult(res);
        if (user.role !== 'Admin') {
          backend.saveAiInteraction(user.id, `SDG Assessment: ${dept}`, freshInsights);
        }
      } catch (saveErr) {
        console.error("Save failed:", saveErr);
      } finally {
        setIsSaving(false);
      }
    } catch (e) {
      console.error("Assessment processing error:", e);
      alert("Strategic engine error. Please retry.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleDeleteResult = async (id: string) => {
    try {
      await backend.deleteResult(id);
      if (user?.role === 'Admin') {
        setAllResults(prev => prev.filter(r => r.id !== id));
      } else {
        setResults(prev => prev.filter(r => r.id !== id));
      }
    } catch (err: any) {
      alert("Failed to delete result: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!user || user.role !== 'Admin') return;
    try {
      await backend.deleteUser(user.id, userId);
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      // Also remove their results from the local state
      setAllResults(prev => prev.filter(r => r.userId !== userId));
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    }
  };

  const refreshUsers = async () => {
    if (user?.role === 'Admin') {
      const users = await backend.getAllUsers(user.id);
      setAllUsers(users);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-300">
      <Navigation view={view} setView={setView} user={user} logout={handleLogout} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      <main className="flex-grow">
        {view === 'landing' && <Landing onStart={() => setView('role-select')} onOverview={() => setView('presentation')} />}
        {view === 'role-select' && <RoleSelect excludeGuest={user?.role === 'Guest'} onSelect={async (r) => { 
          setSelectedRole(r); 
          if (r === 'Guest') { 
            try {
              const guestUser = await backend.guestLogin();
              setUser(guestUser); 
              setView('assessment'); 
            } catch (e: any) {
              alert(e.message);
            }
          } else {
            setView('auth'); 
          }
        }} />}
        {view === 'auth' && selectedRole && <AuthForm role={selectedRole} onBack={() => setView('role-select')} onLogin={handleLogin} />}
        {view === 'profile' && user && <ProfileView user={user} onUpdate={setUser} onBack={() => setView(user.role === 'Admin' ? 'admin-dashboard' : 'dashboard')} onLogout={handleLogout} />}
        {view === 'assessment' && <Assessment user={user} onComplete={handleAssessmentComplete} />}
        {view === 'result-summary' && <ResultSummary result={lastResult} insights={aiInsights} onContinue={() => setView('improvement')} onReview={() => setView('review')} loading={loadingInsights} />}
        {view === 'review' && <ReviewAssessment onBack={() => setView('result-summary')} />}
        {view === 'admin-dashboard' && user?.role === 'Admin' && <AdminDashboard allResults={allResults} allUsers={allUsers} onDeleteResult={handleDeleteResult} onDeleteUser={handleDeleteUser} adminUser={user} onRefreshUsers={refreshUsers} />}
        {view === 'dashboard' && user && <Dashboard user={user} results={results} onReset={() => setView('assessment')} onAcceptPathway={(i) => { if(i) setAiInsights(i); setView('improvement'); }} onDeleteResult={handleDeleteResult} onViewResult={handleViewHistoricalResult} aiInsights={aiInsights} loadingInsights={loadingInsights} />}
        {view === 'improvement' && user && <ImprovementCenter insights={aiInsights} user={user} result={lastResult || results[0] || null} onBack={() => setView('dashboard')} />}
        {view === 'presentation' && <Presentation />}
        {view === 'help' && <Help onShowSystemHealth={() => setShowSystemHealth(true)} />}
        {view === 'contact' && <Contact />}
        {view === 'about' && <About />}
      </main>
      <SystemHealth isOpen={showSystemHealth} onClose={() => setShowSystemHealth(false)} />
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 sm:py-12 px-4 sm:px-8 text-center text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase no-print">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-4 sm:mb-6">
          <button onClick={() => setView('about')} className="hover:text-emerald-500 transition-colors">About Us</button>
          <button onClick={() => setView('help')} className="hover:text-emerald-500 transition-colors">Help/FAQ</button>
          <button onClick={() => setView('contact')} className="hover:text-emerald-500 transition-colors">Contact</button>
        </div>
        © 2026 SDG-INSIGHT FRAMEWORK
      </footer>
    </div>
  );
}

const ProfileView = ({ user, onUpdate, onBack, onLogout }: { user: User, onUpdate: (u: User) => void, onBack: () => void, onLogout: () => void }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [institution, setInstitution] = useState(user.institution || '');
  const [role, setRole] = useState<Role>(user.role);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    const confirmMessage = user.role === 'Admin' 
      ? "CRITICAL: Deleting your Admin account will permanently delete ALL institutional data, including all registered users and their assessments. This action is IRREVERSIBLE. Are you absolutely sure?"
      : "Are you sure you want to permanently delete your account and all your assessment data? This action cannot be undone.";

    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        await backend.deleteOwnAccount(user.id, user.role, user.institution || '');
        onLogout();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 sm:py-24 animate-slide-up">
      <button onClick={onBack} className="flex items-center gap-2 sm:gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-[10px] sm:text-xs uppercase tracking-widest mb-8 sm:mb-12 transition-all hover:translate-x-[-8px]"><ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" /> Back</button>
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <header className="mb-8 sm:mb-12 text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 sdg-gradient rounded-[2rem] sm:rounded-[2.5rem] mx-auto flex items-center justify-center text-white text-4xl sm:text-5xl font-black mb-6 sm:mb-8 shadow-2xl ring-4 sm:ring-8 ring-slate-100 dark:ring-slate-800">{fullName.charAt(0).toUpperCase()}</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 text-slate-900 dark:text-white">Institutional Identity</h2>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Full Name</label>
            <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Affiliation</label>
            <input 
              required 
              type="text" 
              value={institution} 
              onChange={e => setInstitution(e.target.value)} 
              disabled={user.role !== 'Guest'}
              className={`w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent transition-all text-lg sm:text-xl text-slate-900 dark:text-white ${user.role !== 'Guest' ? 'opacity-50 cursor-not-allowed' : 'focus:border-emerald-500'}`} 
            />
            {user.role !== 'Guest' && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mt-1">Institutional affiliation is locked by the framework.</p>}
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl font-bold outline-none border-2 border-transparent focus:border-emerald-500 transition-all text-lg sm:text-xl text-slate-900 dark:text-white" />
          </div>
          <button disabled={loading || isDeleting} type="submit" className={`w-full py-5 sm:py-6 rounded-3xl font-black text-lg sm:text-xl shadow-2xl transition-all active:scale-95 ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-black'}`}>
            {loading ? <RefreshCw className="animate-spin" size={32} /> : success ? 'IDENTITY SYNCHRONIZED' : 'UPDATE IDENTITY'}
          </button>
        </form>

        <div className="mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
          <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest mb-4">Danger Zone</h4>
          <p className="text-xs text-slate-400 font-bold mb-6 sm:mb-8">Permanently remove your identity and all associated data from the SDG-INSIGHT framework.</p>
          <button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="px-6 sm:px-10 py-4 sm:py-5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex items-center justify-center gap-2 sm:gap-3 mx-auto active:scale-95 w-full sm:w-auto"
          >
            {isDeleting ? <RefreshCw className="animate-spin" size={18} /> : <><Trash2 size={18} /> DELETE ACCOUNT</>}
          </button>
        </div>
      </div>
    </div>
  );
};
