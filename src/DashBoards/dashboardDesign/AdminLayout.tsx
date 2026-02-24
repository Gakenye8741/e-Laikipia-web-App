import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AdminSideNav } from "./AdminSidenav";


export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // University Branding Colors
  const PRIMARY_RED = "#b91c1c";

  return (
    /* Main Container: University White/Light Gray background */
    <div className="flex h-screen bg-white text-slate-800 relative font-sans overflow-hidden">
      
      {/* MOBILE TRIGGER - University Red Glow */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[999] p-4 bg-[#b91c1c] text-white rounded-full shadow-[0_0_20px_rgba(185,28,28,0.4)] border border-[#b91c1c]/50 active:scale-90 transition-all"
        >
          <Menu size={24} strokeWidth={3} />
        </button>
      )}

      {/* DESKTOP SIDEBAR - Matches Dashboard Aesthetic */}
      <aside className="hidden lg:block w-72 h-full fixed top-0 left-0 z-30 border-r border-slate-100 bg-white shadow-sm">
        <AdminSideNav />
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {sidebarOpen && (
        <>
          {/* Overlay - z-[1000] ensures it covers the fixed top nav */}
          <div 
            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />

          {/* Sidebar Panel - University Style */}
          <aside className="fixed top-0 left-0 z-[1001] w-[80%] max-w-[300px] h-full bg-white shadow-2xl lg:hidden transform transition-transform duration-300 border-r border-slate-200">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 z-[1002] p-2 text-slate-400 hover:text-[#b91c1c] transition-colors"
            >
              <X size={24} />
            </button>
            <AdminSideNav onNavItemClick={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:ml-72 bg-slate-50 min-h-screen">
        {/* SPACER FOR FIXED NAV: 
            Adjust padding to match your specific Navbar height if necessary.
        */}
        <div className="pb-20 max-w-7xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};