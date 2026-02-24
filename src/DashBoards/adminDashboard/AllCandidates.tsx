import { useState, useMemo } from "react";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetAllPositionsQuery } from "../../features/APIS/Position.APi";
import {
  useGetCandidatesByElectionQuery,
  useDisqualifyCandidateMutation,
  useDeleteCandidateMutation,
} from "../../features/APIS/CandidateApi";
import { useGetApplicationByIdQuery } from "../../features/APIS/Applcation.Api"; 
import { PuffLoader } from "react-spinners";
import { FaSearch, FaSync, FaTrash, FaEye, FaUserSlash, FaVoteYea, FaFileAlt, FaUniversity } from 'react-icons/fa';
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const AdminCandidateManager = () => {
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- API Hooks ---
  const { data: electionsData, isLoading: loadingElections, refetch: refetchElections } = useGetAllElectionsQuery();
  const { data: positionsData } = useGetAllPositionsQuery();
  const { 
    data: candidatesData, 
    isFetching: isFetchingCandidates, 
    refetch: refetchCandidates 
  } = useGetCandidatesByElectionQuery(selectedElection, {
    skip: !selectedElection,
    refetchOnMountOrArgChange: true, 
  });

  const [disqualifyCandidate] = useDisqualifyCandidateMutation();
  const [deleteCandidate] = useDeleteCandidateMutation();

  // --- Data Normalization ---
  const elections = (electionsData as any)?.elections || (Array.isArray(electionsData) ? electionsData : []);
  const positions = (positionsData as any)?.positions || (Array.isArray(positionsData) ? positionsData : []);
  const candidates = (candidatesData as any)?.candidates || (Array.isArray(candidatesData) ? candidatesData : []);

  /* ================= REIMAGINED MODAL HANDLERS ================= */
  
  const handleViewCandidate = async (cand: any) => {
    // Priority: Nested Application Data > Candidate Top Level
    const app = cand.application || {};
    const candidateName = app.name || cand.name || "Unknown Candidate";
    const displayManifesto = app.manifesto || cand.manifesto || "No manifesto found in application registry.";
    const displaySchool = app.school?.replace(/_/g, ' ') || "General Science";
    const displayAppId = (cand.application_id || cand.id || "0").toString();
    const displayPhoto = app.photo_url || cand.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=f8fafc&color=b91c1c`;

    await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registry Profile</span><br/><b class="text-slate-800 tracking-tighter italic uppercase text-xl">Official Verification</b>`,
      html: `
        <div class="text-left font-sans p-2">
            <div class="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                <div class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 font-black text-xl overflow-hidden border-2 border-white shadow-sm">
                    <img src="${displayPhoto}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}'" />
                </div>
                <div>
                    <h4 class="font-black text-slate-800 uppercase tracking-tighter leading-none text-lg">${candidateName}</h4>
                    <p class="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1">${displaySchool}</p>
                </div>
            </div>

            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 mb-6 shadow-sm">
                <label class="text-[9px] font-black text-[#b91c1c] uppercase tracking-widest block mb-2">Validated Application Manifesto</label>
                <div class="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    <p class="text-slate-600 text-xs italic leading-relaxed whitespace-pre-wrap font-medium">"${displayManifesto}"</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span class="block text-[8px] font-black text-slate-400 uppercase mb-1">Application ID</span>
                    <span class="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">#${displayAppId.slice(-10)}</span>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span class="block text-[8px] font-black text-slate-400 uppercase mb-1">Registry Status</span>
                    <div class="flex items-center gap-1">
                        <span class="text-[10px] font-bold text-emerald-600 uppercase italic">APPROVED CANDIDATE</span>
                    </div>
                </div>
            </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'CLOSE PROFILE',
      confirmButtonColor: '#0f172a',
      customClass: { 
        popup: 'rounded-[2.5rem]', 
        confirmButton: 'rounded-xl text-[10px] font-black tracking-widest px-8 py-4 uppercase' 
      },
    });
  };

  const handleDisqualify = async (id: string, name: string) => {
    const { value: reason, isConfirmed } = await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Action</span><br/><b class="text-red-700 uppercase italic text-lg">Disqualify Candidate</b>`,
      text: `Removing ${name} from the active ballot.`,
      input: 'textarea',
      inputPlaceholder: 'Enter reason for disqualification...',
      showCancelButton: true,
      confirmButtonText: 'CONFIRM DISQUALIFICATION',
      confirmButtonColor: '#b91c1c',
      cancelButtonText: 'CANCEL',
      customClass: { 
        popup: 'rounded-[2.5rem]', 
        input: 'rounded-2xl text-sm font-medium border-slate-100 bg-slate-50 focus:ring-[#b91c1c]',
        confirmButton: 'rounded-xl text-[10px] font-black tracking-widest px-6 py-4',
        cancelButton: 'rounded-xl text-[10px] font-black tracking-widest px-6 py-4'
      },
    });

    if (isConfirmed) {
      try {
        await disqualifyCandidate(id).unwrap();
        toast.error(`${name} Disqualified`);
        refetchCandidates();
      } catch (err) {
        toast.error("Disqualification failed.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await MySwal.fire({
        title: "PURGE CANDIDATE?",
        text: "This will remove the candidate record entirely.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        confirmButtonText: "YES, PURGE",
        customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black px-8 py-4', cancelButton: 'rounded-xl text-[10px] font-black px-8 py-4' }
      });
  
      if (res.isConfirmed) {
        await deleteCandidate(id).unwrap();
        toast.success("Candidate Purged");
        refetchCandidates();
      }
  };

  if (loadingElections) return (
    <div className="h-screen flex flex-col justify-center items-center bg-[#F8FAFC]">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Command Center...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
                    <span className={`h-2 w-2 rounded-full ${isFetchingCandidates ? 'bg-red-600 animate-ping' : 'bg-red-600'}`}></span>
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Live Ballot Management</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Candidate <span className="text-red-700">Registry</span></h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="FILTER BALLOT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-2 border-transparent focus:border-[#b91c1c] text-slate-900 text-[11px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-sm outline-none w-64 transition-all"
                />
                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
              <button onClick={() => { refetchElections(); refetchCandidates(); }} disabled={isFetchingCandidates} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#b91c1c] transition-all shadow-sm">
                <FaSync className={`${isFetchingCandidates ? 'animate-spin text-[#b91c1c]' : ''}`} />
              </button>
            </div>
        </div>

        <div className="bg-white shadow-xl shadow-slate-200/50 p-5 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row items-center gap-4">
            <div className="flex-grow w-full">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-2 tracking-widest">Active Election Cycle</label>
                <select 
                    className="w-full bg-slate-50 border-none text-slate-900 text-[11px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl focus:ring-2 focus:ring-[#b91c1c] outline-none cursor-pointer"
                    value={selectedElection}
                    onChange={(e) => setSelectedElection(e.target.value)}
                >
                    <option value="">Select an Election race to Manage</option>
                    {elections.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name || e.title}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {!selectedElection ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                <FaVoteYea className="text-slate-200" size={40} />
            </div>
            <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Select an election cycle to unlock the registry</p>
          </div>
        ) : (
          <div className="space-y-16">
            {positions
              .filter((p: any) => p.election_id === selectedElection)
              .map((pos: any) => {
                const candidatesInPos = candidates.filter((c: any) => 
                    c.position_id === pos.id && 
                    (searchTerm === "" || c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                
                return (
                  <section key={pos.id} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border-l-[6px] border-l-[#b91c1c] border border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                          {pos.name} <span className="text-red-700 ml-2 italic text-[10px]">({candidatesInPos.length} Registered)</span>
                        </h2>
                      </div>
                      <div className="h-[1px] flex-grow bg-slate-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {candidatesInPos.length > 0 ? (
                        candidatesInPos.map((cand: any) => (
                          <CandidateCard 
                            key={cand.id} 
                            cand={cand} 
                            onView={() => handleViewCandidate(cand)}
                            onDisqualify={() => handleDisqualify(cand.id, cand.name)}
                            onDelete={() => handleDelete(cand.id)}
                          />
                        ))
                      ) : (
                        <div className="col-span-full py-16 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center opacity-60">
                           <FaFileAlt size={40} className="mx-auto text-slate-200 mb-3" />
                           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Ballot is empty for this position</p>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

/* --- ENHANCED CARD COMPONENT: Pulls Fresh Application Data --- */
const CandidateCard = ({ cand, onView, onDisqualify, onDelete }: any) => {
    // We query the application ID specifically to get the real manifesto/photo/name
    const { data } = useGetApplicationByIdQuery(cand.application_id);
    const app = (data as any)?.application || data;

    return (
      <div className="group bg-white rounded-[2.5rem] p-8 border border-slate-200 hover:border-[#b91c1c] hover:shadow-2xl transition-all duration-500 flex flex-col border-l-[6px] border-l-transparent hover:border-l-[#b91c1c]">
        
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-red-50 shadow-inner group-hover:border-red-100 transition-colors">
              <img 
                src={app?.photo_url || cand.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app?.name || cand.name)}`} 
                alt={app?.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div>
              <h3 className="font-black text-slate-900 leading-tight uppercase tracking-tighter italic">{app?.name || cand.name}</h3>
              <p className="text-[9px] text-red-700 font-black uppercase tracking-widest mt-1">
                 {app?.school?.replace(/_/g, ' ') || 'GENERAL SCIENCE'}
              </p>
            </div>
          </div>
          <button 
              onClick={onView}
              className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
              <FaEye size={18} />
          </button>
        </div>

        <div className="px-1 flex-grow mb-6">
          <p className="text-slate-400 text-xs italic leading-relaxed line-clamp-2 border-l-2 border-red-100 pl-4 py-1">
            "{app?.manifesto || cand.manifesto || "Fetching verified application manifesto..."}"
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onDisqualify}
            className="flex-grow py-3.5 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest shadow-lg flex justify-center items-center gap-2"
          >
            <FaUserSlash /> Disqualify
          </button>
          <button 
            onClick={onDelete}
            className="p-4 bg-red-50 text-[#b91c1c] rounded-2xl hover:bg-[#b91c1c] hover:text-white transition-all shadow-sm"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
    );
};

const CandidateSchool = ({ appId }: { appId: string }) => {
    const { data } = useGetApplicationByIdQuery(appId);
    const app = (data as any)?.application || data;
    return (
        <p className="text-[9px] text-red-700 font-black uppercase tracking-widest mt-1">
            {app?.school?.replace(/_/g, ' ') || '.......'}
        </p>
    );
};