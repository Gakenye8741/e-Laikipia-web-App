import '../../animations/TrueFocus.css';
import { useSelector } from 'react-redux';
import { useRef, useEffect, useMemo } from 'react';
import Typed from 'typed.js';
import type { RootState } from '../../App/store';
import TrueFocus from '../../animations/TextFocus';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Gavel, 
  Activity, 
  ArrowRight, 
  Database, 
  Lock, 
  CheckCircle2,
  ChevronRight,
  Loader2,
  Zap,
  ArrowUpRight,
  Fingerprint
} from 'lucide-react';
import { MdSecurity, MdVerifiedUser, MdBallot } from "react-icons/md";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line 
} from "recharts";

// API Hook Imports
import { useGetAllElectionsQuery } from '../../features/APIS/Election.Api';
import { useCountPositionsQuery } from '../../features/APIS/Position.APi';
import { useGetAllCandidatesQuery } from '../../features/APIS/CandidateApi';
import { useGetAllUsersQuery } from "../../features/APIS/UserApi"; // Added for Analytics data

const HeroHomeSection = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.user?.name?.split(" ")[0] ?? 'Authorized Agent';

  // --- 1. DATA FETCHING ---
  const { data: electionsRaw, isLoading: loadingElections } = useGetAllElectionsQuery();
  const { data: posData, isLoading: loadingPositions } = useCountPositionsQuery();
  const { data: candData, isLoading: loadingCandidates } = useGetAllCandidatesQuery();
  const { data: usersData } = useGetAllUsersQuery(undefined); // Added for Analytics

  // --- 2. DATA LOGIC ---
  const elections = useMemo(() => Array.isArray(electionsRaw) ? electionsRaw : [], [electionsRaw]);
  const users = useMemo(() => {
    const raw = usersData?.users || usersData;
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);

  const activeCount = useMemo(() => elections.filter((e: any) => e.status === 'active').length, [elections]);
  
  const upcomingElections = useMemo(() => 
    elections.filter((e: any) => e.status === 'upcoming' || e.status === 'pending').slice(0, 3)
  , [elections]);

  // --- ANALYTICS CHART LOGIC ---
  const voterDistribution = useMemo(() => {
    return elections.slice(0, 4).map(e => ({
      name: e.name.length > 10 ? e.name.substring(0, 10) + '...' : e.name,
      voters: users.filter((u: any) => u.election_id === e.id).length
    }));
  }, [users, elections]);

  const registrationTrend = useMemo(() => {
    const map: Record<string, number> = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    users.forEach((u: any) => {
      const date = new Date(u.created_at).toLocaleDateString();
      if (last7Days.includes(date)) map[date] = (map[date] || 0) + 1;
    });

    return last7Days.map(date => ({
      date: date.split('/')[0] + '/' + date.split('/')[1],
      count: map[date] || 0
    }));
  }, [users]);

  // --- 3. UI TYPED LOGIC ---
  const typedRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!typedRef.current) return;
    const typed = new Typed(typedRef.current, {
      strings: [firstName.toUpperCase()],
      typeSpeed: 60,
      showCursor: true,
      cursorChar: '_',
    });
    return () => typed.destroy();
  }, [firstName]);

  const stats = [
    { label: "Active Nodes", val: loadingElections ? <Loader2 size={14} className="animate-spin"/> : activeCount, icon: <Activity size={16}/>, color: "border-l-red-600", text: "text-red-700" },
    { label: "Ledger Stack", val: "Sepolia", icon: <Database size={16}/>, color: "border-l-slate-900", text: "text-slate-900" },
    { label: "Positions", val: loadingPositions ? <Loader2 size={14} className="animate-spin"/> : (posData?.count || 0), icon: <Gavel size={16}/>, color: "border-l-slate-400", text: "text-slate-600" },
    { label: "Candidates", val: loadingCandidates ? <Loader2 size={14} className="animate-spin"/> : (candData?.candidates?.length || 0), icon: <Users size={16}/>, color: "border-l-emerald-600", text: "text-emerald-600" },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden font-sans pt-20 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-slate-100 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* TOP BADGE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-1">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              E-Laikipia Election Managemet System!
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center mt-0">
  {/* LEFT CONTENT: THE OPERATIONAL HUB */}
  <div className="lg:col-span-7 space-y-12 text-black">
    <div className="space-y-6">
      <div className="inline-block">
        <TrueFocus
          sentence="LAIKIPIA E-VOTE"
          manualMode={false}
          blurAmount={3}
          borderColor="#b91c1c"
          animationDuration={1.2}
        />
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic">
        Hello Admin,<br />
        <span ref={typedRef} className="text-red-700 not-italic border-r-4 border-red-700 pr-2" />
      </h1>
    </div>

    <p className="text-slate-500 text-lg font-bold leading-relaxed max-w-2xl italic border-l-4 border-red-600 pl-8 bg-slate-50/50 py-4 rounded-r-2xl">
      "Accessing the decentralized infrastructure of Laikipia University. 
      Deploying immutable blockchain protocols to ensure 100% election integrity."
    </p>

    {/* STATS GRID: HUD-STYLE CARDS */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className={`group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-4 ${stat.color} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:scale-150 transition-transform">
            {stat.icon}
          </div>
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            {stat.icon}
            <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">{stat.label}</span>
          </div>
          <div className={`text-3xl font-black ${stat.text} tracking-tighter`}>
            {stat.val}
          </div>
        </div>
      ))}
    </div>

    {/* ACTION TERMINAL BUTTONS */}
    <div className="flex flex-wrap gap-5 pt-6">
      <Link to="/admindashboard/AllElections" className="group bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl shadow-slate-300 flex items-center gap-4 active:scale-95">
        Manage Elections 
        <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
      </Link>
      <Link to="/admindashboard" className="bg-white border-2 border-slate-200 text-slate-900 px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:border-red-600 hover:text-red-700 transition-all flex items-center gap-3 active:scale-95 shadow-sm">
        AdminDashboard
      </Link>
    </div>
  </div>

  {/* RIGHT PANEL: ENCRYPTED PROTOCOL LEDGER */}
  <div className="lg:col-span-5">
    <div className="bg-white rounded-[4rem] border border-slate-200 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] p-10 md:p-12 relative overflow-hidden group">
      {/* Decorative Background Icon */}
      <div className="absolute top-[-5%] right-[-5%] p-8 opacity-[0.04] group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000 text-slate-900">
        <MdVerifiedUser size={320} />
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900 flex items-center gap-2">
              <MdBallot className="text-red-700" size={20} /> Protocol Ledger
            </h3>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-7">Operational_Sync_Active</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[9px] font-black uppercase tracking-tighter border border-red-100">Live_Sync</span>
            <span className="h-1 w-8 bg-red-600 rounded-full animate-pulse"></span>
          </div>
        </div>

        {/* ELECTION SESSIONS LIST */}
        <div className="space-y-5 mb-12">
          {upcomingElections.length > 0 ? (
            upcomingElections.map((election: any, idx: number) => (
              <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center group/item hover:bg-white hover:shadow-xl hover:border-red-100 transition-all duration-300">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-red-700 shadow-sm border border-slate-100">
                      <Fingerprint size={20} />
                   </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover/item:text-red-700 transition-colors">
                      {election.title}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                       <span className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover/item:bg-red-500"></span>
                       Starts: {new Date(election.start_date || election.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover/item:opacity-100 transition-all">
                  <ChevronRight className="text-red-600" size={18} />
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-4">
              <div className="relative inline-block">
                <Database className="mx-auto text-slate-100" size={64} />
                <Lock className="absolute bottom-0 right-0 text-slate-300" size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">No active sessions queued</p>
            </div>
          )}
        </div>

        {/* NETWORK FOOTER STATUS */}
        <div className="mt-auto p-8 bg-slate-900 rounded-[3rem] text-white space-y-5 relative overflow-hidden group/footer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[50px] rounded-full" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-900/20 group-hover/footer:scale-110 transition-transform">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Sepolia Network</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter italic">Immutable Consensus: Active</p>
              </div>
            </div>
            <Activity className="text-emerald-500 animate-pulse" size={20} />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* --- INTEGRATED ANALYTICS OVERVIEW SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 mb-16">
          {/* Chart 1: Voter Distribution */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users size={14} className="text-red-700" /> Voter_Distribution
              </h3>
              <Link to="/analytics"><ArrowUpRight size={16} className="text-slate-300 hover:text-red-700"/></Link>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voterDistribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="voters" fill="#b91c1c" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Registration Trend */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Activity size={14} className="text-emerald-600" /> Registry_Uplink
              </h3>
              <span className="text-[8px] font-black text-emerald-500 animate-pulse">ACTIVE_FEED</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" fontSize={8} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                  <Line type="monotone" dataKey="count" stroke="#7f1d1d" strokeWidth={3} dot={{r: 3, fill: '#7f1d1d'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Node Stats (Dark Theme) */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl text-white flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" /> System_Health
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Integrity</span>
                  <span className="text-xs font-black italic">99.9%</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Latency</span>
                  <span className="text-xs font-black italic">12ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Network</span>
                  <span className="text-[9px] font-black text-emerald-500">STABLE</span>
                </div>
              </div>
            </div>
            <Link to="/analytics" className="mt-6 block text-center py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors">
              Full Analytics Report
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroHomeSection;