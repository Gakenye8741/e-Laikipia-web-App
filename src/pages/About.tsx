import React from 'react';
import { BarChart3, CheckCircle, Lock, ShieldCheck, Cpu, Database, Server } from "lucide-react";
import { MdVerifiedUser, MdHistoryEdu, MdBallot, MdWorkspacePremium } from "react-icons/md";
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
      color: "text-red-600", 
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
      icon: <Lock size={16}/>,
      title: "Blockchain Anchoring & Immutability",
      description: "Unlike traditional databases that can be modified by administrators, Secure-Vote uses decentralized Solidity smart contracts on the Ethereum Sepolia Testnet. Every cast ballot generates a permanent cryptographic record, ensuring absolute data integrity and zero tampering.",
      highlight: "Ethereum Sepolia Testnet"
    },
    {
      icon: <BarChart3 size={16}/>,
      title: "Dual Election Types & Voter Classification",
      description: "The system supports both normal institutional polls (direct individual candidate voting for school representatives) and specialized delegate elections (where delegates vote for coalitions). Access permissions are strictly enforced at the protocol level.",
      highlight: "Delegate Elections"
    },
    {
      icon: <ShieldCheck size={16}/>,
      title: "Multi-Layered Security Architecture",
      description: "Enterprise-grade protection combines student RegNo/password verification, Helmet HTTP header hardening, rate limiting against DDoS attacks, HTTPS encryption, unique voting secret authorization codes, frontend biometric or PIN safeguards etc",
      highlight: "Multi-Layered Security"
    },
    {
      icon: <MdVerifiedUser size={16}/>,
      title: "Transparent Auditability & Real-Time Tallying",
      description: "Students can verify their transactions on the public blockchain explorer and cross-reference digital receipts. Votes are live-tallied as elections progress, eliminating human counting bottlenecks and delivering continuous results visibility.",
      highlight: "Transparent Auditability"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* HEADER SECTION */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            About <span className="text-red-600">Secure-Vote</span>
          </h1>
        </header>

        {/* STATS SECTION */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 ${stat.border}`}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-black ${stat.color} ${stat.isStatus ? 'text-sm font-bold' : ''}`}>
                {stat.isStatus && '● '} {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* INNOVATION AWARD CALLOUT */}
        <section className="mb-10 bg-gradient-to-br from-red-50/80 to-white p-6 sm:p-8 rounded-3xl border border-red-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-red-600 text-white rounded-2xl shrink-0 shadow-md">
            <MdWorkspacePremium size={36} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-100/80 px-3 py-1 rounded-full border border-red-200">
              Award-Winning Innovation
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              2nd Place Winner — Laikipia University Innovation Day
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Recognized and honored for designing an advanced, decentralized blockchain-integrated electronic voting platform engineered to secure, modernize, and automate campus elections.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR: MISSION STATEMENT */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm sticky top-28 space-y-6">
              <div className="p-6 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                <MdHistoryEdu className="text-red-600 text-5xl" />
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest">Our Core Mission</h2>
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                  "To solve campus voter disenfranchisement, long queues, and manual counting errors by modernizing elections with secure blockchain technology and mobile convenience."
                </p>
                
                <div className="pt-4 space-y-3">
                  {[
                    "Tamper-Proof Ledger", 
                    "Multi-Layered Security", 
                    "Off-Campus Voting Access", 
                    "Real-Time Verification"
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-2.5">
                      <CheckCircle className="text-emerald-500 shrink-0" size={16} />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT: SYSTEM SPECIFICATIONS */}
          <article className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <MdBallot className="text-red-600" size={24} /> System Specifications & Security
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {specifications.map((spec, index) => (
                  <div key={index} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-all border-l-4 border-transparent hover:border-red-600">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-slate-900 text-white p-2.5 rounded-xl">
                        {spec.icon}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {spec.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed ml-0 sm:ml-12">
                      {spec.description.split(spec.highlight).map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i !== arr.length - 1 && (
                            <span className="text-red-600 font-bold">{spec.highlight}</span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                ))}
              </div>

              {/* TECH STACK FOOTER */}
              <footer className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Built With Modern Tech Stack
                </p>
                <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
                  {[
                    "PostgreSQL", 
                    "Express", 
                    "React", 
                    "Node.js", 
                    "Solidity", 
                    "Ethereum Sepolia", 
                    "React Native", 
                    "TypeScript"
                  ].map((tech) => (
                    <span key={tech} className="px-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-xs">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="mt-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    © 2026 Secure-Vote. All rights reserved.
                  </p>
                </div>
              </footer>
            </div>
          </article>

        </div>
      </main>
    </div>
  );
};

export default AboutPage;