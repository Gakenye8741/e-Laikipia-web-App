import React, { useMemo, useState, useEffect } from 'react';
import {
  Search, Shield, LayoutGrid, X, CheckCircle2, Trophy, Hexagon, Loader2, Zap, BarChart3,
  Fingerprint, ChevronRight, Share2, Award, Users, UserCheck,
  Medal, Star, Crown,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp, Activity, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAllElectionsQuery } from '../features/APIS/Election.Api';
import { useGetAllPositionsQuery } from '../features/APIS/Position.APi';
import { useGetUsersCountQuery } from '../features/APIS/UserApi';
import { useGetElectionResultsQuery } from '../features/APIS/Vote.Api';
import { useGetCoalitionFullSlateQuery, useGetCoalitionsByElectionQuery } from '../features/APIS/CoalitionApi';
import { useGetDelegateRosterQuery, useGetExecutiveResultsQuery } from '../features/APIS/Delegate.Api';
import { Navbar } from '../components/Navbar';
import { useSelector } from 'react-redux';
import type { RootState } from '../App/store';

// THEME CONSTANTS
const UNIVERSITY_RED = '#c8102e';

interface ElectionResult {
  candidate_id: string;
  candidate_name: string | null;
  position_id: string;
  votes_count: string | number;
  coalition_id?: string;
  coalition_name?: string;
  coalition_color?: string;
  total_pos_votes?: number;
}

