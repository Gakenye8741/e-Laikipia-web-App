import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { FaEdit, FaTrash, FaSyncAlt, FaPlus, FaSearch, FaSync, FaTimes, FaGavel } from "react-icons/fa";
import { MdBallot } from "react-icons/md";

import {
  useGetAllElectionsQuery,
  useCreateElectionMutation,
  useUpdateElectionMutation,
  useDeleteElectionMutation,
  useChangeElectionStatusMutation,
} from "../../features/APIS/Election.Api";
import { toast } from "sonner";

const MySwal = withReactContent(Swal);

export const AllElections = () => {
  /* ================= FETCHING DATA (Position Style) ================= */
  const { data: electionsRaw, isLoading, error, refetch } = useGetAllElectionsQuery(undefined);

  /* ================= MUTATIONS ================= */
  const [createElection] = useCreateElectionMutation();
  const [updateElection] = useUpdateElectionMutation();
  const [deleteElection] = useDeleteElectionMutation();
  const [changeStatus] = useChangeElectionStatusMutation();

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= DATA GUARDS & NORMALIZATION ================= */
  const elections = useMemo(() => {
    const data = (electionsRaw as any)?.elections || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, startDateFilter, endDateFilter]);

  /* ================= FILTER LOGIC ================= */
  const filteredElections = elections.filter((election: any) => {
    const matchesName = (election.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? election.status === statusFilter : true;
    const matchesStartDate = startDateFilter ? new Date(election.start_date) >= new Date(startDateFilter) : true;
    const matchesEndDate = endDateFilter ? new Date(election.end_date) <= new Date(endDateFilter) : true;
    return matchesName && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const totalPages = Math.ceil(filteredElections.length / itemsPerPage);
  const paginatedElections = filteredElections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= CREATE (University Style) ================= */
  const handleAddElection = async () => {
    const { value } = await MySwal.fire({
      title: '<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registry System</span><br/><b class="text-slate-800 tracking-tighter italic uppercase text-2xl">Deploy New Election</b>',
      html: `
        <div class="text-left font-sans p-2">
          <div class="mb-4">
            <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Election Title</label>
            <input id="name" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all" placeholder="e.g. SRC General Election 2026" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">Start Date</label>
              <input id="start_date" type="datetime-local" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none" />
            </div>
            <div>
              <label class="text-[9px] font-black text-[#b91c1c] uppercase ml-1 tracking-widest">End Date</label>
              <input id="end_date" type="datetime-local" class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none" />
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "INITIALIZE BALLOT",
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black tracking-widest px-8 py-4' },
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const start_date = (document.getElementById("start_date") as HTMLInputElement).value;
        const end_date = (document.getElementById("end_date") as HTMLInputElement).value;

        const persistAuth = localStorage.getItem("persist:auth");
        let created_by = null;
        if (persistAuth) {
          const authObj = JSON.parse(persistAuth);
          const userStr = authObj.user;
          if (userStr) {
            const userObj = JSON.parse(userStr);
            created_by = userObj.user?.id;
          }
        }

        if (!name || !start_date || !end_date || !created_by) {
          Swal.showValidationMessage("Incomplete Registry Fields");
          return;
        }
        return { name, start_date, end_date, created_by };
      },
    });

    if (value) {
      try {
        await createElection(value).unwrap();
        MySwal.fire({ title: "REGISTERED", text: "Election initialized successfully", icon: "success", confirmButtonColor: '#1e293b' });
      } catch {
        MySwal.fire({ title: "FAILURE", text: "Registry deployment failed", icon: "error", confirmButtonColor: '#b91c1c' });
      }
    }
  };

  /* ================= UPDATE ================= */
  const handleEditElection = async (election: any) => {
    const { value } = await MySwal.fire({
      title: '<b class="text-slate-800 uppercase italic">Modify Election Record</b>',
      html: `
        <div class="text-left font-sans p-2">
          <input id="name" class="w-full bg-slate-100 border-none rounded-xl p-4 mb-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600" value="${election.name}" />
          <input id="start_date" type="datetime-local" class="w-full bg-slate-100 border-none rounded-xl p-4 mb-4 text-xs font-bold outline-none" value="${election.start_date}" />
          <input id="end_date" type="datetime-local" class="w-full bg-slate-100 border-none rounded-xl p-4 text-xs font-bold outline-none" value="${election.end_date}" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "SAVE CHANGES",
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2.5rem]' },
      preConfirm: () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const start_date = (document.getElementById("start_date") as HTMLInputElement).value;
        const end_date = (document.getElementById("end_date") as HTMLInputElement).value;
        if (!name || !start_date || !end_date) {
          Swal.showValidationMessage("All fields required");
          return;
        }
        return { electionId: election.id, name, start_date, end_date, created_by: election.created_by };
      },
    });

    if (value) {
      try {
        await updateElection(value).unwrap();
        MySwal.fire({ title: "UPDATED", icon: "success", confirmButtonColor: '#1e293b' });
      } catch {
        MySwal.fire({ title: "ERROR", icon: "error", confirmButtonColor: '#b91c1c' });
      }
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteElection = async (id: string) => {
    const confirm = await MySwal.fire({
      title: "PURGE RECORD?",
      text: "This election will be permanently scrubbed from the Registry.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      confirmButtonText: "YES, PURGE",
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (confirm.isConfirmed) {
      try {
        await deleteElection(id).unwrap();
        toast.success("Election Purged");
      } catch {
        MySwal.fire("Error", "Purge Operation Failed", "error");
      }
    }
  };

  /* ================= STATUS ================= */
  const handleChangeStatus = async (election: any) => {
    const { value: status } = await MySwal.fire({
      title: "Transition Status",
      input: "select",
      inputOptions: { upcoming: "Upcoming", ongoing: "Ongoing", finished: "Finished" },
      inputValue: election.status,
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (status) {
      try {
        await changeStatus({ electionId: election.id, status }).unwrap();
      } catch {
        MySwal.fire("Error", "Status update failed", "error");
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Registry...</p>
      </div>
    );

  if (error) return <div className="p-8 text-red-600 font-black uppercase text-center">Sync Error: Secure Link Failed</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Election Control</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Elections <span className="text-red-700">Registry</span></h1>
          </div>

          <button onClick={() => { setSearchTerm(""); setStatusFilter(""); setStartDateFilter(""); setEndDateFilter(""); refetch(); }}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-700 transition-all shadow-sm flex items-center gap-2"
          >
            <FaSync className="w-3 h-3 text-red-600" /> Refresh Link
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Database Total</p>
             <p className="text-2xl font-black text-slate-900">{elections.length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Now</p>
             <p className="text-2xl font-black text-emerald-600">{elections.filter((e:any) => e.status === 'ongoing').length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-red-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Planned Sessions</p>
             <p className="text-2xl font-black text-red-600">{elections.filter((e:any) => e.status === 'upcoming').length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Registry Health</p>
             <p className="text-xs font-black text-emerald-500 uppercase">● Optimized</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Side */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8 space-y-6">
              <button onClick={handleAddElection}
                className="w-full py-5 bg-[#b91c1c] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <FaPlus /> Initialize New Race
              </button>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="relative">
                  <input type="text" placeholder="Search Elections..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                  <option value="">Filter by Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                </select>

                <div>
                   <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Archive Start Date</label>
                   <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* List Side (Transmission Feed) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <MdBallot className="text-red-700" size={24} /> Official Feed
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase">Archive Segments {currentPage} of {totalPages || 1}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {paginatedElections.length > 0 ? (
                  paginatedElections.map((election: any) => (
                    <div key={election.id} className="p-7 hover:bg-red-50/30 transition-all group relative border-l-[6px] border-transparent hover:border-red-600">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          election.status === 'ongoing' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                          election.status === 'upcoming' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {election.status}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-4">
                          <button onClick={() => handleEditElection(election)} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaEdit /> Edit</button>
                          <button onClick={() => handleChangeStatus(election)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaSyncAlt /> Status</button>
                          <button onClick={() => handleDeleteElection(election.id)} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaTrash /> Purge</button>
                        </div>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-900 uppercase italic mb-1 tracking-tight">{election.name}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mt-5 border-t border-slate-50 pt-5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-loose">
                           Commencement: <br/><span className="text-slate-800 text-xs font-black">{new Date(election.start_date).toLocaleString()}</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em] leading-loose">
                           Conclusion: <br/><span className="text-slate-800 text-xs font-black">{new Date(election.end_date).toLocaleString()}</span>
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
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-colors">Prev Segment</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-700 text-white shadow-lg shadow-red-200 scale-110' : 'bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>{i + 1}</button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-red-600 transition-colors">Next Segment</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};