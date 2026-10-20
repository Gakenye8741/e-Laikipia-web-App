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

/* Small animations. They switch off for people who prefer less motion. */
const animations = `
@keyframes st-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes st-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes st-float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(18px, -24px); } }
@keyframes st-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(185,28,28,.35); } 100% { box-shadow: 0 0 0 14px rgba(185,28,28,0); } }
@keyframes st-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

.st-rise { animation: st-rise .55s cubic-bezier(.22,1,.36,1) both; }
.st-fade { animation: st-fade .35s ease-out both; }
.st-float { animation: st-float 14s ease-in-out infinite; }
.st-float-slow { animation: st-float 20s ease-in-out infinite reverse; }
.st-ring { animation: st-pulse-ring 1.8s ease-out 2; }
.st-bob { animation: st-bob 2.6s ease-in-out infinite; }

/* Clear outline when moving around with a keyboard */
.st-root button:focus-visible,
.st-root select:focus-visible,
.st-root input:focus-visible {
  outline: 3px solid rgba(185,28,28,.35);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .st-rise, .st-fade, .st-float, .st-float-slow, .st-ring, .st-bob, .animate-spin { animation: none !important; }
}
`;

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
      title: `<span style="color: #b91c1c; font-size: 15px; font-weight: 800;">Student profile</span>`,
      html: `
        <div style="text-align: left; padding: 8px 4px; font-family: 'Inter', sans-serif;">
          <div style="border-left: 4px solid #b91c1c; padding-left: 15px; margin-bottom: 20px;">
             <p style="font-size: 12px; font-weight: 600; color: #64748b; margin: 0 0 2px;">Name</p>
             <p style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; word-break: break-word;">${user.name}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
             <div style="background: #f8fafc; padding: 14px; border-radius: 14px;">
                <p style="font-size: 11px; font-weight: 700; color: #b91c1c; margin: 0 0 4px;">Reg no</p>
                <p style="font-size: 13px; font-weight: 700; margin: 0; word-break: break-word;">${user.reg_no}</p>
             </div>
             <div style="background: #f8fafc; padding: 14px; border-radius: 14px;">
                <p style="font-size: 11px; font-weight: 700; color: #b91c1c; margin: 0 0 4px;">School</p>
                <p style="font-size: 13px; font-weight: 700; margin: 0; word-break: break-word;">${user.school || 'N/A'}</p>
             </div>
          </div>
        </div>
      `,
      confirmButtonColor: "#b91c1c",
      confirmButtonText: "Close",
      width: "min(92vw, 28rem)",
      showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
      customClass: { popup: 'rounded-3xl' }
    });
  };

  if (isLoading) return (
    <div className="st-fade flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <PuffLoader color="#b91c1c" />
      <p className="animate-pulse text-sm font-medium text-slate-400">Loading students...</p>
    </div>
  );

  return (
    <div className="st-root relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/30 px-4 py-6 font-sans sm:px-6 sm:py-8 lg:p-10">
      <style>{animations}</style>

      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="st-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-200/30 blur-3xl sm:h-96 sm:w-96"></div>
        <div className="st-float-slow absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl sm:h-80 sm:w-80"></div>
      </div>

      <div className="relative mx-auto max-w-7xl">
        
        {/* HEADER SECTION */}
        <div className="st-rise mb-6 flex flex-col justify-between gap-5 sm:mb-10 md:flex-row md:items-center md:gap-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-lg bg-red-800 px-3 py-1 text-xs font-bold text-white shadow-md shadow-red-800/25">
                {deanAssignedSchool ? `${deanAssignedSchool} school` : "All schools"}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              School <span className="text-[#b91c1c]">students</span>
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-400">
              <FaUserShield className="text-[#b91c1c]" /> Dean: {deanName}
            </p>
          </div>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <div className="relative min-w-0 flex-1 md:flex-none">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or reg no" 
                className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-base font-semibold shadow-sm outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400 hover:shadow-md focus:border-[#b91c1c] focus:ring-4 focus:ring-red-100 sm:text-sm md:w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleRefresh}
              aria-label="Refresh list"
              className="flex min-h-[52px] min-w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white p-4 text-[#b91c1c] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b91c1c] hover:text-white hover:shadow-lg active:scale-95"
            >
              <FaSync className={isSpinning ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* INFO CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2">
           <div className="st-rise group flex items-center gap-4 rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:gap-5 sm:p-6" style={{ animationDelay: "80ms" }}>
              <div className="st-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#b91c1c] transition-transform duration-300 group-hover:scale-110">
                 <FaUniversity size={24} />
              </div>
              <div className="min-w-0">
                 <p className="text-xs font-semibold text-slate-400">Your school</p>
                 <p className="truncate text-lg font-extrabold text-slate-800">{deanAssignedSchool ? `School of ${deanAssignedSchool}` : "All schools"}</p>
              </div>
           </div>
           <div className="st-rise group flex items-center gap-4 rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:gap-5 sm:p-6" style={{ animationDelay: "150ms" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-[#b91c1c]">
                 <FaCalendarAlt size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-400">Graduation year</p>
                <select 
                    className="min-h-[32px] w-full cursor-pointer bg-transparent text-base font-bold text-slate-800 outline-none sm:text-sm"
                    value={gradFilter}
                    onChange={(e) => setGradFilter(e.target.value)}
                >
                    <option value="">All years</option>
                    {uniqueGradYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
           </div>
        </div>

        {/* DATA TABLE */}
        <div className="st-rise overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/60 sm:rounded-[2.5rem]" style={{ animationDelay: "220ms" }}>

          {/* Table on bigger screens */}
          <table className="hidden w-full text-left md:table">
            <thead className="bg-[#1e293b] text-white">
              <tr>
                <th className="px-8 py-5 text-xs font-semibold">Student</th>
                <th className="px-8 py-5 text-xs font-semibold">Reg no</th>
                <th className="px-8 py-5 text-right text-xs font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.length > 0 ? paginatedUsers.map((user, i) => (
                <tr
                  key={user.id}
                  className="st-rise group transition-colors duration-200 hover:bg-red-50/40"
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[#b91c1c] group-hover:text-white">
                        <FaUserGraduate />
                      </div>
                      <div>
                        <p className="mb-0.5 text-sm font-extrabold leading-tight text-slate-800">{user.name}</p>
                        <p className="text-xs font-medium text-slate-400">{user.school}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-600">
                        {user.reg_no}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetails(user)} 
                        title="View details"
                        aria-label={`View details for ${user.name}`}
                        className="rounded-xl border border-slate-100 bg-white p-3 text-slate-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b91c1c] hover:text-[#b91c1c] hover:shadow-md active:scale-95"
                      >
                        <FaInfoCircle size={16} />
                      </button>
                     
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <div className="st-fade flex flex-col items-center gap-3 text-slate-300">
                        <FaUniversity size={40} className="st-bob" />
                        <p className="text-sm font-semibold text-slate-400">No students found{deanAssignedSchool ? ` in ${deanAssignedSchool}` : ""}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Cards on phones */}
          <div className="divide-y divide-slate-100 md:hidden">
            {paginatedUsers.length > 0 ? paginatedUsers.map((user, i) => (
              <div
                key={user.id}
                className="st-rise flex items-center gap-3 p-4 transition-colors active:bg-red-50/60"
                style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 shadow-sm">
                  <FaUserGraduate />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-800">{user.name}</p>
                  <p className="truncate text-xs font-medium text-slate-400">{user.school}</p>
                  <span className="mt-1.5 inline-block max-w-full truncate rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">
                    {user.reg_no}
                  </span>
                </div>
                <button
                  onClick={() => handleViewDetails(user)}
                  title="View details"
                  aria-label={`View details for ${user.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all active:scale-95 active:text-[#b91c1c]"
                >
                  <FaInfoCircle size={18} />
                </button>
              </div>
            )) : (
              <div className="st-fade flex flex-col items-center gap-3 px-6 py-16 text-center text-slate-300">
                <FaUniversity size={40} className="st-bob" />
                <p className="text-sm font-semibold text-slate-400">No students found{deanAssignedSchool ? ` in ${deanAssignedSchool}` : ""}</p>
              </div>
            )}
          </div>

          {/* FOOTER / PAGINATION */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:p-8">
             <span className="text-center text-xs font-semibold text-slate-400 sm:text-left">
               Showing {paginatedUsers.length} of {filteredUsers.length} students
               <span className="mx-2 text-slate-300">|</span>
               Page {currentPage} of {Math.max(totalPages, 1)}
             </span>
             <div className="flex w-full gap-2 sm:w-auto">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b91c1c] hover:text-[#b91c1c] active:scale-95 disabled:translate-y-0 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-inherit sm:flex-none"
                >Previous</button>
                <button 
                  disabled={currentPage >= totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b91c1c] hover:text-[#b91c1c] active:scale-95 disabled:translate-y-0 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-inherit sm:flex-none"
                >Next</button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};