import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { MdSecurity, MdCode } from "react-icons/md";
import { Database, ShieldCheck, Cpu, Terminal, Fingerprint, Activity, ChevronRight, Globe } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F8FAFC] border-t-4 border-red-700 pt-20 pb-10 px-6 font-sans relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-slate-900 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-16">
          
          {/* 1. BRAND & ARCHITECT IDENTITY */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-3 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform">
                <Terminal className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  E-Laikipia <span className="text-red-700 text-sm not-italic align-top">VOTE</span>
                </h3>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-[12px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider max-w-sm italic border-l-4 border-red-600 pl-6">
                "Engineering absolute integrity into university governance through immutable ledger consensus and high-performance architecture."
              </p>
              
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm group hover:border-red-600 transition-all">
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-700 transition-colors">
                  <MdCode className="text-red-700 group-hover:text-white" size={20} /> 
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Fullstack Software Engineer</p>
                  <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">Gakenye Ndiritu</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:border-red-600 hover:text-red-700 transition-all hover:-translate-y-1 shadow-sm"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. NAVIGATION HUD */}
         <div className="md:col-span-3">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em] mb-10 flex items-center gap-2">
    <Fingerprint size={14} className="text-red-700" /> SYSTEM_MENU
              </h4>
           <ul className="space-y-5">
    {/* 1. HOME NODE */}
    <li>
      <Link 
        to="/" 
        className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-red-700 transition-all flex justify-between items-center group w-full border-b border-transparent hover:border-red-100 pb-1"
      >
        <span>01 // HOME</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    </li>

    {/* 2. ELECTIONS/VOTING TERMINAL */}
    <li>
      <Link 
        to="/about" 
        className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-red-700 transition-all flex justify-between items-center group w-full border-b border-transparent hover:border-red-100 pb-1"
      >
        <span>02 // About Us</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    </li>

    {/* 3. ANALYTICS NODE */}
    <li>
      <Link 
        to="/contact" 
        className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-red-700 transition-all flex justify-between items-center group w-full border-b border-transparent hover:border-red-100 pb-1"
      >
        <span>03 //Contact us</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    </li>

    {/* 4. ABOUT PROTOCOL */}
    <li>
      <Link 
        to="/developer" 
        className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-red-700 transition-all flex justify-between items-center group w-full border-b border-transparent hover:border-red-100 pb-1"
      >
        <span>04 // Developer</span>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    </li>
           </ul>
          </div>

          {/* 3. VERIFICATION TERMINAL (DARK MODE) */}
          <div className="md:col-span-4">
             <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden ring-8 ring-slate-100 h-full">
                <div className="absolute top-[-20%] right-[-10%] p-6 opacity-[0.03]">
                   <ShieldCheck size={200} />
                </div>
                
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Validation_Node</h4>
                  <div className="flex gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-700 animate-pulse"></span>
                    <span className="w-1 h-1 rounded-full bg-red-700 delay-75 animate-pulse"></span>
                    <span className="w-1 h-1 rounded-full bg-red-700 delay-150 animate-pulse"></span>
                  </div>
                </div>
                
                <div className="space-y-6 relative z-10">
                   <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors">
                      <div className="mt-1 p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                         <ShieldCheck size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-tight">Official Verification</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase italic leading-tight">Computing & Informatics Dept</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors">
                      <div className="mt-1 p-2 bg-red-600/20 rounded-xl text-red-600">
                         <Database size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-tight">Consensus Layer</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase italic leading-tight">Ethereum_Sepolia Net</p>
                      </div>
                   </div>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
                   <div className="flex items-center gap-2">
                     <Activity size={12} className="text-emerald-500" />
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Uptime: 99.98%</span>
                   </div>
                   <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase">
                      Status: Ready
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* BOTTOM METADATA BAR */}
        <div className="pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-slate-300" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                © {currentYear} <span className="text-red-700 italic">Gakenye Ndiritu</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-slate-300" />
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Stack: PERN + Solidity + React Native + .......
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all">
            <div className="p-1.5 bg-slate-900 rounded-lg">
               <MdSecurity className="text-white" size={14} />
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
              Authorized Deployer: <span className="text-red-700 italic">Gakenye Ndiritu-2026</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};