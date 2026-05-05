import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { FaTrash, FaSearch, FaSync, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdGavel } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import {
  useGetAllAppealsQuery,
  useResolveAppealMutation,
  useDeleteAppealMutation,
} from "../../features/APIS/Appeals.Api";
import type { RootState } from "../../App/store";

const MySwal = withReactContent(Swal);

export const AdminAppeals = () => {
  /* ================= FETCHING DATA ================= */
  const { data: appealsRaw, isLoading, error, refetch } = useGetAllAppealsQuery();
  const { user } = useSelector((state: RootState) => state.auth);

  /* ================= MUTATIONS ================= */
  const [resolveAppeal] = useResolveAppealMutation();
  const [deleteAppeal] = useDeleteAppealMutation();

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= DATA NORMALIZATION ================= */
  const appeals = useMemo(() => {
    return Array.isArray(appealsRaw) ? appealsRaw : [];
  }, [appealsRaw]);

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, stageFilter]);

  /* ================= FILTER LOGIC ================= */
  const filteredAppeals = appeals.filter((appeal: any) => {
    const studentName = appeal.application?.student?.name || "";
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          appeal.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? appeal.status === statusFilter : true;
    const matchesStage = stageFilter ? appeal.rejected_stage === stageFilter : true;
    
    return matchesSearch && matchesStatus && matchesStage;
  });

  const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);
  const paginatedAppeals = filteredAppeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= VIEW EVIDENCE ================= */
  const handleViewEvidence = (url: string) => {
    MySwal.fire({
      title: '<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Evidence Review</span>',
      imageUrl: url,
      imageAlt: 'Appeal Evidence',
      confirmButtonText: 'CLOSE PREVIEW',
      confirmButtonColor: '#1e293b',
      customClass: { popup: 'rounded-[2rem]' }
    });
  };

  /* ================= RESOLVE APPEAL ================= */
  const handleResolveAppeal = async (appeal: any) => {
    const { value: decision } = await MySwal.fire({
      title: '<b class="text-slate-800 uppercase italic">Adjudicate Appeal</b>',
      text: "Submit a final decision for this candidate's appeal.",
      input: 'select',
      inputOptions: {
        APPROVED: 'Approve Appeal (Reset Application)',
        REJECTED: 'Reject Appeal (Keep Disqualified)'
      },
      inputPlaceholder: 'Select Decision',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2.5rem]' },
      inputValidator: (value) => {
        if (!value) return 'You must select a decision';
      }
    });

    if (decision) {
      const { value: comment } = await MySwal.fire({
        title: 'Reviewer Comment',
        input: 'textarea',
        inputPlaceholder: 'Explain the reason for this decision...',
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        customClass: { popup: 'rounded-[2.5rem]' }
      });

      if (comment !== undefined) {
        try {
          await resolveAppeal({
            appealId: appeal.id,
            status: decision,
            comment: comment
          }).unwrap();
          toast.success(`Appeal ${decision.toLowerCase()}`);
        } catch (err: any) {
          toast.error(err?.data?.message || "Resolution failed");
        }
      }
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteAppeal = async (id: string) => {
    const confirm = await MySwal.fire({
      title: "PURGE APPEAL?",
      text: "This record will be scrubbed from the justice registry.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      confirmButtonText: "YES, PURGE",
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (confirm.isConfirmed) {
      try {
        await deleteAppeal(id).unwrap();
        toast.success("Appeal record purged");
      } catch {
        toast.error("Purge Operation Failed");
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Justice Registry...</p>
      </div>
    );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full mb-3 border border-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Justice System</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Appeals <span className="text-amber-600">Registry</span></h1>
          </div>

          <button onClick={() => { setSearchTerm(""); setStatusFilter(""); setStageFilter(""); refetch(); }}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-700 transition-all shadow-sm flex items-center gap-2"
          >
            <FaSync className="w-3 h-3 text-amber-600" /> Refresh Registry
          </button>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Appeals</p>
             <p className="text-2xl font-black text-slate-900">{appeals.length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-amber-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pending Review</p>
             <p className="text-2xl font-black text-amber-600">{appeals.filter((a:any) => a.status === 'PENDING').length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Overturned</p>
             <p className="text-2xl font-black text-emerald-600">{appeals.filter((a:any) => a.status === 'APPROVED').length}</p>
           </div>
           <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-red-600">
             <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Upheld Rejections</p>
             <p className="text-2xl font-black text-red-600">{appeals.filter((a:any) => a.status === 'REJECTED').length}</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Side */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8 space-y-6">
              <div className="p-4 bg-slate-900 rounded-[1.5rem] text-center">
                 <MdGavel className="text-amber-500 mx-auto mb-2" size={32} />
                 <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Adjudication Panel</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="relative">
                  <input type="text" placeholder="Search by name or reason..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500">
                  <option value="">Resolution Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved (Overturned)</option>
                  <option value="REJECTED">Rejected (Upheld)</option>
                </select>

                <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500">
                  <option value="">Appeal Stage</option>
                  <option value="SCHOOL_DEAN">School Dean</option>
                  <option value="ACCOUNTS">Finance/Accounts</option>
                  <option value="DEAN_OF_STUDENTS">Dean of Students</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <MdGavel className="text-amber-600" size={24} /> Justice Feed
                </h2>
                <span className="text-[10px] font-black text-slate-400 uppercase">Case {currentPage} of {totalPages || 1}</span>
              </div>

              <div className="divide-y divide-slate-100">
                {paginatedAppeals.length > 0 ? (
                  paginatedAppeals.map((appeal: any) => (
                    <div key={appeal.id} className="p-7 hover:bg-amber-50/30 transition-all group relative border-l-[6px] border-transparent hover:border-amber-600">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                             appeal.status === 'PENDING' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
                             appeal.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
                             'bg-red-100 text-red-600 border border-red-200'
                           }`}>
                             {appeal.status}
                           </span>
                           <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[8px] font-black uppercase tracking-widest">
                             {appeal.rejected_stage.replace('_', ' ')}
                           </span>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-4">
                          <button onClick={() => handleViewEvidence(appeal.supporting_document_url)} className="text-[10px] font-black text-slate-400 hover:text-amber-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaEye /> Proof</button>
                          {appeal.status === 'PENDING' && (
                            <button onClick={() => handleResolveAppeal(appeal)} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaCheckCircle /> Resolve</button>
                          )}
                          <button onClick={() => handleDeleteAppeal(appeal.id)} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaTrash /> Purge</button>
                        </div>
                      </div>
                      
                      <h3 className="text-base font-black text-slate-900 uppercase italic mb-1 tracking-tight">
                        {appeal.application?.student?.name || "Unknown Candidate"}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed bg-white/50 p-4 rounded-xl border border-slate-100 mt-2">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Reason for Appeal:</span>
                        {appeal.reason}
                      </p>
                      
                      <div className="flex items-center justify-between mt-5 border-t border-slate-50 pt-5">
                        <div className="text-[9px] font-bold text-slate-400 uppercase">
                          Submitted: <span className="text-slate-800 font-black">{new Date(appeal.created_at).toLocaleString()}</span>
                        </div>
                        {appeal.reviewer_comment && (
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black uppercase text-amber-600">Review Note:</span>
                             <span className="text-[10px] font-bold italic text-slate-500">"{appeal.reviewer_comment.substring(0, 30)}..."</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center flex flex-col items-center">
                    <div className="p-5 bg-slate-50 rounded-full mb-4">
                        <MdGavel className="text-slate-200" size={40} />
                    </div>
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No matching appeal records found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-amber-600 transition-colors">Prev</button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-amber-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}>{i + 1}</button>
                  ))}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-amber-600 transition-colors">Next</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};