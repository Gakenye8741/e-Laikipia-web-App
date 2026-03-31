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
  ShieldCheck
} from "lucide-react";

import Typed from "typed.js";
import "./animate.css";
import { MdDashboard } from "react-icons/md";

export const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const typedRef = useRef<HTMLSpanElement>(null);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  // Fixed path based on your Redux usage in previous screens
  const Name = useSelector((state: RootState) => state.auth.user?.user?.name);

  const isActive = (path: string) =>
    location.pathname === path ? "text-[#b91c1c] font-black italic underline underline-offset-8 decoration-2" : "text-slate-600";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [menuOpen]);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "LAIKIPIA E-VOTE",
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
    setMenuOpen(false);
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

          {/* CENTER: DESKTOP MENU (REGISTRY STYLE) */}
          <div className="navbar-center hidden lg:flex">
            <ul className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.15em]">
              <li><Link className={`${isActive("/")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/"><Home size={14} /> Home</Link></li>
              <li><Link className={`${isActive("/about")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/about"><Info size={14} /> About</Link></li>
              <li><Link className={`${isActive("/contact")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/contact"><Phone size={14} /> Contact</Link></li>
              <li><Link className={`${isActive("/developer")} hover:text-[#b91c1c] transition-colors flex items-center gap-2`} to="/developer"><Code size={14} /> Developer</Link></li>
            </ul>
          </div>

          {/* RIGHT: THEME + AUTH */}
          <div className="navbar-end flex items-center gap-4">

            {!isAuthenticated ? (
              <Link to="/login" className="px-5 py-2.5 bg-[#1e293b] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#b91c1c] transition-all shadow-lg active:scale-95 flex items-center gap-2">
                <LogIn size={14} /> Admin Access
              </Link>
            ) : (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="flex items-center gap-3 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">User Name</p>
                    <p className="text-sm font-black text-slate-900 uppercase italic">{Name}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-[#b91c1c] group-hover:bg-[#b91c1c] group-hover:text-white transition-all shadow-sm">
                    <ChevronDown size={18} />
                  </div>
                </label>
                <ul tabIndex={0} className="dropdown-content mt-4 z-[110] p-2 shadow-2xl bg-white border border-slate-100 rounded-2xl w-60 overflow-hidden">
                  <li className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Session Management</p>
                  </li>
                  <li>
                    <Link to="/admindashboard/AllElections" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-slate-700 hover:text-[#b91c1c] rounded-xl transition-all font-bold text-xs uppercase tracking-tight">
                       <MdDashboard size={18} /> Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all font-bold text-xs uppercase tracking-tight">
                      <LogOut size={18} /> Terminate Session
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (REGISTRY THEME) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-[100] px-4 py-3">
        <ul className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <li><Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === "/" ? "text-white" : ""}`}><Home size={18} />Home</Link></li>
          <li><Link to="/about" className={`flex flex-col items-center gap-1 ${location.pathname === "/about" ? "text-white" : ""}`}><Info size={18} />About</Link></li>
          <li><Link to="/contact" className={`flex flex-col items-center gap-1 ${location.pathname === "/contact" ? "text-white" : ""}`}><Phone size={18} />Contact</Link></li>
          <li><Link to="/developer" className={`flex flex-col items-center gap-1 ${location.pathname === "/developer" ? "text-white" : ""}`}><Code size={18} />Dev</Link></li>
        </ul>
      </div>
    </>
  );
};