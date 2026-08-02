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
  Radio,
  CheckCircle2,
  ShieldCheck,
  Award,
  BookOpen,
} from 'lucide-react';
import { MdVerifiedUser, MdBallot, MdDashboard } from "react-icons/md";
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";

// API Hook Imports
import { useGetAllElectionsQuery } from '../../features/APIS/Election.Api';
import { useCountPositionsQuery } from '../../features/APIS/Position.APi';
import { useGetAllCandidatesQuery } from '../../features/APIS/CandidateApi';
import { useGetAllUsersQuery } from "../../features/APIS/UserApi";

const HeroHomeSection = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.user?.name?.split(" ")[0] ?? 'Voter';
  
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

  // --- ROLE BUTTONS ---
  const renderDashboardButtons = () => {
    if (userRole === "Voter") {
      return (
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="flex items-center gap-3 bg-slate-100/80 border border-slate-200/80 px-6 py-4 rounded-2xl w-full sm:w-auto">
            <UserX size={18} className="text-slate-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-700">Voter Account</p>
              <p className="text-xs text-slate-500">Ready to vote safely online.</p>
            </div>
          </div>
          <Link to="/elections" className="w-full sm:w-auto bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-red-700 transition shadow-md flex items-center justify-center gap-3">
             Cast Your Vote <ArrowRight size={18} />
          </Link>
        </div>
      );
    } 
    
    if (userRole === "Accountant" || userRole === "Accounts") {
      return (
        <Link to="/accounts-dashboard/" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-3">
          <Wallet size={18} /> Financial Records <ArrowRight size={18} />
        </Link>
      );
    } 
    
    if (userRole === "Dean_of_Students") {
      return (
        <Link to="/dean-student-dashboard/" className="w-full sm:w-auto bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-red-700 transition shadow-md flex items-center justify-center gap-3">
          <GraduationCap size={18} /> Student Affairs <ArrowRight size={18} />
        </Link>
      );
    } 
    
    if (userRole === "Dean_of_School") {
      return (
        <Link to="/dean-school-dashboard/" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-3">
          <School size={18} /> Dean Portal: {assignedSchool || "School"} <ArrowRight size={18} />
        </Link>
      );
    } 
    
    if (userRole === "Admin" || userRole === "SuperAdmin") {
      return (
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full">
          <Link to="/admindashboard/AllElections" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-3">
            <MdDashboard size={18} /> Manage Elections <ArrowRight size={18} />
          </Link>
          <Link to="/admindashboard" className="w-full sm:w-auto bg-white border border-slate-300 text-slate-800 px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:border-red-600 transition shadow-xs flex items-center justify-center gap-3">
            Admin Panel
          </Link>
        </div>
      );
    }

    return null;
  };

  const stats = [
    { label: "Active Polls", val: loadingElections ? <Loader2 size={16} className="animate-spin"/> : activeCount, icon: <Activity size={18}/>, color: "border-l-emerald-500", text: "text-emerald-600" },
    { label: "Network", val: "Sepolia", icon: <Database size={18}/>, color: "border-l-red-600", text: "text-red-600" },
    { label: "Seats Open", val: loadingPositions ? <Loader2 size={16} className="animate-spin"/> : (posData?.count || 0), icon: <Gavel size={18}/>, color: "border-l-slate-800", text: "text-slate-900" },
    { label: "Candidates", val: loadingCandidates ? <Loader2 size={16} className="animate-spin"/> : (candData?.candidates?.length || 0), icon: <Users size={18}/>, color: "border-l-blue-600", text: "text-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pt-24 pb-20 selection:bg-red-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200/80 rounded-full shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Secure Online Voting System</span>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Laikipia University
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT WELCOME BOX */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 bg-white p-6 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-6">
              <div className="inline-block">
                <TrueFocus sentence="SECURE-VOTE APP" blurAmount={3} borderColor="#dc2626" />
              </div>
              <h1 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                {userRole === "Voter" ? "Hello Student," : "Welcome Back,"}<br />
                <span ref={typedRef} className="text-red-600 border-r-4 border-red-600 pr-2" />
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Cast your vote easily and safely for your campus student leaders using our trusted online voting system.
              </p>

              {/* QUICK INFO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Safe</p>
                    <p className="text-xs font-bold text-slate-800">Protected Ballots</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Award</p>
                    <p className="text-xs font-bold text-slate-800">Innovation Day #2</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-slate-400">Network</p>
                    <p className="text-xs font-bold text-slate-800">Ethereum Sepolia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS COUNTERS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className={`bg-slate-50 p-4 rounded-2xl border border-slate-200/80 border-l-4 ${stat.color}`}>
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    {stat.icon}
                    <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                  <div className={`text-2xl font-black ${stat.text}`}>{stat.val}</div>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-slate-100">
              {renderDashboardButtons()}
            </div>
          </div>

          {/* RIGHT SIDEBAR: UPCOMING ELECTIONS */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white">
              <MdVerifiedUser size={280} />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 text-slate-300">
                  <MdBallot className="text-red-500" size={20} /> Election Schedule
                </h3>
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/20">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Elections</p>
                {upcomingElections.length > 0 ? (
                  upcomingElections.map((election: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex justify-between items-center hover:bg-slate-800 transition">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-9 w-9 bg-slate-700 rounded-xl flex items-center justify-center text-red-400 shrink-0">
                          <Fingerprint size={18} />
                        </div>
                        <p className="text-xs font-bold text-white uppercase truncate">{election.title}</p>
                      </div>
                      <ChevronRight className="text-red-500 shrink-0 ml-2" size={16} />
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-slate-800/50 rounded-2xl text-center text-xs text-slate-400">
                    No upcoming elections right now.
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-600 rounded-xl text-white">
                    <Lock size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Blockchain Protected</p>
                    <p className="text-xs text-slate-400">Your vote remains private and secure.</p>
                  </div>
                </div>
                <Radio className="text-emerald-400 animate-pulse" size={20} />
              </div>
            </div>
          </div>

        </div>

        {/* CHARTS AND GRAPHICS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* VOTER DISTRIBUTION CHART */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-6">
              <Users size={16} className="text-red-600" /> Voters Per Election
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voterDistribution}>
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="voters" fill="#dc2626" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* REGISTRATION TREND CHART */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-6">
              <Activity size={16} className="text-emerald-600" /> Voter Sign-ups (Last 7 Days)
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrend}>
                  <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} stroke="#64748b" />
                  <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, fill: '#dc2626' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-lg text-white flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" /> System Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">System Security</span>
                  <span className="text-sm font-black text-emerald-400">99.9% Safe</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Encryption</span>
                  <span className="text-sm font-black text-white">Full SSL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Server Status</span>
                  <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Online
                  </span>
                </div>
              </div>
            </div>
            <Link to="/results" className="mt-6 block text-center py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition shadow-xs">
              View Analytics Reports
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HeroHomeSection;