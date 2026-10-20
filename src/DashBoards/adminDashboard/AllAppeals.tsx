// import { useState, useEffect, useMemo } from "react";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import { PuffLoader } from "react-spinners";
// import { FaTrash, FaSearch, FaSync, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
// import { MdGavel } from "react-icons/md";
// import { useSelector } from "react-redux";
// import { toast } from "sonner";

// import {
//   useGetAllAppealsQuery,
//   useResolveAppealMutation,
//   useDeleteAppealMutation,
// } from "../../features/APIS/Appeals.Api";
// import type { RootState } from "../../App/store";

// const MySwal = withReactContent(Swal);

// export const AdminAppeals = () => {
//   /* ================= FETCHING DATA ================= */
//   const { data: appealsRaw, isLoading, error, refetch } = useGetAllAppealsQuery();
//   const { user } = useSelector((state: RootState) => state.auth);

//   /* ================= MUTATIONS ================= */
//   const [resolveAppeal] = useResolveAppealMutation();
//   const [deleteAppeal] = useDeleteAppealMutation();

//   /* ================= STATE ================= */
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [stageFilter, setStageFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   /* ================= DATA NORMALIZATION ================= */
//   const appeals = useMemo(() => {
//     return Array.isArray(appealsRaw) ? appealsRaw : [];
//   }, [appealsRaw]);

//   useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, stageFilter]);

//   /* ================= FILTER LOGIC ================= */
//   const filteredAppeals = appeals.filter((appeal: any) => {
//     const studentName = appeal.application?.student?.name || "";
//     const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                           appeal.reason.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter ? appeal.status === statusFilter : true;
//     const matchesStage = stageFilter ? appeal.rejected_stage === stageFilter : true;
    
//     return matchesSearch && matchesStatus && matchesStage;
//   });

//   const totalPages = Math.ceil(filteredAppeals.length / itemsPerPage);
//   const paginatedAppeals = filteredAppeals.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   /* ================= VIEW EVIDENCE ================= */
//   const handleViewEvidence = (url: string) => {
//     MySwal.fire({
//       title: '<span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Evidence Review</span>',
//       imageUrl: url,
//       imageAlt: 'Appeal Evidence',
//       confirmButtonText: 'CLOSE PREVIEW',
//       confirmButtonColor: '#1e293b',
//       customClass: { popup: 'rounded-[2rem]' }
//     });
//   };

//   /* ================= RESOLVE APPEAL ================= */
//   const handleResolveAppeal = async (appeal: any) => {
//     const { value: decision } = await MySwal.fire({
//       title: '<b class="text-slate-800 uppercase italic">Adjudicate Appeal</b>',
//       text: "Submit a final decision for this candidate's appeal.",
//       input: 'select',
//       inputOptions: {
//         APPROVED: 'Approve Appeal (Reset Application)',
//         REJECTED: 'Reject Appeal (Keep Disqualified)'
//       },
//       inputPlaceholder: 'Select Decision',
//       showCancelButton: true,
//       confirmButtonColor: '#b91c1c',
//       customClass: { popup: 'rounded-[2.5rem]' },
//       inputValidator: (value) => {
//         if (!value) return 'You must select a decision';
//       }
//     });

//     if (decision) {
//       const { value: comment } = await MySwal.fire({
//         title: 'Reviewer Comment',
//         input: 'textarea',
//         inputPlaceholder: 'Explain the reason for this decision...',
//         showCancelButton: true,
//         confirmButtonColor: '#b91c1c',
//         customClass: { popup: 'rounded-[2.5rem]' }
//       });

//       if (comment !== undefined) {
//         try {
//           await resolveAppeal({
//             appealId: appeal.id,
//             status: decision,
//             comment: comment
//           }).unwrap();
//           toast.success(`Appeal ${decision.toLowerCase()}`);
//         } catch (err: any) {
//           toast.error(err?.data?.message || "Resolution failed");
//         }
//       }
//     }
//   };

//   /* ================= DELETE ================= */
//   const handleDeleteAppeal = async (id: string) => {
//     const confirm = await MySwal.fire({
//       title: "PURGE APPEAL?",
//       text: "This record will be scrubbed from the justice registry.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: '#b91c1c',
//       confirmButtonText: "YES, PURGE",
//       customClass: { popup: 'rounded-[2rem]' }
//     });

//     if (confirm.isConfirmed) {
//       try {
//         await deleteAppeal(id).unwrap();
//         toast.success("Appeal record purged");
//       } catch {
//         toast.error("Purge Operation Failed");
//       }
//     }
//   };

//   if (isLoading)
//     return (
//       <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
//         <PuffLoader color="#b91c1c" size={60} />
//         <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Justice Registry...</p>
//       </div>
//     );

//   return (
//     <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header Section */}
//         <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
//           <div>
//             <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full mb-3 border border-amber-100">
//               <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse"></span>
//               <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Justice System</span>
//             </div>
//             <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Appeals <span className="text-amber-600">Registry</span></h1>
//           </div>

//           <button onClick={() => { setSearchTerm(""); setStatusFilter(""); setStageFilter(""); refetch(); }}
//             className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:text-amber-700 transition-all shadow-sm flex items-center gap-2"
//           >
//             <FaSync className="w-3 h-3 text-amber-600" /> Refresh Registry
//           </button>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-slate-800">
//              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Appeals</p>
//              <p className="text-2xl font-black text-slate-900">{appeals.length}</p>
//            </div>
//            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-amber-600">
//              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Pending Review</p>
//              <p className="text-2xl font-black text-amber-600">{appeals.filter((a:any) => a.status === 'PENDING').length}</p>
//            </div>
//            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
//              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Overturned</p>
//              <p className="text-2xl font-black text-emerald-600">{appeals.filter((a:any) => a.status === 'APPROVED').length}</p>
//            </div>
//            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 border-l-red-600">
//              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Upheld Rejections</p>
//              <p className="text-2xl font-black text-red-600">{appeals.filter((a:any) => a.status === 'REJECTED').length}</p>
//            </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
//           {/* Controls Side */}
//           <div className="lg:col-span-4">
//             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8 space-y-6">
//               <div className="p-4 bg-slate-900 rounded-[1.5rem] text-center">
//                  <MdGavel className="text-amber-500 mx-auto mb-2" size={32} />
//                  <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Adjudication Panel</p>
//               </div>

//               <div className="space-y-4 pt-4 border-t border-slate-100">
//                 <div className="relative">
//                   <input type="text" placeholder="Search by name or reason..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" />
//                   <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
//                 </div>

//                 <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500">
//                   <option value="">Resolution Status</option>
//                   <option value="PENDING">Pending</option>
//                   <option value="APPROVED">Approved (Overturned)</option>
//                   <option value="REJECTED">Rejected (Upheld)</option>
//                 </select>

//                 <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500">
//                   <option value="">Appeal Stage</option>
//                   <option value="SCHOOL_DEAN">School Dean</option>
//                   <option value="ACCOUNTS">Finance/Accounts</option>
//                   <option value="DEAN_OF_STUDENTS">Dean of Students</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* List Side */}
//           <div className="lg:col-span-8">
//             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
//               <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
//                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
//                   <MdGavel className="text-amber-600" size={24} /> Justice Feed
//                 </h2>
//                 <span className="text-[10px] font-black text-slate-400 uppercase">Case {currentPage} of {totalPages || 1}</span>
//               </div>

//               <div className="divide-y divide-slate-100">
//                 {paginatedAppeals.length > 0 ? (
//                   paginatedAppeals.map((appeal: any) => (
//                     <div key={appeal.id} className="p-7 hover:bg-amber-50/30 transition-all group relative border-l-[6px] border-transparent hover:border-amber-600">
//                       <div className="flex justify-between items-start mb-3">
//                         <div className="flex gap-2">
//                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
//                              appeal.status === 'PENDING' ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
//                              appeal.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 
//                              'bg-red-100 text-red-600 border border-red-200'
//                            }`}>
//                              {appeal.status}
//                            </span>
//                            <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[8px] font-black uppercase tracking-widest">
//                              {appeal.rejected_stage.replace('_', ' ')}
//                            </span>
//                         </div>
//                         <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-4">
//                           <button onClick={() => handleViewEvidence(appeal.supporting_document_url)} className="text-[10px] font-black text-slate-400 hover:text-amber-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaEye /> Proof</button>
//                           {appeal.status === 'PENDING' && (
//                             <button onClick={() => handleResolveAppeal(appeal)} className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaCheckCircle /> Resolve</button>
//                           )}
//                           <button onClick={() => handleDeleteAppeal(appeal.id)} className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-tighter transition-colors flex items-center gap-1"><FaTrash /> Purge</button>
//                         </div>
//                       </div>
                      
//                       <h3 className="text-base font-black text-slate-900 uppercase italic mb-1 tracking-tight">
//                         {appeal.application?.student?.name || "Unknown Candidate"}
//                       </h3>
//                       <p className="text-[11px] font-medium text-slate-600 leading-relaxed bg-white/50 p-4 rounded-xl border border-slate-100 mt-2">
//                         <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Reason for Appeal:</span>
//                         {appeal.reason}
//                       </p>
                      
//                       <div className="flex items-center justify-between mt-5 border-t border-slate-50 pt-5">
//                         <div className="text-[9px] font-bold text-slate-400 uppercase">
//                           Submitted: <span className="text-slate-800 font-black">{new Date(appeal.created_at).toLocaleString()}</span>
//                         </div>
//                         {appeal.reviewer_comment && (
//                           <div className="flex items-center gap-2">
//                              <span className="text-[8px] font-black uppercase text-amber-600">Review Note:</span>
//                              <span className="text-[10px] font-bold italic text-slate-500">"{appeal.reviewer_comment.substring(0, 30)}..."</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="p-20 text-center flex flex-col items-center">
//                     <div className="p-5 bg-slate-50 rounded-full mb-4">
//                         <MdGavel className="text-slate-200" size={40} />
//                     </div>
//                     <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No matching appeal records found</p>
//                   </div>
//                 )}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center gap-3">
//                   <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-amber-600 transition-colors">Prev</button>
//                   {[...Array(totalPages)].map((_, i) => (
//                     <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-2xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-amber-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400'}`}>{i + 1}</button>
//                   ))}
//                   <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-4 py-2 text-[10px] font-black uppercase text-slate-600 disabled:opacity-20 hover:text-amber-600 transition-colors">Next</button>
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PuffLoader } from "react-spinners";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import {
  FaSearch,
  FaSync,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
} from "react-icons/fa";
import { MdGavel } from "react-icons/md";

