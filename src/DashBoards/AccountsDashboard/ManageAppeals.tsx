import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { FaSearch, FaSync, FaEye, FaHistory, FaClock, FaFileInvoiceDollar, FaCheck, FaTimes } from "react-icons/fa";
import { MdOutlinePayments } from "react-icons/md";
import { toast } from "sonner";

import {
  useGetAppealsByRoleQuery, // Efficient role-based fetching
  useResolveAppealMutation,
} from "../../features/APIS/Appeals.Api";

const MySwal = withReactContent(Swal);

export const AccountsAppeals = () => {
  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= FETCHING DATA ================= */
  // Fetches data based on the active tab (history toggle)
  const { 
    data: appealsRaw, 
    isLoading, 
    isFetching, 
    error, 
    refetch 
  } = useGetAppealsByRoleQuery({ 
    role: "ACCOUNTS", 
    history: activeTab === "HISTORY" 
  });

  /* ================= MUTATIONS ================= */
  const [resolveAppeal, { isLoading: isUpdating }] = useResolveAppealMutation();

  /* ================= SEARCH FILTERING ================= */
  const filteredAppeals = useMemo(() => {
    const data = Array.isArray(appealsRaw) ? appealsRaw : [];
    if (!searchTerm) return data;

    return data.filter((appeal: any) => {
      const studentName = appeal.application?.student?.name || "";
      const regNo = appeal.application?.student?.regNo || "";
      return (
        studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        regNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [appealsRaw, searchTerm]);

  const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);
  const paginatedAppeals = filteredAppeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= VIEW RECEIPT ================= */
  const handleViewReceipt = (url: string) => {
    MySwal.fire({
      title: '<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Evidence</span>',
      imageUrl: url,
      imageAlt: 'Receipt Screenshot',
      confirmButtonText: 'CLOSE',
      confirmButtonColor: '#1e293b',
      customClass: { popup: 'rounded-[2rem]' }
    });
  };

  /* ================= ADJUDICATE (EDIT/RESOLVE) ================= */
  const handleDecision = async (appealId: string, status: "APPROVED" | "REJECTED") => {
    const isApprove = status === "APPROVED";
    
    const { value: comment, isConfirmed } = await MySwal.fire({
      title: `<b class="text-slate-800 uppercase italic">${isApprove ? 'Approve Clearance' : 'Issue Rejection'}</b>`,
      text: isApprove 
        ? "This will mark the student as cleared and move them back to the verification queue." 
        : "Explain why this appeal is being rejected.",
      input: 'textarea',
      inputPlaceholder: isApprove ? 'Optional: e.g. Fee balance cleared.' : 'Required: e.g. Invalid transaction code.',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'APPROVE NOW' : 'REJECT APPEAL',
      confirmButtonColor: isApprove ? '#059669' : '#dc2626',
      customClass: { popup: 'rounded-[2.5rem]' },
      inputValidator: (value) => {
        if (!value && !isApprove) return 'A reason for rejection is required';
      }
    });

    if (isConfirmed) {
      try {
        await resolveAppeal({ appealId, status, comment: comment || "" }).unwrap();
        toast.success(`Appeal status updated to ${status}`);
      } catch (err: any) {
        toast.error(err?.data?.error || "Update failed");
      }
    }
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
      <PuffLoader color="#059669" size={60} />
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Appeals Data...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Fee <span className="text-red-600">Appeals</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Reg No / Name..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl p-3 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 w-64 shadow-sm" 
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
            
            <div className="flex bg-slate-200/50 p-1 rounded-2xl">
              <button 
                onClick={() => { setActiveTab("PENDING"); setCurrentPage(1); }} 
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'PENDING' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500'}`}
              >
                <FaClock className="inline mr-1" /> Pending
              </button>
              <button 
                onClick={() => { setActiveTab("HISTORY"); setCurrentPage(1); }} 
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                <FaHistory className="inline mr-1" /> History
              </button>
            </div>

            <button onClick={() => refetch()} className={`p-3 bg-white border border-slate-200 rounded-2xl hover:bg-red-50 transition-all shadow-sm ${isFetching ? 'animate-spin' : ''}`}>
              <FaSync className="text-red-600" />
            </button>
          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">Student's Reason</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedAppeals.length > 0 ? (
                  paginatedAppeals.map((appeal: any) => (
                    <tr key={appeal.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                              <FaFileInvoiceDollar size={18} />
                           </div>
                           <div>
                             <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{appeal.application?.student?.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appeal.application?.student?.regNo}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 max-w-xs">
                        <p className="text-[10px] text-slate-600 leading-relaxed italic line-clamp-2">"{appeal.reason}"</p>
                        {appeal.reviewer_comment && (
                           <div className="mt-2 flex items-center gap-1">
                             <span className="text-[8px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-md uppercase">Reviewer Note</span>
                             <p className="text-[9px] text-slate-500 font-medium truncate">{appeal.reviewer_comment}</p>
                           </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          appeal.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                          appeal.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                             appeal.status === 'PENDING' ? 'bg-amber-500' : 
                             appeal.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-emerald-500'
                          }`}></span>
                          {appeal.status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleViewReceipt(appeal.supporting_document_url)} 
                            className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                            title="View Evidence"
                          >
                            <FaEye size={14}/>
                          </button>
                          
                          {/* Resolve Actions: Visible in Pending or for Editing History */}
                          <div className="flex gap-1.5">
                            <button 
                              disabled={appeal.status === 'APPROVED' || isUpdating}
                              onClick={() => handleDecision(appeal.id, "APPROVED")}
                              className={`p-2.5 rounded-xl transition-all ${
                                appeal.status === 'APPROVED' 
                                ? 'bg-red-50 text-red-300 cursor-not-allowed' 
                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                              }`}
                            >
                              <FaCheck size={12} />
                            </button>
                            
                            <button 
                              disabled={appeal.status === 'REJECTED' || isUpdating}
                              onClick={() => handleDecision(appeal.id, "REJECTED")}
                              className={`p-2.5 rounded-xl transition-all ${
                                appeal.status === 'REJECTED' 
                                ? 'bg-red-50 text-red-300 cursor-not-allowed' 
                                : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white'
                              }`}
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                       <MdOutlinePayments className="mx-auto text-slate-200 mb-3" size={64} />
                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No appeal records found</p>
                       <p className="text-[9px] text-slate-300 mt-1 uppercase font-bold tracking-wider">Try switching tabs or adjusting search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {paginatedAppeals.length} of {filteredAppeals.length} appeals
              </p>
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-red-600 text-white shadow-red-200 shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:border-red-300'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};