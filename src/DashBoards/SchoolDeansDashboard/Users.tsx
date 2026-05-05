import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  useGetAllUsersQuery,
} from "../../features/APIS/UserApi";

import "../adminDashboard/style.css";
import { FaKey, FaSearch, FaUserGraduate, FaInfoCircle, FaSync, FaCalendarAlt, FaUniversity, FaUserShield } from "react-icons/fa";

const MySwal = withReactContent(Swal);

interface UserNode {
  id: string;
  name: string;
  reg_no: string;
  role: string;
  email?: string;
  school?: string;
  expected_graduation?: string;
}

export const AllSchoolStudents = () => {
  /* ================= JURISDICTION LOGIC ================= */
  // Accessing the user object based on your JSON structure: auth.user.user
  const authState = useSelector((state: any) => state.auth.user?.user);
  
  const deanName = authState?.name || "Dean";
  const deanRole = authState?.role || "";
  const deanAssignedSchool = authState?.school; // e.g., "Science"

  /* ================= API HOOKS ================= */
  const { data: allUsersData = { users: [] }, isLoading, refetch } = useGetAllUsersQuery(undefined);

  /* ================= STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [gradFilter, setGradFilter] = useState<string>("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const usersArray = (allUsersData?.users || []) as UserNode[];

  /* ================= STRICT SCHOOL FILTERING ================= */
  const schoolStudents = useMemo(() => {
    // If Global Admin, show everything
    if (deanRole === "admin") return usersArray;
    
    // If a Dean, filter students where their school matches the Dean's school exactly
    return usersArray.filter(student => 
      student.school?.trim().toLowerCase() === deanAssignedSchool?.trim().toLowerCase()
    );
  }, [usersArray, deanAssignedSchool, deanRole]);

  const uniqueGradYears = useMemo(() => 
    Array.from(new Set(schoolStudents.map((u) => u.expected_graduation).filter(Boolean))) as string[], 
  [schoolStudents]);

  const filteredUsers = useMemo(() => {
    return schoolStudents.filter((user) => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        user.name?.toLowerCase().includes(lowerSearch) ||
        user.reg_no?.toLowerCase().includes(lowerSearch);
      
      const matchesGrad = gradFilter ? user.expected_graduation === gradFilter : true;

      return matchesSearch && matchesGrad;
    });
  }, [schoolStudents, searchTerm, gradFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRefresh = () => {
    setIsSpinning(true);
    refetch();
    setTimeout(() => setIsSpinning(false), 700);
  };

  /* ================= ACTIONS ================= */
  const handleViewDetails = (user: UserNode) => {
    MySwal.fire({
      title: `<span style="color: #b91c1c; font-size: 14px; font-weight: 900; letter-spacing: 1px;">STUDENT PROFILE</span>`,
      html: `
        <div style="text-align: left; padding: 15px; font-family: 'Inter', sans-serif;">
          <div style="border-left: 4px solid #b91c1c; padding-left: 15px; margin-bottom: 20px;">
             <p style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Student Identity</p>
             <p style="font-size: 18px; font-weight: 900; color: #0f172a;">${user.name}</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
             <div style="background: #f8fafc; padding: 12px; border-radius: 12px;">
                <p style="font-size: 9px; font-weight: 800; color: #b91c1c;">REGISTRATION</p>
                <p style="font-size: 11px; font-weight: 700;">${user.reg_no}</p>
             </div>
             <div style="background: #f8fafc; padding: 12px; border-radius: 12px;">
                <p style="font-size: 9px; font-weight: 800; color: #b91c1c;">SCHOOL</p>
                <p style="font-size: 11px; font-weight: 700;">${user.school || 'N/A'}</p>
             </div>
          </div>
        </div>
      `,
      confirmButtonColor: "#b91c1c",
      customClass: { popup: 'rounded-3xl' }
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><PuffLoader color="#b91c1c" /></div>;

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-red-800 text-white text-[10px] font-black uppercase rounded-lg tracking-widest shadow-md">
                {deanAssignedSchool} DEPARTMENT
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">
              Student <span className="text-[#b91c1c]">Matrix</span>
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase flex items-center gap-2">
              <FaUserShield className="text-[#b91c1c]" /> Dean: {deanName}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter by Name or Reg No..." 
                className="pl-12 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm text-xs font-bold w-72 focus:ring-2 focus:ring-[#b91c1c] transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={handleRefresh} className="p-4 bg-white text-[#b91c1c] rounded-2xl shadow-sm hover:bg-[#b91c1c] hover:text-white transition-all">
              <FaSync className={isSpinning ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-[#b91c1c]">
                 <FaUniversity size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Assigned Jurisdiction</p>
                 <p className="text-lg font-black text-slate-800 uppercase italic">School of {deanAssignedSchool}</p>
              </div>
           </div>
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                 <FaCalendarAlt size={24} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Graduation Filter</p>
                <select 
                    className="bg-transparent w-full text-xs font-black uppercase outline-none cursor-pointer text-slate-800"
                    value={gradFilter}
                    onChange={(e) => setGradFilter(e.target.value)}
                >
                    <option value="">All Cohorts</option>
                    {uniqueGradYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-[#1e293b] text-white">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Student Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em]">Reg Number</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right">Registry Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-red-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#b91c1c] group-hover:text-white transition-all shadow-sm">
                        <FaUserGraduate />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase italic leading-none mb-1">{user.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.school}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-mono text-xs font-black border border-slate-200">
                        {user.reg_no}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetails(user)} 
                        title="View Record"
                        className="p-3 bg-white text-slate-300 hover:text-[#b91c1c] hover:border-[#b91c1c] rounded-xl border border-slate-100 transition-all shadow-sm"
                      >
                        <FaInfoCircle size={16} />
                      </button>
                     
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <FaUniversity size={40} />
                        <p className="text-sm font-black italic uppercase tracking-widest">No matching records in {deanAssignedSchool}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* FOOTER / PAGINATION */}
          <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {paginatedUsers.length} of {filteredUsers.length} Students</span>
             <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-6 py-2.5 bg-white text-[10px] font-black rounded-xl border border-slate-200 shadow-sm disabled:opacity-30 uppercase transition-all active:scale-95"
                >Prev</button>
                <button 
                  disabled={currentPage >= totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-6 py-2.5 bg-white text-[10px] font-black rounded-xl border border-slate-200 shadow-sm disabled:opacity-30 uppercase transition-all active:scale-95"
                >Next</button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};