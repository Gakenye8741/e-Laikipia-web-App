import React from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  Settings2,
  Vote,
  GitGraph,
  GraduationCap,
  ShieldCheck,
  FileBadge,
  BellRing,
  CheckCircle2,
  ShieldAlert,
  Megaphone,
  UserCheck,
  User2,
  Gavel,
} from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { MdBallot, MdEmojiPeople } from "react-icons/md";
import { clearCredentials } from "../../../features/Auth/AuthSlice";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface DeanStudentSideNavProps {
  onNavItemClick?: () => void;
}

/**
 * 🏛️ DEAN OF STUDENTS NAVIGATION
 * Focused on: Oversight, Clearance, and Student Affairs.
 */
const navItems: NavItem[] = [
  { name: "Executive Summary", path: "Analytics", icon: <GitGraph size={20} /> },
  { name: "All Users", path: "manage-users", icon: <User2 size={20} /> },
  { name: "Aspirant Clearance", path: "Manage-Applications", icon: <FileBadge size={20} /> },
  { name: "Manage Appeals", path: "Manage-Appeals", icon: <Gavel size={20} /> },
  { name: "Verified Candidates", path: "Manage-Candidates", icon: <UserCheck size={20} /> },
  { name: "Elections", path: "AllElections", icon: <Vote size={20} /> },
  { name: "Election Positions", path: "Manage-positions", icon: <MdBallot size={20} /> },

];

export const DeanStudentSideNav: React.FC<DeanStudentSideNavProps> = ({ onNavItemClick }) => {
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    localStorage.removeItem('user');
    toast.success("Dean's Session Terminated", {
      style: { background: '#ffffff', color: '#b91c1c', border: '1px solid #fee2e2' }
    });
    onNavItemClick?.();
  };

  return (
    <aside className="h-full w-full flex flex-col bg-white text-slate-600 overflow-hidden border-r border-slate-100">
      
      {/* 🏛️ IDENTITY: OFFICE OF THE DEAN OF STUDENTS */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#b91c1c] rounded-xl shadow-lg shadow-red-100">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
              Dean<span className="text-[#b91c1c]">Office</span>
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Student Affairs Authority
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION SECTION */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavItemClick}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-200 group relative font-bold text-sm ${
                isActive 
                  ? "bg-red-50 text-[#b91c1c]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Line */}
                <span className={`absolute left-0 top-4 bottom-4 w-1 bg-[#b91c1c] rounded-r-full transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`} />
                
                <span className={`group-hover:scale-110 transition-transform duration-200 ${isActive ? "text-[#b91c1c]" : "text-slate-400 group-hover:text-slate-800"}`}>
                  {item.icon}
                </span>
                
                <span className="tracking-tight">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 🛡️ FOOTER: DEAN PROFILE & STATUS */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#b91c1c] to-[#7f1d1d] flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black text-slate-800 uppercase truncate">Dean of Students</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Session Secure</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-red-100 text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-all w-full text-sm font-black uppercase tracking-tighter shadow-sm"
        >
          <LogOut size={16} />
          <span>Exit Portal</span>
        </button>
      </div>
    </aside>
  );
};

export default DeanStudentSideNav;