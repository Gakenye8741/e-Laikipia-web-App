import React, { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { BarChart3, CheckCircle, Lock, ShieldCheck, ChevronDown } from "lucide-react";
import { MdVerifiedUser, MdHistoryEdu, MdWorkspacePremium } from "react-icons/md";
import { Navbar } from "../components/Navbar";

/* ----------------------------- TYPES ----------------------------- */

interface Stat {
  label: string;
  value: string;
  color: string;
  border: string;
  dot?: boolean;
}

interface Feature {
  icon: ComponentType<{ size?: number }>;
  title: string;
  text: string;
}

type Direction = "up" | "left" | "right";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  from?: Direction;
  className?: string;
}

/* ----------------------------- TEXT ----------------------------- */

const STATS: Stat[] = [
  { label: "Status", value: "Live now", color: "text-emerald-600", border: "border-l-emerald-500", dot: true },
  { label: "Network", value: "Ethereum Sepolia", color: "text-red-600", border: "border-l-red-600" },
  { label: "Lock type", value: "AES-256", color: "text-slate-900", border: "border-l-slate-800" },
  { label: "Health", value: "All good", color: "text-emerald-600", border: "border-l-slate-400", dot: true },
];

const FEATURES: Feature[] = [
  {
    icon: Lock,
    title: "Nobody can change your vote",
    text: "Most systems keep votes in a normal database. An admin can change those votes. Secure-Vote is different. It saves each vote on a blockchain. A blockchain is a digital notebook that no one can erase or edit.",
  },
  {
    icon: BarChart3,
    title: "Two kinds of elections",
    text: "In a normal election, students vote for one person. In a delegate election, delegates vote for a team. Only the right people can vote in each one.",
  },
  {
    icon: ShieldCheck,
    title: "Strong safety checks",
    text: "You log in with your reg number and password. You also get a secret voting code. The app can ask for your fingerprint or PIN. We also block hackers who try to flood the site.",
  },
  {
    icon: MdVerifiedUser,
    title: "See your vote and live results",
    text: "After you vote, you get a receipt. Use it to find your vote online. Results update live, so nobody has to count by hand.",
  },
];

const MISSION_POINTS: string[] = [
  "Votes cannot be changed",
  "Very safe",
  "Vote from anywhere",
  "Check your own vote",
];

const TECH: string[] = [
  "PostgreSQL",
  "Express",
  "React",
  "Node.js",
  "Solidity",
  "Ethereum Sepolia",
  "React Native",
  "TypeScript",
];

/* --------------------------- ANIMATION --------------------------- */

// Becomes true when the element scrolls into view.
const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, seen };
};

// Slides content in when you scroll to it.
const Reveal = ({ children, delay = 0, from = "up", className = "" }: RevealProps) => {
  const { ref, seen } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal reveal-${from} ${seen ? "reveal-on" : ""} ${className}`}
    >
      {children}
    </div>
  );
};

// Thin red bar at the top that grows as you scroll.
const ScrollBar = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${percent}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none">
      <div ref={barRef} className="h-full w-0 bg-red-600" />
    </div>
  );
};

const Styles = () => (
  <style>{`
    /* Scroll reveal */
    .reveal { opacity: 0; transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); }
    .reveal-up { transform: translateY(32px); }
    .reveal-left { transform: translateX(-40px); }
    .reveal-right { transform: translateX(40px); }
    .reveal-on { opacity: 1; transform: none; }

    /* Page load */
    @keyframes rise { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
    .rise { opacity: 0; animation: rise .8s cubic-bezier(.2,.7,.2,1) forwards; }

    /* Floating background shapes */
    @keyframes drift-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,30px) scale(1.1); } }
    @keyframes drift-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-30px,40px) scale(1.15); } }
    .blob-a { animation: drift-a 12s ease-in-out infinite; }
    .blob-b { animation: drift-b 15s ease-in-out infinite; }

    /* Vote chain */
    @keyframes block-in { from { opacity: 0; transform: scale(.5) rotate(-8deg); } to { opacity: 1; transform: none; } }
    @keyframes link-flow { from { background-position: 0 0; } to { background-position: 16px 0; } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,.45); } 50% { box-shadow: 0 0 0 12px rgba(220,38,38,0); } }
    @keyframes travel { 0% { left: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
    .chain-block { opacity: 0; animation: block-in .6s cubic-bezier(.2,.9,.3,1.3) forwards; }
    .chain-block-last { opacity: 0; animation: block-in .6s cubic-bezier(.2,.9,.3,1.3) forwards, glow 2s ease-in-out 2.5s infinite; }
    .chain-link {
      background-image: repeating-linear-gradient(90deg, #dc2626 0 8px, transparent 8px 16px);
      animation: link-flow .6s linear infinite;
    }
    .chain-dot { animation: travel 3s ease-in-out 2.2s infinite; }

    /* Pulsing live dot */
    @keyframes ping-soft { 75%,100% { transform: scale(2.4); opacity: 0; } }
    .ping-soft { animation: ping-soft 1.6s cubic-bezier(0,0,.2,1) infinite; }

    /* Floating badge */
    @keyframes float { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-8px) rotate(4deg); } }
    .float { animation: float 3s ease-in-out infinite; }

    /* Shine across the award card */
    @keyframes shine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(320%) skewX(-20deg); } }
    .shine::after {
      content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 30%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
      animation: shine 4.5s ease-in-out 1.5s infinite;
      pointer-events: none;
    }

    /* Open and close smoothly */
    .accordion { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .4s ease; }
    .accordion-open { grid-template-rows: 1fr; }

    /* Respect people who prefer no motion */
    @media (prefers-reduced-motion: reduce) {
      .reveal, .rise, .chain-block, .chain-block-last { opacity: 1 !important; transform: none !important; animation: none !important; transition: none !important; }
      .chain-link, .chain-dot, .ping-soft, .float, .blob-a, .blob-b, .shine::after { animation: none !important; }
      .chain-dot { display: none; }
      .accordion { transition: none; }
    }
  `}</style>
);

/* --------------------------- COMPONENTS --------------------------- */

// Four blocks joined in a chain. A red dot travels along it.
const VoteChain = () => (
  <div className="relative flex items-center" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <React.Fragment key={i}>
        <div
          style={{ animationDelay: `${0.5 + i * 0.35}s` }}
          className={`h-12 w-12 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center font-black text-sm sm:text-base text-white
            ${i === 3 ? "bg-red-600 chain-block-last" : "bg-slate-900 chain-block"}`}
        >
          {i === 3 ? "NEW" : `#${i + 1}`}
        </div>
        {i < 3 && <div className="chain-link h-1 w-6 sm:w-10" />}
      </React.Fragment>
    ))}
    <span className="chain-dot absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.9)]" />
  </div>
);

const StatCard = ({ stat, index }: { stat: Stat; index: number }) => (
  <Reveal delay={index * 100}>
    <div
      className={`h-full bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 border-l-4 ${stat.border}
        transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
    >
      <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
      <p className={`flex items-center gap-2 text-lg sm:text-xl font-black ${stat.color}`}>
        {stat.dot && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
        )}
        {stat.value}
      </p>
    </div>
  </Reveal>
);

const FeatureItem = ({
  feature,
  open,
  onToggle,
}: {
  feature: Feature;
  open: boolean;
  onToggle: () => void;
}) => {
  const Icon = feature.icon;
  return (
    <div className={`border-l-4 transition-colors duration-300 ${open ? "border-red-600 bg-red-50/40" : "border-transparent"}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group w-full flex items-center gap-4 p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
      >
        <span
          className={`p-2.5 rounded-xl text-white transition-all duration-300 group-hover:scale-110
            ${open ? "bg-red-600 rotate-6" : "bg-slate-900"}`}
        >
          <Icon size={18} />
        </span>
        <span className="flex-1 text-base sm:text-lg font-bold text-slate-900">{feature.title}</span>
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${open ? "rotate-180 text-red-600" : "text-slate-400"}`}
        />
      </button>

      <div className={`accordion ${open ? "accordion-open" : ""}`}>
        <div className="overflow-hidden">
          <p className="px-5 sm:px-6 pb-6 sm:pl-[5.25rem] text-sm sm:text-base text-slate-600 leading-relaxed max-w-prose">
            {feature.text}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ PAGE ------------------------------ */

const AboutPage = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-800 font-sans selection:bg-red-600 selection:text-white">
      <Styles />
      <ScrollBar />

      {/* Soft moving shapes in the background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="blob-a absolute -top-24 -right-24 h-96 w-96 rounded-full bg-red-200/50 blur-3xl" />
        <div className="blob-b absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-slate-300/40 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* HERO */}
        <header className="mb-14 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1
              className="rise text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight"
              style={{ animationDelay: "0.05s" }}
            >
              Vote safely.
              <br />
              <span className="text-red-600">Vote from your phone.</span>
            </h1>
            <p
              className="rise mt-5 text-base sm:text-lg text-slate-600 max-w-md leading-relaxed"
              style={{ animationDelay: "0.25s" }}
            >
              Secure-Vote is a voting app for students. Every vote is saved so that nobody can change it.
            </p>
          </div>
          <div className="rise flex justify-start md:justify-end" style={{ animationDelay: "0.4s" }}>
            <VoteChain />
          </div>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10" aria-label="System status">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </section>

        {/* AWARD */}
        <Reveal className="mb-10">
          <section className="shine relative overflow-hidden bg-gradient-to-br from-red-50 to-white p-6 sm:p-8 rounded-3xl border border-red-200 flex flex-col md:flex-row items-center gap-6">
            <div className="float p-4 bg-red-600 text-white rounded-2xl shrink-0 shadow-md">
              <MdWorkspacePremium size={36} />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                2nd place at Laikipia University Innovation Day
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-prose">
                We won this prize for making campus voting safe, fast, and easy.
              </p>
            </div>
          </section>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MISSION */}
          <aside className="lg:col-span-4">
            <Reveal from="left" className="lg:sticky lg:top-28">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
                <div className="p-6 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                  <MdHistoryEdu className="float text-red-600 text-5xl" />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Our goal</h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    We want to end long queues, counting mistakes, and students who miss their vote. Now you can vote
                    safely from your phone.
                  </p>

                  <ul className="pt-2 space-y-3">
                    {MISSION_POINTS.map((text, i) => (
                      <li
                        key={text}
                        className="rise flex items-center gap-2.5"
                        style={{ animationDelay: `${0.8 + i * 0.15}s` }}
                      >
                        <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                        <span className="text-sm font-semibold text-slate-700">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </aside>

          {/* FEATURES */}
          <article className="lg:col-span-8">
            <Reveal from="right">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/60">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">How we keep votes safe</h2>
                  <p className="text-sm text-slate-500 mt-1">Tap a title to read more.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {FEATURES.map((feature, i) => (
                    <FeatureItem
                      key={feature.title}
                      feature={feature}
                      open={openIndex === i}
                      onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                    />
                  ))}
                </div>

                {/* TECH */}
                <footer className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-sm font-semibold text-slate-500 mb-4">Made with</p>
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {TECH.map((tech, i) => (
                      <Reveal key={tech} delay={i * 70}>
                        <span className="block px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-red-600 hover:text-red-600">
                          {tech}
                        </span>
                      </Reveal>
                    ))}
                  </div>
                  <p className="mt-8 text-xs text-slate-400">© 2026 Secure-Vote. All rights reserved.</p>
                </footer>
              </div>
            </Reveal>
          </article>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;