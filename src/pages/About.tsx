import React from 'react';
import { BarChart3, CheckCircle, Lock } from "lucide-react";
import { MdVerifiedUser, MdHistoryEdu, MdBallot } from "react-icons/md";
import { Navbar } from "../components/Navbar";

const AboutPage = () => {
  const stats = [
    { 
      label: "Protocol Status", 
      value: "Active", 
      color: "text-emerald-600", 
      border: "border-l-emerald-600" 
    },
    { 
      label: "Ledger Network", 
      value: "Ethereum Sepolia", 
      color: "text-red-700", 
      border: "border-l-red-600" 
    },
    { 
      label: "Encryption", 
      value: "AES-256", 
      color: "text-slate-900", 
      border: "border-l-slate-800" 
    },
    { 
      label: "System Health", 
      value: "Optimized", 
      color: "text-emerald-500", 
      border: "border-l-slate-400", 
      isStatus: true 
    },
  ];

  const specifications = [
    {
      icon: <Lock size={14}/>,
      title: "Blockchain Anchoring",
      description: "Unlike traditional databases that can be edited by administrators, Laikipia E-Vote utilizes the Ethereum Sepolia Testnet. Every cast ballot generates a unique cryptographic hash, ensuring that your vote remains exactly as you cast it.",
      highlight: "Ethereum Sepolia Testnet"
    },
    {
      icon: <BarChart3 size={14}/>,
      title: "Voter Classification",
      description: "The registry system handles complex university hierarchies. Whether you are a Regular Voter restricted to your school reps, or a Delegate with expanded voting tiers, our system logic enforces permissions at the protocol level.",
      highlight: "Regular Voter"
    },
    {
      icon: <MdVerifiedUser size={14}/>,
      title: "Transparent Auditability",
      description: "Integrity is built-in. Any student can verify their transaction on the public blockchain explorer, cross-referencing their digital receipt against the official registry records to confirm the validity of the final tally.",
      highlight: "Transparent Auditability"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      {/* Main Content Container - Added pt-24 to offset the fixed Navbar */}
      <main className="p-4 md:p-8 pt-24 lg:pt-32 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <header className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">
                  System Information
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
                About <span className="text-red-700">Laikipia E-Vote</span>
              </h1>
            </div>
          </header>

          {/* System Stats Section */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm border-l-4 ${stat.border}`}>
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{stat.label}</p>
                <p className={`text-xl md:text-2xl font-black ${stat.color} ${stat.isStatus ? 'text-[10px]' : ''}`}>
                  {stat.isStatus && '● '} {stat.value}
                </p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar: Mission Statement */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-28 space-y-6">
                <div className="p-5 bg-red-50 rounded-[1.5rem] flex items-center justify-center">
                  <MdHistoryEdu className="text-red-700 text-5xl" />
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-[11px] font-black text-red-700 uppercase tracking-[0.2em]">Our Core Mission</h2>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                    "To digitize the democratic process at Laikipia University through immutable blockchain technology and transparent registry management."
                  </p>
                  
                  <div className="pt-4 space-y-3">
                    {["Tamper-Proof Ledger", "Real-Time Verification", "Student Privacy First"].map((text) => (
                      <div key={text} className="flex items-center gap-2">
                        <CheckCircle className="text-emerald-500" size={14} />
                        <span className="text-[9px] font-black uppercase text-slate-700">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content: Specifications Feed */}
            <article className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <MdBallot className="text-red-700" size={24} /> System Specifications
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {specifications.map((spec, index) => (
                    <div key={index} className="p-7 hover:bg-red-50/30 transition-all group relative border-l-[6px] border-transparent hover:border-red-600">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-slate-900 text-white p-2 rounded-lg group-hover:bg-red-700 transition-colors">
                          {spec.icon}
                        </span>
                        <h3 className="text-base font-black text-slate-900 uppercase italic tracking-tight">
                          {spec.title}
                        </h3>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 leading-loose ml-0 md:ml-11">
                        {spec.description.split(spec.highlight).map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {part}
                            {i !== arr.length - 1 && (
                              <span className="text-red-700 font-black">{spec.highlight}</span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer: Tech Stack */}
                <footer className="p-8 bg-slate-50 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                      Secured Technology Stack
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                      {["PostgreSQL", "Express", "React", "Node.js", "Ethereum","React Native","etc...."].map((tech) => (
                        <span key={tech} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-800 uppercase shadow-sm hover:border-red-600 transition-colors">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        © 2026 E-Laikipia Vote
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
            </article>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;