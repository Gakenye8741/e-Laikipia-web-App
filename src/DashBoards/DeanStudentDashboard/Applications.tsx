import React, { useState, useMemo } from 'react'; 
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
import { FaSearch, FaSync, FaTrash, FaCheckCircle, FaTimesCircle, FaUserShield, FaGraduationCap, FaLock, FaFingerprint } from 'react-icons/fa';
import { MdBallot } from 'react-icons/md';

const MySwal = withReactContent(Swal);

const CandidateApplicationDeansDashBoard = () => {
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
  const [selectedSchool, setSelectedSchool] = useState('ALL');
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

  // --- Helpers ---
  const elections = useMemo(() => {
    if (!electionsData) return [];
    const data = (electionsData as any)?.elections || (electionsData as any)?.data || electionsData;
    return Array.isArray(data) ? data : [];
  }, [electionsData]);

  const uniqueSchools = useMemo(() => {
    if (!applications) return [];
    const schools = applications.map((app: any) => app.school).filter(Boolean);
    return Array.from(new Set(schools));
  }, [applications]);

  const uniquePositions = useMemo(() => {
    if (!applications) return [];
    const positions = applications.map((app: any) => app.position_id).filter(Boolean);
    return Array.from(new Set(positions));
  }, [applications]);

  const getAdminId = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      return user.id || user._id;
    }
    return null;
  };

  /* ================= DEAN OF STUDENTS DISCIPLINARY REVIEW ================= */
  const handleReviewApp = async (app: any) => {
    if (checkHasVotes(app)) {
      return toast.error("ACCESS DENIED: Candidate has active votes. Registry is locked.");
    }

    await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Integrity & Disciplinary Review</span><br/><b class="text-slate-800 tracking-tighter italic uppercase text-xl">Dean of Students Portal</b>`,
      html: `
        <div class="text-left font-sans p-2">
            <div class="bg-red-50 p-6 rounded-[2rem] border border-red-100 mb-6">
                <label class="text-[9px] font-black text-[#b91c1c] uppercase tracking-widest block mb-1">Aspirant ID: ${app.reg_no || 'N/A'}</label>
                <p class="text-slate-700 text-xs font-semibold leading-relaxed">Verify disciplinary records and adherence to the university code of conduct before clearance.</p>
            </div>
            
            <div class="space-y-3">
                <button id="swal-dean-approve" class="w-full p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 group">
                    <span class="text-[11px] font-black uppercase tracking-widest">Approve - Clear Record</span>
                    <i class="fas fa-check-circle group-hover:scale-125 transition-transform"></i>
                </button>

                <button id="swal-dean-reject" class="w-full p-5 border-2 border-rose-100 text-rose-600 rounded-2xl flex items-center justify-between hover:bg-rose-600 hover:text-white transition-all group">
                    <span class="text-[11px] font-black uppercase tracking-widest">Reject - Disciplinary Issue</span>
                    <i class="fas fa-times-circle group-hover:scale-125 transition-transform"></i>
                </button>
            </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'CLOSE PORTAL',
      customClass: { popup: 'rounded-[2.5rem]', cancelButton: 'rounded-xl text-[10px] font-black tracking-widest px-8 py-4' },
      didOpen: () => {
        document.getElementById('swal-dean-approve')?.addEventListener('click', () => {
            MySwal.close();
            confirmAction(app, 'APPROVED');
        });
        document.getElementById('swal-dean-reject')?.addEventListener('click', () => {
            MySwal.close();
            confirmAction(app, 'REJECTED');
        });
      }
    });
  };

  const confirmAction = async (app: any, status: 'APPROVED' | 'REJECTED') => {
    const { value: comment, isConfirmed } = await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Dean's Decision</span><br/><b class="text-slate-800 uppercase italic text-lg">${status} ASPIRANT</b>`,
      input: 'textarea',
      inputPlaceholder: 'Enter official disciplinary remarks...',
      inputValue: status === 'APPROVED' 
        ? "Discipline wise great....Approved" 
        : "Candidate rejected due to disciplinary misconduct or integrity concerns.",
      showCancelButton: true,
      confirmButtonText: 'EXECUTE DECISION',
      confirmButtonColor: status === 'APPROVED' ? '#10b981' : '#b91c1c',
      cancelButtonText: 'CANCEL',
      customClass: { 
        popup: 'rounded-[2.5rem]', 
        input: 'rounded-2xl text-sm font-medium border-slate-100 bg-slate-50 focus:ring-red-800',
        confirmButton: 'rounded-xl text-[10px] font-black px-6 py-4',
        cancelButton: 'rounded-xl text-[10px] font-black px-6 py-4'
      },
      inputValidator: (value) => {
        if (!value) {
          return "Please provide disciplinary remarks for the audit trail.";
        }
      }
    });

    if (isConfirmed) {
      try {
        await updateStatus({
          applicationId: app.id || app._id, 
          approverRole: "dean_of_students", 
          approverId: getAdminId(),
          status,
          comment: comment || ""
        }).unwrap();
        
        // Final Success Confirmation
        await MySwal.fire({
            icon: status === 'APPROVED' ? 'success' : 'error',
            title: `<span class="text-[10px] font-black uppercase tracking-[0.2em] ${status === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}">Action Logged</span>`,
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
    if (checkHasVotes(app)) return toast.error("CANNOT DELETE: Live votes exist.");
    const res = await MySwal.fire({
        title: "PURGE RECORD?",
        text: `Permanently remove application for ${app.reg_no}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        confirmButtonText: "YES, DELETE",
        customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black px-8 py-4' }
      });
      if (res.isConfirmed) {
        try {
          await deleteApplication(app.id || app._id).unwrap();
          toast.success("Record purged.");
          refetch();
        } catch (err: any) { toast.error("Delete Failed."); }
      }
  };

  const filteredApps = applications?.filter((app: any) => {
    const dbStatus = (app?.overall_status || 'PENDING').toUpperCase();
    const matchesStatus = filter === 'ALL' || dbStatus === filter.toUpperCase();
    const matchesElection = selectedElectionId === 'ALL' || app.election_id === selectedElectionId;
    const matchesSchool = selectedSchool === 'ALL' || app.school === selectedSchool;
    const matchesPosition = selectedPosition === 'ALL' || app.position_id === selectedPosition;
    const matchesSearch = searchTerm === '' || 
                         app.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.manifesto?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesElection && matchesSchool && matchesPosition && matchesSearch;
  });

  if (isLoading || isLoadingElections) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="h-12 w-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Opening Dean's Ledger...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto mb-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full mb-3 border border-red-200">
                    <FaGraduationCap className="text-red-800 text-xs" />
                    <span className="text-[9px] font-black text-red-800 uppercase tracking-widest">Office of the Dean of Students</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Aspirant <span className="text-red-700">Clearance</span></h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="SEARCH REG NO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-2 border-transparent focus:border-red-800 text-slate-900 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-2xl shadow-sm outline-none w-64 transition-all"
                />
                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
              <button onClick={() => refetch()} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-800 transition-all shadow-sm">
                <FaSync className={isFetching ? 'animate-spin text-red-800' : ''} />
              </button>
            </div>
        </div>

        {/* Global Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Election Cycle</label>
                <select value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)} className="w-full bg-slate-50 text-[10px] font-black uppercase py-3.5 px-4 rounded-xl outline-none mt-1">
                  <option value="ALL">All Active Races</option>
                  {elections.map((election: any) => (<option key={election.id} value={election.id}>{election.name}</option>))}
                </select>
            </div>
            <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Unit</label>
                <select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} className="w-full bg-slate-50 text-[10px] font-black uppercase py-3.5 px-4 rounded-xl outline-none mt-1">
                  <option value="ALL">All Schools</option>
                  {uniqueSchools.map((school: any) => (<option key={school} value={school}>{school.replace(/_/g, ' ')}</option>))}
                </select>
            </div>
            <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Seat</label>
                <select value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className="w-full bg-slate-50 text-[10px] font-black uppercase py-3.5 px-4 rounded-xl outline-none mt-1">
                  <option value="ALL">All Positions</option>
                  {uniquePositions.map((posId: any) => (<PositionOption key={posId} id={posId} />))}
                </select>
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`flex-1 py-2 text-[8px] font-black rounded-lg transition-all ${filter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{s}</button>
                  ))}
              </div>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredApps && filteredApps.length > 0 ? (
          filteredApps.map((app: any) => {
            const hasVotes = checkHasVotes(app);
            return (
              <div key={app.id || app._id} className={`bg-white rounded-[2.5rem] border p-8 hover:shadow-2xl transition-all flex flex-col border-b-4 ${hasVotes ? 'border-amber-400 bg-amber-50/20' : 'border-slate-100 hover:border-b-red-700'}`}>
                 <div className="flex justify-between items-start mb-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${hasVotes ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-red-700 group-hover:text-white'}`}>
                      {hasVotes ? <FaLock size={20} /> : <FaUserShield size={20} />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${app.overall_status === 'APPROVED' ? 'text-emerald-500' : app.overall_status === 'REJECTED' ? 'text-red-500' : 'text-amber-500'}`}>{app.overall_status || 'PENDING'}</span>
                      {hasVotes && <span className="text-[7px] font-black text-amber-600 mt-1 animate-pulse uppercase">Live Voting</span>}
                    </div>
                 </div>
                 
                 <CandidateName id={app.student_id} />
                 <PositionName id={app.position_id} />
                 
                 <div className="mt-4 border-l-2 border-red-100 pl-4 py-1 flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                        <FaFingerprint className="text-red-800/30" size={12} />
                        <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest">{app.reg_no || 'NO REG NO'}</p>
                    </div>
                    <p className="text-slate-400 text-[11px] italic line-clamp-2 leading-relaxed">"{app.manifesto || 'No manifesto recorded.'}"</p>
                 </div>

                 <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => handleReviewApp(app)} 
                      disabled={hasVotes}
                      className={`flex-1 py-4 text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] transition-all shadow-lg ${hasVotes ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-red-800'}`}
                    >
                      {hasVotes ? 'Audit Locked' : 'Conduct Review'}
                    </button>
                    <button onClick={() => handleDeleteRecord(app)} disabled={hasVotes} className="p-4 rounded-2xl bg-red-50 text-red-700 hover:bg-red-700 hover:text-white transition-all">
                        <FaTrash size={12} />
                    </button>
                 </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <MdBallot className="mx-auto text-slate-200 mb-4" size={50} />
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No clearance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CandidateName = ({ id }: any) => {
    const { data } = useGetUserByIdQuery(id);
    const user = data?.data || data?.user || data;
    return <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter truncate leading-tight">{user?.name || "..."}</h2>;
};

const PositionName = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em] mt-1.5 opacity-80">{pos?.name || "..."}</p>;
};

const PositionOption = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <option value={id}>{pos?.name || "..."}</option>;
};

export default CandidateApplicationDeansDashBoard;