import {
  useGetAllAppealsQuery,
  useResolveAppealMutation,
  useDeleteAppealMutation,
} from "../../features/APIS/Appeals.Api";

/* ============================== Types & constants ============================== */
type StatusKey = "PENDING" | "APPROVED" | "REJECTED";

type Dialog =
  | { type: "evidence"; appeal: any }
  | { type: "resolve"; appeal: any }
  | { type: "delete"; appeal: any }
  | null;

const ITEMS_PER_PAGE = 6;

const STATUS_STYLE: Record<StatusKey, { label: string; badge: string; dot: string }> = {
  PENDING: { label: "Pending", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  APPROVED: { label: "Overturned", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "Upheld", badge: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-600" },
};

const STAGE_LABEL: Record<string, string> = {
  SCHOOL_DEAN: "School dean",
  ACCOUNTS: "Accounts office",
  DEAN_OF_STUDENTS: "Dean of students",
};

const selectClass =
  "w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10";

const cancelBtn =
  "rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10";
const dangerBtn =
  "rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:opacity-50";

/* ================================== Helpers ================================== */
const statusOf = (a: any): StatusKey => {
  const s = String(a?.status || "PENDING").toUpperCase();
  return (s in STATUS_STYLE ? s : "PENDING") as StatusKey;
};
const stageLabel = (s?: string) => STAGE_LABEL[s || ""] || (s || "Unknown stage").replace(/_/g, " ").toLowerCase();
const studentName = (a: any) => a?.application?.student?.name || "Unknown candidate";

/* ================================== Motion ================================== */
const page: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ============================== Small components ============================== */
const Counter = ({ to }: { to: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 0.9, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
};

const StatCard = ({ label, value, dot }: { label: string; value: number; dot?: string }) => (
  <div className="bg-white p-5">
    <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
    </p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
      <Counter to={value} />
    </p>
  </div>
);

const StatusPill = ({ status }: { status: StatusKey }) => {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${s.badge}`}>
      <span className="relative flex h-2 w-2">
        {status === "PENDING" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
};

const Pagination = ({
  page: current,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <button
      disabled={current <= 1}
      onClick={() => onChange(current - 1)}
      aria-label="Previous page"
      className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaChevronLeft size={11} />
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        aria-current={n === current ? "page" : undefined}
        className={`h-10 w-10 rounded-lg text-sm font-bold transition ${
          n === current
            ? "bg-red-700 text-white"
            : "border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-700"
        }`}
      >
        {n}
      </button>
    ))}
    <button
      disabled={current >= totalPages}
      onClick={() => onChange(current + 1)}
      aria-label="Next page"
      className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaChevronRight size={11} />
    </button>
  </div>
);

/** Dark backdrop with a panel that pops in. Closes on Escape or a click outside. */
const Modal = ({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 220, damping: 22 } }}
        exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.15 } }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/10"
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
};

/* ================================== Dialogs ================================== */
const EvidenceDialog = ({ appeal, onClose }: { appeal: any; onClose: () => void }) => {
  const url: string | undefined = appeal.supporting_document_url;
  const [broken, setBroken] = useState(false);

  return (
    <Modal title="Evidence" subtitle={`Submitted by ${studentName(appeal)}`} onClose={onClose}>
      <div className="space-y-4 p-6">
        {!url ? (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-500">
            No evidence was attached to this appeal.
          </p>
        ) : broken ? (
          <p className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
            This file cannot be shown here.{" "}
            <a href={url} target="_blank" rel="noreferrer" className="font-bold text-red-700 hover:underline">
              Open it in a new tab
            </a>
          </p>
        ) : (
          <img
            src={url}
            alt="Appeal evidence"
            onError={() => setBroken(true)}
            className="max-h-[60vh] w-full rounded-2xl border border-slate-100 object-contain"
          />
        )}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ResolveDialog = ({
  appeal,
  busy,
  onConfirm,
  onClose,
}: {
  appeal: any;
  busy: boolean;
  onConfirm: (decision: "APPROVED" | "REJECTED", comment: string) => void;
  onClose: () => void;
}) => {
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | "">("");
  const [comment, setComment] = useState("");

  const options = [
    {
      value: "APPROVED" as const,
      icon: <FaCheckCircle />,
      title: "Approve the appeal",
      hint: "The application will be reset",
      active: "border-emerald-500 bg-emerald-50",
      iconClass: "bg-emerald-100 text-emerald-700",
    },
    {
      value: "REJECTED" as const,
      icon: <FaTimesCircle />,
      title: "Reject the appeal",
      hint: "The candidate stays disqualified",
      active: "border-red-500 bg-red-50",
      iconClass: "bg-red-100 text-red-700",
    },
  ];

  return (
    <Modal title="Resolve this appeal" subtitle={`Appeal from ${studentName(appeal)}`} onClose={onClose}>
      <div className="space-y-5 p-6">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-red-800">
            <FaQuoteLeft size={11} /> Reason for the appeal
          </p>
          <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {appeal.reason || "No reason was written."}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-700">Your decision</p>
          {options.map((o) => (
            <motion.button
              key={o.value}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDecision(o.value)}
              aria-pressed={decision === o.value}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-red-600/15 ${
                decision === o.value ? o.active : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${o.iconClass}`}>
                {o.icon}
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-800">{o.title}</span>
                <span className="block text-xs text-slate-500">{o.hint}</span>
              </span>
            </motion.button>
          ))}
        </div>

        <div>
          <label htmlFor="comment" className="mb-1 block text-sm font-semibold text-slate-600">
            Note for the candidate (optional)
          </label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain why you made this decision"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={cancelBtn}>
            Go back
          </button>
          <button
            onClick={() => decision && onConfirm(decision, comment.trim())}
            disabled={busy || !decision}
            className={dangerBtn}
          >
            {busy ? "Saving..." : "Save decision"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DeleteDialog = ({
  appeal,
  busy,
  onConfirm,
  onClose,
}: {
  appeal: any;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <Modal title="Delete this appeal?" subtitle="The record will be removed for good. This cannot be undone." onClose={onClose}>
    <div className="space-y-4 p-6">
      <p className="text-sm text-slate-600">
        You are about to delete the appeal from <strong className="text-slate-900">{studentName(appeal)}</strong>.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className={cancelBtn}>
          Keep it
        </button>
        <button onClick={onConfirm} disabled={busy} className={dangerBtn}>
          {busy ? "Deleting..." : "Yes, delete"}
        </button>
      </div>
    </div>
  </Modal>
);

/* ================================== Appeal card ================================== */
const AppealCard = ({
  appeal,
  index,
  onEvidence,
  onResolve,
  onDelete,
}: {
  appeal: any;
  index: number;
  onEvidence: () => void;
  onResolve: () => void;
  onDelete: () => void;
}) => {
  const status = statusOf(appeal);

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          Rejected by: {stageLabel(appeal.rejected_stage)}
        </span>
        <StatusPill status={status} />
      </div>

      <h3 className="mt-4 text-xl font-black leading-tight text-slate-900">{studentName(appeal)}</h3>
      <p className="mt-1 text-sm text-slate-400">
        Sent on {appeal.created_at ? new Date(appeal.created_at).toLocaleString() : "an unknown date"}
      </p>

      <div className="mt-4 border-l-2 border-red-100 pl-4">
        <p className="text-xs font-bold text-red-800">Reason for the appeal</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {appeal.reason || "No reason was written."}
        </p>
      </div>

      {appeal.reviewer_comment && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-bold text-slate-500">Reviewer note</p>
          <p className="mt-1 line-clamp-3 text-sm text-slate-600">{appeal.reviewer_comment}</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onEvidence}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/15"
        >
          <FaEye /> View evidence
        </motion.button>
        {status === "PENDING" && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onResolve}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20"
          >
            <MdGavel /> Resolve appeal
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onDelete}
          aria-label="Delete appeal"
          title="Delete appeal"
          className="ml-auto rounded-xl border border-red-100 bg-red-50 px-4 text-red-700 transition-colors hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600/20"
        >
          <FaTrash size={13} />
        </motion.button>
      </div>
    </motion.article>
  );
};

