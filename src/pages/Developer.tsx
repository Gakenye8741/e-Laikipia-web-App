import React, { useRef, useState, useEffect } from "react";
import {
  Globe, ExternalLink, Terminal, Cpu, Layers, GitBranch, Network, Activity,
  Database, Smartphone, Zap, Palette, Lock, Fingerprint, Code2, type LucideIcon,
  User,
} from "lucide-react";
import { MdVerified, MdOutlineSchool, MdWorkOutline, MdBallot } from "react-icons/md";
import { FaCertificate, FaGithub, FaLinkedin, FaUserShield } from "react-icons/fa";
import {
  motion, MotionConfig, useScroll, useSpring, useInView, animate,
  useMotionValue, useTransform, type Variants,
} from "framer-motion";
import { Navbar } from "../components/Navbar";

/* ----------------------------- Content ----------------------------- */

const skillGroups: Record<string, { name: string; icon: LucideIcon }[]> = {
  "Full-stack": [
    { name: "PERN Stack", icon: Layers },
    { name: "TypeScript", icon: Code2 },
    { name: "Node.js & Express", icon: Activity },
    { name: "PostgreSQL", icon: Database },
  ],
  "Mobile & design": [
    { name: "React Native & Expo", icon: Smartphone },
    { name: "React & Redux", icon: Zap },
    { name: "Tailwind CSS", icon: Palette },
  ],
  Blockchain: [
    { name: "Blockchain & EVM", icon: Cpu },
    { name: "Solidity", icon: Lock },
    { name: "Ethers.js", icon: Network },
  ],
  Tools: [
    { name: "EAS Build", icon: Terminal },
    { name: "Git & GitHub", icon: GitBranch },
  ],
};

const profile = [
  { label: "Education", title: "BSc. Computer Science", note: "Laikipia University (2026)", icon: MdOutlineSchool },
  { label: "Leadership", title: "Former Secretary General", note: "Computing & Innovation Society", icon: FaUserShield },
  { label: "Certificate", title: "Software Engineering Attaché", note: "Teach2Give (Aug 2025)", icon: FaCertificate },
  { label: "Work", title: "Freelance Engineer", note: "Full-stack solutions", icon: MdWorkOutline },
];

const statusStyle: Record<string, string> = {
  "Patent pending": "bg-amber-50 text-amber-700 ring-amber-200",
  Live: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In progress": "bg-blue-50 text-blue-700 ring-blue-200",
  Active: "bg-red-50 text-red-700 ring-red-200",
};

const projects = [
  {
    title: "Laikipia E-Vote",
    desc: "A mobile and web voting app that uses Ethereum smart contracts. It keeps university elections fair and open for everyone to check.",
    tech: ["Solidity", "React Native", "Node.js", "EAS"],
    link: "https://github.com/Gakenye8741/Laikipia-E-Vote",
    status: "Patent pending",
  },
  {
    title: "Unihaven",
    desc: "A simple website that helps Laikipia University students find and book hostels near campus.",
    tech: ["PostgreSQL", "Express", "React", "Tailwind"],
    link: "https://uni-hostel-finder.netlify.app/",
    status: "Live",
  },
  {
    title: "Anma Perfumes & Jewellery",
    desc: "An online shop with safe payments, a shopping cart, and stock tracking.",
    tech: ["PERN Stack", "Redux", "TypeScript"],
    link: "#",
    status: "In progress",
  },
  {
    title: "Personal Portfolio",
    desc: "My own website. It has a clean design, smooth movement, and shows my latest work.",
    tech: ["React", "TypeScript", "Tailwind CSS"],
    link: "https://gakenye-ndiritu.co.ke",
    status: "Active",
  },
];

const allSkills = Object.values(skillGroups).flat();
const STATS = [
  { to: projects.length, label: "featured projects" },
  { to: allSkills.length, label: "skills I use" },
  { to: Object.keys(skillGroups).length, label: "areas of work" },
];

/* --------------------------- Animations ---------------------------- */

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
};
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.15 } } as const;

const ScrollBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-red-600" />;
};

const Counter = ({ to }: { to: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 1.5, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref}>{n}</span>;
};

/** Card that tilts in 3D toward the pointer */
const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [9, -9]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-9, 9]), { stiffness: 200, damping: 18 });
  return (
    <motion.div
      variants={rise}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/** Name where each word flies in */
const WordReveal = ({ text }: { text: string }) => (
  <motion.h1 variants={container} className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
    {text.split(" ").map((w, i) => (
      <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
        <motion.span
          variants={{
            hidden: { y: "110%", rotate: 8, opacity: 0 },
            show: { y: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 14 } },
          }}
          className={`inline-block ${i === 1 ? "text-red-600" : ""}`}
        >
          {w}
        </motion.span>
      </span>
    ))}
  </motion.h1>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div variants={rise} className={`rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 ${className}`}>
    {children}
  </motion.div>
);

const Social = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <motion.a
    whileHover={{ y: -4, rotate: -6, scale: 1.08 }} whileTap={{ scale: 0.9 }}
    href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}
    className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800 shadow-sm transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
  >
    {children}
  </motion.a>
);

const ProjectCard = ({ project }: { project: (typeof projects)[number] }) => (
  <TiltCard className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-colors hover:border-red-600 hover:shadow-2xl sm:p-7">
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          <MdBallot size={20} />
        </div>
        <span className={`relative rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyle[project.status]}`}>
          {project.status === "Live" && (
            <motion.span
              aria-hidden className="absolute inset-0 rounded-full ring-2 ring-emerald-400"
              animate={{ scale: [1, 1.4], opacity: [0.7, 0] }} transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
          <span className="relative">{project.status}</span>
        </span>
      </div>
      <h4 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-red-600">{project.title}</h4>
      <p className="mb-6 text-sm leading-relaxed text-slate-600">{project.desc}</p>
    </div>

    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span key={t} className="rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors group-hover:border-red-200 group-hover:bg-red-50">{t}</span>
        ))}
      </div>
      <a
        href={project.link} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded text-sm font-bold text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
      >
        View project
        <ExternalLink size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    </div>
  </TiltCard>
);

/* ------------------------------ Page ------------------------------- */

const DeveloperPage = () => (
  <MotionConfig reducedMotion="user">
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-800 selection:bg-red-600 selection:text-white">
      <ScrollBar />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8">

        {/* HERO */}
        <motion.header
          variants={container} initial="hidden" animate="show"
          className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10 lg:p-12"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600" />
          <motion.div aria-hidden className="pointer-events-none absolute -left-16 top-10 h-60 w-60 rounded-full bg-red-600/10 blur-3xl"
            animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.25, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl"
            animate={{ x: [0, -40, 0], y: [0, -40, 0], scale: [1.1, 0.9, 1.1] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />

          <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <motion.div variants={rise} className="relative shrink-0">
                {/* spinning dashed ring */}
                <motion.div aria-hidden className="absolute -inset-3 rounded-[1.75rem] border-2 border-dashed border-red-600/50"
                  animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />
                <motion.div
                  animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
                  className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-slate-900 text-white shadow-xl sm:h-36 sm:w-36"
                >
                  <span className="text-4xl font-black italic tracking-tighter sm:text-5xl">BG</span>
                </motion.div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 12 }}
                  className="absolute -bottom-2 -right-2 rounded-full border-4 border-white bg-emerald-500 p-2 text-white shadow-md"
                  aria-label="Verified"
                >
                  <MdVerified size={20} />
                </motion.div>
              </motion.div>

              <div className="space-y-3">
                <motion.span variants={rise} className="inline-block rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  Full-stack software engineer
                </motion.span>
                <WordReveal text="Gakenye Ndiritu" />
                <motion.p variants={rise} className="text-sm font-medium text-slate-600">
                  Former Secretary General, CISLU <span className="mx-1 text-slate-300">|</span>
                  <span className="text-slate-500">Laikipia University</span>
                </motion.p>
              </div>
            </div>

            <motion.div variants={rise} className="flex w-full flex-wrap items-center justify-center gap-3 lg:w-auto">
              <Social href="https://github.com/Gakenye8741" label="GitHub profile"><FaGithub size={22} /></Social>
              <Social href="https://linkedin.com" label="LinkedIn profile"><FaLinkedin size={22} /></Social>
              <motion.a
                whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.96 }}
                href="https://gakenye-ndiritu.co.ke" target="_blank" rel="noreferrer"
                className="relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-red-600 px-6 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:flex-none"
              >
                <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/25"
                  initial={{ x: "-150%" }} animate={{ x: "450%" }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
                <span className="relative flex items-center gap-2"><Globe size={18} /> My website</span>
              </motion.a>
            </motion.div>
          </div>
        </motion.header>

        {/* SKILL MARQUEE */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-slate-900 py-3.5 sm:mb-8" aria-label="My skills">
          <motion.div className="flex w-max gap-10 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
            {[...allSkills, ...allSkills, ...allSkills, ...allSkills].map((s, i) => (
              <span key={i} className="flex items-center gap-10 text-sm font-bold text-slate-300">
                {s.name} <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              </span>
            ))}
          </motion.div>
        </div>

        {/* COUNTERS */}
        <motion.div {...inView} variants={container} className="mb-10 grid grid-cols-3 gap-3 sm:mb-14 sm:gap-6">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={rise} whileHover={{ scale: 1.06, rotate: -1 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm sm:p-6">
              <div className="text-3xl font-black tabular-nums text-red-600 sm:text-5xl"><Counter to={s.to} /></div>
              <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">

          {/* SIDEBAR */}
          <motion.aside {...inView} variants={container} className="space-y-6 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            <Card>
              <h2 className="mb-6 flex items-center gap-2 text-sm font-bold text-red-600">
                <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2, repeat: Infinity }}><Fingerprint size={16} /></motion.span>
                Quick facts
              </h2>
              <ul className="space-y-5">
                {profile.map(({ label, title, note, icon: Icon }) => (
                  <motion.li key={label} variants={rise} whileHover={{ x: 6 }} className="group flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-all duration-300 group-hover:rotate-[360deg] group-hover:border-red-600 group-hover:bg-red-600 group-hover:text-white">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400">{label}</p>
                      <p className="text-sm font-extrabold text-slate-900">{title}</p>
                      <p className="text-xs text-slate-500">{note}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </Card>

            <Card>
              <h3 className="mb-5 text-sm font-bold text-slate-900">What I work with</h3>
              <div className="space-y-5">
                {Object.entries(skillGroups).map(([group, list]) => (
                  <div key={group} className="space-y-2.5">
                    <h4 className="border-l-2 border-red-600 pl-2 text-xs font-bold text-slate-500">{group}</h4>
                    <motion.div variants={container} className="flex flex-wrap gap-2">
                      {list.map(({ name, icon: Icon }, i) => (
                        <motion.span
                          key={name}
                          variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 14 } } }}
                          whileHover={{ y: -4, scale: 1.08, rotate: i % 2 ? 2 : -2 }}
                          className="flex cursor-default items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50"
                        >
                          <Icon size={14} className="text-red-600" /> {name}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.aside>

          {/* MAIN */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-8">
            <motion.div {...inView} variants={container}>
              <Card>
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="rounded-xl bg-red-50 p-2.5 text-red-600"><User size={22} /></motion.div>
                  <h2 className="text-lg font-bold text-slate-900">About me</h2>
                  <motion.span aria-hidden className="ml-1 h-5 w-2.5 bg-red-600"
                    animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                  <motion.p variants={rise} className="rounded-r-xl border-l-4 border-red-600 bg-red-50/40 p-4 italic text-slate-700">
                    “I build fast, reliable web and mobile apps. I like making safe and easy-to-use tools for schools and community groups.”
                  </motion.p>
                  <motion.p variants={rise}>
                    I am the former <strong className="text-slate-900">Secretary General of the Computing & Innovation Society</strong> at Laikipia University, where I led tech projects. My{" "}
                    <strong className="font-semibold text-red-600">Laikipia E-Vote</strong> app shows how blockchain can make campus elections open and fair.
                  </motion.p>
                </div>
              </Card>
            </motion.div>

            <section>
              <motion.div {...inView} variants={rise} className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-extrabold text-slate-900">My projects</h3>
                <span className="text-xs font-medium text-slate-500">Live work and research</span>
              </motion.div>
              <motion.div {...inView} variants={container} className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
                {projects.map((p) => <ProjectCard key={p.title} project={p} />)}
              </motion.div>
            </section>
          </div>
        </div>

        <footer className="mt-16 border-t border-slate-200 pt-8 text-center sm:mt-20">
          <p className="text-xs font-bold text-slate-700">Built with care by Gakenye Ndiritu © 2026</p>
        </footer>
      </main>
    </div>
  </MotionConfig>
);

export default DeveloperPage;