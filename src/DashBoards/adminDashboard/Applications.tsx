import React, { useState, useEffect, useMemo } from 'react'; 
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
import { FaSearch, FaSync, FaTrash, FaCheckCircle, FaTimesCircle, FaGavel, FaUniversity, FaWallet, FaUserShield, FaChevronRight } from 'react-icons/fa';
import { MdBallot } from 'react-icons/md';

const MySwal = withReactContent(Swal);

const CandidateApplication = () => {
  // Data Fetching
  const { data: applications, isLoading, refetch, isFetching } = useGetAllApplicationsQuery();
  const { data: electionsData, isLoading: isLoadingElections } = useGetAllElectionsQuery();
  
  // Mutations
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();
  
  // Filtering States
  const [filter, setFilter] = useState('ALL');
  const [selectedElectionId, setSelectedElectionId] = useState('ALL'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // --- ELECTION EXTRACTION ---
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
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
        const authObj = JSON.parse(persistAuth);
        const userObj = JSON.parse(authObj.user);
        return userObj.user?.id || userObj.id;
    }
    return null;
  };

  /* ================= REIMAGINED MODAL HANDLERS (POSITION STYLE) ================= */
  const handleReviewApp = async (app: any) => {
    setSelectedApp(app);
    
    await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Application Review</span><br/><b class="text-slate-800 tracking-tighter italic uppercase text-xl">Governance Portal</b>`,
      html: `
        <div class="text-left font-sans p-2">
            <div class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                <label class="text-[9px] font-black text-[#b91c1c] uppercase tracking-widest block mb-2">Candidate Manifesto</label>
                <p class="text-slate-600 text-xs italic leading-relaxed">"${app.manifesto || 'No manifesto provided for this registry entry.'}"</p>
            </div>
            
            <div class="grid grid-cols-1 gap-3">
                <button id="swal-dean" class="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-red-50 transition-all group">
                    <span class="text-[10px] font-black uppercase text-slate-600 group-hover:text-red-700">01. Academic Dean Approval</span>
                    <i class="fas fa-chevron-right text-slate-300 group-hover:text-red-700"></i>
                </button>
                <button id="swal-accounts" class="w-full p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-red-50 transition-all group">
                    <span class="text-[10px] font-black uppercase text-slate-600 group-hover:text-red-700">02. Finance Verification</span>
                    <i class="fas fa-chevron-right text-slate-300 group-hover:text-red-700"></i>
                </button>
                <button id="swal-admin" class="w-full p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between hover:bg-[#b91c1c] transition-all">
                    <span class="text-[10px] font-black uppercase">Final Admin Sanction</span>
                    <i class="fas fa-check-circle"></i>
                </button>
                <div class="pt-4 border-t border-slate-100 mt-2">
                    <button id="swal-reject" class="w-full p-4 border-2 border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all">Reject Application</button>
                </div>
            </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'CLOSE PORTAL',
      customClass: { popup: 'rounded-[2.5rem]', cancelButton: 'rounded-xl text-[10px] font-black tracking-widest px-8 py-4' },
      didOpen: () => {
        document.getElementById('swal-dean')?.addEventListener('click', () => confirmAction(app, 'school_dean', 'APPROVED'));
        document.getElementById('swal-accounts')?.addEventListener('click', () => confirmAction(app, 'accounts', 'APPROVED'));
        document.getElementById('swal-admin')?.addEventListener('click', () => confirmAction(app, 'admin', 'APPROVED'));
        document.getElementById('swal-reject')?.addEventListener('click', () => confirmAction(app, 'admin', 'REJECTED'));
      }
    });
  };

  const confirmAction = async (app: any, role: string, status: 'APPROVED' | 'REJECTED') => {
    const { value: comment, isConfirmed } = await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Final Validation</span><br/><b class="text-slate-800 uppercase italic text-lg">Confirm ${status}</b>`,
      text: `Acting Authority: ${role.replace('_', ' ').toUpperCase()}`,
      input: 'textarea',
      inputPlaceholder: 'Enter official decision notes...',
      inputValue: status === 'APPROVED' ? "Requirements verified. Approved." : "Criteria not met. Rejected.",
      showCancelButton: true,
      confirmButtonText: status === 'APPROVED' ? 'EXECUTE APPROVAL' : 'EXECUTE REJECTION',
      confirmButtonColor: status === 'APPROVED' ? '#10b981' : '#b91c1c',
      cancelButtonText: 'BACK',
      customClass: { 
        popup: 'rounded-[2.5rem]', 
        input: 'rounded-2xl text-sm font-medium border-slate-100 bg-slate-50 focus:ring-[#b91c1c]',
        confirmButton: 'rounded-xl text-[10px] font-black tracking-widest px-6 py-4',
        cancelButton: 'rounded-xl text-[10px] font-black tracking-widest px-6 py-4'
      },
    });

    if (isConfirmed) {
      try {
        const currentAdminId = getAdminId();
        await updateStatus({
          applicationId: app.id,
          approverRole: role as any,
          approverId: currentAdminId,
          status,
          comment: comment || ""
        }).unwrap();
        
        // Success Confirmation Modal
        await MySwal.fire({
            title: '<span class="text-emerald-500 font-black uppercase tracking-widest text-xs">Registry Synchronized</span>',
            text: `The application has been successfully ${status.toLowerCase()}.`,
            icon: 'success',
            confirmButtonColor: '#0f172a',
            customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl text-[10px] font-black px-8 py-3' }
        });
        
        MySwal.close();
        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || "Sync Failed");
      }
    }
  };

  const handleDeleteRecord = async (id: string) => {
    const res = await MySwal.fire({
        title: "PURGE RECORD?",
        text: "This application will be permanently scrubbed from the Registry.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        confirmButtonText: "YES, PURGE",
        customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black px-8 py-4', cancelButton: 'rounded-xl text-[10px] font-black px-8 py-4' }
      });
  
      if (res.isConfirmed) {
        await deleteApplication(id).unwrap();
        toast.success("Record Purged");
        refetch();
      }
  };

  // --- FILTER LOGIC ---
  const filteredApps = applications?.filter((app: any) => {
    const dbStatus = (app?.overall_status || 'PENDING').toUpperCase();
    const matchesStatus = filter === 'ALL' || dbStatus === filter.toUpperCase();
    const matchesElection = selectedElectionId === 'ALL' || app.election_id === selectedElectionId;
    const matchesSchool = selectedSchool === 'ALL' || app.school === selectedSchool;
    const matchesPosition = selectedPosition === 'ALL' || app.position_id === selectedPosition;
    const matchesSearch = searchTerm === '' || app.manifesto?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesElection && matchesSchool && matchesPosition && matchesSearch;
  });

  if (isLoading || isLoadingElections) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <PuffLoader color="#b91c1c" size={60} />
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Registry...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto mb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
                    <span className={`h-2 w-2 rounded-full ${isFetching ? 'bg-red-600 animate-ping' : 'bg-red-600'}`}></span>
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Candidate Control</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Oversight <span className="text-red-700">Portal</span></h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="SEARCH REGISTRY..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-2 border-transparent focus:border-[#b91c1c] text-slate-900 text-[11px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-sm outline-none w-64 transition-all"
                />
                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>

              <button onClick={() => refetch()} disabled={isFetching} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#b91c1c] transition-all shadow-sm">
                <FaSync className={`${isFetching ? 'animate-spin text-[#b91c1c]' : ''}`} />
              </button>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 bg-white shadow-xl shadow-slate-200/50 p-5 rounded-[2.5rem] border border-slate-200">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-2 tracking-widest">Election Race</label>
                <select 
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  className="w-full bg-slate-50 border-none text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#b91c1c] outline-none cursor-pointer"
                >
                  <option value="ALL">Global Elections</option>
                  {elections.map((election: any) => (
                      <option key={election.id || election._id} value={election.id || election._id}>
                        {election.name || election.title}
                      </option>
                  ))}
                </select>
            </div>

            <div className="flex-1 min-w-[180px]">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-2 tracking-widest">Academic School</label>
                <select 
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full bg-slate-50 border-none text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#b91c1c] outline-none cursor-pointer"
                >
                  <option value="ALL">All Schools</option>
                  {uniqueSchools.map((school: any) => (
                      <option key={school} value={school}>{school.replace(/_/g, ' ')}</option>
                  ))}
                </select>
            </div>

            <div className="flex-1 min-w-[180px]">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-2 tracking-widest">Registry Position</label>
                <select 
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full bg-slate-50 border-none text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#b91c1c] outline-none cursor-pointer"
                >
                  <option value="ALL">All Positions</option>
                  {uniquePositions.map((posId: any) => (
                      <PositionOption key={posId} id={posId} />
                  ))}
                </select>
            </div>

            <div className="flex items-end">
              <div className="flex bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                  <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2.5 rounded-xl text-[9px] font-black transition-all ${filter === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{s}</button>
                  ))}
              </div>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto">
        {filteredApps && filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredApps.map((app: any) => {
              const dbStatus = (app?.overall_status || 'PENDING').toUpperCase();
              return (
                <div key={app.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:border-[#b91c1c] hover:shadow-2xl transition-all duration-500 flex flex-col border-l-[6px] border-l-transparent hover:border-l-[#b91c1c]">
                   <div className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-6">
                          <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200">{app.school?.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase tracking-tighter ${dbStatus === 'APPROVED' ? 'text-emerald-600' : dbStatus === 'REJECTED' ? 'text-red-600' : 'text-amber-500'}`}>{dbStatus}</span>
                              <div className={`h-2 w-2 rounded-full ${dbStatus === 'APPROVED' ? 'bg-emerald-500' : dbStatus === 'REJECTED' ? 'bg-[#b91c1c]' : 'bg-amber-500 animate-pulse'}`}></div>
                          </div>
                      </div>
                      <CandidateName id={app.student_id} />
                      <PositionName id={app.position_id} />
                   </div>
                   <div className="px-8 flex-grow">
                       <p className="text-slate-400 text-xs line-clamp-2 italic border-l-2 border-red-100 pl-4 py-1">"{app.manifesto || 'No manifesto provided.'}"</p>
                   </div>
                   <div className="p-8 flex gap-3">
                      <button onClick={() => handleReviewApp(app)} className="flex-grow py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-[#b91c1c] transition-all uppercase tracking-widest shadow-lg active:scale-95">Review Portal</button>
                      <button onClick={() => handleDeleteRecord(app.id)} className="p-4 bg-red-50 text-[#b91c1c] rounded-2xl hover:bg-[#b91c1c] hover:text-white transition-all shadow-sm"><FaTrash size={12}/></button>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                <MdBallot className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">No registry records found for these parameters</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS (STYLED) ---
const CandidateName = ({ id, size = "small" }: any) => {
    const { data } = useGetUserByIdQuery(id);
    const user = data?.data || data?.user || data;
    return <h2 className={`${size === 'large' ? 'text-4xl' : 'text-xl'} font-black text-slate-900 uppercase tracking-tighter leading-none italic mb-1`}>{user?.name || "..."}</h2>;
};

const PositionName = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <p className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em]">{pos?.name || "Initializing..."}</p>;
};

const PositionOption = ({ id }: any) => {
    const { data } = useGetPositionByIdQuery(id);
    const pos = data?.data || data?.position || data;
    return <option value={id}>{pos?.name || "Loading..."}</option>;
};

const PuffLoader = ({ color, size }: any) => (
    <div style={{ width: size, height: size, border: `4px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-spin"></div>
);

export default CandidateApplication;