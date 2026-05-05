import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { 
  FaPlus, FaEdit, FaTrash, FaUsers, FaPalette, 
  FaSearch, FaExternalLinkAlt, FaGlobe, FaUserTie, FaTimes 
} from "react-icons/fa";
import { 
  useGetCoalitionsByElectionQuery, 
  useCreateCoalitionMutation, 
  useUpdateCoalitionMutation, 
  useDeleteCoalitionMutation,
  useGetCoalitionFullSlateQuery // Added for Slate view
} from "../../features/APIS/CoalitionApi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

export const AdminCoalitionManager = () => {
  const [selectedElection, setSelectedElection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoalition, setEditingCoalition] = useState<any>(null);
  
  // Slate View State
  const [viewingSlateId, setViewingSlateId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    slogan: "",
    color_code: "#b91c1c",
    logo_url: ""
  });

  const { data: electionsData } = useGetAllElectionsQuery(undefined);
  const { data: coalitionsData, isLoading } = useGetCoalitionsByElectionQuery(selectedElection, {
    skip: !selectedElection,
  });
  
  // Slate Query
  const { data: slateData, isLoading: isLoadingSlate } = useGetCoalitionFullSlateQuery(viewingSlateId!, {
    skip: !viewingSlateId,
  });

  const [createCoalition] = useCreateCoalitionMutation();
  const [updateCoalition] = useUpdateCoalitionMutation();
  const [deleteCoalition] = useDeleteCoalitionMutation();

  const electionsList = (electionsData as any)?.elections || [];
  const coalitionsList = coalitionsData?.coalitions || [];

  const filteredCoalitions = useMemo(() => {
    return coalitionsList.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.acronym?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coalitionsList, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoalition) {
        await updateCoalition({ id: editingCoalition.id, body: formData }).unwrap();
      } else {
        // FIXED: Mapping to CreateCoalitionRequest structure
        await createCoalition({ 
          creatorCandidateId: "ADMIN_ACTION", // Or your admin ID
          coalition: { 
            ...formData, 
            election_id: selectedElection // Map electionId here
          } 
        }).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      alert("Action failed. Check API constraints.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", acronym: "", slogan: "", color_code: "#b91c1c", logo_url: "" });
    setEditingCoalition(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Dissolve this alliance? This will remove all member affiliations.")) {
      await deleteCoalition(id);
    }
  };

  if (isLoading && selectedElection) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
      <PuffLoader color="#b91c1c" size={60} />
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Alliances...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-3 border border-blue-100">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Political Formations</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Coalition <span className="text-red-700">Hub</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <select 
              className="bg-white border border-slate-200 rounded-2xl p-4 text-[10px] font-black uppercase outline-none shadow-sm min-w-[250px]"
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
            >
              <option value="">Select Election Context</option>
              {electionsList.map((e: any) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            {selectedElection && (
              <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-lg"
              >
                <FaPlus /> New Coalition
              </button>
            )}
          </div>
        </div>

        {/* Coalition Grid */}
        {!selectedElection ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
            <FaGlobe className="mx-auto text-slate-200 mb-4" size={50} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select an election context to manage alliances</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoalitions.map((c) => (
              <div key={c.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                <div className="h-3" style={{ backgroundColor: c.color_code || '#cbd5e1' }}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                      {c.logo_url ? <img src={c.logo_url} alt="logo" className="object-cover" /> : <FaUsers className="text-slate-300" />}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setViewingSlateId(c.id)} className="p-2 text-slate-400 hover:text-green-600 transition-colors"><FaExternalLinkAlt title="View Slate" /></button>
                      <button onClick={() => { setEditingCoalition(c); setFormData(c as any); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><FaEdit /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><FaTrash /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{c.name}</h3>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter mb-4">{c.acronym || 'ALLIANCE'}</p>
                  
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">Motto</p>
                    <p className="text-xs font-bold text-slate-600 italic">"{c.slogan || 'No Slogan Set'}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coalition Slate View Modal */}
      {viewingSlateId && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">Coalition <span className="text-red-700">Slate</span></h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member Lineup & Positions</p>
              </div>
              <button onClick={() => setViewingSlateId(null)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md text-slate-400 hover:text-red-600"><FaTimes /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {isLoadingSlate ? (
                <div className="py-20 text-center"><PuffLoader color="#b91c1c" className="mx-auto" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slateData?.coalition.candidates.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                        {member.photo_url ? <img src={member.photo_url} alt="" className="object-cover h-full w-full" /> : <FaUserTie className="text-slate-300" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase leading-none">{member.name}</p>
                        <p className="text-[9px] font-bold text-red-600 uppercase mt-1 tracking-wider">{member.position.name}</p>
                      </div>
                    </div>
                  ))}
                  {slateData?.coalition.candidates.length === 0 && (
                    <p className="col-span-2 text-center py-10 text-[10px] font-black uppercase text-slate-400 italic">No candidates have joined this alliance yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900 uppercase italic">
                {editingCoalition ? 'Edit' : 'Create'} <span className="text-red-700">Alliance</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              {/* Form inputs remain the same as your previous logic */}
              <input type="text" placeholder="Name" required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="text" placeholder="Acronym" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold" value={formData.acronym} onChange={(e) => setFormData({...formData, acronym: e.target.value})} />
              <input type="color" className="w-full h-12 bg-slate-50 rounded-xl p-1" value={formData.color_code} onChange={(e) => setFormData({...formData, color_code: e.target.value})} />
              <input type="text" placeholder="Logo URL" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} />
              <textarea placeholder="Slogan" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold h-24" value={formData.slogan} onChange={(e) => setFormData({...formData, slogan: e.target.value})} />
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 shadow-lg transition-all">
                {editingCoalition ? 'Save Changes' : 'Launch Coalition'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};