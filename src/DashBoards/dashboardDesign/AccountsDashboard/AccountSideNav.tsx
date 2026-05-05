import React from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  ShieldCheck,
  UserCheck,
  Wallet,
  Receipt,
  BadgeDollarSign,
  History,
  LayoutDashboard,
  Scale
} from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { MdBallot } from "react-icons/md";
import { clearCredentials } from "../../../features/Auth/AuthSlice";

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

interface AccountantSideNavProps {
  onNavItemClick?: () => void;
}

/**
 * 🏛️ UNIVERSITY TREASURY NAVIGATION GROUPS
 * Organized by Revenue Oversight and Financial Clearance.
 */
const navGroups: NavGroup[] = [
  {
    groupName: "Financial Oversight",
    items: [
      { name: "Treasury Analytics", path: "Analytics", icon: <LayoutDashboard size={18} /> },
      { name: "Election Levies", path: "AllElections", icon: <Receipt size={18} /> },
      { name: "Position Dues", path: "Manage-positions", icon: <MdBallot size={18} /> },
    ],
  },
  {
    groupName: "Clearance Operations",
    items: [
      { name: "Aspirant Clearance", path: "Manage-Applications", icon: <BadgeDollarSign size={18} /> },
      { name: "Verified Aspirants", path: "Manage-Candidates", icon: <UserCheck size={18} /> },
      { name: "Manage Appeals", path: "Manage-Appeals", icon: <Scale size={18} /> },
    ],
  },
  ];

export const AccountSideNav: React.FC<AccountantSideNavProps> = ({ onNavItemClick }) => {
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    dispatch(clearCredentials());
    localStorage.removeItem('user');
    toast.success("Accounts Session Terminated", {
      style: { background: '#ffffff', color: '#b91c1c', border: '1px solid #fee2e2' }
    });
    onNavItemClick?.();
  };

  return (
    /**
     * FIXED POSITIONING: 
     * 'fixed top-16' ensures it stays pinned below your fixed navbar.
     * 'z-40' keeps it above content but below navbar (usually z-50).
     */
    <aside className="fixed left-0 top-16 bottom-0 w-72 flex flex-col bg-white text-slate-600 border-r border-slate-100 z-40 overflow-hidden">
      
      {/* 🏛️ UNIVERSITY BRANDING: TREASURY OFFICE */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#b91c1c] rounded-xl shadow-lg shadow-red-100">
            <Wallet size={22} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
              Treasury<span className="text-[#b91c1c]">Office</span>
            </h4>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Financial Clearance Unit
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 NAVIGATION SECTION - Scrollable internal area */}
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
                    
                    <span className={`transition-transform duration-200 ${isActive ? "text-[#b91c1c] scale-110" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-800"}`}>
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

      {/* 🛡️ FOOTER: ACCOUNTANT STATUS */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200 mb-4 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#b91c1c] to-[#7f1d1d] flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black text-slate-800 uppercase truncate">Accountant</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">System Auditing</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-red-100 text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white transition-all w-full text-sm font-black uppercase tracking-tighter shadow-sm"
        >
          <LogOut size={16} />
          <span>Exit Ledger</span>
        </button>
      </div>
    </aside>
  );
};

export default AccountSideNav;