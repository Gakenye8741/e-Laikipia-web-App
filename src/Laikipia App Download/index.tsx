import React, { useRef, useState, useEffect } from 'react';
import {
  Shield, CheckCircle, Smartphone, Globe, Lock, Cpu, Server, ChevronRight,
  ExternalLink, Sparkles, BookOpen, type LucideIcon,
} from 'lucide-react';
import {
  motion, AnimatePresence, MotionConfig, useScroll, useSpring, useInView, animate,
  useMotionValue, useTransform, type Variants,
} from 'framer-motion';
import { Navbar } from '../components/Navbar';
import Seo, { PAGES } from '../components/Seo';

/* ----------------------------- Content ----------------------------- */

const EXPO_BUILD_URL =
  'https://expo.dev/accounts/gakenye123/projects/LaikipiaE-Vote/builds/e7c1ef3c-2536-45e2-aa05-db7abf678ec5';
const DOCS_URL =
  'https://docs.google.com/document/d/e/2PACX-1vRk--qA-Z7Idgj4UVNsCl4XrS3_AmWylzqbfB32ePQX-kY-O07IrLF42-Z4JJWcWf4Bzxf-PB0jIyOT/pub';
const ADMIN_URL = 'https://laikipia.netlify.app';

type Platform = 'student' | 'admin';

const TECH = ['Solidity', 'Ethereum', 'React Native', 'Expo', 'Node.js', 'PostgreSQL', 'TypeScript', 'Blockchain'];

const STATS = [
  { to: 60, suffix: ' sec', label: 'to cast a vote' },
  { to: 4, suffix: '', label: 'simple steps' },
  { to: 0, suffix: '', label: 'edits to saved votes' },
];

const votingSteps = [
  { id: 1, title: 'Sign in', description: 'Log in with your student details so we can check that you can vote.' },
  { id: 2, title: 'Pick a coalition', description: 'Look through the coalitions on your phone and choose one.' },
  { id: 3, title: 'Confirm it is you', description: 'Enter your secret code and scan your fingerprint or face to approve your vote.' },
  { id: 4, title: 'Vote is locked in', description: 'Your vote is encrypted, sent to our server, and saved on the blockchain for good.' },
];

const securityFeatures: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Cpu, title: 'No one can change votes', description: 'Built with Solidity smart contracts on the Ethereum Sepolia test network, so saved votes cannot be edited.' },
  { icon: Lock, title: 'Only real delegates vote for coalitions', description: 'The voting rules let only checked and approved delegates vote in coalition elections.' },
  { icon: Server, title: 'Always online', description: 'The system runs fully online, so results stay up to date and nothing is stored only on your phone.' },
];

const platforms: Record<Platform, {
  tag: string; title: string; points: string[]; icon: LucideIcon; label: string; value: string; note: string;
}> = {
  student: {
    tag: 'For students', title: 'Vote in under 60 seconds.',
    points: ['Quick fingerprint or face check.', 'Your vote is sent and saved right away.', 'Each vote is recorded on the Sepolia test network.'],
    icon: Smartphone, label: 'Current version', value: 'v1.2.0-beta', note: 'Hosted on Expo (EAS Build)',
  },
  admin: {
    tag: 'For admins', title: 'Manage candidates, coalitions and results.',
    points: ['One dashboard to run the whole election.', 'Set up delegates and register coalitions.', 'Watch results update live, with no way to change them.'],
    icon: Globe, label: 'Web app', value: 'Admin Portal', note: 'Hardware key needed',
  },
};

/* --------------------------- Animations ---------------------------- */

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 16 } },
};
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.15 } } as const;

/** Thin red bar at the top that fills as you scroll */
const ScrollBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-red-600" />;
};

/** Number that counts up when it scrolls into view */
const Counter = ({ to, suffix }: { to: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 1.6, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref}>{n}{suffix}</span>;
};

/** Card that tilts in 3D toward the pointer */
const TiltCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 18 });
  return (
    <motion.div
      variants={rise}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
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

/** Button with a light streak that sweeps across it */
const ShineButton = ({
  href, children, variant,
}: { href: string; children: React.ReactNode; variant: 'red' | 'light' | 'dark' }) => {
  const styles = {
    red: 'bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700',
    light: 'border-2 border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50',
    dark: 'bg-slate-900 text-white shadow-md hover:bg-slate-800',
  }[variant];
  return (
    <motion.a
      whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.96 }}
      href={href} target="_blank" rel="noopener noreferrer"
      className={`relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:w-auto sm:px-8 sm:py-4 sm:text-base ${styles}`}
    >
      <motion.span
        aria-hidden
        initial={{ x: '-150%' }} animate={{ x: '350%' }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
        className={`absolute inset-y-0 left-0 w-1/4 -skew-x-12 ${variant === 'light' ? 'bg-red-600/10' : 'bg-white/25'}`}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.a>
  );
};

