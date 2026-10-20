import React, { useState, useMemo } from 'react'; 
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { 
  useDeleteApplicationMutation, 
  useGetAllApplicationsQuery, 
  useUpdateApplicationStatusMutation 
} from '../../features/APIS/Applcation.Api';
import { useGetUserByIdQuery } from '../../features/APIS/UserApi';
import { useGetPositionByIdQuery } from '../../features/APIS/Position.APi';
import { useGetAllElectionsQuery } from '../../features/APIS/Election.Api';
import { useGetElectionAuditQuery } from '../../features/APIS/Vote.Api'; 
import { FaSearch, FaSync, FaTrash, FaCheckCircle, FaTimesCircle, FaUserShield, FaGraduationCap, FaLock, FaChartLine } from 'react-icons/fa';
import { MdBallot } from 'react-icons/md';

const MySwal = withReactContent(Swal);

/* Small animations. They switch off for people who prefer less motion. */
const animations = `
@keyframes ca-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ca-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ca-float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(18px, -24px); } }
@keyframes ca-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes ca-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes ca-wiggle { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-10deg); } 40% { transform: rotate(8deg); } 60% { transform: rotate(-5deg); } 80% { transform: rotate(3deg); } }

.ca-rise { animation: ca-rise .55s cubic-bezier(.22,1,.36,1) both; }
.ca-fade { animation: ca-fade .35s ease-out both; }
.ca-float { animation: ca-float 14s ease-in-out infinite; }
.ca-float-slow { animation: ca-float 20s ease-in-out infinite reverse; }
.ca-bob { animation: ca-bob 2.6s ease-in-out infinite; }
.ca-wiggle { animation: ca-wiggle .9s ease-in-out .5s 1; transform-origin: 50% 50%; }
.ca-skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: ca-shimmer 1.4s linear infinite;
}
.ca-hide-scroll { scrollbar-width: none; }
.ca-hide-scroll::-webkit-scrollbar { display: none; }

/* Clear outline when moving around with a keyboard */
.ca-root button:focus-visible,
.ca-root select:focus-visible,
.ca-root input:focus-visible {
  outline: 3px solid rgba(185,28,28,.35);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .ca-rise, .ca-fade, .ca-float, .ca-float-slow, .ca-bob, .ca-wiggle, .ca-skeleton,
  .animate-spin, .animate-pulse { animation: none !important; }
}
`;

/* Friendly names and colours for each status (looks only) */
const statusStyles: Record<string, { label: string; pill: string; dot: string; bar: string }> = {
  APPROVED: { label: 'Approved', pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', pill: 'bg-red-100 text-red-700', dot: 'bg-red-500', bar: 'bg-red-500' },
  PENDING: { label: 'Pending', pill: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', bar: 'bg-amber-400' },
};

const filterLabels: Record<string, string> = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const selectBase =
  "mt-1.5 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-semibold text-slate-800 outline-none transition duration-200 hover:border-slate-300 focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-100 sm:text-sm";

const CandidateApplicationSchoolDeans = () => {
  /* ================= JURISDICTION CONTEXT ================= */
  const authUser = useSelector((state: any) => state.auth.user?.user);
  const deanSchool = authUser?.school;
  const deanRole = authUser?.role || "";
  const deanName = authUser?.name || "Dean";

  // --- Data Fetching ---
  const { data: applications, isLoading, refetch, isFetching } = useGetAllApplicationsQuery();
  const { data: electionsData, isLoading: isLoadingElections } = useGetAllElectionsQuery();
  
  // --- Mutations ---
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();
  
  // --- Filtering States ---
  const [filter, setFilter] = useState('ALL');
  const [selectedElectionId, setSelectedElectionId] = useState('ALL'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');

  // --- Voting Integrity Check ---
  const { data: auditData } = useGetElectionAuditQuery(selectedElectionId, {
    skip: selectedElectionId === 'ALL'
  });

  const checkHasVotes = (app: any) => {
    if (!auditData || !Array.isArray(auditData)) return false;
    const appId = app.id || app._id;
    return auditData.some((vote: any) => vote.candidate_id === appId || vote.application_id === appId);
  };

  /* ================= STRICT SCHOOL FILTERING ================= */
  const schoolFilteredApps = useMemo(() => {
    if (!applications) return [];
    if (deanRole === "admin") return applications;
    return applications.filter((app: any) => 
      app.school?.trim().toLowerCase() === deanSchool?.trim().toLowerCase()
    );
  }, [applications, deanSchool, deanRole]);

  // --- Helpers ---
  const elections = useMemo(() => {
    if (!electionsData) return [];
    const data = (electionsData as any)?.elections || (electionsData as any)?.data || electionsData;
    return Array.isArray(data) ? data : [];
  }, [electionsData]);

  const uniquePositions = useMemo(() => {
    if (!schoolFilteredApps) return [];
    const positions = schoolFilteredApps.map((app: any) => app.position_id).filter(Boolean);
    return Array.from(new Set(positions));
  }, [schoolFilteredApps]);

  const getAdminId = () => authUser?.userId || authUser?.id || null;

  // How many applications are in each status (for the small number badges)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: schoolFilteredApps.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    schoolFilteredApps.forEach((app: any) => {
      const s = (app?.overall_status || 'PENDING').toUpperCase();
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  }, [schoolFilteredApps]);

  /* ================= ACADEMIC & GRADE REVIEW LOGIC ================= */
  const handleReviewApp = async (app: any) => {
    if (checkHasVotes(app)) {
      return toast.error("This candidate already has votes, so changes are locked.");
    }

    await MySwal.fire({
      title: `
        <span class="text-xs font-semibold text-slate-400">Check grades and clearance</span><br/>
        <b class="text-slate-800 tracking-tight text-xl">Review: School of ${deanSchool}</b>
      `,
      html: `
        <div class="text-left font-sans p-1">
            <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4 flex items-center gap-3">
                <div class="h-10 w-10 shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <div>
                    <p class="text-xs font-bold text-blue-900 leading-none">Check the student's grades</p>
                    <p class="text-xs text-blue-700 font-medium mt-1">Make sure their average grade is good enough.</p>
                </div>
            </div>

            <div class="bg-red-50 p-5 rounded-3xl border border-red-100 mb-5">
                <label class="text-xs font-bold text-[#b91c1c] block mb-2">Candidate's manifesto</label>
                <p class="text-slate-700 text-sm italic leading-relaxed font-medium break-words">"${app.manifesto || 'No manifesto recorded.'}"</p>
            </div>
            
            <div class="space-y-3">
                <button id="swal-dean-approve" class="w-full p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 hover:bg-emerald-600 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 group">
                    <span class="text-sm font-bold text-left">Approve this candidate<br/><small class="opacity-60 font-normal">Grades are good enough</small></span>
                    <svg class="shrink-0 group-hover:scale-125 transition-transform" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </button>

                <button id="swal-dean-reject" class="w-full p-4 border-2 border-rose-100 text-rose-600 rounded-2xl flex items-center justify-between gap-3 hover:bg-rose-600 hover:text-white hover:-translate-y-0.5 active:scale-[0.98] transition-all group">
                    <span class="text-sm font-bold text-left">Reject this candidate<br/><small class="opacity-60 font-normal">Grades are not good enough</small></span>
                    <svg class="shrink-0 group-hover:scale-125 transition-transform" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </button>
            </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Close',
      width: 'min(92vw, 30rem)',
      customClass: { popup: 'rounded-[2rem]', cancelButton: 'rounded-xl text-sm font-bold px-8 py-3' },
      didOpen: () => {
        document.getElementById('swal-dean-approve')?.addEventListener('click', () => confirmAction(app, 'school_dean', 'APPROVED'));
        document.getElementById('swal-dean-reject')?.addEventListener('click', () => confirmAction(app, 'school_dean', 'REJECTED'));
      }
    });
  };

  const confirmAction = async (app: any, role: string, status: 'APPROVED' | 'REJECTED') => {
    const { value: comment, isConfirmed } = await MySwal.fire({
      title: `<b class="text-slate-800 text-lg">${status === 'APPROVED' ? 'Approve' : 'Reject'} this candidate</b>`,
      input: 'textarea',
      inputPlaceholder: 'Write your comment here...',
      inputValue: status === 'APPROVED' 
        ? "Academic standing verified. Candidate has reached the required Grade Threshold for leadership." 
        : "Application rejected. Candidate has not met the minimum academic requirements.",
      showCancelButton: true,
      confirmButtonText: status === 'APPROVED' ? 'Yes, approve' : 'Yes, reject',
      confirmButtonColor: status === 'APPROVED' ? '#10b981' : '#b91c1c',
      cancelButtonText: 'Cancel',
      width: 'min(92vw, 30rem)',
      customClass: { 
        popup: 'rounded-[2rem]', 
        input: 'rounded-2xl text-sm border-slate-100 bg-slate-50',
        confirmButton: 'rounded-xl text-sm font-bold px-6 py-3',
        cancelButton: 'rounded-xl text-sm font-bold px-6 py-3'
      },
    });

    if (isConfirmed) {
      try {
        await updateStatus({
          applicationId: app.id || app._id, 
          approverRole: role as any,
          approverId: getAdminId(),
          status,
          comment: comment || ""
        }).unwrap();
        
        // Final Success Confirmation
        await MySwal.fire({
            icon: status === 'APPROVED' ? 'success' : 'error',
            title: `<span class="text-xs font-semibold ${status === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}">Saved</span>`,
            html: `<b class="text-slate-800 text-lg">Candidate ${status === 'APPROVED' ? 'approved' : 'rejected'}</b>`,
            showConfirmButton: false,
            timer: 2000,
            customClass: { popup: 'rounded-[2rem]' }
        });

        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || "Could not save. Please try again.");
      }
    }
  };

  const handleDeleteRecord = async (app: any) => {
    if (checkHasVotes(app)) return toast.error("Can't delete. This candidate already has votes.");
    const res = await MySwal.fire({
        title: "Delete this application?",
        text: "This will remove the candidate for good.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
        width: 'min(92vw, 28rem)',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl text-sm font-bold px-8 py-3', cancelButton: 'rounded-xl text-sm font-bold px-8 py-3' }
      });
  
      if (res.isConfirmed) {
        try {
          await deleteApplication(app.id || app._id).unwrap();
          toast.success("Application deleted.");
          refetch();
        } catch (err: any) {
          toast.error("Could not delete. Please try again.");
        }
      }
  };

  const finalFilteredApps = schoolFilteredApps?.filter((app: any) => {
    const dbStatus = (app?.overall_status || 'PENDING').toUpperCase();
    const matchesStatus = filter === 'ALL' || dbStatus === filter.toUpperCase();
    const matchesElection = selectedElectionId === 'ALL' || app.election_id === selectedElectionId;
    const matchesPosition = selectedPosition === 'ALL' || app.position_id === selectedPosition;
    const matchesSearch = searchTerm === '' || app.manifesto?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesElection && matchesPosition && matchesSearch;
  });

  if (isLoading || isLoadingElections) return (
    <div className="ca-root min-h-screen bg-gradient-to-b from-slate-50 via-white to-red-50/30 px-4 py-8 sm:px-8">
      <style>{animations}</style>
      <div className="mx-auto max-w-7xl">
        <div className="ca-skeleton mb-3 h-7 w-40 rounded-lg"></div>
        <div className="ca-skeleton mb-10 h-10 w-72 max-w-full rounded-lg"></div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {[0, 1, 2].map(n => (
            <div key={n} className="space-y-4 rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8">
              <div className="ca-skeleton h-12 w-12 rounded-2xl"></div>
              <div className="ca-skeleton h-5 w-2/3 rounded-md"></div>
              <div className="ca-skeleton h-3 w-1/3 rounded-md"></div>
              <div className="ca-skeleton h-12 w-full rounded-xl"></div>
            </div>
          ))}
        </div>
        <p className="mt-8 animate-pulse text-center text-sm font-medium text-slate-400">Loading applications...</p>
      </div>
    </div>
  );

  return (
    <div className="ca-root relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/30 px-4 py-6 font-sans sm:px-6 sm:py-8 lg:p-10">
      <style>{animations}</style>

      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="ca-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-200/30 blur-3xl sm:h-96 sm:w-96"></div>
        <div className="ca-float-slow absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl sm:h-80 sm:w-80"></div>
      </div>

      <div className="relative mx-auto mb-8 max-w-7xl sm:mb-10">
        
        {/* Header Section */}
        <div className="ca-rise mb-6 flex flex-col justify-between gap-5 sm:mb-8 md:flex-row md:items-end md:gap-6">
            <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-red-900 bg-red-800 px-3 py-1 text-white shadow-md shadow-red-800/25">
                    <FaGraduationCap className="ca-wiggle text-xs" />
                    <span className="text-xs font-bold">School of {deanSchool}</span>
                </div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">Candidate <span className="text-red-700">approvals</span></h1>
                <p className="mt-2 text-sm font-medium text-slate-500">Dean in charge: {deanName}</p>
            </div>

            <div className="flex w-full items-center gap-3 md:w-auto">
              <div className="relative min-w-0 flex-1 md:flex-none">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search candidates"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 hover:shadow-md focus:border-red-700 focus:ring-4 focus:ring-red-100 sm:text-sm md:w-72"
                />
              </div>
              <button
                onClick={() => refetch()}
                aria-label="Refresh list"
                className="flex min-h-[52px] min-w-[52px] shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-slate-400 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-red-800 hover:shadow-md active:scale-95"
              >
                <FaSync className={isFetching ? 'animate-spin text-red-800' : ''} />
              </button>
            </div>
        </div>

        {/* Global Filter Bar */}
        <div className="ca-rise grid grid-cols-1 gap-4 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/50 sm:rounded-[2.5rem] sm:p-6 lg:grid-cols-3" style={{ animationDelay: '100ms' }}>
            <div>
                <label className="ml-1 text-xs font-semibold text-slate-500">Election</label>
                <select value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)} className={selectBase}>
                  <option value="ALL">All elections</option>
                  {elections.map((election: any) => (
                      <option key={election.id} value={election.id}>{election.name}</option>
                  ))}
                </select>
            </div>
            <div>
                <label className="ml-1 text-xs font-semibold text-slate-500">Position</label>
                <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className={selectBase}>
                  <option value="ALL">All positions</option>
                  {uniquePositions.map((posId: any) => (
                      <PositionOption key={posId} id={posId} />
                  ))}
                </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="mb-1.5 ml-1 text-xs font-semibold text-slate-500">Status</label>
              <div className="ca-hide-scroll -mx-1 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1.5">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`flex min-h-[40px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition-all duration-300 active:scale-95 ${filter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'}`}
                  >
                    {filterLabels[s]}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${filter === s ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>{statusCounts[s]}</span>
                  </button>
                  ))}
              </div>
            </div>
        </div>
      </div>

      {/* Grid of Applications */}
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {finalFilteredApps && finalFilteredApps.length > 0 ? (
          finalFilteredApps.map((app: any, i: number) => {
            const hasVotes = checkHasVotes(app);
            const statusKey = (app.overall_status || 'PENDING').toUpperCase();
            const status = statusStyles[statusKey] || statusStyles.PENDING;
            return (
              <div
                key={app.id || app._id}
                className={`ca-rise group relative flex flex-col overflow-hidden rounded-[2rem] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8 ${hasVotes ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100 bg-white hover:border-red-200'}`}
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                 {/* Coloured strip along the top shows the status */}
                 <span className={`absolute inset-x-0 top-0 h-1.5 ${hasVotes ? 'bg-amber-400' : status.bar}`}></span>

                 <div className="mb-5 flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-all duration-300 group-hover:scale-110 ${hasVotes ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-red-700 group-hover:text-white'}`}>
                      {hasVotes ? <FaLock size={20} /> : <FaUserShield size={20} />}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot} ${statusKey === 'PENDING' ? 'animate-pulse' : ''}`}></span>
                        {status.label}
                      </span>
                      {hasVotes && <span className="animate-pulse text-right text-[11px] font-semibold leading-tight text-amber-600">Votes counted,<br/>changes locked</span>}
                    </div>
                 </div>
                 
                 <CandidateName id={app.student_id} />
                 <PositionName id={app.position_id} />
                 
                 <p className="mt-4 flex-grow border-l-2 border-red-100 py-1 pl-4 text-sm italic leading-relaxed text-slate-500 line-clamp-3 break-words">
                   "{app.manifesto || 'No manifesto provided.'}"
                 </p>

                 <div className="mt-6 flex gap-3 sm:mt-8">
                    <button 
                      onClick={() => handleReviewApp(app)} 
                      disabled={hasVotes}
                      className={`min-h-[48px] flex-1 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 ${hasVotes ? 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none' : 'bg-slate-900 text-white shadow-slate-900/20 hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-red-800/25'}`}
                    >
                      {hasVotes ? 'Locked' : 'Review application'}
                    </button>
                    <button 
                      onClick={() => handleDeleteRecord(app)} 
                      disabled={hasVotes}
                      aria-label="Delete application"
                      className={`flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl p-4 shadow-sm transition-all duration-200 active:scale-95 ${hasVotes ? 'cursor-not-allowed bg-slate-100 text-slate-300' : 'bg-red-50 text-red-700 hover:-translate-y-0.5 hover:bg-red-700 hover:text-white'}`}
                    >
                      <FaTrash size={13} />
                    </button>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="ca-fade col-span-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-white py-16 text-center sm:rounded-[3rem] sm:py-24">
            <MdBallot className="ca-bob mx-auto mb-4 text-slate-200" size={50} />
            <p className="px-4 text-sm font-semibold text-slate-400">No applications found for {deanSchool}.</p>
            <p className="mt-1 px-4 text-xs text-slate-300">Try changing the search or the filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- Data Wrappers --- */
const CandidateName = ({ id }: any) => {
    const { data } = useGetUserByIdQuery(id);
    const user = data?.data || data?.user || data;
    return user?.name
      ? <h2 className="truncate text-xl font-extrabold leading-tight tracking-tight text-slate-900">{user.name}</h2>
      : <div className="ca-skeleton h-6 w-2/3 rounded-md" aria-label="Loading name"></div>;
};

const PositionName = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return pos?.name
      ? <p className="mt-1.5 text-sm font-bold text-red-700">{pos.name}</p>
      : <div className="ca-skeleton mt-2 h-4 w-1/3 rounded-md" aria-label="Loading position"></div>;
};

const PositionOption = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <option value={id}>{pos?.name || "Loading..."}</option>;
};

export default CandidateApplicationSchoolDeans;