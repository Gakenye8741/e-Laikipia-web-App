import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X, School } from "lucide-react";
import DeanSchoolsSideNav from "./Dean_sSchools_SideNav";
export const DeanSchoolsLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /* Main Container: Professional Gray/White Aesthetic */
    <div className="flex h-screen bg-white text-slate-800 relative font-sans overflow-hidden">
      
      {/* MOBILE TRIGGER - Institutional Red Glow */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-[999] p-4 bg-[#b91c1c] text-white rounded-full shadow-[0_0_20px_rgba(185,28,28,0.4)] border border-[#b91c1c]/50 active:scale-90 transition-all flex items-center justify-center"
        >
          <Menu size={24} strokeWidth={3} />
        </button>
      )}

      {/* DESKTOP SIDEBAR - Dean of Schools Registry Style */}
      <aside className="hidden lg:flex flex-col w-72 h-full fixed top-0 left-0 z-30 border-r border-slate-100 bg-white shadow-sm">
        {/* Header Branding for Sidebar */}
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-xl">
              <School size={20} className="text-[#b91c1c]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Portal</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">
            Dean of <span className="text-[#b91c1c]">Schools</span>
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <DeanSchoolsSideNav />
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm lg:hidden" 
            onClick={() => setSidebarOpen(false)} 
          />

          {/* Sidebar Panel */}
          <aside className="fixed top-0 left-0 z-[1001] w-[80%] max-w-[300px] h-full bg-white shadow-2xl lg:hidden transform transition-transform duration-300 border-r border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
               <h2 className="text-sm font-black text-slate-900 uppercase italic">School Registry</h2>
               <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-[#b91c1c] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DeanSchoolsSideNav onNavItemClick={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto lg:ml-72 bg-[#F8FAFC] min-h-screen">
        {/* Top Header Bar (Optional spacer/header) */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 hidden lg:flex justify-end items-center">
           <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Session Live</span>
           </div>
        </div>

        {/* Content Container */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};