import '../../animations/TrueFocus.css';
import { useSelector } from 'react-redux';
import { useRef, useEffect, useMemo } from 'react';
import Typed from 'typed.js';
import type { RootState } from '../../App/store';
import TrueFocus from '../../animations/TextFocus';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Gavel, 
  Activity, 
  ArrowRight, 
  Database, 
  Lock, 
  ChevronRight,
  Loader2,
  Zap,
  Fingerprint,
  GraduationCap,
  School,
  Wallet,
  UserX,
} from 'lucide-react';
import { MdVerifiedUser, MdBallot, MdDashboard } from "react-icons/md";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line 
} from "recharts";

// API Hook Imports
import { useGetAllElectionsQuery } from '../../features/APIS/Election.Api';
import { useCountPositionsQuery } from '../../features/APIS/Position.APi';
import { useGetAllCandidatesQuery } from '../../features/APIS/CandidateApi';
import { useGetAllUsersQuery } from "../../features/APIS/UserApi";

const HeroHomeSection = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.user?.name?.split(" ")[0] ?? 'Authorized Agent';
  
  // --- ROLE-BASED LOGIC ---
  const userRole = useSelector((state: RootState) => state.auth.user?.user?.role);
  const assignedSchool = useSelector((state: RootState) => state.auth.user?.user?.school);

  // --- DATA FETCHING ---
  const { data: electionsRaw, isLoading: loadingElections } = useGetAllElectionsQuery();
  const { data: posData, isLoading: loadingPositions } = useCountPositionsQuery();
  const { data: candData, isLoading: loadingCandidates } = useGetAllCandidatesQuery();
  const { data: usersData } = useGetAllUsersQuery(undefined);

  // --- DATA LOGIC ---
  const elections = useMemo(() => Array.isArray(electionsRaw) ? electionsRaw : [], [electionsRaw]);
  const users = useMemo(() => {
    const raw = usersData?.users || usersData;
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);

  const activeCount = useMemo(() => elections.filter((e: any) => e.status === 'active').length, [elections]);
  const upcomingElections = useMemo(() => elections.filter((e: any) => e.status === 'upcoming' || e.status === 'pending').slice(0, 3), [elections]);

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

  // --- UI TYPED LOGIC ---
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

  // --- STRICT ROLE-BASED BUTTON RENDERING ---
  const renderDashboardButtons = () => {
    if (userRole === "Voter") {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-8 py-5 rounded-[2.5rem] shadow-sm">
            <div className="p-3 bg-slate-200 rounded-full text-slate-400">
              <UserX size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Access Restricted</p>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">Voters cannot access management consoles.</p>
            </div>
          </div>
          <Link to="/elections" className="group bg-red-700 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
             Cast Your Vote <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
          </Link>
        </div>
      );
    } 
    
    if (userRole === "Accountant" || userRole === "Accounts") {
      return (
        <Link to="/accounts-dashboard/" className="group bg-emerald-700 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
          <Wallet size={20} /> Financial Ledger <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
        </Link>
      );
    } 
    
    if (userRole === "Dean_of_Students") {
      return (
        <Link to="/dean-student-dashboard/" className="group bg-red-700 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-800 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
          <GraduationCap size={20} /> Student Affairs <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
        </Link>
      );
    } 
    
    if (userRole === "Dean_of_School") {
      return (
        <Link to="/dean-school-dashboard/" className="group bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
          <School size={20} /> Dean: {assignedSchool || "School"} <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
        </Link>
      );
    } 
    
    // Only show System Management/Admin Dashboard for SuperAdmins/Admins
    if (userRole === "Admin" || userRole === "SuperAdmin") {
      return (
        <>
          <Link to="/admindashboard/AllElections" className="group bg-slate-900 text-white px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-2xl flex items-center gap-4 active:scale-95">
            <MdDashboard size={20} /> System Management <ArrowRight size={20} className="group-hover:translate-x-2 transition-all" />
          </Link>
          <Link to="/admindashboard" className="bg-white border-2 border-slate-200 text-slate-900 px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:border-red-600 transition-all flex items-center gap-3 active:scale-95">
            AdminDashboard
          </Link>
        </>
      );
    }

    return null; // Fallback for undefined roles
  };

  const stats = [
    { label: "Active Nodes", val: loadingElections ? <Loader2 size={14} className="animate-spin"/> : activeCount, icon: <Activity size={16}/>, color: "border-l-red-600", text: "text-red-700" },
    { label: "Ledger Stack", val: "Sepolia", icon: <Database size={16}/>, color: "border-l-slate-900", text: "text-slate-900" },
    { label: "Positions", val: loadingPositions ? <Loader2 size={14} className="animate-spin"/> : (posData?.count || 0), icon: <Gavel size={16}/>, color: "border-l-slate-400", text: "text-slate-600" },
    { label: "Candidates", val: loadingCandidates ? <Loader2 size={14} className="animate-spin"/> : (candData?.candidates?.length || 0), icon: <Users size={16}/>, color: "border-l-emerald-600", text: "text-emerald-600" },
  ];

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] overflow-hidden font-sans pt-20 pb-20">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-slate-100 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-1 mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Blockchain Integrity Verified</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-12 text-black">
            <div className="space-y-6">
              <div className="inline-block">
                <TrueFocus sentence="LAIKIPIA E-VOTE" blurAmount={3} borderColor="#b91c1c" />
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic">
                {userRole === "Voter" ? "Hello Voter," : "Hello,"}<br />
                <span ref={typedRef} className="text-red-700 not-italic border-r-4 border-red-700 pr-2" />
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className={`group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm border-l-4 ${stat.color} hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center gap-2 mb-3 text-slate-400">
                    {stat.icon}
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">{stat.label}</span>
                  </div>
                  <div className={`text-3xl font-black ${stat.text} tracking-tighter`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* EXCLUSIVE ACTION BUTTONS */}
            <div className="flex flex-wrap gap-5 pt-6">
              {renderDashboardButtons()}
            </div>
          </div>

          {/* PROTOCOL LEDGER SIDEBAR */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[4rem] border border-slate-200 shadow-xl p-10 md:p-12 relative overflow-hidden group">
              <div className="absolute top-[-5%] right-[-5%] p-8 opacity-[0.04] group-hover:scale-125 transition-transform duration-1000 text-slate-900">
                <MdVerifiedUser size={320} />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900 flex items-center gap-2">
                      <MdBallot className="text-red-700" size={20} /> Protocol Ledger
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-[9px] font-black uppercase tracking-tighter border border-red-100">Live_Sync</span>
                </div>

                <div className="space-y-5 mb-12">
                  {upcomingElections.map((election: any, idx: number) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                          <Fingerprint size={20} />
                        </div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{election.title}</p>
                      </div>
                      <ChevronRight className="text-red-600" size={18} />
                    </div>
                  ))}
                </div>

                <div className="mt-auto p-8 bg-slate-900 rounded-[3rem] text-white space-y-5 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-600 rounded-2xl shadow-lg">
                        <Lock size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em]">Sepolia Network</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase italic">Immutable Consensus: Active</p>
                      </div>
                    </div>
                    <Activity className="text-emerald-500 animate-pulse" size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 mb-16">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
              <Users size={14} className="text-red-700" /> Voter_Distribution
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voterDistribution}>
                  <XAxis dataKey="name" fontSize={8} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="voters" fill="#b91c1c" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6">
              <Activity size={14} className="text-emerald-600" /> Registry_Uplink
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrend}>
                  <XAxis dataKey="date" fontSize={8} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="count" stroke="#7f1d1d" strokeWidth={3} dot={{ r: 3, fill: '#7f1d1d' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Status</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase">Stable</span>
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