/* ================================== The page ================================== */
export const AdminAppeals = () => {
  /* ---------- Data ---------- */
  const { data: appealsRaw, isLoading, isFetching, isError, refetch } = useGetAllAppealsQuery();
  const [resolveAppeal, { isLoading: isResolving }] = useResolveAppealMutation();
  const [deleteAppeal, { isLoading: isDeleting }] = useDeleteAppealMutation();

  /* ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog>(null);

  const appeals: any[] = useMemo(() => {
    const raw = Array.isArray(appealsRaw) ? appealsRaw : (appealsRaw as any)?.appeals;
    return Array.isArray(raw) ? raw : [];
  }, [appealsRaw]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return appeals.filter(
      (a) =>
        (!term || studentName(a).toLowerCase().includes(term) || (a.reason || "").toLowerCase().includes(term)) &&
        (!statusFilter || statusOf(a) === statusFilter) &&
        (!stageFilter || a.rejected_stage === stageFilter)
    );
  }, [appeals, searchTerm, statusFilter, stageFilter]);

  const totals = useMemo(() => {
    const t = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    appeals.forEach((a) => (t[statusOf(a)] += 1));
    return t;
  }, [appeals]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const hasFilters = !!(searchTerm || statusFilter || stageFilter);
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStageFilter("");
  };

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, stageFilter]);

  /* ---------- Actions ---------- */
  const closeDialog = () => setDialog(null);

  const handleResolve = async (appeal: any, decision: "APPROVED" | "REJECTED", comment: string) => {
    try {
      await resolveAppeal({ appealId: appeal.id, status: decision, comment }).unwrap();
      toast.success(decision === "APPROVED" ? "The appeal was approved" : "The appeal was rejected");
      closeDialog();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not save your decision. Please try again.");
    }
  };

  const handleDelete = async (appeal: any) => {
    try {
      await deleteAppeal(appeal.id).unwrap();
      toast.success("The appeal was deleted");
      closeDialog();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not delete the appeal. Please try again.");
    }
  };

  /* ---------- Loading and error ---------- */
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading appeals...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <MdGavel className="mb-4 text-slate-300" size={52} />
        <p className="text-sm font-bold text-slate-700">We could not load the appeals</p>
        <p className="mt-1 text-sm text-slate-500">Check your connection and try again.</p>
        <button onClick={() => refetch()} className={`${dangerBtn} mt-5`}>
          Try again
        </button>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <motion.header
            variants={item}
            className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                <MdGavel className="text-red-700" /> Appeals
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">
                Read each appeal, check the evidence, then approve it or reject it.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <label htmlFor="search" className="sr-only">
                  Search by name or reason
                </label>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or reason"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10 md:w-72"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh the list"
                title="Refresh the list"
                className="rounded-xl border border-slate-200 bg-white p-3.5 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10"
              >
                <FaSync className={isFetching ? "animate-spin text-red-700" : ""} />
              </motion.button>
            </div>
          </motion.header>

          {/* Numbers */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4"
          >
            <StatCard label="All appeals" value={appeals.length} />
            <StatCard label="Pending" value={totals.PENDING} dot="bg-amber-500" />
            <StatCard label="Overturned" value={totals.APPROVED} dot="bg-emerald-500" />
            <StatCard label="Upheld" value={totals.REJECTED} dot="bg-red-600" />
          </motion.div>

          {/* Filters */}
          <motion.div variants={item} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="f-status" className="mb-1 block text-sm font-semibold text-slate-600">
                  Status
                </label>
                <select
                  id="f-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Overturned (appeal approved)</option>
                  <option value="REJECTED">Upheld (appeal rejected)</option>
                </select>
              </div>
              <div>
                <label htmlFor="f-stage" className="mb-1 block text-sm font-semibold text-slate-600">
                  Rejected by
                </label>
                <select
                  id="f-stage"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className={selectClass}
                >
                  <option value="">All stages</option>
                  <option value="SCHOOL_DEAN">School dean</option>
                  <option value="ACCOUNTS">Accounts office</option>
                  <option value="DEAN_OF_STUDENTS">Dean of students</option>
                </select>
              </div>
            </div>

            <AnimatePresence>
              {hasFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <button onClick={clearFilters} className="mt-4 text-sm font-bold text-red-700 hover:underline">
                    Clear filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* List */}
          <motion.div variants={item} className="space-y-5">
            <p className="text-sm text-slate-500" aria-live="polite">
              {filtered.length.toLocaleString()} {filtered.length === 1 ? "appeal" : "appeals"}
              {hasFilters ? " match your filters" : ""}
            </p>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {pageItems.map((appeal, i) => (
                  <AppealCard
                    key={appeal.id}
                    appeal={appeal}
                    index={i}
                    onEvidence={() => setDialog({ type: "evidence", appeal })}
                    onResolve={() => setDialog({ type: "resolve", appeal })}
                    onDelete={() => setDialog({ type: "delete", appeal })}
                  />
                ))}
              </AnimatePresence>
            </div>

            {pageItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center"
              >
                <MdGavel className="mx-auto mb-4 text-slate-200" size={52} />
                <p className="text-sm font-bold text-slate-700">
                  {hasFilters ? "No appeals match your filters" : "There are no appeals yet"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasFilters ? "Try different filters or clear them." : "New appeals will show up here."}
                </p>
              </motion.div>
            )}

            {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} />}
          </motion.div>
        </motion.div>

        {/* Dialogs */}
        <AnimatePresence>
          {dialog?.type === "evidence" && <EvidenceDialog key="evidence" appeal={dialog.appeal} onClose={closeDialog} />}
          {dialog?.type === "resolve" && (
            <ResolveDialog
              key="resolve"
              appeal={dialog.appeal}
              busy={isResolving}
              onClose={closeDialog}
              onConfirm={(decision, comment) => handleResolve(dialog.appeal, decision, comment)}
            />
          )}
          {dialog?.type === "delete" && (
            <DeleteDialog
              key="delete"
              appeal={dialog.appeal}
              busy={isDeleting}
              onClose={closeDialog}
              onConfirm={() => handleDelete(dialog.appeal)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default AdminAppeals;