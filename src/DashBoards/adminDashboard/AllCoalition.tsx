import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { 
  FaPlus, FaEdit, FaTrash, FaUsers, FaPalette, 
  FaSearch, FaExternalLinkAlt, FaGlobe 
} from "react-icons/fa";
import { 
  useGetCoalitionsByElectionQuery, 
  useCreateCoalitionMutation, 
  useUpdateCoalitionMutation, 
  useDeleteCoalitionMutation 
} from "../../features/APIS/CoalitionApi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

export const AdminCoalitionManager = () => {
  const [selectedElection, setSelectedElection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoalition, setEditingCoalition] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    acronym: "",
    slogan: "",
    color_code: "#b91c1c",
    logo_url: ""
  });

  // Queries & Mutations
  const { data: electionsData } = useGetAllElectionsQuery(undefined);
  const { data: coalitionsData, isLoading } = useGetCoalitionsByElectionQuery(selectedElection, {
    skip: !selectedElection,
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
        await createCoalition({ electionId: selectedElection, ...formData }).unwrap();
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      alert("Action failed. Check admin permissions.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", acronym: "", slogan: "", color_code: "#b91c1c", logo_url: "" });
    setEditingCoalition(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will dissolve the coalition and remove all candidate affiliations.")) {
      await deleteCoalition(id);
    }
  };

  if (isLoading && selectedElection) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
      <PuffLoader color="#b91c1c" size={60} />
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Alliances...</p>
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

        {!selectedElection ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
            <FaGlobe className="mx-auto text-slate-200 mb-4" size={50} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Please select an election to manage coalitions</p>
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
                      <button 
                        onClick={() => { setEditingCoalition(c); setFormData(c as any); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      ><FaEdit /></button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      ><FaTrash /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-1">{c.name}</h3>
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter mb-4">{c.acronym || 'NO ACRONYM'}</p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">Motto/Slogan</p>
                      <p className="text-xs font-bold text-slate-600 italic">"{c.slogan || 'Unity in Diversity'}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Coalition Name</label>
                <input 
                  type="text" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Acronym</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none"
                    value={formData.acronym}
                    onChange={(e) => setFormData({...formData, acronym: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Brand Color</label>
                  <input 
                    type="color"
                    className="w-full h-[50px] bg-slate-50 border border-slate-200 rounded-xl p-1"
                    value={formData.color_code}
                    onChange={(e) => setFormData({...formData, color_code: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Logo URL</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Official Slogan</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none resize-none h-24"
                  value={formData.slogan}
                  onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                />
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-lg mt-4">
                {editingCoalition ? 'Save Changes' : 'Launch Coalition'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};