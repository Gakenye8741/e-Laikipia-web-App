import { useState, useEffect } from "react";
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
  BarChart3, 
  Download
} from "lucide-react";

import "./animate.css";
import { MdDashboard } from "react-icons/md";

export const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  const user = useSelector((state: RootState) => state.auth.user?.user);
  const Name = user?.name;
  const userRole = user?.role; 

  /* ================= ROLE CHECKING ================= */
  const isSchoolDean = userRole?.startsWith("Dean_of_") && userRole !== "Dean_of_Students";
  const isVoter = userRole?.toLowerCase() === "voter";
  const isAccountant = userRole === "Accountants" || userRole === "Accounts";

  const assignedSchool = isSchoolDean 
    ? userRole?.replace("Dean_of_", "").replace(/_/g, " ") 
    : null;

  const isActive = (path: string) =>
    location.pathname === path ? "text-red-600 font-extrabold border-b-2 border-red-600 pb-1" : "text-slate-600 hover:text-red-600";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b ${
          scrolled 
            ? "bg-white/90 backdrop-blur-md border-slate-200/80 shadow-sm py-3" 
            : "bg-slate-50/80 backdrop-blur-sm border-slate-200/40 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* LOGO & APP NAME */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-red-600 p-2 rounded-xl text-white shadow-md shadow-red-200 group-hover:scale-105 transition-transform flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-slate-900 text-sm sm:text-base uppercase italic select-none">
                SECURE-VOTE APP
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Laikipia University</span>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION MENU (ALL 6 TABS) */}
          <nav className="hidden lg:flex items-center">
            <ul className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
              <li>
                <Link className={`${isActive("/")} transition-colors flex items-center gap-1.5`} to="/">
                  <Home size={15} /> Home
                </Link>
              </li>
              <li>
                <Link className={`${isActive("/results")} transition-colors flex items-center gap-1.5`} to="/results">
                  <BarChart3 size={15} /> Results
                </Link>
              </li>
              <li>
                <Link className={`${isActive("/about")} transition-colors flex items-center gap-1.5`} to="/about">
                  <Info size={15} /> About
                </Link>
              </li>
              <li>
                <Link className={`${isActive("/contact")} transition-colors flex items-center gap-1.5`} to="/contact">
                  <Phone size={15} /> Contact
                </Link>
              </li>
              <li>
                <Link className={`${isActive("/developer")} transition-colors flex items-center gap-1.5`} to="/developer">
                  <Code size={15} /> Developer
                </Link>
              </li>
              <li>
                <Link className={`${isActive("/download")} transition-colors flex items-center gap-1.5`} to="/download">
                  <Download size={15} /> Download App
                </Link>
              </li>
            </ul>
          </nav>

          {/* USER ACCOUNT OR LOGIN */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Link 
                to="/login" 
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-600 transition shadow-sm flex items-center gap-2"
              >
                <LogIn size={15} /> Login Portal
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="flex items-center gap-3 cursor-pointer group bg-white border border-slate-200/80 px-3 py-2 rounded-2xl shadow-xs hover:border-red-600 transition">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[120px]">{Name}</p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                    <ChevronDown size={16} />
                  </div>
                </label>

                <ul tabIndex={0} className="dropdown-content mt-3 z-[110] p-2 shadow-xl bg-white border border-slate-100 rounded-2xl w-64 overflow-hidden">
                  <li className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isVoter ? "Voter Menu" : "Management Portals"}
                    </p>
                  </li>

                  {isVoter ? (
                    <li className="px-4 py-4 flex items-center gap-3 bg-slate-50 rounded-xl m-1">
                      <UserX size={18} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Voter Access</p>
                        <p className="text-[11px] text-slate-500 leading-tight">Ready to cast ballot.</p>
                      </div>
                    </li>
                  ) : (
                    <>
                      {userRole === "Dean_of_Students" ? (
                        <li>
                          <Link to="/dean-student-dashboard/" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl transition font-bold text-xs uppercase tracking-wider">
                            <GraduationCap size={16} className="text-red-600" /> Students Dashboard
                          </Link>
                        </li>
                      ) : isSchoolDean ? (
                        <li>
                          <Link to="/dean-school-dashboard/" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl transition font-bold text-xs uppercase tracking-wider">
                            <School size={16} className="text-red-600" /> Dean: {assignedSchool}
                          </Link>
                        </li>
                      ) : isAccountant ? (
                        <li>
                          <Link to="/accounts-dashboard/" className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition font-bold text-xs uppercase tracking-wider">
                            <Wallet size={16} className="text-emerald-600" /> Accounts Dashboard
                          </Link>
                        </li>
                      ) : (
                        <li>
                          <Link to="/admindashboard/AllElections" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl transition font-bold text-xs uppercase tracking-wider">
                            <MdDashboard size={16} className="text-slate-500" /> System Management
                          </Link>
                        </li>
                      )}
                    </>
                  )}

                  <li className="mt-1 border-t border-slate-100 pt-1">
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition font-bold text-xs uppercase tracking-wider"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION (ALL 6 TABS INCLUDED) */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-lg bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-[100] px-2 py-2">
        <ul className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-wider">
          <li>
            <Link to="/" className={`flex flex-col items-center gap-0.5 transition ${location.pathname === "/" ? "text-white" : "hover:text-slate-200"}`}>
              <Home size={15} /> Home
            </Link>
          </li>
          <li>
            <Link to="/results" className={`flex flex-col items-center gap-0.5 transition ${location.pathname === "/results" ? "text-white" : "hover:text-slate-200"}`}>
              <BarChart3 size={15} /> Results
            </Link>
          </li>
          <li>
            <Link to="/about" className={`flex flex-col items-center gap-0.5 transition ${location.pathname === "/about" ? "text-white" : "hover:text-slate-200"}`}>
              <Info size={15} /> About
            </Link>
          </li>
          
          {/* SPECIAL CENTER APP DOWNLOAD TAB */}
          <li>
            <Link 
              to="/download" 
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/40 hover:bg-red-700 transition transform -translate-y-2 border-2 border-slate-900"
            >
              <Download size={16} className="animate-bounce" />
              <span className="text-[7px] font-black tracking-widest">App</span>
            </Link>
          </li>

          <li>
            <Link to="/contact" className={`flex flex-col items-center gap-0.5 transition ${location.pathname === "/contact" ? "text-white" : "hover:text-slate-200"}`}>
              <Phone size={15} /> Contact
            </Link>
          </li>
          <li>
            <Link to="/developer" className={`flex flex-col items-center gap-0.5 transition ${location.pathname === "/developer" ? "text-white" : "hover:text-slate-200"}`}>
              <Code size={15} /> Dev
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};