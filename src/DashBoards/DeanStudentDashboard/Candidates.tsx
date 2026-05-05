import { useState, useMemo } from "react";
import { useSelector } from "react-redux"; // Added for role checking
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetAllPositionsQuery } from "../../features/APIS/Position.APi";
import {
  useGetCandidatesByElectionQuery,
  useDisqualifyCandidateMutation,
  useDeleteCandidateMutation,
} from "../../features/APIS/CandidateApi";
import { useGetApplicationByIdQuery } from "../../features/APIS/Applcation.Api"; 
import { PuffLoader } from "react-spinners";
import { FaSearch, FaSync, FaTrash, FaEye, FaUserSlash, FaVoteYea, FaFileAlt, FaLock } from 'react-icons/fa';
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { RootState } from "../../App/store";

const MySwal = withReactContent(Swal);

export const CandidateManager = () => {
  /* ================= ROLE MANAGEMENT ================= */
  const user = useSelector((state: RootState) => (state.auth as any)?.user);
  const userRole = user?.role || user?.user?.role; // Adjust based on your API structure
  const isAdmin = userRole === "Admin" || userRole === "SuperAdmin";

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

  /* ================= MODAL HANDLERS ================= */
  
  const handleViewCandidate = async (cand: any) => {
    const app = cand.application || {};
    const candidateName = app.name || cand.name || "Unknown Candidate";
    const displayManifesto = app.manifesto || cand.manifesto || "No manifesto found.";
    const displaySchool = app.school?.replace(/_/g, ' ') || "General Science";
    const displayAppId = (cand.application_id || cand.id || "0").toString();
    const displayPhoto = app.photo_url || cand.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=f8fafc&color=b91c1c`;

    await MySwal.fire({
      title: `<span class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registry Profile</span><br/><b class="text-slate-800 tracking-tighter italic uppercase text-xl">Official Verification</b>`,
      html: `
        <div class="text-left font-sans p-2">
            <div class="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                <div class="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                    <img src="${displayPhoto}" class="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 class="font-black text-slate-800 uppercase tracking-tighter leading-none text-lg">${candidateName}</h4>
                    <p class="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1">${displaySchool}</p>
                </div>
            </div>
            <div class="bg-white p-6 rounded-[2rem] border border-slate-100 mb-6 shadow-sm">
                <label class="text-[9px] font-black text-[#b91c1c] uppercase tracking-widest block mb-2">Manifesto</label>
                <p class="text-slate-600 text-xs italic leading-relaxed whitespace-pre-wrap">"${displayManifesto}"</p>
            </div>
        </div>
      `,
      confirmButtonText: 'CLOSE',
      confirmButtonColor: '#0f172a',
      customClass: { popup: 'rounded-[2.5rem]' },
    });
  };

  const handleDisqualify = async (id: string, name: string) => {
    if (!isAdmin) return toast.error("Only Admins can perform this action");

    const { value: reason, isConfirmed } = await MySwal.fire({
      title: `<b class="text-red-700 uppercase italic text-lg">Disqualify Candidate</b>`,
      text: `Removing ${name} from the active ballot.`,
      input: 'textarea',
      inputPlaceholder: 'Reason...',
      showCancelButton: true,
      confirmButtonText: 'CONFIRM',
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2.5rem]' },
    });

    if (isConfirmed) {
      try {
        await disqualifyCandidate(id).unwrap();
        toast.error(`${name} Disqualified`);
        refetchCandidates();
      } catch (err) {
        toast.error("Action failed.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return toast.error("Only Admins can delete candidates");

    const res = await MySwal.fire({
        title: "PURGE CANDIDATE?",
        text: "This will remove the candidate record entirely.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#b91c1c',
        confirmButtonText: "YES, PURGE",
        customClass: { popup: 'rounded-[2.5rem]' }
      });
  
      if (res.isConfirmed) {
        try {
            await deleteCandidate(id).unwrap();
            toast.success("Candidate Purged");
            refetchCandidates();
        } catch (err) {
            toast.error("Delete failed");
        }
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
                    <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Candidate Registry</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Registry <span className="text-red-700">Manager</span></h1>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="FILTER BY NAME..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-2 border-transparent focus:border-[#b91c1c] text-slate-900 text-[11px] font-black uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-sm outline-none w-64 transition-all"
                />
                <FaSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
              <button onClick={() => { refetchElections(); refetchCandidates(); }} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#b91c1c] transition-all shadow-sm">
                <FaSync className={`${isFetchingCandidates ? 'animate-spin text-[#b91c1c]' : ''}`} />
              </button>
            </div>
        </div>

        <div className="bg-white shadow-xl shadow-slate-200/50 p-5 rounded-[2.5rem] border border-slate-200">
            <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-2 tracking-widest">Select Election</label>
            <select 
                className="w-full bg-slate-50 border-none text-slate-900 text-[11px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl focus:ring-2 focus:ring-[#b91c1c] outline-none"
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
            >
                <option value="">Select Election to Manage</option>
                {elections.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name || e.title}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {!selectedElection ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
            <FaVoteYea className="text-slate-200 mx-auto mb-4" size={40} />
            <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">Select an election cycle</p>
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
                  <section key={pos.id}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border-l-[6px] border-l-[#b91c1c] border border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                          {pos.name}
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
                            isAdmin={isAdmin} // Pass permission to card
                            onView={() => handleViewCandidate(cand)}
                            onDisqualify={() => handleDisqualify(cand.id, cand.name)}
                            onDelete={() => handleDelete(cand.id)}
                          />
                        ))
                      ) : (
                        <div className="col-span-full py-16 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] text-center opacity-60">
                           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No candidates registered</p>
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

/* --- CARD COMPONENT --- */
const CandidateCard = ({ cand, onView, onDisqualify, onDelete, isAdmin }: any) => {
    const { data } = useGetApplicationByIdQuery(cand.application_id);
    const app = (data as any)?.application || data;

    return (
      <div className="group bg-white rounded-[2.5rem] p-8 border border-slate-200 hover:border-[#b91c1c] transition-all duration-500 border-l-[6px] border-l-transparent hover:border-l-[#b91c1c]">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-red-50">
              <img 
                src={app?.photo_url || cand.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(app?.name || cand.name)}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tighter italic">{app?.name || cand.name}</h3>
              <p className="text-[9px] text-red-700 font-black uppercase tracking-widest">
                 {app?.school?.replace(/_/g, ' ') || 'GENERAL SCIENCE'}
              </p>
            </div>
          </div>
          <button onClick={onView} className="p-3 text-slate-300 hover:text-red-600 transition-all">
              <FaEye size={18} />
          </button>
        </div>

        <div className="flex-grow mb-6">
          <p className="text-slate-400 text-xs italic line-clamp-2 border-l-2 border-red-100 pl-4">
            "{app?.manifesto || cand.manifesto || "Loading manifesto..."}"
          </p>
        </div>

        {/* --- CONDITIONAL ACTIONS: Only visible to Admins --- */}
        <div className="flex gap-3">
          {isAdmin ? (
            <>
              <button 
                onClick={onDisqualify}
                className="flex-grow py-3.5 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-red-700 transition-all uppercase tracking-widest shadow-lg flex justify-center items-center gap-2"
              >
                <FaUserSlash /> Disqualify
              </button>
              <button 
                onClick={onDelete}
                className="p-4 bg-red-50 text-[#b91c1c] rounded-2xl hover:bg-[#b91c1c] hover:text-white transition-all"
              >
                <FaTrash size={14} />
              </button>
            </>
          ) : (
            <div className="w-full py-3.5 bg-slate-50 text-slate-300 text-[10px] font-black rounded-2xl flex justify-center items-center gap-2 uppercase tracking-widest border border-slate-100">
               <FaLock /> View Only Mode
            </div>
          )}
        </div>
      </div>
    );
};