import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../App/store";
import { clearCredentials } from "../features/Auth/AuthSlice";

import { 
  Home, 
  LogIn, 
  LogOut, 
  ChevronDown, 
  Phone, 
  Info, 
  Code,
  ShieldCheck,
  GraduationCap,
  School,
  UserX,
  Wallet,
  BarChart3, // Added for Results icon
  DownloadIcon
} from "lucide-react";

import Typed from "typed.js";
import "./animate.css";
import { MdDashboard } from "react-icons/md";

export const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  const user = useSelector((state: RootState) => state.auth.user?.user);
  const Name = user?.name;
  const userRole = user?.role; 

  /* ================= ROLE PARSING LOGIC ================= */
  const isSchoolDean = userRole?.startsWith("Dean_of_") && userRole !== "Dean_of_Students";
  const isVoter = userRole?.toLowerCase() === "voter";
  const isAccountant = userRole === "Accountants" || userRole === "Accounts";

  const assignedSchool = isSchoolDean 
    ? userRole?.replace("Dean_of_", "").replace(/_/g, " ") 
    : null;

  const isActive = (path: string) =>
    location.pathname === path ? "text-[#b91c1c] font-black italic underline underline-offset-8 decoration-2" : "text-slate-600";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "SECURE-VOTE APP",
        "SECURE REGISTRY",
        "BLOCKCHAIN LEDGER"
      ],
      typeSpeed: 80,
      backSpeed: 40,
      cursorChar: "_",
      loop: true,
    });

    return () => typed.destroy();
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 border-b ${
          scrolled 
            ? "backdrop-blur-xl bg-white/80 border-slate-200 shadow-xl shadow-slate-200/40 py-1" 
            : "bg-[#F8FAFC] border-transparent py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto navbar px-4 lg:px-8">

          {/* LEFT: LOGO */}
          <div className="navbar-start">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#b91c1c] p-2 rounded-xl rotate-3 group-hover:rotate-0 transition-transform shadow-lg shadow-red-200">
                <ShieldCheck className="text-white h-5 w-5" />
              </div>
              <span 
                ref={typedRef} 
                className="font-black tracking-tighter text-slate-900 text-sm sm:text-base md:text-xl uppercase italic select-none" 
              />
            </Link>
          </div>

          {/* CENTER: DESKTOP MENU */}
          <div className="navbar-center hidden lg:flex">
            <ul className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.15em]">
              <li><Link className={`${isActive("/")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/"><Home size={14} /> Home</Link></li>
              {/* RESULTS TAB ADDED HERE */}
              <li><Link className={`${isActive("/results")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/results"><BarChart3 size={14} /> Results</Link></li>
              <li><Link className={`${isActive("/about")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/about"><Info size={14} /> About</Link></li>
              <li><Link className={`${isActive("/contact")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/contact"><Phone size={14} /> Contact</Link></li>
              <li><Link className={`${isActive("/developer")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/developer"><Code size={14} /> Developer</Link></li>
              <li><Link className={`${isActive("/download")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/download"><DownloadIcon size={14} /> Download App</Link></li>
            </ul>
          </div>

          {/* RIGHT: AUTH SECTION */}
          <div className="navbar-end flex items-center gap-4">

            {!isAuthenticated ? (
              <Link to="/login" className="px-5 py-2.5 bg-[#1e293b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#b91c1c] transition-all shadow-lg active:scale-95 flex items-center gap-2">
                <LogIn size={14} /> Admin Login
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
                      {isVoter 
                        ? "Verified Voter" 
                        : isAccountant 
                          ? "Treasury Officer"
                          : isSchoolDean 
                            ? `Dean: ${assignedSchool}` 
                            : userRole === "Dean_of_Students" 
                              ? "Students Dean" 
                              : "System Admin"}
                    </p>
                    <p className="text-sm font-black text-slate-900 uppercase italic">{Name}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${isVoter ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-red-50 border-red-100 text-[#b91c1c] group-hover:bg-[#b91c1c] group-hover:text-white'}`}>
                    <ChevronDown size={18} />
                  </div>
                </label>
                <ul tabIndex={0} className="dropdown-content mt-4 z-[110] p-2 shadow-2xl bg-white border border-slate-100 rounded-2xl w-64 overflow-hidden">
                  <li className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      {isVoter ? "Account Status" : "Secure Registry Portals"}
                    </p>
                  </li>

                  {/* DASHBOARD ROUTING */}
                  {isVoter ? (
                    <li className="px-4 py-4 flex items-center gap-3 bg-slate-50/50 rounded-xl m-1">
                        <UserX size={18} className="text-slate-300" />
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">Access Restricted</p>
                            <p className="text-[8px] font-medium text-slate-400 leading-tight">Voters cannot access management dashboards.</p>
                        </div>
                    </li>
                  ) : (
                    <>
                      {userRole === "Dean_of_Students" ? (
                        <li>
                          <Link to="/dean-student-dashboard/" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-700 hover:text-[#b91c1c] rounded-xl transition-all font-bold text-xs uppercase tracking-tight">
                             <GraduationCap size={18} className="text-[#b91c1c]" /> Students Dashboard
                          </Link>
                        </li>
                      ) : isSchoolDean ? (
                        <li>
                          <Link to="/dean-school-dashboard/" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-700 hover:text-[#b91c1c] rounded-xl transition-all font-bold text-xs uppercase tracking-tight">
                             <School size={18} className="text-[#b91c1c]" />Dean {assignedSchool} Portal
                          </Link>
                        </li>
                      ) : isAccountant ? (
                        <li>
                          <Link to="/accounts-dashboard/" className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition-all font-bold text-xs uppercase tracking-tight">
                             <Wallet size={18} className="text-emerald-600" /> Accounts Dashboard
                          </Link>
                        </li>
                      ) : (
                        <li>
                          <Link to="/admindashboard/AllElections" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl transition-all font-bold text-xs uppercase tracking-tight">
                             <MdDashboard size={18} className="text-slate-400" /> System Management
                          </Link>
                        </li>
                      )}
                    </>
                  )}

                  <li className="mt-1 border-t border-slate-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-red-400 hover:text-red-600 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest">
                      <LogOut size={16} /> Exit Registry
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-[100] px-4 py-3">
        <ul className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
          <li><Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === "/" ? "text-white" : ""}`}><Home size={18} />Home</Link></li>
          {/* RESULTS ADDED TO MOBILE */}
          <li><Link to="/results" className={`flex flex-col items-center gap-1 ${location.pathname === "/results" ? "text-white" : ""}`}><BarChart3 size={18} />Results</Link></li>
          <li><Link to="/about" className={`flex flex-col items-center gap-1 ${location.pathname === "/about" ? "text-white" : ""}`}><Info size={18} />About</Link></li>
          <li><Link to="/contact" className={`flex flex-col items-center gap-1 ${location.pathname === "/contact" ? "text-white" : ""}`}><Phone size={18} />Contact</Link></li>
          <li><Link to="/developer" className={`flex flex-col items-center gap-1 ${location.pathname === "/developer" ? "text-white" : ""}`}><Code size={18} />Dev</Link></li>
        </ul>
      </div>
    </>
  );
};