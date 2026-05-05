import { useState, useEffect, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { FaSearch, FaSync, FaGraduationCap } from "react-icons/fa";
import { MdBallot } from "react-icons/md";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

export const Elections = () => {
  /* ================= FETCHING DATA ================= */
  const { data: electionsRaw, isLoading, error, refetch, isFetching } = useGetAllElectionsQuery(undefined);

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= DATA NORMALIZATION ================= */
  const elections = useMemo(() => {
    const data = (electionsRaw as any)?.elections || (electionsRaw as any)?.data || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  /* ================= FILTER LOGIC ================= */
  const filteredElections = elections.filter((election: any) => {
    const matchesName = (election.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    return matchesName && matchesStatus;
  });

  const totalPages = Math.ceil(filteredElections.length / itemsPerPage);
  const paginatedElections = filteredElections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing with Official Registry...</p>
      </div>
    );

  if (error) return <div className="p-8 text-red-600 font-black uppercase text-center">Connection Error: Failed to fetch Registry</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
              <FaGraduationCap className="text-red-800 text-xs" />
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Office of the Dean</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Election <span className="text-red-700">Registry</span></h1>
          </div>

          <button onClick={() => refetch()}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-700 transition-all shadow-sm flex items-center gap-2"
          >
            <FaSync className={isFetching ? 'animate-spin text-red-600' : 'text-red-600'} /> Refresh Feed
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Registered Cycles</p>
             <p className="text-2xl font-black text-slate-900">{elections.length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Ongoing Phases</p>
             <p className="text-2xl font-black text-emerald-600">{elections.filter((e:any) => e.status === 'ongoing').length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-red-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Upcoming Races</p>
             <p className="text-2xl font-black text-red-600">{elections.filter((e:any) => e.status === 'upcoming').length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Registry Status</p>
             <p className="text-xs font-black text-emerald-500 uppercase">● Synchronized</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Filter Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Search & Filtering</p>
                <div className="relative">
                  <input type="text" placeholder="Filter by Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div className="pt-6 border-t border-slate-100">
                <p className="text-[9px] leading-relaxed text-slate-400 font-bold uppercase">
                  This registry provides a read-only audit trail of all student government election phases.
                </p>
              </div>
            </div>
          </div>

          {/* Records View */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <MdBallot className="text-red-700" size={24} /> Election Ledger
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase">Page {currentPage} of {totalPages || 1}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {paginatedElections.length > 0 ? (
                  paginatedElections.map((election: any) => (
                    <div key={election.id} className="p-7 hover:bg-slate-50/80 transition-all border-l-[6px] border-transparent hover:border-red-600">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          election.status === 'ongoing' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                          election.status === 'upcoming' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {election.status}
                        </span>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">UUID: {election.id.slice(0, 8)}...</span>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-900 uppercase italic mb-1 tracking-tight">{election.name}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 border-t border-slate-50 pt-5">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b w-fit">Voter Balloting Phase</p>
                          <div className="flex flex-col gap-1">
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Start: <span className="text-slate-800 font-black">{new Date(election.start_date).toLocaleString()}</span></div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">End: <span className="text-slate-800 font-black">{new Date(election.end_date).toLocaleString()}</span></div>
                          </div>
                        </div>
                        <div className="bg-red-50/30 p-4 rounded-2xl border border-red-50">
                          <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-2 border-b w-fit">Delegate Voting Phase</p>
                          <div className="flex flex-col gap-1">
                            <div className="text-[9px] font-bold text-slate-500 uppercase">Start: <span className="text-red-700 font-black">{election.delegate_start_date ? new Date(election.delegate_start_date).toLocaleString() : 'Not Set'}</span></div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">End: <span className="text-red-700 font-black">{election.delegate_end_date ? new Date(election.delegate_end_date).toLocaleString() : 'Not Set'}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center">
                    <div className="p-5 bg-slate-50 rounded-full mb-4">
                        <MdBallot className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No matching registry records found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-colors">Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-700 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}>{i + 1}</button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-colors">Next</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};