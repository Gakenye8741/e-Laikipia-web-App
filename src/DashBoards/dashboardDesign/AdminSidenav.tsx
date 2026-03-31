import React from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  Settings2,
  Vote,
  Users,
  UserCircle,
  GitGraph,
  LayoutDashboard,
} from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { MdAccountBox, MdBallot, MdEmojiPeople } from "react-icons/md";
import { clearCredentials } from "../../features/Auth/AuthSlice";

// --- TYPES & INTERFACES ---
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface AdminSideNavProps {
  onNavItemClick?: () => void;
}

/**
 * Updated NavItems to strictly match the Router children paths.
 * Note: These are relative paths to the parent '/admin' route.
 */
const navItems: NavItem[] = [
  { name: "Analytics", path: "Analytics", icon: <GitGraph size={20} /> },
  { name: "Create Accounts", path: "create-accounts", icon: <MdAccountBox size={20} /> },
  { name: "Manage Users", path: "Manage-Users", icon: <Users size={20} /> },
  { name: "Manage Elections", path: "AllElections", icon: <Vote size={20} /> },
  { name: "Manage Positions", path: "Manage-positions", icon: <MdBallot size={20} /> },
  { name: "Candidate Applications", path: "Manage-Applications", icon: <UserCircle size={20} /> },
   { name: "Manage Notifications", path: "AllNotifications", icon: <UserCircle size={20} /> },
  { name: "Manage Candidates", path: "Manage-Candidates", icon: <MdEmojiPeople size={20} /> },
  { name: "System Settings", path: "profile", icon: <Settings2 size={20} /> },
];

export const AdminSideNav: React.FC<AdminSideNavProps> = ({ onNavItemClick }) => {
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    localStorage.removeItem('user');
    toast.success("Admin Session Ended", {
      style: { background: '#ffffff', color: '#b91c1c', border: '1px solid #fee2e2' }
    });
    onNavItemClick?.();
  };

  return (
    <aside className="h-full w-full flex flex-col bg-white text-slate-600 overflow-hidden">
      
      {/* BRANDING: UNIVERSITY LOGO STYLE */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#b91c1c] rounded-xl shadow-lg shadow-red-100">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
              Voter<span className="text-[#b91c1c]">Core</span>
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              University Admin
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SECTION */}
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
            {/* Active Side Indicator */}
            {({ isActive }) => (
              <>
                <span className={`absolute left-0 top-4 bottom-4 w-1 bg-[#b91c1c] rounded-r-full transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`} />
                
                <span className="group-hover:scale-110 transition-transform duration-200">
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

      {/* FOOTER SECTION */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#b91c1c] to-[#7f1d1d] flex items-center justify-center text-white font-black text-sm shadow-md">
            AD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black text-slate-800 uppercase truncate">System Admin</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Authorized</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-red-100 text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-all w-full text-sm font-black uppercase tracking-tighter shadow-sm"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSideNav;