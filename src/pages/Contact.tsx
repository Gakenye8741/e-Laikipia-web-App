import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, ShieldCheck } from "lucide-react";
import { MdSupportAgent, MdAlternateEmail, MdOutlineContactSupport } from "react-icons/md";
import { Navbar } from "../components/Navbar";
import { toast } from "sonner";

const ContactPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating a registry sync
    setTimeout(() => {
      setLoading(false);
      toast.success("Message Transmitted to Registry");
    }, 1500);
  };

  const contactMethods = [
    { 
      icon: <Mail size={18} className="text-red-700" />, 
      label: "Official Email", 
      value: "secure.ac.ke",
      sub: "General Inquiries"
    },
    { 
      icon: <Phone size={18} className="text-red-700" />, 
      label: "Support Line", 
      value: "+254 700 000 000",
      sub: "Technical Emergencies"
    },
    { 
      icon: <MapPin size={18} className="text-red-700" />, 
      label: "Physical Office", 
      value: "Electrol Commission // Computing and informatics",
      sub: "Main Campus, Nyahururu"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="p-4 md:p-8 pt-24 lg:pt-32 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <header className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">
                  Communication center
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                Support <span className="text-red-700">Registry</span>
              </h1>
            </div>

          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar: Official Channels */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-28 space-y-8">
                <div className="p-5 bg-red-50 rounded-[1.5rem] flex items-center justify-center">
                  <MdSupportAgent className="text-red-700 text-5xl" />
                </div>

                <div className="space-y-6">
                  {contactMethods.map((method, i) => (
                    <div key={i} className="group border-b border-slate-50 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-1">
                        {method.icon}
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {method.label}
                        </p>
                      </div>
                      <p className="text-sm font-black text-slate-900 ml-7 group-hover:text-red-700 transition-colors">
                        {method.value}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 ml-7 italic">
                        {method.sub}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-700">
                    <Globe size={14} className="text-emerald-500" />
                    <span>Secure Vote App: <span className="text-emerald-600">Online</span></span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content: Message Transmission Form */}
            <article className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <MdOutlineContactSupport className="text-red-700" size={24} /> New Message ?
                  </h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority: Standard</span>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.1em]">Full Name / Identity</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Gakenye Ndiritu" 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none transition-all mt-1" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.1em]">Student / Staff Email</label>
                      <div className="relative mt-1">
                        <input 
                          required
                          type="email" 
                          placeholder="name@laikipia.ac.ke" 
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none transition-all" 
                        />
                        <MdAlternateEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.1em]">Subject of Inquiry</label>
                    <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 mt-1 outline-none cursor-pointer focus:ring-2 focus:ring-red-500">
                      <option>Blockchain Verification Issues</option>
                      <option>Voter Registration Error</option>
                      <option>Candidate Approval Query</option>
                      <option>Other Technical Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-[0.1em]">Message Payload</label>
                    <textarea 
                      required
                      rows={5} 
                      placeholder="Describe the issue in detail..." 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-red-600 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none transition-all mt-1 resize-none"
                    />
                  </div>

                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full py-5 bg-[#b91c1c] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="animate-pulse">Encrypting & Sending...</span>
                    ) : (
                      <>
                        <Send size={16} /> Transmit Message
                      </>
                    )}
                  </button>
                </form>

                {/* Registry Notice Footer */}
                <footer className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Automated Response System Enabled
                    </p>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 max-w-md mx-auto leading-relaxed uppercase tracking-tighter">
                    Messages are logged into the system registry. A technical agent from the Secure Vote  // Assigned ICT staff will respond within 24 operational hours.
                  </p>
                </footer>
              </div>
            </article>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;