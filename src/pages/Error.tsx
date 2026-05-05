import { Link, useRouteError } from "react-router-dom";
import { ArrowLeft, LifeBuoy, ShieldAlert, Home } from 'lucide-react';

function Error() {
  const error: any = useRouteError();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full">
        {/* Decorative System Element */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
              <ShieldAlert size={48} className="text-red-600" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-4 border border-red-100">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-[10px] font-black text-red-700 uppercase tracking-[0.3em]">
              System Error {error?.status || "404"}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic mb-4">
            Link <span className="text-red-700">Severed</span>
          </h1>

          {/* Error Message */}
          <p className="text-base md:text-lg font-medium text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
            The requested registry node is currently unavailable or has been moved to a restricted directory.
          </p>

          {/* Technical Detail Card */}
          <div className="bg-slate-900 rounded-[1.5rem] p-4 mb-10 inline-block border-b-4 border-red-600 shadow-lg">
            <code className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <span className="text-slate-500">Log Output:</span> 
              {error?.statusText || error?.message || "RESOURCE_NOT_FOUND"}
            </code>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <Home size={16} /> Return to Home
            </Link>
            
            <Link 
              to="/contact" 
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LifeBuoy size={16} className="text-red-600" /> Support Desk
            </Link>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="mt-16 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
                LUSA Election Security Framework 2026
            </p>
        </div>
      </div>
    </div>
  );
}

export default Error;