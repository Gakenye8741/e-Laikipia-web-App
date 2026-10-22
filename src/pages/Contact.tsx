import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, AlertTriangle } from "lucide-react";
import { MdSupportAgent, MdAlternateEmail, MdOutlineContactSupport } from "react-icons/md";
import {
  motion, MotionConfig, useScroll, useSpring, useMotionValue, useTransform,
  useAnimationControls, type Variants,
} from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import Seo, { PAGES } from "../components/Seo";

/* --------------------------- Animations ---------------------------- */

const group: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 16 } },
};
const slideLeft: Variants = {
  hidden: { opacity: 0, x: -70 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};
const slideRight: Variants = {
  hidden: { opacity: 0, x: 70 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};
const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.1 } } as const;

/** Red bar at the top that fills as you scroll */
const ScrollBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-red-600" />;
};

/** Title where each word flies in */
const WordReveal = ({ words }: { words: { text: string; red?: boolean }[] }) => (
  <motion.h1
    variants={group} initial="hidden" animate="show"
    className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
  >
    {words.map((w, i) => (
      <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
        <motion.span
          variants={{
            hidden: { y: "110%", rotate: 8, opacity: 0 },
            show: { y: 0, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 140, damping: 14 } },
          }}
          className={`inline-block ${w.red ? "text-red-600" : ""}`}
        >
          {w.text}
        </motion.span>
      </span>
    ))}
  </motion.h1>
);

/** Card that tilts in 3D toward the pointer */
const TiltCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 });
  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
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

/** Light streak that sweeps across its parent */
const Shine = () => (
  <motion.span
    aria-hidden
    initial={{ x: "-150%" }} animate={{ x: "500%" }}
    transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
    className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/60"
  />
);

/** Floating icons behind the header */
const FLOATERS = [
  { Icon: Mail, left: "6%", top: "20%", d: 0 },
  { Icon: Phone, left: "78%", top: "10%", d: 1 },
  { Icon: MessageSquare, left: "90%", top: "60%", d: 2 },
  { Icon: MapPin, left: "55%", top: "70%", d: 3 },
];

/* ------------------------------ Page ------------------------------- */

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Problem checking my vote",
    message: "",
  });

  // Makes the "off" button shake when someone tries to press it
  const shake = useAnimationControls();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The form is turned off because it is only a demo
  };

  const contactMethods = [
    { icon: Mail, label: "Email", value: "support@Secure-Vote.ac.ke", sub: "For general questions" },
    { icon: Phone, label: "Phone", value: "+254 700 000 000", sub: "For urgent problems" },
    { icon: MapPin, label: "Visit Us", value: "Computing & Informatics Dept", sub: "Main Campus, Nyahururu" },
  ];

  const fieldBase =
    "w-full cursor-not-allowed rounded-xl border border-slate-200/85 bg-slate-100 p-4 text-sm font-medium text-slate-400 outline-none";
  const labelBase = "mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600";

  return (
    <MotionConfig reducedMotion="user">
       <Seo {...PAGES.contact} />
      <div className="flex min-h-screen flex-col justify-between overflow-x-hidden bg-slate-50 font-sans text-slate-800 selection:bg-red-600 selection:text-white">
        <ScrollBar />
        <div>
          <Navbar />

          <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8">

            {/* HEADER */}
            <header className="relative mb-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white px-6 py-10 shadow-sm sm:mb-12 sm:px-10 sm:py-14">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-red-600" />
              <motion.div aria-hidden className="pointer-events-none absolute -left-16 top-0 h-60 w-60 rounded-full bg-red-600/10 blur-3xl"
                animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.25, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div aria-hidden className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-red-600/10 blur-3xl"
                animate={{ x: [0, -40, 0], y: [0, -40, 0], scale: [1.1, 0.9, 1.1] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }} />

              {FLOATERS.map(({ Icon, left, top, d }, i) => (
                <motion.span key={i} aria-hidden className="pointer-events-none absolute text-red-600/15"
                  style={{ left, top }}
                  animate={{ y: [0, -18, 0], rotate: [0, 12, -12, 0] }}
                  transition={{ duration: 5 + d, repeat: Infinity, ease: "easeInOut", delay: d * 0.4 }}>
                  <Icon className="h-8 w-8 sm:h-12 sm:w-12" />
                </motion.span>
              ))}

              <div className="relative">
                <WordReveal words={[{ text: "Help" }, { text: "&" }, { text: "Contact", red: true }]} />
                <motion.p
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  className="mt-3 max-w-md text-sm text-slate-600 sm:text-base"
                >
                  Have a problem or a question? Here is how to reach us.
                </motion.p>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">

              {/* SIDEBAR: CONTACT METHODS */}
              <aside className="lg:col-span-4">
                <motion.div {...inView} variants={slideLeft} className="lg:sticky lg:top-28">
                  <TiltCard className="space-y-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                    <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-red-100 bg-red-50 p-6">
                      {[0, 1].map((i) => (
                        <motion.span key={i} aria-hidden className="absolute h-16 w-16 rounded-full border-2 border-red-600/40"
                          animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }} />
                      ))}
                      <motion.div
                        animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        whileHover={{ scale: 1.2, rotate: 360 }}
                      >
                        <MdSupportAgent className="relative text-5xl text-red-600" />
                      </motion.div>
                    </div>

                    <motion.div variants={group} {...inView} className="space-y-6">
                      {contactMethods.map(({ icon: Icon, label, value, sub }) => (
                        <motion.div
                          key={label} variants={rise} whileHover={{ x: 8 }}
                          className="group border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                        >
                          <div className="mb-1 flex items-center gap-2.5">
                            <span className="transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-125">
                              <Icon size={18} className="text-red-600" />
                            </span>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                          </div>
                          <p className="ml-7 break-words text-sm font-extrabold text-slate-900 transition-colors duration-300 group-hover:text-red-600">{value}</p>
                          <p className="ml-7 text-xs text-slate-500">{sub}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span className="relative flex">
                          <motion.span aria-hidden className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                            animate={{ scale: [1, 2.4], opacity: [0.7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />
                          <Globe size={16} className="relative text-emerald-500" />
                        </span>
                        <span>Secure-Vote is: <span className="font-extrabold text-emerald-600">Online</span></span>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              </aside>

              {/* MAIN: CONTACT FORM */}
              <article className="lg:col-span-8">
                <motion.div {...inView} variants={slideRight}
                  className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
                    <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900">
                      <motion.span animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}>
                        <MdOutlineContactSupport className="text-red-600" size={24} />
                      </motion.span>
                      Send a Message
                    </h2>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }} transition={{ duration: 2.4, repeat: Infinity }}
                      className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600"
                    >
                      Form is off (demo)
                    </motion.span>
                  </div>

                  <motion.form {...inView} variants={group} onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <motion.div variants={rise}>
                        <label className={labelBase}>Your Name</label>
                        <input disabled type="text" name="name" value={formData.name} onChange={handleChange}
                          placeholder="e.g. Gakenye Ndiritu" className={fieldBase} />
                      </motion.div>
                      <motion.div variants={rise}>
                        <label className={labelBase}>Your Email</label>
                        <div className="relative">
                          <input disabled type="email" name="email" value={formData.email} onChange={handleChange}
                            placeholder="name@Secure-Vote.ac.ke" className={`${fieldBase} pl-12`} />
                          <MdAlternateEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-300" />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div variants={rise}>
                      <label className={labelBase}>What is this about?</label>
                      <select disabled name="subject" value={formData.subject} onChange={handleChange}
                        className={`${fieldBase} text-xs font-bold uppercase`}>
                        <option value="Problem checking my vote">Problem checking my vote</option>
                        <option value="Help with voter sign-up">Help with voter sign-up</option>
                        <option value="Question about candidate approval">Question about candidate approval</option>
                        <option value="Other help">Other help</option>
                      </select>
                    </motion.div>

                    <motion.div variants={rise}>
                      <label className={labelBase}>Your Message</label>
                      <textarea disabled rows={5} name="message" value={formData.message} onChange={handleChange}
                        placeholder="Tell us your problem or question..." className={`${fieldBase} resize-none`} />
                    </motion.div>

                    <motion.div variants={rise} className="space-y-3">
                      {/* Wrapper catches the tap, because disabled buttons do not fire events */}
                      <motion.div
                        animate={shake}
                        onPointerDown={() => shake.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.5 } })}
                      >
                        <button
                          disabled
                          type="submit"
                          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 py-4 text-sm font-bold uppercase tracking-wider text-slate-400"
                        >
                          <Send size={16} /> Send Message (Off)
                        </button>
                      </motion.div>

                      <div className="relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-600">
                        <Shine />
                        <motion.span className="shrink-0" animate={{ rotate: [0, -14, 14, -14, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}>
                          <AlertTriangle size={14} />
                        </motion.span>
                        <span className="relative">This form is turned off for now. It is only a demo.</span>
                      </div>
                    </motion.div>
                  </motion.form>

                  <div className="border-t border-slate-100 bg-slate-50 p-6 text-center sm:p-8">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <MessageSquare size={16} className="text-slate-400" />
                      </motion.span>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Support Chat Is Off</p>
                    </div>
                    <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-500">
                      You cannot send messages here right now. Please use the email or phone number on the left.
                    </p>
                  </div>
                </motion.div>
              </article>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </MotionConfig>
  );
};

export default ContactPage;