const ResultsScreen = () => {
  const [activeTab, setActiveTab] = useState<'main' | 'coalition' | 'delegates' | 'analytics'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSlateModalVisible, setIsSlateModalVisible] = useState(false);
  const [activeCoalition, setActiveCoalition] = useState<any>(null);
  const userName = useSelector((state: RootState) => state.auth.user?.user?.name)

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  // API QUERIES
  const { data: allElections, isLoading: loadingElections } = useGetAllElectionsQuery();
  const { data: positionsData } = useGetAllPositionsQuery();
  const { data: userCountData } = useGetUsersCountQuery();

  const { resolvedId, resolvedName, electionStatus } = useMemo(() => {
    const navId = new URLSearchParams(window.location.search).get('electionId');
    const elections = (allElections as any)?.elections || (Array.isArray(allElections) ? allElections : []);
    let target = elections.find((e: any) => (e.id || e._id) === navId);

    if (!target && elections.length > 0) {
      target = [...elections].sort((a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )[0];
    }
    return {
      resolvedId: target?.id || target?._id || null,
      resolvedName: target?.name || "Election Results",
      electionStatus: target?.status || 'active'
    };
  }, [allElections]);

  const isCompleted = electionStatus === 'completed' || electionStatus === 'ended';

  const { data, isLoading } = useGetElectionResultsQuery(resolvedId, {
    skip: !resolvedId,
    pollingInterval: isCompleted ? 0 : 10000,
  });

  const { data: coalitionsData } = useGetCoalitionsByElectionQuery(resolvedId, { skip: !resolvedId });
  const { data: executiveResults } = useGetExecutiveResultsQuery(resolvedId, { skip: !resolvedId });
const { data: rosterResponse, isLoading: loadingRoster, isError: rosterError } = 
  useGetDelegateRosterQuery(resolvedId, { skip: !resolvedId });
  const { data: leaderSlateData, isLoading: loadingLeaderSlate } = useGetCoalitionFullSlateQuery(activeCoalition?.id, { skip: !activeCoalition?.id });

  const processedData = useMemo(() => {
  // 1. Data Normalization (Handling API Wrappers)
  const rawData = (data?.data || []) as ElectionResult[];
  const coalList = (coalitionsData?.coalitions || []) as any[];
  const allPos = (positionsData as any)?.positions || (Array.isArray(positionsData) ? positionsData : []);
  
  // UPDATED: Points to the .data property of your roster response
  const delegates = rosterResponse?.data || [];

  const schoolPositions = allPos.filter((p: any) =>
    p.tier?.toLowerCase() === 'school' && !p.name?.toLowerCase().includes('executive')
  );

  // 2. Enrich candidate data with coalition branding
  const enrichedData = rawData.map(candidate => {
    const matchingCoalition = coalList.find((c: any) => c.id === candidate.coalition_id);
    return {
      ...candidate,
      coalition_name: matchingCoalition?.name || "Independent",
      coalition_color: matchingCoalition?.color_code || '#64748b'
    };
  });

  // 3. Analytics: School/Voter Distribution
  const schoolDistribution = schoolPositions.map((pos: any) => {
    const totalVotesForSchool = rawData
      .filter(c => c.position_id === pos.id)
      .reduce((sum, c) => sum + Number(c.votes_count || 0), 0);

    return {
      name: pos.name.replace('School of ', 'S.O.'),
      votes: totalVotesForSchool
    };
  }).filter((s: any) => s.votes > 0);

  const totalVotesInElection = enrichedData.reduce((acc, curr) => acc + Number(curr.votes_count || 0), 0);
  const turnout = (totalVotesInElection / (Number(userCountData?.count) || 1)) * 100;

  // 4. Sectional Data (Filtered by Position/Search)
  const sections: { title: string, data: ElectionResult[] }[] = [];
  const positionsToDisplay = selectedPositionId ? schoolPositions.filter((p: any) => p.id === selectedPositionId) : schoolPositions;

  positionsToDisplay.forEach((pos: any) => {
    const candidatesForPos = enrichedData
      .filter(c => c.position_id === pos.id && (c.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery))
      .sort((a, b) => Number(b.votes_count) - Number(a.votes_count));

    if (candidatesForPos.length > 0) {
      sections.push({
        title: pos.name,
        data: candidatesForPos.map(c => ({
          ...c,
          total_pos_votes: candidatesForPos.reduce((s, curr) => s + Number(curr.votes_count), 0)
        }))
      });
    }
  });

  // 5. Executive Results & Coalition Standings
  const executiveResultsList = (executiveResults?.results || []) as any[];
  const totalExecutiveVotes = executiveResultsList.reduce((acc, curr) => acc + Number(curr.voteCount || 0), 0);
  const resultsMap = new Map(executiveResultsList.map((r: any) => [r.coalitionId, Number(r.voteCount || 0)]));

  const standings = coalList.map((info) => {
    const votes = resultsMap.get(info.id) || 0;
    
    // UPDATED: Finds the delegate assigned to this specific coalition
    const rosterEntry = delegates.find((d: any) => d.coalition_id === info.id);
    
    return {
      id: info.id,
      name: info.name,
      acronym: info.acronym,
      slogan: info.slogan,
      description: info.description,
      votes,
      color: info.color_code || '#c8102e',
      percentage: totalExecutiveVotes > 0 ? (votes / totalExecutiveVotes) * 100 : 0,
      // Map the delegate name or fallback
      delegateName: rosterEntry?.name || "Verified Delegate"
    };
  }).sort((a, b) => b.votes - a.votes);

  return {
    sections,
    totalVotes: totalVotesInElection,
    turnoutPercentage: turnout,
    coalitionStanding: standings,
    coalitionPie: standings.filter(s => s.votes > 0).map(s => ({ name: s.acronym, value: s.votes, fill: s.color })),
    schoolPositions,
    schoolDistribution,
    leadingCoalition: standings[0] || null,
    verifiedDelegates: delegates // Correctly passes the list to your UI
  };
  
// UPDATED: Replaced delegateRoster with rosterResponse to match your hook call
}, [data, selectedPositionId, searchQuery, userCountData, coalitionsData, executiveResults, positionsData, rosterResponse]);

  if (loadingElections || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="font-extrabold text-[10px] tracking-[0.4em] text-red-600 uppercase">Fetching Results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      <Navbar />
      <div className="pt-28 max-w-6xl mx-auto px-4 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2 text-red-700">
              <Fingerprint size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Hello: {userName || 'Voter'}</span>
            </div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                Results: <span className="text-red-700">{resolvedName}</span>
              </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isCompleted ? 'IMMUTABLE FINAL RECORD' : 'REAL-TIME DATA MINING'}
              </span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Turnout</p>
              <div className="text-2xl font-black text-emerald-600">{processedData.turnoutPercentage.toFixed(1)}%</div>
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Tally</p>
              <div className="text-2xl font-black">{processedData.totalVotes.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-24 z-40 mb-10">
          <div className="bg-slate-900 p-1.5 rounded-3xl flex shadow-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'main', label: 'Live Tally', icon: LayoutGrid },
              { id: 'coalition', label: 'Coalition Race', icon: Shield },
              { id: 'delegates', label: 'Verified Delegates', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-red-700 shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'main' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">

            {/* Coalition Race Mini-Cards for Live Tally */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coalition Standings</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {processedData.coalitionStanding.map((coal, idx) => (
                  <motion.div
                    key={coal.id}
                    whileHover={{ y: -2 }}
                    className={`min-w-[200px] bg-white p-5 rounded-3xl border shadow-sm flex flex-col justify-between relative ${idx === 0 ? 'border-amber-200' : 'border-slate-100'}`}
                  >
                    {idx === 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                        <Crown size={10} />
                        <span className="text-[8px] font-black uppercase">Lead</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: coal.color }}>
                        {coal.acronym.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{coal.acronym}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[80px]">{coal.name}</p>
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-900">{coal.votes.toLocaleString()} Votes</div>
                      <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">{coal.percentage.toFixed(1)}%  Share of total votes</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search School Representatives..."
                  className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-red-700/5 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                <button onClick={() => setSelectedPositionId(null)} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${!selectedPositionId ? 'bg-red-700 text-white' : 'bg-white text-slate-400'}`}>All Schools</button>
                {processedData.schoolPositions.map((pos: any) => (
                  <button key={pos.id} onClick={() => setSelectedPositionId(pos.id)} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedPositionId === pos.id ? 'bg-red-700 text-white' : 'bg-white text-slate-400'}`}>{pos.name}</button>
                ))}
              </div>
            </div>

            {processedData.sections.map((section) => (
              <div key={section.title} className="space-y-6">
                <div className="flex items-center gap-4">
                  <Users className="text-slate-400" size={16} />
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{section.title}</h3>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.data.map((cand, idx) => {
                    const isWinner = idx === 0 && !searchQuery;
                    const isRunnerUp = idx === 1 && !searchQuery;
                    const percentage = (Number(cand.votes_count) / (cand.total_pos_votes || 1)) * 100;

                    return (
                      <motion.div layout key={cand.candidate_id} className={`group bg-white p-6 rounded-3xl border transition-all relative ${isWinner ? 'border-amber-200 shadow-xl ring-1 ring-amber-100' : 'border-slate-100'}`}>
                        {/* RANKING BADGES - Stays absolute but we added padding-right to the container below */}
                        <div className="absolute top-4 right-11 z-10">
                          {isWinner ? (
                            <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-amber-200">
                              <Star size={10} className="fill-amber-700" /> Platform Lead
                            </span>
                          ) : isRunnerUp ? (
                            <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Runner Up
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-slate-300 uppercase">RANK{idx + 1}</span>
                          )}
                        </div>

                        {/* Main Content Wrapper - Added pr-24 to ensure the Badge doesn't block the Vote Count */}
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 pr-0 sm:pr-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg relative flex-shrink-0 ${isWinner ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                              {isWinner ? (isCompleted ? <Trophy size={20} /> : <Zap size={20} />) : <UserCheck size={20} />}
                              {isWinner && (
                                <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                                  <Medal size={12} />
                                </div>
                              )}
                            </div>
                            <div className="pr-4">
                              <h4 className="text-base font-black text-slate-900 break-words">{cand.candidate_name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{cand.coalition_name}</p>
                            </div>
                          </div>

                          {/* Vote Tally - Pushed down slightly and given margin to avoid badge overlap */}
                          <div className="text-right mt-6 sm:mt-8 md:mt-0 min-w-[80px]">
                            <p className={`text-xl font-black ${isWinner ? 'text-amber-600' : 'text-slate-900'}`}>{Number(cand.votes_count).toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-slate-400">{percentage.toFixed(1)}%</p>
                          </div>
                        </div>

                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full rounded-full ${isWinner ? 'bg-amber-500' : 'bg-red-600'}`} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}

 {/* Delegates View */}
{activeTab === 'delegates' && (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="space-y-8"
  >
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-100 text-red-700 rounded-2xl">
          <UserCheck size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Verified Delegate Roster</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Identity confirmed representatives
          </p>
        </div>
      </div>

      {loadingRoster ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="animate-spin text-red-700" size={32} />
          <p className="text-xs font-bold text-slate-400">SYNCING WITH LEDGER...</p>
        </div>
      ) : rosterError ? (
        <div className="py-10 text-center text-red-500 font-bold bg-red-50 rounded-3xl border border-dashed border-red-200">
          <p>FAILED TO LOAD DELEGATE ROSTER</p>
          <p className="text-[10px] text-red-400 mt-1">PLEASE CHECK YOUR CONNECTION</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Use processedData.verifiedDelegates which we populated in useMemo */}
          {processedData.verifiedDelegates && processedData.verifiedDelegates.length > 0 ? (
            processedData.verifiedDelegates.map((delegate: any) => (
              <div 
                key={delegate.delegate_id} 
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 hover:border-red-200 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-700 shadow-sm border border-slate-100 group-hover:bg-red-700 group-hover:text-white transition-colors">
                  <Users size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {delegate.name}
                  </h4>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      Reg: {delegate.reg_no}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                      School of {delegate.school}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <div className="inline-flex p-4 bg-white rounded-full mb-4 shadow-sm text-slate-300">
                <Users size={32} />
              </div>
              <p className="text-sm font-bold text-slate-400">NO DELEGATES FOUND IN THIS ELECTION</p>
            </div>
          )}
        </div>
      )}
    </div>
  </motion.div>
)}

        {/* Coalition View - ENHANCED CYBER-SLATE DESIGN */}
        {activeTab === 'coalition' && (
          <div className="space-y-12">
            {/* PRIMARY AUTHORITY (Rank #1) */}
            {processedData.leadingCoalition && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative group rounded-[3.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(200,16,46,0.3)] border-b-8 border-[#3b0e15] bg-slate-900"
              >
                {/* Background Decorative Tech Elements */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:30px_30px]" />
                <Shield className="absolute -right-16 -bottom-16 text-white opacity-5 group-hover:rotate-12 transition-transform duration-700" size={400} />

                <div className="relative z-10 p-10 lg:p-16">
                  <div className="flex flex-col lg:flex-row justify-between gap-12">
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-[#c8102e]/20 backdrop-blur-xl border border-[#c8102e]/30 rounded-xl flex items-center gap-2">
                          <Trophy size={16} className="text-[#c8102e] fill-[#c8102e]" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Current Frontrunner</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-7xl lg:text-9xl font-black text-white tracking-tighter leading-none mb-4">
                          {processedData.leadingCoalition.name}
                        </h2>
                        <p className="text-xl font-bold text-[#c8102e] uppercase tracking-[0.5em] mb-6">
                          {processedData.leadingCoalition.acronym}
                        </p>

                        {processedData.leadingCoalition.slogan && (
                          <div className="inline-block px-6 py-3 bg-white/5 border-l-4 border-[#c8102e] rounded-r-2xl mb-8">
                            <p className="text-sm italic font-bold text-slate-300">
                              "{processedData.leadingCoalition.slogan}"
                            </p>
                          </div>
                        )}

                        {/* ACTION BUTTON TO TRIGGER MODAL */}
                        <div className="flex flex-wrap gap-4 pt-4">
                          <button
                            onClick={() => {
                              setActiveCoalition(processedData.leadingCoalition);
                              setIsSlateModalVisible(true);
                            }}
                            className="group/btn relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-[#c8102e] hover:text-white transition-all duration-300 flex items-center gap-3"
                          >
                            <Users size={16} className="group-hover/btn:rotate-12 transition-transform" />
                            COALITION MEMBERS LIST
                            <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Leading Stats Console */}
                    <div className="w-full lg:w-96 flex flex-col justify-end gap-6 bg-black/40 p-8 rounded-[3rem] backdrop-blur-md border border-white/5 h-fit lg:self-end">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Authenticated Votes</p>
                          <p className="text-5xl font-black text-white">{processedData.leadingCoalition.votes.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-black text-emerald-500">{processedData.leadingCoalition.percentage.toFixed(1)}%</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Of The Total Votes</p>
                        </div>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${processedData.leadingCoalition.percentage}%` }}
                          className="h-full bg-[#c8102e] rounded-full shadow-[0_0_20px_rgba(200,16,46,0.6)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECONDARY RANKS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {processedData.coalitionStanding.slice(1).map((coal, idx) => (
                <motion.div
                  key={coal.id}
                  whileHover={{ y: -10, scale: 1.01 }}
                  onClick={() => { setActiveCoalition(coal); setIsSlateModalVisible(true); }}
                  className="group bg-white p-10 rounded-[3.5rem] border border-[#c8102e] hover:border-[#c8102e]/20 shadow-sm hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Subtle Rank Background Number */}
                  <div className="absolute -right-2 top-0 text-[12rem] font-black text-slate-50 opacity-50 select-none group-hover:text-red-50/50 transition-colors">
                    {idx + 2}
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-10">
                      <div
                        className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white text-2xl font-black shadow-lg"
                        style={{ backgroundColor: coal.color || '#c8102e' }}
                      >
                        {coal.acronym?.substring(0, 1)}
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">RANK</span>
                        <span className="bg-red-700 text-white px-4 py-1.5 rounded-xl text-xs font-black">{idx + 2}</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div>
                        <h3 className="text-4xl font-black text-slate-900 group-hover:text-[#c8102e] transition-colors">
                          {coal.name}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{coal.acronym}</p>
                      </div>

                      {coal.slogan && (
                        <div className="flex items-start gap-2">
                          <div className="w-1 h-8 bg-slate-200 rounded-full group-hover:bg-[#c8102e] transition-colors" />
                          <p className="text-2xl text-slate-500 font-extrabold">"{coal.slogan}"</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Stats Section */}
                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Tally Count</p>
                        <p className="text-3xl font-black text-black">{coal.votes.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-l font-black text-[#c8102e]">{coal.percentage.toFixed(1)}% of the total votes</p>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[#c8102e]" style={{ width: `${coal.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      {/* Analytics View - FINAL ARCHITECTURE WITH MULTI-COLOR NODES */}
{activeTab === 'analytics' && (
  <div className="space-y-8">
    {/* Row 1: Global Stats & Coalition Power */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Platform Distribution (Primary Pie) */}
      <div className="lg:col-span-7 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Coalition Power Share</h3>
            <p className="text-2xl font-black text-slate-900">Platform Distribution</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
            <PieChartIcon size={20} className="text-[#c8102e]" />
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={processedData.coalitionPie || []} 
                innerRadius={110} 
                outerRadius={140} 
                paddingAngle={10} 
                dataKey="value"
                stroke="none"
              >
                {(processedData.coalitionPie || []).map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill || ['#c8102e', '#1e293b', '#475569'][index % 3]} 
                    className="hover:opacity-80 transition-opacity" 
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-[#c8102e] p-8 rounded-[3rem] text-white shadow-2xl shadow-red-200 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingUp size={160} />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
               <Activity size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1">Authenticated Tally</p>
            <div className="text-5xl font-black mb-6 tracking-tighter">
              {processedData.totalVotes?.toLocaleString() ?? 0}
            </div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Network Fully Synced
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] text-white border border-slate-800 relative overflow-hidden">
          <Cpu className="mb-6 text-[#c8102e]" size={32} />
          <h4 className="text-xl font-black mb-3 uppercase tracking-tight">Security Protocol</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Ballots are cryptographically hashed via the 0xSecure Ledger. Your vote is anonymized and immutable.
          </p>
          <div className="mt-6 flex gap-2">
             <div className="h-1 flex-1 bg-red-600/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#c8102e] w-3/4" />
             </div>
             <div className="h-1 flex-1 bg-slate-800 rounded-full" />
             <div className="h-1 flex-1 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* CANDIDATE DISTRIBUTION BY POSITION - COLOR ENHANCED */}
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Candidate Node Matrix</h3>
          <p className="text-2xl font-black text-slate-900">Position Vote Distribution</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {(processedData.sections || []).map((section, idx) => (
          <div key={idx} className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 hover:border-blue-200 transition-all group">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4">
              {section.title}
            </h4>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={section.data.map(c => ({ 
                      name: c.candidate_name, 
                      value: Number(c.votes_count)
                    }))}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {section.data.map((entry: any, index: number) => {
                      // High-contrast palette: Red, Amber, Emerald, Violet, Rose
                      const colors = ['#c8102e', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e'];
                      return (
                        <Cell 
                          key={`cell-pos-${index}`} 
                          fill={entry.coalition_color || colors[index % colors.length]} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* VOTER DENSITY BY SCHOOL - COLOR ENHANCED */}
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-1.5 h-8 bg-[#c8102e] rounded-full" />
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Node Analytics</h3>
          <p className="text-2xl font-black text-slate-900">Voter Density by School</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(processedData.schoolDistribution || []).map((school:any, idx: any) => {
          // Alternative shades for different schools
          const schoolColors = ['#c8102e', '#9b0d24', '#7a0a1c', '#5e0816'];
          return (
            <div key={idx} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 group hover:border-[#c8102e]/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{school.name}</div>
                <div className="text-sm font-black text-slate-900">{school.votes.toLocaleString()}</div>
              </div>
              <div className="h-[180px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: school.votes }, { value: processedData.totalVotes - school.votes }]}
                      innerRadius={55}
                      outerRadius={70}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill={schoolColors[idx % schoolColors.length]} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900">
                    {((school.votes / (processedData.totalVotes || 1)) * 100).toFixed(0)}%
                  </span>
                  <span className="text-[8px] font-black text-slate-400 uppercase">Share</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* GLOBAL TALLY BAR CHART */}
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-[#c8102e] rounded-full" />
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Global Tally</h3>
            <p className="text-2xl font-black text-slate-900">Regional Distribution Bar Chart</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
           <BarChartIcon size={18} />
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={processedData.schoolDistribution || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
            <YAxis hide />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
            <Bar dataKey="votes" fill="#c8102e" radius={[10, 10, 0, 0]} barSize={40}>
              {(processedData.schoolDistribution || []).map((entry:any, index: any) => (
                <Cell key={`cell-bar-${index}`} fill={['#c8102e', '#9b0d24', '#7a0a1c'][index % 3]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}
      </div>

      <AnimatePresence>
        {isSlateModalVisible && (
          <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSlateModalVisible(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full max-w-xl rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Full Platform Slate</p><h3 className="text-2xl font-black" style={{ color: activeCoalition?.color }}>{activeCoalition?.name}</h3></div>
                <button onClick={() => setIsSlateModalVisible(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {loadingLeaderSlate ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  leaderSlateData?.coalition?.candidates.map((cand: any) => (
                    <div key={cand.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <h5 className="text-sm font-black text-slate-900">{cand.name}</h5>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{cand.position.name}</p>
                      </div>
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResultsScreen;