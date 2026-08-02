import React from "react";
import { 
  Globe, 
  ExternalLink, 
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
  Fingerprint
} from "lucide-react";
import { MdVerified, MdOutlineSchool, MdWorkOutline, MdBallot } from "react-icons/md";
import { FaCertificate, FaGithub, FaLinkedin, FaUserShield } from "react-icons/fa";
import { Navbar } from "../components/Navbar";

const DeveloperPage = () => {
  const skillGroups = {
    "Full-Stack Development": [
      { name: "PERN Stack", level: "Expert", icon: <Layers size={14} /> },
      { name: "TypeScript", level: "Advanced", icon: <Code2Fallback size={14} /> },
      { name: "Node.js & Express", level: "Expert", icon: <Activity size={14} /> },
      { name: "PostgreSQL", level: "Advanced", icon: <Database size={14} /> },
    ],
    "Mobile & UI": [
      { name: "React Native & Expo", level: "Advanced", icon: <Smartphone size={14} /> },
      { name: "React & Redux", level: "Expert", icon: <Zap size={14} /> },
      { name: "Tailwind CSS", level: "Expert", icon: <Palette size={14} /> },
    ],
    "Web3 Protocols": [
      { name: "Blockchain & EVM", level: "Specialist", icon: <Cpu size={14} /> },
      { name: "Solidity", level: "Mid-Level", icon: <Lock size={14} /> },
      { name: "Ethers.js", level: "Advanced", icon: <Network size={14} /> },
    ],
    "DevOps & Tools": [
      { name: "EAS Build", level: "Advanced", icon: <Terminal size={14} /> },
      { name: "Git & Version Control", level: "Expert", icon: <GitBranch size={14} /> },
    ]
  };

  const projects = [
    {
      title: "Laikipia E-Vote",
      desc: "A decentralized mobile and web voting system powered by Ethereum smart contracts to ensure 100% fair and transparent university elections.",
      tech: ["Solidity", "React Native", "Node.js", "EAS"],
      link: "https://github.com/Gakenye8741/Laikipia-E-Vote",
      status: "Patent Pending"
    },
    {
      title: "Unihaven (Hostel Finder)",
      desc: "A fast, user-friendly web platform built to help Laikipia University students easily discover and secure student housing near campus.",
      tech: ["PostgreSQL", "Express", "React", "Tailwind"],
      link: "https://uni-hostel-finder.netlify.app/",
      status: "Live in Production"
    },
    {
      title: "Anma Perfumes & Jewellery",
      desc: "A full-featured e-commerce store with secure payment processing, shopping cart management, and inventory tracking for retail products.",
      tech: ["PERN Stack", "Redux", "TypeScript"],
      link: "#",
      status: "In Development"
    },
    {
      title: "Personal Portfolio Hub",
      desc: "An interactive personal developer portfolio featuring a clean, modern design, smooth transitions, and live project updates.",
      tech: ["React", "TypeScript", "Tailwind CSS"],
      link: "/",
      status: "Active Release"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-600 selection:text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* HEADER SECTION */}
        <header className="mb-16 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-900 text-white border-4 border-white shadow-xl flex items-center justify-center">
                <span className="font-black text-4xl sm:text-5xl italic tracking-tighter">BG</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-4 border-white shadow-md">
                <MdVerified size={20} />
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-red-50 border border-red-100 rounded-full text-red-700 text-xs font-bold uppercase tracking-wider">
                Full-Stack Software Engineer
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Gakenye Ndiritu
              </h1>
              <p className="text-slate-600 font-medium text-sm flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span>Secretary General @ CISLU</span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full hidden sm:inline-block"></span>
                <span className="text-slate-500">Laikipia University</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/Gakenye8741" 
              target="_blank" 
              rel="noreferrer" 
              className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition shadow-sm"
              title="GitHub Profile"
            >
              <FaGithub size={22} />
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition shadow-sm"
              title="LinkedIn Profile"
            >
              <FaLinkedin size={22} />
            </a>
            <a 
              href="https://gakenye-ndiritu.co.ke" 
              target="_blank" 
              rel="noreferrer" 
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-md font-bold text-sm flex items-center gap-2"
            >
              <Globe size={18} />
              <span>Portfolio Website</span>
            </a>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR: INTEL & SKILLS */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600"></div>
              
              <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Fingerprint size={16} /> Professional Profile
              </h2>
              
              <div className="space-y-6">
                {/* Education */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                    <MdOutlineSchool size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Education</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">BSc. Computer Science</p>
                    <p className="text-xs text-slate-500">Laikipia University (2026)</p>
                  </div>
                </div>

                {/* Leadership */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                    <FaUserShield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Leadership</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">Secretary General</p>
                    <p className="text-xs text-slate-500">Computing & Innovation Society</p>
                  </div>
                </div>

                {/* Certification */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                    <FaCertificate size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Certification</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">Software Engineering Attaché</p>
                    <p className="text-xs text-slate-500">Teach2Give (Aug 2025)</p>
                  </div>
                </div>

                {/* Current Role */}
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                    <MdWorkOutline size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Current Role</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">Freelance Engineer</p>
                    <p className="text-xs text-slate-500">Full-Stack Solutions</p>
                  </div>
                </div>
              </div>

              {/* Core Skills Groups */}
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Core Technical Skills</h3>
                
                {Object.entries(skillGroups).map(([group, list]) => (
                  <div key={group} className="space-y-2.5">
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-l-2 border-red-600 pl-2">
                      {group}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {list.map((skill, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-white border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 transition">
                          <span className="text-red-600">{skill.icon}</span>
                          <span>{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </aside>

          {/* MAIN CONTENT: BIO & PROJECTS */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* Bio Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                    <Terminal size={22} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">About Me</h2>
                </div>
              </div>
              
              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p className="italic text-slate-700 border-l-4 border-red-600 bg-red-50/40 p-4 rounded-r-xl">
                  "I build reliable, high-performance web and mobile applications that bridge traditional systems with modern technology. My focus is on creating secure, user-friendly platforms for academic and social organizations."
                </p>
                <p>
                  As the <strong className="text-slate-900">Secretary General of the Computing & Innovation Society</strong> at Laikipia University, I lead technical projects and digital initiatives. My work on the <strong className="text-red-600 font-semibold">Laikipia E-Vote</strong> platform sets a high standard for transparent, blockchain-anchored campus governance.
                </p>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900">Featured Projects</h3>
                <span className="text-xs text-slate-500 font-medium">Production & Research</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, i) => (
                  <div key={i} className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-red-600 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-sm">
                          <MdBallot size={20} />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full uppercase">
                            {project.status}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 mb-2 hover:text-red-600 transition">
                        {project.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                        {project.desc}
                      </p>
                    </div>

                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tech.map(t => (
                          <span key={t} className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>

                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        <span>View Project Link</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </article>

        </div>

        {/* FOOTER */}
        <footer className="mt-20 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Built with Precision by Gakenye Ndiritu © 2026
          </p>
        </footer>

      </main>
    </div>
  );
};

// Fallback icon component for clean code representation
const Code2Fallback = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
);

export default DeveloperPage;