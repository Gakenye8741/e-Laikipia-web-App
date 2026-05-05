import React from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileBadge,
  MessageSquareQuote,
  Megaphone,
  Fingerprint,
  Users2,
  ListChecks,
  Scale,
  History,
} from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { clearCredentials } from "../../features/Auth/AuthSlice";

// --- TYPES & INTERFACES ---
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

interface AdminSideNavProps {
  onNavItemClick?: () => void;
}

/**
 * GROUPED NAVIGATION ITEMS
 * Organized by logic for better UX
 */
const navGroups: NavGroup[] = [
  {
    groupName: "Overview",
    items: [
      { name: "Analytics", path: "Analytics", icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    groupName: "User Management",
    items: [
      { name: "Create Accounts", path: "create-accounts", icon: <ShieldCheck size={18} /> },
      { name: "Manage Users", path: "Manage-Users", icon: <Users size={18} /> },
    ],
  },
  {
    groupName: "Election Operations",
    items: [
      { name: "Manage Elections", path: "AllElections", icon: <ListChecks size={18} /> },
      { name: "Manage Positions", path: "Manage-positions", icon: <FileBadge size={18} /> },
      { name: "Manage Coalitions", path: "Manage-Coalition", icon: <Users2 size={18} /> },
    ],
  },
  {
    groupName: "Candidate Processing",
    items: [
      { name: "Applications", path: "Manage-Applications", icon: <MessageSquareQuote size={18} /> },
      { name: "Manage Candidates", path: "Manage-Candidates", icon: <Fingerprint size={18} /> },
      { name: "Manage Appeals", path: "Manage-appeals", icon: <Scale size={18} /> },
    ],
  },
  {
    groupName: "Governance",
    items: [
      { name: "Manage Votes", path: "Manage-Votes", icon: <History size={18} /> },
      { name: "Notifications", path: "AllNotifications", icon: <Megaphone size={18} /> },
    ],
  },
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
    <aside className="h-full w-full flex flex-col bg-white text-slate-600 border-r border-slate-100 overflow-hidden">
      
      {/* BRANDING */}
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
      <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <h5 className="px-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
              {group.groupName}
            </h5>
            
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavItemClick}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-5 py-3 rounded-xl transition-all duration-200 group relative font-bold text-[13px] ${
                    isActive 
                      ? "bg-red-50 text-[#b91c1c]" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`absolute left-0 top-3 bottom-3 w-1 bg-[#b91c1c] rounded-r-full transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`} />
                    
                    <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                      {item.icon}
                    </span>
                    
                    <span className="tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
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