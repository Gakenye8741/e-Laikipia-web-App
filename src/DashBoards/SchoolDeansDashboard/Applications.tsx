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

  /* ================= ACADEMIC & GRADE REVIEW LOGIC ================= */
  const handleReviewApp = async (app: any) => {
    if (checkHasVotes(app)) {
      return toast.error("ACCESS DENIED: Candidate has active votes. Registry is locked.");
    }

    await MySwal.fire({
      title: `
        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Academic Standing & Clearance</span><br/>
        <b class="text-slate-800 tracking-tighter italic uppercase text-xl">Review Portal: ${deanSchool}</b>
      `,
      html: `
        <div class="text-left font-sans p-2">
            <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4 flex items-center gap-3">
                <div class="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FaChartLine />
                </div>
                <div>
                    <p class="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-none">Grade Verification</p>
                    <p class="text-[9px] text-blue-700 font-bold uppercase mt-1">Cross-referencing ERP for Mean Grade & Standing...</p>
                </div>
            </div>

            <div class="bg-red-50 p-6 rounded-[2rem] border border-red-100 mb-6">
                <label class="text-[9px] font-black text-[#b91c1c] uppercase tracking-widest block mb-2 underline">Candidate's Manifesto</label>
                <p class="text-slate-700 text-xs italic leading-relaxed font-semibold">"${app.manifesto || 'No manifesto recorded.'}"</p>
            </div>
            
            <div class="space-y-3">
                <button id="swal-dean-approve" class="w-full p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 group">
                    <span class="text-[11px] font-black uppercase tracking-widest text-left">Confirm Academic Standing <br/><small class="opacity-50 font-normal">Grade Threshold Reached</small></span>
                    <FaCheckCircle className="group-hover:scale-125 transition-transform" />
                </button>

                <button id="swal-dean-reject" class="w-full p-5 border-2 border-rose-100 text-rose-600 rounded-2xl flex items-center justify-between hover:bg-rose-600 hover:text-white transition-all group">
                    <span class="text-[11px] font-black uppercase tracking-widest text-left">Reject Application <br/><small class="opacity-50 font-normal">Failed Academic Criteria</small></span>
                    <FaTimesCircle className="group-hover:scale-125 transition-transform" />
                </button>
            </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'CLOSE REGISTRY',
      customClass: { popup: 'rounded-[2.5rem]', cancelButton: 'rounded-xl text-[10px] font-black tracking-widest px-8 py-4' },
      didOpen: () => {
        document.getElementById('swal-dean-approve')?.addEventListener('click', () => confirmAction(app, 'school_dean', 'APPROVED'));
        document.getElementById('swal-dean-reject')?.addEventListener('click', () => confirmAction(app, 'school_dean', 'REJECTED'));
      }
    });
  };

  const confirmAction = async (app: any, role: string, status: 'APPROVED' | 'REJECTED') => {
    const { value: comment, isConfirmed } = await MySwal.fire({
      title: `<b class="text-slate-800 uppercase italic text-lg">${status} ASPIRANT</b>`,
      input: 'textarea',
      inputPlaceholder: 'Dean\'s official remarks...',
      inputValue: status === 'APPROVED' 
        ? "Academic standing verified. Candidate has reached the required Grade Threshold for leadership." 
        : "Application rejected. Candidate has not met the minimum academic requirements.",
      showCancelButton: true,
      confirmButtonText: 'EXECUTE DECISION',
      confirmButtonColor: status === 'APPROVED' ? '#10b981' : '#b91c1c',
      cancelButtonText: 'CANCEL',
      customClass: { 
        popup: 'rounded-[2.5rem]', 
        input: 'rounded-2xl text-sm border-slate-100 bg-slate-50',
        confirmButton: 'rounded-xl text-[10px] font-black px-6 py-4',
        cancelButton: 'rounded-xl text-[10px] font-black px-6 py-4'
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
            title: `<span class="text-[10px] font-black uppercase tracking-[0.2em] ${status === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}">System Updated</span>`,
            html: `<b class="text-slate-800 uppercase italic text-lg">CANDIDATE ${status}</b>`,
            showConfirmButton: false,
            timer: 2000,
            customClass: { popup: 'rounded-[2.5rem]' }
        });

        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || "Action Blocked.");
      }
    }
  };

  const handleDeleteRecord = async (app: any) => {
    if (checkHasVotes(app)) return toast.error("PURGE BLOCKED: Candidate has live votes.");
    const res = await MySwal.fire({
        title: "PURGE DATA?",
        text: "Remove this aspirant from the registry permanently?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        confirmButtonText: "YES, PURGE",
        customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black px-8 py-4' }
      });
  
      if (res.isConfirmed) {
        try {
          await deleteApplication(app.id || app._id).unwrap();
          toast.success("Application scrubbed.");
          refetch();
        } catch (err: any) {
          toast.error("Purge Failed.");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="h-12 w-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validating School Ledger...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto mb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-800 text-white rounded-lg mb-3 border border-red-900 shadow-md">
                    <FaGraduationCap className="text-xs" />
                    <span className="text-[9px] font-black uppercase tracking-widest">School of {deanSchool}</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Aspirant <span className="text-red-700">Clearance</span></h1>
                <p className="text-xs font-bold text-slate-500 mt-2">Dean in Charge: {deanName}</p>
            </div>

            <div className="flex items-center gap-4">
              <input 
                type="text"
                placeholder="SEARCH ASPIRANTS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-2 border-transparent focus:border-red-800 text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl shadow-sm outline-none w-64 transition-all"
              />
              <button onClick={() => refetch()} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-800 transition-all shadow-sm">
                <FaSync className={isFetching ? 'animate-spin text-red-800' : ''} />
              </button>
            </div>
        </div>

        {/* Global Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Election Cycle</label>
                <select value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)} className="w-full bg-slate-50 border-none text-[10px] font-black uppercase py-3.5 px-4 rounded-xl outline-none mt-1 cursor-pointer">
                  <option value="ALL">All Active Races</option>
                  {elections.map((election: any) => (
                      <option key={election.id} value={election.id}>{election.name}</option>
                  ))}
                </select>
            </div>
            <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Seat</label>
                <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="w-full bg-slate-50 border-none text-[10px] font-black uppercase py-3.5 px-4 rounded-xl outline-none mt-1 cursor-pointer">
                  <option value="ALL">All Positions</option>
                  {uniquePositions.map((posId: any) => (
                      <PositionOption key={posId} id={posId} />
                  ))}
                </select>
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`flex-1 py-2 text-[8px] font-black rounded-lg transition-all ${filter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{s}</button>
                  ))}
              </div>
            </div>
        </div>
      </div>

      {/* Grid of Applications */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {finalFilteredApps && finalFilteredApps.length > 0 ? (
          finalFilteredApps.map((app: any) => {
            const hasVotes = checkHasVotes(app);
            return (
              <div key={app.id || app._id} className={`bg-white rounded-[2.5rem] border p-8 hover:shadow-2xl transition-all group flex flex-col border-b-4 border-b-transparent ${hasVotes ? 'border-amber-400 bg-amber-50/20' : 'border-slate-100 hover:border-b-red-700'}`}>
                 <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-inner ${hasVotes ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-red-700 group-hover:text-white'}`}>
                      {hasVotes ? <FaLock size={20} /> : <FaUserShield size={20} />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${app.overall_status === 'APPROVED' ? 'text-emerald-500' : app.overall_status === 'REJECTED' ? 'text-red-500' : 'text-amber-500'}`}>{app.overall_status || 'PENDING'}</span>
                      {hasVotes && <span className="text-[7px] font-black text-amber-600 mt-1 animate-pulse uppercase tracking-widest leading-none text-right">Live Votes<br/>Locked</span>}
                    </div>
                 </div>
                 
                 <CandidateName id={app.student_id} />
                 <PositionName id={app.position_id} />
                 
                 <p className="mt-4 text-slate-500 text-[11px] italic line-clamp-2 leading-relaxed flex-grow border-l-2 border-red-100 pl-4 py-1">
                   "{app.manifesto || 'No manifesto provided.'}"
                 </p>

                 <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => handleReviewApp(app)} 
                      disabled={hasVotes}
                      className={`flex-1 py-4 text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${hasVotes ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-red-800'}`}
                    >
                      {hasVotes ? 'Audit Locked' : 'Clearance Portal'}
                    </button>
                    <button 
                      onClick={() => handleDeleteRecord(app)} 
                      disabled={hasVotes}
                      className={`p-4 rounded-2xl transition-all shadow-sm ${hasVotes ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-red-50 text-red-700 hover:bg-red-700 hover:text-white'}`}
                    >
                      <FaTrash size={12} />
                    </button>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <MdBallot className="mx-auto text-slate-200 mb-4" size={50} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No clearance requests found for {deanSchool}.</p>
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
    return <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate leading-tight">{user?.name || "Initializing..."}</h2>;
};

const PositionName = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mt-1.5 opacity-80">{pos?.name || "Loading Registry..."}</p>;
};

const PositionOption = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <option value={id}>{pos?.name || "Loading..."}</option>;
};

export default CandidateApplicationSchoolDeans;