import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { 
  FaUserPlus, FaSearch, FaSync, FaUserShield, FaUserGraduate, 
  FaTrash, FaIdCard, FaTimesCircle, FaCheckCircle 
} from "react-icons/fa";
import { MdOutlineVerifiedUser, MdAdminPanelSettings } from "react-icons/md";

// Ensure these paths match your actual project structure
import { useRegisterMutation } from "../../features/APIS/Auth.Api"; 
import { 
  useGetAllUsersQuery, 
  useDeleteUserMutation 
} from "../../features/APIS/UserApi"; 
import { toast } from "sonner";

const MySwal = withReactContent(Swal);

export const AccountRegistry = () => {
  /* ================= API HOOKS ================= */
  const { data: usersRaw, isLoading, refetch, isFetching } = useGetAllUsersQuery();
  const [registerAccount, { isLoading: isRegistering }] = useRegisterMutation();
  const [deleteUser] = useDeleteUserMutation();

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= DATA HANDLING ================= */
  const allUsers = useMemo(() => {
    const data = usersRaw?.users || usersRaw;
    return Array.isArray(data) ? data : [];
  }, [usersRaw]);

  useEffect(() => setCurrentPage(1), [searchTerm, roleFilter]);

  /* ================= ACTION: REGISTER ================= */
  const handleRegister = async () => {
    const { value: formData } = await MySwal.fire({
      title: '<b class="text-slate-800 uppercase italic text-2xl tracking-tighter">Provision Identity</b>',
      html: `
        <div class="text-left font-sans p-2">
          <label class="text-[9px] font-black text-[#b91c1c] uppercase tracking-widest ml-1">Registration Number</label>
          <input 
            id="swal_reg_no" 
            class="w-full bg-slate-100 border-none rounded-xl p-4 mt-1 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 uppercase" 
            placeholder="e.g. STUDENT/00022" 
          />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "AUTHORIZE",
      confirmButtonColor: '#b91c1c',
      customClass: { popup: 'rounded-[2.5rem]', confirmButton: 'rounded-xl text-[10px] font-black px-6 py-4' },
      preConfirm: () => {
        const input = document.getElementById("swal_reg_no") as HTMLInputElement;
        const val = input?.value?.trim();
        if (!val) {
          Swal.showValidationMessage("Registration Number is required");
          return null;
        }
        return { reg_no: val }; 
      }
    });

    if (formData) {
      try {
        // Execute Mutation
        await registerAccount(formData).unwrap();
        
        // SUCCESS MODAL
        await MySwal.fire({
          icon: 'success',
          title: '<span class="text-slate-800 uppercase font-black italic">Identity Provisioned</span>',
          html: `<p class="text-xs font-bold text-slate-500 uppercase tracking-widest">ID: ${formData.reg_no} has been added to the registry.</p>`,
          confirmButtonColor: '#1e293b',
          customClass: { popup: 'rounded-[2rem]' }
        });

        refetch();
      } catch (err: any) {
        // ERROR MODAL (Extracting {"error": "..."} or {"message": "..."})
        const errorMessage = err?.data?.error || err?.data?.message || "Registry synchronization failed";
        
        MySwal.fire({
          icon: 'error',
          title: '<span class="text-red-700 uppercase font-black italic">Registration Failed</span>',
          html: `<p class="text-xs font-black text-slate-600 uppercase tracking-tight">${errorMessage}</p>`,
          confirmButtonColor: '#b91c1c',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    }
  };

  /* ================= ACTION: DELETE ================= */
  const handleDelete = async (userId: string) => {
    const confirm = await MySwal.fire({
      title: "PURGE RECORD?",
      text: "This action is irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      confirmButtonText: "YES, PURGE"
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(userId).unwrap();
        toast.success("Identity Purged");
      } catch (err: any) {
        toast.error(err?.data?.error || "Purge Failed");
      }
    }
  };

  /* ================= FILTER & PAGINATION ================= */
  const filteredUsers = allUsers.filter((user: any) => 
    (user.reg_no || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
    (roleFilter ? user.role === roleFilter : true)
  );
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#F8FAFC]">
      <PuffLoader color="#b91c1c" size={60} />
      <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Master Registry...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
              <span className={`h-2 w-2 rounded-full bg-red-600 ${isFetching ? 'animate-ping' : ''}`}></span>
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Master Identity Control</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">User <span className="text-red-700">Registry</span></h1>
          </div>

          <div className="flex gap-3">
             <button onClick={() => refetch()} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                <FaSync className={`text-slate-400 ${isFetching ? 'animate-spin' : ''}`} />
             </button>
             <button onClick={handleRegister} className="px-8 py-4 bg-[#b91c1c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                <FaUserPlus /> Provision ID
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Filters */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8 space-y-6">
               <div className="relative">
                  <input type="text" placeholder="Search Reg No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all uppercase" />
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
               </div>

               <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 cursor-pointer">
                  <option value="">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="voter">Voters</option>
               </select>
            </div>
          </div>

          {/* User List */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                  <MdOutlineVerifiedUser className="text-red-700" size={24} /> Registry Database
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user: any) => (
                    <div key={user.id || user._id} className="p-7 hover:bg-red-50/30 transition-all group border-l-[6px] border-transparent hover:border-red-600">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${user.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-red-50 text-red-600'}`}>
                            {user.role === 'admin' ? <MdAdminPanelSettings size={22} /> : <FaUserGraduate size={20} />}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{user.reg_no}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.name || 'Account Not Initialized'}</p>
                          </div>
                        </div>

                        <button onClick={() => handleDelete(user.id || user._id)} className="opacity-0 group-hover:opacity-100 p-3 bg-white border border-slate-200 rounded-xl hover:text-red-600 transition-all shadow-sm">
                           <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <FaIdCard className="text-slate-100 mx-auto mb-4" size={50} />
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No matching records</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};