import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSync, FaTimes } from "react-icons/fa";
import { MdBallot } from "react-icons/md";

import {
  useGetAllPositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from "../../features/APIS/Position.APi";

import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

const MySwal = withReactContent(Swal);

/* ================= ENUMS ================= */
const TIERS = ["school", "university"] as const;
const SCHOOLS = [
  "Science",
  "Education",
  "Business",
  "Humanities and Developmental_Studies",
  "TVET",
] as const;

export const AllPositions = () => {
  /* ================= FETCHING DATA ================= */
  const { data: positionsRaw, isLoading: isLoadingPositions, error, refetch: refetchPositions } = useGetAllPositionsQuery();
  const { data: electionsRaw, isLoading: isLoadingElections, refetch: refetchElections } = useGetAllElectionsQuery();

  /* ================= MUTATIONS ================= */
  const [createPosition] = useCreatePositionMutation();
  const [updatePosition] = useUpdatePositionMutation();
  const [deletePosition] = useDeletePositionMutation();

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
    const data = (positionsRaw as any)?.positions || positionsRaw;
    return Array.isArray(data) ? data : [];
  }, [positionsRaw]);

  const elections = useMemo(() => {
    const data = (electionsRaw as any)?.elections || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  useEffect(() => {
    if (elections.length > 0 && !electionFilter) {
      setElectionFilter(elections[elections.length - 1].id);
    }
  }, [elections, electionFilter]);

  const electionMap = useMemo(() => elections.reduce((acc: Record<string, string>, e: any) => {
    acc[e.id] = e.name;
    return acc;
  }, {}), [elections]);

  useEffect(() => setCurrentPage(1), [searchTerm, tierFilter, schoolFilter, electionFilter]);

  /* ================= REFRESH HANDLER ================= */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchPositions(), refetchElections()]);
    setTimeout(() => setIsRefreshing(false), 1000); // Animation duration
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

  /* ================= MODAL STYLING & HANDLERS ================= */
  const handleAddPosition = async () => {
    const tierOptions = TIERS.map((t) => `<option value="${t}">${t.toUpperCase()}</option>`).join("");
    const schoolOptions = SCHOOLS.map((s) => `<option value="${s}">${(s || "").replace(/_/g, " ")}</option>`).join("");
    const electionOptions = elections.map((e: any) => `<option value="${e.id}">${e.name}</option>`).join("");

    const { value } = await MySwal.fire({
      title: '<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registry System</span><br/><b class="text-slate-800 tracking-tighter italic uppercase text-2xl">Deploy New Position</b>',
      html: `
        <div class="text-left font-sans p-2">
          <div class="mb-4">
            <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Position Name</label>
            <input id="name" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all" placeholder="e.g. Faculty Representative" />
          </div>
          <div class="mb-4">
            <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Role Description</label>
            <input id="description" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all" placeholder="Briefly describe responsibilities..." />
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Administrative Tier</label>
              <select id="tier" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none cursor-pointer hover:bg-slate-200 transition-all text-slate-500">${tierOptions}</select>
            </div>
            <div>
              <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Assigned School</label>
              <select id="school" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none cursor-pointer hover:bg-slate-200 transition-all text-slate-500">${schoolOptions}</select>
            </div>
          </div>
          <div>
            <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Connect to Election</label>
            <select id="election_id" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none cursor-pointer hover:bg-slate-200 transition-all text-slate-500">${electionOptions}</select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'INITIALIZE POSITION',
      confirmButtonColor: '#b91c1c',
      cancelButtonText: 'CANCEL',
      customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black tracking-widest px-8 py-4' },
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const description = (document.getElementById("description") as HTMLInputElement).value;
        const tier = (document.getElementById("tier") as HTMLSelectElement).value;
        const school = (document.getElementById("school") as HTMLSelectElement).value;
        const election_id = (document.getElementById("election_id") as HTMLSelectElement).value;
        if (!name || !description || !tier || !school || !election_id) {
          Swal.showValidationMessage("Validation Error: All fields required");
          return;
        }
        return { name, description, tier, school, election_id };
      },
    });

    if (value) {
      await createPosition(value).unwrap();
      MySwal.fire({ title: "REGISTERED", text: "New position recorded in registry", icon: "success", confirmButtonColor: '#1e293b' });
      refetchPositions();
    }
  };

  const handleEditPosition = async (p: any) => {
    const tierOptions = TIERS.map((t) => `<option value="${t}" ${t === p.tier ? "selected" : ""}>${t.toUpperCase()}</option>`).join("");
    const schoolOptions = SCHOOLS.map((s) => `<option value="${s}" ${s === p.school ? "selected" : ""}>${(s || "").replace(/_/g, " ")}</option>`).join("");
    const electionOptions = elections.map((e: any) => `<option value="${e.id}" ${e.id === p.election_id ? "selected" : ""}>${e.name}</option>`).join("");

    const { value } = await MySwal.fire({
      title: '<b class="text-slate-800 uppercase italic">Modify Record</b>',
      html: `
        <div class="text-left font-sans p-2">
          <input id="name" class="w-full bg-slate-100 border-none rounded-xl p-4 mb-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all" value="${p.name || ""}" />
          <input id="description" class="w-full bg-slate-100 border-none rounded-xl p-4 mb-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all" value="${p.description || ""}" />
          <select id="tier" class="w-full bg-slate-100 border-none rounded-xl p-4 mb-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600">${tierOptions}</select>
          <select id="school" class="w-full bg-slate-100 border-none rounded-xl p-4 mb-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600">${schoolOptions}</select>
          <select id="election_id" class="w-full bg-slate-100 border-none rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600">${electionOptions}</select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE CHANGES',
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2.5rem]' },
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const description = (document.getElementById("description") as HTMLInputElement).value;
        const tier = (document.getElementById("tier") as HTMLSelectElement).value;
        const school = (document.getElementById("school") as HTMLSelectElement).value;
        const election_id = (document.getElementById("election_id") as HTMLSelectElement).value;
        return { positionId: p.id, name, description, tier, school, election_id };
      },
    });

    if (value) {
      await updatePosition(value).unwrap();
      MySwal.fire({ title: "UPDATED", icon: "success", confirmButtonColor: '#1e293b' });
      refetchPositions();
    }
  };

  const handleDeletePosition = async (id: string) => {
    const res = await MySwal.fire({
      title: "PURGE POSITION?",
      text: "This record will be permanently scrubbed from the Registry.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      confirmButtonText: "YES, PURGE",
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (res.isConfirmed) {
      await deletePosition(id).unwrap();
      refetchPositions();
    }
  };

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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Position Control</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Positions <span className="text-red-700">Registry</span></h1>
          </div>

          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleRefresh}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-700 transition-all shadow-sm flex items-center gap-2"
            >
              <FaSync className={`w-3 h-3 text-red-600 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Link
            </button>
            <button onClick={() => { setSearchTerm(""); setTierFilter(""); setSchoolFilter(""); setElectionFilter(""); }}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <FaTimes className="w-3 h-3 text-rose-500" /> Reset Registry
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Database Entries", val: positions.length, color: "text-slate-900", b: "border-l-slate-800" },
            { label: "Active Filter", val: filteredPositions.length, color: "text-red-600", b: "border-l-red-600" },
            { label: "Linked Races", val: elections.length, color: "text-emerald-600", b: "border-l-emerald-600" },
            { label: "Registry Health", val: "Optimal", color: "text-emerald-500", isText: true, b: "border-l-slate-400" }
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
              <button onClick={handleAddPosition}
                className="w-full py-5 bg-[#b91c1c] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <FaPlus /> Initialize New Position
              </button>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="relative">
                  <input type="text" placeholder="Search Records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>

                <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">Filter by Tier</option>
                  {TIERS.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>

                <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">Filter by School</option>
                  {SCHOOLS.map(s => <option key={s} value={s}>{(s || "").replace(/_/g, " ")}</option>)}
                </select>

                <select value={electionFilter} onChange={(e) => setElectionFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">Linked Election Race</option>
                  {elections.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* List Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                   <MdBallot className="text-red-700" size={24} /> Transmission Feed
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase border border-red-100">
                  <FaSync className={`text-[8px] ${isRefreshing ? 'animate-spin' : ''}`} /> Live Stream
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto custom-scrollbar">
                {paginatedPositions.length > 0 ? (
                  paginatedPositions.map((p: any) => (
                    <div key={p.id} className="p-7 hover:bg-red-50/30 transition-all group relative border-l-[6px] border-transparent hover:border-red-600">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest border border-red-200">{p.tier || "N/A"}</span>
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200">{(p.school || "").replace(/_/g, " ") || "GENERAL"}</span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-4">
                          <button onClick={() => handleEditPosition(p)} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaEdit /> Edit</button>
                          <button onClick={() => handleDeletePosition(p.id)} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaTrash /> Purge</button>
                        </div>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-900 uppercase italic mb-1 tracking-tight">{p.name || "UNIDENTIFIED RECORD"}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{p.description || "System generated: No metadata attached."}</p>
                      
                      <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                           Linked Race: <span className="text-slate-800 font-black">{electionMap[p.election_id] || "DISCONNECTED"}</span>
                        </span>
                        <span className="text-[8px] text-slate-300 font-black tracking-widest">ID: {p.id?.slice(0,12)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-24 text-center">
                    <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                        <MdBallot className="text-slate-200" size={40} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-loose">No matching registry records found.<br/>Adjust parameters or refresh link.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center items-center gap-3">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}
                    className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-all">Prev Segment</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-700 text-white shadow-lg shadow-red-200 scale-110' : 'bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}
                    className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-all">Next Segment</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};