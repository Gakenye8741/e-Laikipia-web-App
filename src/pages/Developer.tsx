import React from "react";
import { 
  Globe, 
  ExternalLink, 
  Code2, 
  Terminal, 
  Cpu, 
  Layers, 
  GitBranch, 
  Network, 
  Activity, 
  Database, 
  Smartphone, 
  Zap, 
  Palette, 
  Lock,
  ChevronRight,
  Fingerprint
} from "lucide-react";
import { MdVerified, MdOutlineSchool, MdWorkOutline, MdBallot } from "react-icons/md";
import { FaCertificate, FaGithub, FaLinkedin, FaUserShield } from "react-icons/fa";
import { Navbar } from "../components/Navbar";

const DeveloperPage = () => {
  const skillGroups = {
    "Full-Stack_Engine": [
      { name: "PERN Stack", level: "Expert", icon: <Layers size={14} /> },
      { name: "TypeScript", level: "Advanced", icon: <Code2 size={14} /> },
      { name: "Node.js/Express", level: "Expert", icon: <Activity size={14} /> },
      { name: "PostgreSQL", level: "Advanced", icon: <Database size={14} /> },
    ],
    "Mobile_&_UI": [
      { name: "React Native/Expo", level: "Advanced", icon: <Smartphone size={14} /> },
      { name: "React/Redux", level: "Expert", icon: <Zap size={14} /> },
      { name: "Tailwind CSS", level: "Expert", icon: <Palette size={14} /> },
    ],
    "Web3_Protocols": [
      { name: "Blockchain/EVM", level: "Specialist", icon: <Cpu size={14} /> },
      { name: "Solidity", level: "Mid-Level", icon: <Lock size={14} /> },
      { name: "Ethers.js", level: "Advanced", icon: <Network size={14} /> },
    ],
    "DevOps_Matrix": [
      { name: "EAS Build", level: "Advanced", icon: <Terminal size={14} /> },
      { name: "Git/VCS", level: "Expert", icon: <GitBranch size={14} /> },
    ]
  };

  const projects = [
    {
      title: "Laikipia E-Vote",
      desc: "A decentralized voting infrastructure utilizing Ethereum Sepolia and smart contracts to ensure 100% election integrity for university governance.",
      tech: ["Solidity", "React Native", "Node.js", "EAS"],
      link: "https://github.com/Gakenye8741/Laikipia-E-Vote",
      status: "CORE_PROTOCOL"
    },
    {
      title: "Unihaven (Hostel Finder)",
      desc: "A high-performance accommodation registry designed to streamline the hostel discovery process for Laikipia University students.",
      tech: ["PostgreSQL", "Express", "React", "Tailwind"],
      link: "#",
      status: "PRODUCTION_READY"
    },
    {
      title: "Anma Perfumes & Jewellery",
      desc: "A full-stack e-commerce engine featuring secure payment gateways and an advanced inventory management system for high-end retail.",
      tech: ["PERN Stack", "Redux Toolkit", "TypeScript"],
      link: "#",
      status: "LIVE_STABLE"
    },
    {
      title: "Dev Portfolio v2.0",
      desc: "Personal engineering hub featuring a Cyberpunk Terminal aesthetic, real-time analytics integration, and high-performance animations.",
      tech: ["React", "TypeScript", "Recharts", "Typed.js"],
      link: "/",
      status: "75%_COMPLETE"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar/>
      <main className="p-4 md:p-8 pt-24 lg:pt-32 font-sans">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <header className="mb-12 text-center lg:text-left flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-36 h-36 rounded-[3rem] bg-slate-900 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                   <span className="text-white font-black text-5xl italic tracking-tighter">BG</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-[#F8FAFC] shadow-lg">
                  <MdVerified size={22} />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 rounded-full border border-red-100 shadow-sm">
                  <span className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em]">Lead Software Engineer</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  Gakenye <span className="text-red-700"> Ndiritu</span>
                </h1>
                <p className="text-slate-500 font-bold text-sm flex items-center justify-center lg:justify-start gap-3 uppercase tracking-tight">
                   <span className="text-slate-900">Secretary General @ CISLU</span>
                   <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                   <span>Certified Full-Stack Engineer</span>
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <a href="https://github.com/Gakenye8741" target="_blank" rel="noreferrer" className="p-4 bg-white border border-black-200 rounded-2xl text-black hover:text-red-700 hover:border-red-600 transition-all shadow-sm hover:shadow-md">
                <FaGithub size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-4 bg-white border border-black-200 rounded-2xl text-black hover:text-red-700 hover:border-red-600 transition-all shadow-sm hover:shadow-md">
                <FaLinkedin size={24} />
              </a>
              <a href="https://gakenye-ndiritu.netlify.app" target="_blank" rel="noreferrer" className="p-5 bg-slate-900 text-white rounded-[2rem] hover:bg-red-700 transition-all shadow-xl flex items-center gap-3 px-8 text-[11px] font-black uppercase tracking-[0.2em]">
                <Globe size={18} /> Web Portifolio
              </a>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Sidebar: Professional Intel */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[3.5rem] p-10 border border-slate-200 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-700"></div>
                <h2 className="text-[11px] font-black text-red-700 uppercase tracking-[0.3em] mb-10 flex items-center gap-2">
                  <Fingerprint size={16} /> Professional_Intel
                </h2>
                
                <div className="space-y-8">
                  {/* Education */}
                  <div className="flex gap-5 group">
                    <div className="h-12 w-12 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-red-700 transition-colors">
                      <MdOutlineSchool size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Education</p>
                      <p className="text-sm font-black text-slate-800 uppercase leading-tight mt-1">BSc. Computer Science</p>
                      <p className="text-[10px] font-bold text-slate-500 italic">Laikipia University (2026)</p>
                    </div>
                  </div>

                  {/* Leadership */}
                  <div className="flex gap-5 group">
                    <div className="h-12 w-12 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-red-700 transition-colors">
                      <FaUserShield size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leadership</p>
                      <p className="text-sm font-black text-slate-800 uppercase leading-tight mt-1">Secretary General</p>
                      <p className="text-[10px] font-bold text-slate-500 italic uppercase">CISLU Society</p>
                    </div>
                  </div>

                  {/* Certification */}
                   <div className="flex gap-5 group">
                    <div className="h-12 w-12 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-red-700 transition-colors">
                      <FaCertificate size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certification</p>
                      <p className="text-sm font-black text-slate-800 uppercase leading-tight mt-1">S.E. Attaché</p>
                      <p className="text-[10px] font-bold text-slate-500 italic uppercase">Teach2Give // Aug 2025</p>
                    </div>
                  </div>

                  {/* Current Role */}
                  <div className="flex gap-5 group">
                    <div className="h-12 w-12 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-red-700 transition-colors">
                      <MdWorkOutline size={24} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deployment</p>
                      <p className="text-sm font-black text-slate-800 uppercase leading-tight mt-1">Freelance Engineer</p>
                      <p className="text-[10px] font-bold text-slate-500 italic">Full-Stack Solutions</p>
                    </div>
                  </div>
                </div>

                {/* Core Stack / Grouped Skills */}
                <div className="mt-12 pt-10 border-t border-slate-100 space-y-8">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] mb-4">Core_Capabilities</p>
                  
                  {Object.entries(skillGroups).map(([group, list]) => (
                    <div key={group} className="space-y-3">
                      <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] border-l-2 border-red-700 pl-3">
                        {group.replace(/_/g, " ")}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {list.map((skill, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 group/skill hover:bg-white hover:border-red-200 transition-all">
                            <span className="text-red-700 group-hover/skill:scale-110 transition-transform">{skill.icon}</span>
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight">{skill.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content: Bio and Projects */}
            <article className="lg:col-span-8 space-y-10">
              <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden group">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                    <Terminal className="text-red-700" size={28} /> System Architect Bio
                  </h2>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-red-600 transition-colors"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-red-600 transition-colors delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-red-600 transition-colors delay-150"></div>
                  </div>
                </div>
                <div className="p-10 space-y-6">
                  <p className="text-lg font-bold text-slate-500 leading-relaxed italic border-l-4 border-red-50 pl-8 py-2">
                    "I build high-performance decentralized applications that bridge the gap between traditional governance and the future of Web3. My focus is on creating secure, scalable, and user-centric registries for academic and social institutions."
                  </p>
                  <p className="text-[15px] text-slate-600 leading-loose font-medium tracking-tight">
                    As the <span className="text-slate-900 font-black italic">Secretary General of the Computing & Innovation Society</span>, I lead digital transformation at Laikipia University. My work on the <strong className="text-red-700 font-black uppercase tracking-tighter underline underline-offset-4 decoration-2">Laikipia E-Vote</strong> platform serves as a blueprint for transparent, blockchain-anchored governance.
                  </p>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((project, i) => (
                  <div key={i} className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200 hover:border-red-700 transition-all duration-500 group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className="p-4 bg-slate-900 rounded-2xl text-white group-hover:bg-red-700 transition-colors shadow-lg">
                         <MdBallot size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[8px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-widest">{project.status}</span>
                        <ExternalLink size={18} className="text-slate-200 group-hover:text-red-700 transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-4 group-hover:text-red-700 transition-colors">{project.title}</h3>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8 flex-grow">
                      {project.desc}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.tech.map(t => (
                        <span key={t} className="text-[9px] font-black text-slate-900 border border-slate-200 px-3 py-1.5 rounded-xl uppercase tracking-tighter group-hover:border-red-100 group-hover:text-red-700 transition-all">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>

          </div>

          {/* Footer Branding */}
          <footer className="mt-24 text-center pb-12">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="px-8 py-4 bg-slate-900 rounded-full text-white shadow-2xl flex items-center gap-4 border border-white/10 group">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] group-hover:text-red-500 transition-colors">Built with Precision by BG Ndiritu</p>
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping shadow-[0_0_8px_#dc2626]"></div>
              </div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Authorized_Deployment_2026</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default DeveloperPage;