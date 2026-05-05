import { useState, useEffect, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { FaSearch, FaSync, FaTimes, FaGraduationCap } from "react-icons/fa";
import { MdBallot } from "react-icons/md";

import { useGetAllPositionsQuery } from "../../features/APIS/Position.APi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

/* ================= ENUMS FOR FILTERING ================= */
const TIERS = ["school", "university"] as const;
const SCHOOLS = [
  "Science",
  "Education",
  "Business",
  "Humanities and Developmental_Studies",
  "TVET",
] as const;

export const Positions = () => {
  /* ================= FETCHING DATA ================= */
  const { data: positionsRaw, isLoading: isLoadingPositions, error, refetch: refetchPositions } = useGetAllPositionsQuery();
  const { data: electionsRaw, isLoading: isLoadingElections, refetch: refetchElections } = useGetAllElectionsQuery();

  /* ================= LOCAL STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [electionFilter, setElectionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 6;

  /* ================= DATA GUARDS & NORMALIZATION ================= */
  const positions = useMemo(() => {
    const data = (positionsRaw as any)?.positions || (positionsRaw as any)?.data || positionsRaw;
    return Array.isArray(data) ? data : [];
  }, [positionsRaw]);

  const elections = useMemo(() => {
    const data = (electionsRaw as any)?.elections || (electionsRaw as any)?.data || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  const electionMap = useMemo(() => elections.reduce((acc: Record<string, string>, e: any) => {
    acc[e.id] = e.name;
    return acc;
  }, {}), [elections]);

  useEffect(() => setCurrentPage(1), [searchTerm, tierFilter, schoolFilter, electionFilter]);

  /* ================= REFRESH HANDLER ================= */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchPositions(), refetchElections()]);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  /* ================= FILTER LOGIC ================= */
  const filteredPositions = positions.filter((p: any) =>
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (tierFilter ? p.tier === tierFilter : true) &&
    (schoolFilter ? p.school === schoolFilter : true) &&
    (electionFilter ? p.election_id === electionFilter : true)
  );

  const totalPages = Math.ceil(filteredPositions.length / itemsPerPage);
  const paginatedPositions = filteredPositions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= UI RENDERING ================= */
  if (isLoadingPositions || isLoadingElections) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Registry...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full mb-3 border border-red-200">
              <FaGraduationCap className="text-red-800 text-xs" />
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Office of the Dean</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Positions <span className="text-red-700">Registry</span></h1>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleRefresh}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-700 transition-all shadow-sm flex items-center gap-2"
            >
              <FaSync className={`w-3 h-3 text-red-600 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Registry
            </button>
            <button onClick={() => { setSearchTerm(""); setTierFilter(""); setSchoolFilter(""); setElectionFilter(""); }}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <FaTimes className="w-3 h-3 text-rose-500" /> Reset Filters
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Positions", val: positions.length, color: "text-slate-900", b: "border-l-slate-800" },
            { label: "Filtered Results", val: filteredPositions.length, color: "text-red-600", b: "border-l-red-600" },
            { label: "Election Races", val: elections.length, color: "text-emerald-600", b: "border-l-emerald-600" },
            { label: "Oversight", val: "Authorized", color: "text-emerald-500", isText: true, b: "border-l-slate-400" }
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 ${stat.b}`}>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">{stat.label}</p>
              <p className={`text-2xl font-black uppercase italic ${stat.color}`}>
                {stat.val}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Side */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Registry Filters</p>
                <div className="relative">
                  <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>

                <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">All Tiers</option>
                  {TIERS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>

                <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">All Schools</option>
                  {SCHOOLS.map(s => <option key={s} value={s}>{(s || "").replace(/_/g, " ")}</option>)}
                </select>

                <select value={electionFilter} onChange={(e) => setElectionFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">Specific Election Race</option>
                  {elections.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <p className="text-[9px] leading-relaxed text-slate-400 font-bold uppercase">
                  This view is restricted to Election Oversight. Position modifications must be handled through the Registry Admin portal.
                </p>
              </div>
            </div>
          </div>

          {/* List Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                   <MdBallot className="text-red-700" size={24} /> Official Ledger
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {paginatedPositions.length > 0 ? (
                  paginatedPositions.map((p: any) => (
                    <div key={p.id} className="p-7 hover:bg-slate-50 transition-all group relative border-l-[6px] border-transparent hover:border-red-600">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-200">{p.tier || "N/A"}</span>
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200">{(p.school || "").replace(/_/g, " ") || "GENERAL"}</span>
                        </div>
                        <span className="text-[8px] text-slate-300 font-black tracking-widest uppercase">Registry ID: {p.id?.slice(0,12)}</span>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-900 uppercase italic mb-1 tracking-tight">{p.name || "UNIDENTIFIED POSITION"}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{p.description || "No specific metadata provided for this role."}</p>
                      
                      <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                           Linked Election Race: <span className="text-slate-800 font-black">{electionMap[p.election_id] || "DISCONNECTED"}</span>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-24 text-center">
                    <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                        <MdBallot className="text-slate-200" size={40} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-loose">No positions found in this segment.<br/>Modify search or reset registry links.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-3">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-all">Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-700 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-all">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};