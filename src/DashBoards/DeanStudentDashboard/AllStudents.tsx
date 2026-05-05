import { useState, useMemo, type ReactNode, type Key } from "react";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../features/APIS/UserApi";
import { useUpdatePasswordMutation } from "../../features/APIS/Auth.Api";

import "../adminDashboard/style.css";
import { FaDeleteLeft } from "react-icons/fa6";
import { FaKey, FaEdit, FaSearch, FaUserShield, FaUserGraduate, FaInfoCircle, FaSync, FaFilter, FaUniversity, FaCalendarAlt } from "react-icons/fa";

const MySwal = withReactContent(Swal);

// Defined interface to resolve 'unknown' type errors
interface UserNode {
  id: string;
  name: string;
  reg_no: string;
  role: string;
  email?: string;
  school?: string;
  expected_graduation?: string;
}

export const AllStudents = () => {
  /* ================= API HOOKS ================= */
  const { data: allUsersData = { users: [] }, isLoading, error, refetch } = useGetAllUsersQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [updatePassword] = useUpdatePasswordMutation();

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [schoolFilter, setSchoolFilter] = useState<string>("");
  const [gradFilter, setGradFilter] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const admin = useSelector((state: any) => state.auth.user);
  const adminName = admin?.name || "User";
  const isSuperAdmin = admin?.role === "admin"; // Check if the user is a real Admin

  // Cast users array to our interface to satisfy ReactNode and Key types
  const usersArray = (allUsersData?.users || []) as UserNode[];

  /* ================= DYNAMIC FILTER OPTIONS ================= */
  const uniqueSchools = useMemo(() => 
    Array.from(new Set(usersArray.map((u) => u.school).filter(Boolean))) as string[], 
  [usersArray]);

  const uniqueGradYears = useMemo(() => 
    Array.from(new Set(usersArray.map((u) => u.expected_graduation).filter(Boolean))) as string[], 
  [usersArray]);

  /* ================= FILTERING & PAGINATION ================= */
  const filteredUsers = useMemo(() => {
    return usersArray.filter((user) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(lowerSearch) ||
        user.reg_no?.toLowerCase().includes(lowerSearch) ||
        (user.email?.toLowerCase().includes(lowerSearch) ?? false);
      
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesSchool = schoolFilter ? user.school === schoolFilter : true;
      const matchesGrad = gradFilter ? user.expected_graduation === gradFilter : true;

      return matchesSearch && matchesRole && matchesSchool && matchesGrad;
    });
  }, [usersArray, searchTerm, roleFilter, schoolFilter, gradFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= ANIMATED REFRESH ================= */
  const handleRefresh = () => {
    setIsSpinning(true);
    refetch();
    setTimeout(() => setIsSpinning(false), 700);
  };

  /* ================= MODAL HANDLERS ================= */
  const handleViewDetails = (user: UserNode) => {
    MySwal.fire({
      title: `<span style="color: #991b1b; font-size: 14px; font-weight: 900; letter-spacing: 2px;">USER DATA SHEET</span>`,
      html: `
        <div style="text-align: left; border-top: 3px solid #991b1b; padding-top: 20px; font-family: sans-serif;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 5px solid #991b1b; margin-bottom: 12px;">
            <p style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0;">Full Identity</p>
            <p style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">${user.name}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
             <div style="background: #fef2f2; padding: 12px; border-radius: 10px;">
                <p style="font-size: 8px; font-weight: 900; color: #991b1b; text-transform: uppercase; margin:0;">Reg Number</p>
                <p style="font-size: 11px; font-weight: 700; margin: 2px 0 0 0;">${user.reg_no}</p>
             </div>
             <div style="background: #f1f5f9; padding: 12px; border-radius: 10px;">
                <p style="font-size: 8px; font-weight: 900; color: #64748b; text-transform: uppercase; margin:0;">Role</p>
                <p style="font-size: 11px; font-weight: 700; margin: 2px 0 0 0;">${user.role}</p>
             </div>
          </div>
          <div style="padding: 12px; background: #fff; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 12px;">
             <p style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin:0;">Email Node</p>
             <p style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">${user.email || 'N/A'}</p>
          </div>
          <div style="padding: 12px; background: #fff; border: 1px solid #f1f5f9; border-radius: 10px;">
             <p style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin:0;">Department/School</p>
             <p style="font-size: 12px; font-weight: 600; margin: 2px 0 0 0;">${user.school || 'Unspecified'}</p>
          </div>
        </div>
      `,
      confirmButtonColor: "#991b1b",
      confirmButtonText: "DONE",
      customClass: { popup: 'rounded-[2rem]' }
    });
  };

  const handleUpdatePassword = async (user: UserNode) => {
    if (!isSuperAdmin) return; // Defensive check
    const { value: password } = await MySwal.fire({
      title: `<b style="color: #991b1b;">PASSWORD OVERRIDE</b>`,
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="font-size: 11px; color: #64748b; margin-bottom: 15px; text-transform: uppercase;">User: <b>${user.reg_no}</b></p>
          <div style="margin-bottom: 15px; position: relative;">
            <label style="font-size: 10px; font-weight: 800; color: #991b1b; text-transform: uppercase;">New Password</label>
            <div style="position: relative; display: flex; align-items: center; margin-top: 5px;">
              <input id="p1" type="password" style="width: 100%; padding: 12px; border: 2px solid #fee2e2; border-radius: 10px; outline: none;" placeholder="••••••••">
              <button type="button" id="toggleEye" style="position: absolute; right: 10px; background: none; border: none; color: #991b1b; cursor: pointer;">Show</button>
            </div>
          </div>
          <div>
            <label style="font-size: 10px; font-weight: 800; color: #991b1b; text-transform: uppercase;">Confirm Password</label>
            <input id="p2" type="password" style="width: 100%; padding: 12px; border: 2px solid #fee2e2; border-radius: 10px; outline: none; margin-top: 5px;" placeholder="••••••••">
            <div id="match-status" style="font-size: 9px; margin-top: 5px; font-weight: bold; text-transform: uppercase;"></div>
          </div>
        </div>
      `,
      didOpen: () => {
        const p1 = document.getElementById('p1') as HTMLInputElement;
        const p2 = document.getElementById('p2') as HTMLInputElement;
        const eye = document.getElementById('toggleEye') as HTMLButtonElement;
        const status = document.getElementById('match-status') as HTMLElement;
        const checkMatch = () => {
          if (p1.value && p2.value) {
            const isMatch = p1.value === p2.value;
            status.innerText = isMatch ? "✓ Passwords Match" : "✗ No Match";
            status.style.color = isMatch ? "#10b981" : "#ef4444";
          } else { status.innerText = ""; }
        };
        p1.addEventListener('input', checkMatch);
        p2.addEventListener('input', checkMatch);
        eye.onclick = () => {
          const isPass = p1.type === 'password';
          p1.type = p2.type = isPass ? 'text' : 'password';
          eye.innerText = isPass ? 'Hide' : 'Show';
        };
      },
      showCancelButton: true,
      confirmButtonText: "Update Key",
      confirmButtonColor: "#991b1b",
      preConfirm: () => {
        const v1 = (document.getElementById('p1') as HTMLInputElement).value;
        const v2 = (document.getElementById('p2') as HTMLInputElement).value;
        if (!v1) return Swal.showValidationMessage("Password required");
        if (v1 !== v2) return Swal.showValidationMessage("Passwords do not match");
        return v1;
      }
    });

    if (password) {
      try {
        await updatePassword({ reg_no: user.reg_no, password }).unwrap();
        MySwal.fire({ title: "Success!", text: "Password updated.", icon: "success", confirmButtonColor: "#991b1b" });
      } catch { MySwal.fire("Error", "Update failed", "error"); }
    }
  };

  const handleEdit = async (user: UserNode) => {
    if (!isSuperAdmin) return; // Defensive check
    const { value: formValues } = await MySwal.fire({
      title: `<b style="color: #991b1b;">EDIT IDENTITY</b>`,
      html: `
        <div style="text-align: left; padding: 10px;">
          <input id="sw-n" class="swal2-input" style="width: 85%; margin: 10px auto; border-radius: 10px;" placeholder="Name" value="${user.name}">
          <input id="sw-s" class="swal2-input" style="width: 85%; margin: 10px auto; border-radius: 10px;" placeholder="School" value="${user.school || ''}">
          <input id="sw-g" class="swal2-input" style="width: 85%; margin: 10px auto; border-radius: 10px;" placeholder="Expected Graduation" value="${user.expected_graduation || ''}">
          <select id="sw-r" class="swal2-input" style="width: 85%; margin: 10px auto; border-radius: 10px; font-size: 14px;">
            <option value="voter" ${user.role === "voter" ? "selected" : ""}>Voter</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
            <option value="Dean_of_Students" ${user.role === "Dean_of_Students" ? "selected" : ""}>Dean of Students</option>
            <option value="Accountants" ${user.role === "Accountants" ? "selected" : ""}>Accountants</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      confirmButtonColor: "#991b1b",
      preConfirm: () => ({
        userId: user.id,
        name: (document.getElementById("sw-n") as HTMLInputElement).value,
        school: (document.getElementById("sw-s") as HTMLInputElement).value,
        expected_graduation: (document.getElementById("sw-g") as HTMLInputElement).value,
        role: (document.getElementById("sw-r") as HTMLSelectElement).value,
      }),
    });

    if (formValues) {
      try {
        await updateUser(formValues).unwrap();
        MySwal.fire({ title: "Success", icon: "success", confirmButtonColor: "#991b1b" });
      } catch { MySwal.fire("Error", "Update failed", "error"); }
    }
  };

  const handleDelete = async (userId: string) => {
    if (!isSuperAdmin) return; // Defensive check
    const confirm = await MySwal.fire({
      title: "Purge Identity?",
      text: "This removal is permanent and irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#991b1b",
      confirmButtonText: "Yes, Purge Node",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(userId).unwrap();
        MySwal.fire({ title: "Purged", text: "Identity removed from registry.", icon: "success", confirmButtonColor: "#991b1b" });
      } catch { MySwal.fire("Error", "Deletion failed", "error"); }
    }
  };

  /* ================= RENDER ================= */
  if (isLoading) return <div className="flex justify-center items-center h-screen bg-white"><PuffLoader color="#991b1b" /></div>;

  return (
    <div className="min-h-screen p-8 bg-white font-sans border-t-[12px] border-red-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse"></span> Terminal Session: {adminName} ({admin?.role})
            </p>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">User <span className="text-red-800">Registry</span></h1>
          </div>

          <div className="flex gap-2">
             <div className="relative group">
                <input type="text" placeholder="Search Matrix..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border-2 border-slate-100 focus:border-red-800 rounded-2xl p-4 pl-12 text-xs font-bold w-64 transition-all outline-none" />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-800" />
             </div>
             <button 
                onClick={handleRefresh} 
                className="p-4 bg-red-800 text-white rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center"
              >
                <FaSync className={isSpinning ? "animate-spin" : ""} style={{ animationDuration: '0.6s' }} />
             </button>
          </div>
        </div>

        {/* Dynamic Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center px-4">
              <FaFilter className="text-red-800 mr-3 text-xs" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-transparent w-full py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                <option value="">All Clearances (Roles)</option>
                <option value="admin">Admin</option>
                <option value="voter">Voter</option>
                <option value="Dean_of_Students">Dean of Students</option>
                <option value="Accountants">Accountants</option>
              </select>
           </div>
           <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center px-4">
              <FaUniversity className="text-red-800 mr-3 text-xs" />
              <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="bg-transparent w-full py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                <option value="">All Schools/Depts</option>
                {uniqueSchools.map((school) => <option key={school as Key} value={school as string}>{school as ReactNode}</option>)}
              </select>
           </div>
           <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center px-4">
              <FaCalendarAlt className="text-red-800 mr-3 text-xs" />
              <select value={gradFilter} onChange={(e) => setGradFilter(e.target.value)} className="bg-transparent w-full py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                <option value="">All Grad Years</option>
                {uniqueGradYears.map((year) => <option key={year as Key} value={year as string}>{year as ReactNode}</option>)}
              </select>
           </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-red-800 text-white">
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest italic">Identity</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest italic">Reg No</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest italic">Clearance</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest italic text-right">Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                  <tr key={user.id as Key} className="hover:bg-red-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-red-800 group-hover:text-white transition-all">
                          {user.role === 'admin' ? <FaUserShield /> : <FaUserGraduate />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase italic leading-none mb-1">{user.name as ReactNode}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.school as ReactNode || 'NO_DEPT'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-[11px] font-black text-red-800">{user.reg_no as ReactNode}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{user.role as ReactNode}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => handleViewDetails(user)} title="View Profile" className="p-2.5 bg-white text-slate-300 hover:text-red-800 rounded-xl shadow-sm border border-slate-100 transition-colors"><FaInfoCircle /></button>
                          
                          {/* ONLY SHOW ADMIN BUTTONS IF LOGGED IN AS ADMIN */}
                          {isSuperAdmin && (
                            <>
                              <button onClick={() => handleUpdatePassword(user)} title="Override Password" className="p-2.5 bg-white text-slate-300 hover:text-red-800 rounded-xl shadow-sm border border-slate-100 transition-colors"><FaKey /></button>
                              <button onClick={() => handleEdit(user)} title="Edit Identity" className="p-2.5 bg-white text-slate-300 hover:text-red-800 rounded-xl shadow-sm border border-slate-100 transition-colors"><FaEdit /></button>
                              <button onClick={() => handleDelete(user.id)} title="Purge Record" className="p-2.5 bg-white text-slate-300 hover:text-red-800 rounded-xl shadow-sm border border-slate-100 transition-colors"><FaDeleteLeft /></button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-slate-400 font-black italic uppercase tracking-widest">No Identities Match These Matrix Parameters</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</p>
             <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-6 py-2 bg-white text-[10px] font-black rounded-xl border border-slate-200 hover:bg-red-800 hover:text-white transition-all disabled:opacity-20 uppercase">Prev</button>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-6 py-2 bg-white text-[10px] font-black rounded-xl border border-slate-200 hover:bg-red-800 hover:text-white transition-all disabled:opacity-20 uppercase">Next</button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};