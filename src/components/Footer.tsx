import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Database,
  Lock
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-50 text-slate-700 font-sans border-t border-slate-200 pb-24 lg:pb-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP SECTION: BRAND & LINKS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-200">
          
          {/* BRAND INFO */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2.5 rounded-2xl text-white shadow-md shadow-red-200">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="font-black tracking-tight text-slate-900 text-lg uppercase italic block">
                  SECURE-VOTE APP
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Laikipia University
                </span>
              </div>
            </div>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md">
              A trusted, secure online voting system built for campus elections. Protected by blockchain technology on Ethereum Sepolia to ensure safe and transparent student choices.
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <Database size={14} className="text-red-600" />
                <span>Sepolia Network</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <Lock size={14} className="text-emerald-600" />
                <span>Encrypted Ballots</span>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Quick Links</h4>
            <ul className="space-y-2.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <li>
                <Link to="/" className="hover:text-red-600 transition flex items-center gap-1">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/results" className="hover:text-red-600 transition flex items-center gap-1">
                  Election Results
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-red-600 transition flex items-center gap-1">
                  About System
                </Link>
              </li>
              <li>
                <Link to="/download" className="hover:text-red-600 transition flex items-center gap-1 text-red-600">
                  Download Mobile App
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT & SUPPORT */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Contact Support</h4>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="text-red-600 shrink-0" />
                <span>Laikipia University, Nyahururu, Kenya</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-red-600 shrink-0" />
                <span>support@securevote.laikipia.ac.ke</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-red-600 shrink-0" />
                <span>+254 700 000 000</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & SOCIALS */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Laikipia University E-Voting System. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-slate-600">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-xs">
              <Github size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-xs">
              <Twitter size={16} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition shadow-xs">
              <Linkedin size={16} />
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};