/** Headline where each word flies in */
const WordReveal = ({ text, redFrom }: { text: string; redFrom: number }) => (
  <motion.h1 variants={group} initial="hidden" animate="show"
    className="mb-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
    {text.split(' ').map((w, i) => (
      <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
        <motion.span
          variants={{
            hidden: { y: '110%', rotate: 8, opacity: 0 },
            show: { y: 0, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 140, damping: 14 } },
          }}
          className={`inline-block ${i >= redFrom ? 'text-red-600' : ''}`}
        >
          {w}
        </motion.span>
      </span>
    ))}
  </motion.h1>
);

/** Floating phone that "casts a vote" on a loop */
const PhoneMockup = () => (
  <motion.div
    animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    className="relative mx-auto h-[19rem] w-44 shrink-0 rounded-[2rem] border-[6px] border-slate-900 bg-white shadow-2xl shadow-red-600/20 sm:h-[24rem] sm:w-56 sm:rounded-[2.5rem]"
    aria-hidden
  >
    <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-slate-900" />
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
        {[0, 1].map((i) => (
          <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-red-600"
            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 1, ease: 'easeOut' }} />
        ))}
        <div className="flex h-full w-full items-center justify-center rounded-full bg-red-600 text-white">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 13l4 4L19 7"
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.8, 1] }} />
          </svg>
        </div>
      </div>
      <p className="text-sm font-extrabold text-slate-900">Vote locked in</p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div className="h-full rounded-full bg-red-600"
          animate={{ width: ['0%', '100%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.8, 1] }} />
      </div>
      <p className="font-mono text-[10px] text-slate-400">Saved on Sepolia</p>
    </div>
  </motion.div>
);

const SectionIntro = ({ title, text }: { title: string; text: string }) => (
  <motion.div variants={rise} className="mx-auto mb-10 max-w-xl text-center sm:mb-12">
    <h2 className="mb-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
    <p className="text-sm text-slate-600 sm:text-base">{text}</p>
  </motion.div>
);

/* ------------------------------ Page ------------------------------- */

export const SecureVoteDownload: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<Platform>('student');
  const p = platforms[activePlatform];
  const PanelIcon = p.icon;

  return (
    <MotionConfig reducedMotion="user">
       <Seo {...PAGES.download} />
      <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-800 selection:bg-red-600 selection:text-white">
        <ScrollBar />
        <Navbar />

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent pb-14 pt-24 sm:pb-16 lg:pb-24 lg:pt-32">
          {/* floating background blobs */}
          <motion.div aria-hidden className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-red-600/10 blur-3xl sm:h-96 sm:w-96"
            animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-red-600/10 blur-3xl sm:h-[28rem] sm:w-[28rem]"
            animate={{ x: [0, -50, 0], y: [0, -50, 0], scale: [1.1, 0.9, 1.1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden className="pointer-events-none absolute right-6 top-24 text-red-600/10"
            animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
            <Shield className="h-40 w-40 sm:h-64 sm:w-64" />
          </motion.div>

          <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1.3fr_1fr]">
            <motion.div variants={group} initial="hidden" animate="show" className="text-center lg:text-left">
              <motion.div variants={rise} className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600">
                <motion.span animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
                Published innovation project
              </motion.div>

              <WordReveal text="Campus elections you can trust." redFrom={4} />

              <motion.p variants={rise} className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
                Vote from your phone, or run the whole election from the web. Every vote is checked, saved on the blockchain, and open for all to verify.
              </motion.p>

              <motion.div variants={rise} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
                <ShineButton href={EXPO_BUILD_URL} variant="red">
                  <Smartphone className="h-5 w-5" /> Get the mobile app <ExternalLink className="h-4 w-4 opacity-80" />
                </ShineButton>
                <ShineButton href={DOCS_URL} variant="light">
                  <BookOpen className="h-5 w-5 text-red-600" /> Read the project guide <ExternalLink className="h-4 w-4 opacity-80" />
                </ShineButton>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.5 }}>
              <PhoneMockup />
            </motion.div>
          </div>
        </section>

        {/* TECH MARQUEE */}
        <div className="overflow-hidden border-b border-slate-100 bg-slate-900 py-3.5" aria-label="Technology we use">
          <motion.div className="flex w-max gap-10 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
            {[...TECH, ...TECH, ...TECH, ...TECH].map((t, i) => (
              <span key={i} className="flex items-center gap-10 text-sm font-bold text-slate-300">
                {t} <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              </span>
            ))}
          </motion.div>
        </div>

        {/* STATS */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
          <motion.div {...inView} variants={group} className="grid grid-cols-3 gap-3 sm:gap-6">
            {STATS.map((s) => (
              <motion.div key={s.label} variants={rise} whileHover={{ scale: 1.06, rotate: -1 }}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm sm:p-6">
                <div className="text-3xl font-black tabular-nums text-red-600 sm:text-5xl"><Counter to={s.to} suffix={s.suffix} /></div>
                <div className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* PLATFORM SWITCHER */}
        <section id="download-client" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
          <motion.div {...inView} variants={group}>
            <SectionIntro title="Choose how you use it" text="Pick the option that matches your role in the election." />

            <motion.div variants={rise} role="tablist" aria-label="Choose your role"
              className="mx-auto mb-10 flex max-w-md rounded-xl border border-slate-200 bg-slate-100 p-1.5 shadow-inner sm:mb-12">
              {([['student', Smartphone, 'Students'], ['admin', Globe, 'Admins']] as const).map(([id, Icon, label]) => {
                const active = activePlatform === id;
                return (
                  <button key={id} role="tab" aria-selected={active} onClick={() => setActivePlatform(id)}
                    className="relative flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                    {active && (
                      <motion.span layoutId="platform-pill" transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="absolute inset-0 rounded-lg bg-red-600 shadow-md" />
                    )}
                    <span className={`relative z-10 flex items-center gap-2 transition-colors ${active ? 'text-white' : 'text-slate-600'}`}>
                      <Icon className="h-4 w-4" /> {label}
                    </span>
                  </button>
                );
              })}
            </motion.div>

            <motion.div variants={rise} className="mx-auto max-w-4xl rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-xl shadow-slate-100/70 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div key={activePlatform}
                  initial={{ opacity: 0, x: activePlatform === 'student' ? -40 : 40, rotateY: 15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: activePlatform === 'student' ? 40 : -40 }}
                  transition={{ duration: 0.3 }}
                  className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <span className="rounded border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">{p.tag}</span>
                    <h3 className="mb-4 mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">{p.title}</h3>
                    <ul className="mb-8 space-y-3 text-sm text-slate-600 sm:text-base">
                      {p.points.map((pt, i) => (
                        <motion.li key={pt} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}
                          className="flex items-start gap-2.5">
                          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /> {pt}
                        </motion.li>
                      ))}
                    </ul>
                    {activePlatform === 'student' ? (
                      <ShineButton href={EXPO_BUILD_URL} variant="dark">Download the app <ExternalLink className="h-4 w-4" /></ShineButton>
                    ) : (
                      <ShineButton href={ADMIN_URL} variant="red">Open admin portal <ChevronRight className="h-4 w-4" /></ShineButton>
                    )}
                  </div>

                  <div className="relative flex min-h-[13rem] flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
                    <motion.div aria-hidden className="absolute -bottom-4 -right-4 text-slate-200/80"
                      animate={{ y: [0, -10, 0], rotate: [10, 18, 10] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                      <PanelIcon className="h-32 w-32" />
                    </motion.div>
                    <div className="relative">
                      <div className="text-xs font-semibold text-slate-500">{p.label}</div>
                      <div className="mt-1 font-mono text-lg font-bold text-slate-900">{p.value}</div>
                    </div>
                    <div className="relative w-fit rounded border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-600 shadow-sm">{p.note}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </section>

        {/* VOTING STEPS */}
        <section className="border-y border-slate-200/80 bg-slate-50/70 py-14 sm:py-16">
          <motion.div {...inView} variants={group} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro title="How voting works" text="Four simple steps. Easy for you, and locked down for everyone else." />
            <div className="relative mx-auto max-w-6xl">
              {/* line that draws itself across the cards on large screens */}
              <motion.div aria-hidden variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.4, delay: 0.3 } } }}
                className="absolute left-[12%] right-[12%] top-[2.4rem] hidden h-0.5 origin-left bg-red-600/30 lg:block" />
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {votingSteps.map((step) => (
                  <TiltCard key={step.id} className="relative rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl">
                    <div aria-hidden className="absolute right-4 top-3 select-none font-mono text-4xl font-black text-slate-100">0{step.id}</div>
                    <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, repeat: Infinity, delay: step.id * 0.4 }}
                      className="relative mb-3 flex h-8 w-8 items-center justify-center rounded border border-red-100 bg-red-50 font-mono text-sm font-bold text-red-600">
                      {step.id}
                    </motion.div>
                    <h4 className="mb-2 pr-8 text-lg font-bold text-slate-900">{step.title}</h4>
                    <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </TiltCard>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECURITY */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <motion.div {...inView} variants={group}>
            <SectionIntro title="Built to be safe" text="Security is part of every layer of the system." />
            <div className="mx-auto grid max-w-5xl gap-5 sm:gap-8 md:grid-cols-3">
              {securityFeatures.map(({ icon: Icon, title, description }, i) => (
                <TiltCard key={title} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl">
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                    className="mb-4 w-fit rounded-lg border border-red-100 bg-red-50 p-3">
                    <Icon className="h-6 w-6 text-red-600" />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{description}</p>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          <p className="mb-1 font-semibold text-slate-700">© 2026 SECURE-VOTE. Fair and open student elections.</p>
          <p className="font-mono text-xs text-slate-400">Built for modern campus leadership.</p>
        </footer>
      </div>
    </MotionConfig>
  );
};