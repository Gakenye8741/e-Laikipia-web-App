import { useState, useEffect, useRef, type RefObject } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring, type Variants } from "framer-motion";
import type { RootState } from "../App/store";
import { clearCredentials } from "../features/Auth/AuthSlice";

import {
  Home, LogIn, LogOut, ChevronDown, Phone, Info, Code, ShieldCheck,
  GraduationCap, School, UserX, Wallet, BarChart3, Download, Smartphone, type LucideIcon,
} from "lucide-react";

import "./animate.css";
import { MdDashboard } from "react-icons/md";

/* -------------------------------------------------------------------------- */
/*  Links                                                                      */
/* -------------------------------------------------------------------------- */

type NavLink = { to: string; label: string; icon: LucideIcon };

const HOME: NavLink = { to: "/", label: "Home", icon: Home };
const RESULTS: NavLink = { to: "/results", label: "Results", icon: BarChart3 };
const ABOUT: NavLink = { to: "/about", label: "About", icon: Info };
const CONTACT: NavLink = { to: "/contact", label: "Contact", icon: Phone };
const DEVELOPER: NavLink = { to: "/developer", label: "Developer", icon: Code };
const APP: NavLink = { to: "/download", label: "Get the App", icon: Download };

const PAGE_LINKS = [HOME, RESULTS, ABOUT, CONTACT, DEVELOPER]; // desktop bar + phone menu
const TAB_LEFT = [HOME, RESULTS];                              // phone bottom bar
const TAB_RIGHT = [ABOUT, CONTACT];

const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

const drawerList: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
const drawerItem: Variants = {
  hidden: { opacity: 0, x: 60, rotate: 4 },
  show: { opacity: 1, x: 0, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 18 } },
};

/* -------------------------------------------------------------------------- */
/*  Small hooks                                                                */
/* -------------------------------------------------------------------------- */

const useScrolled = (offset = 20) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);
  return scrolled;
};

/** Calls close() on outside click or Escape while open */
const useDismiss = (open: boolean, close: () => void, ref?: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref?.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    if (ref) document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, ref]);
};

/** Stops the page from scrolling behind an open menu */
const useLockScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
};

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                     */
/* -------------------------------------------------------------------------- */

const Logo = () => (
  <Link to="/" className="group flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
    <motion.div
      animate={{ rotate: [0, -8, 8, 0] }}
      transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatDelay: 6 }}
      whileHover={{ scale: 1.15, rotate: 360 }}
      className="flex shrink-0 items-center justify-center rounded-xl bg-red-600 p-2 text-white shadow-md shadow-red-200"
    >
      <ShieldCheck size={20} />
    </motion.div>
    <div className="flex min-w-0 flex-col leading-tight">
      <span className="select-none truncate text-sm font-black uppercase italic tracking-tight text-slate-900 sm:text-base">Secure-Vote</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Laikipia University</span>
    </div>
  </Link>
);

const DesktopLinks = ({ isCurrent }: { isCurrent: (p: string) => boolean }) => (
  <nav className="hidden items-center lg:flex" aria-label="Main">
    <ul className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
      {PAGE_LINKS.map(({ to, label, icon: Icon }) => {
        const active = isCurrent(to);
        return (
          <li key={to}>
            <Link
              to={to}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                active ? "font-extrabold text-red-600" : "text-slate-600 hover:text-red-600"
              }`}
            >
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12"><Icon size={15} /></span>
              {label}
              {active && (
                <motion.span layoutId="desktop-underline" transition={spring}
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-red-600" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

/** Desktop "Get the App" button: it stands out from the plain text links */
const AppButton = ({ active }: { active: boolean }) => (
  <motion.div whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.95 }} className="relative hidden lg:block">
    <motion.span aria-hidden className="absolute inset-0 rounded-xl bg-red-600"
      animate={{ scale: [1, 1.25], opacity: [0.35, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
    <Link
      to={APP.to}
      aria-current={active ? "page" : undefined}
      className="relative flex items-center gap-2 overflow-hidden rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
    >
      <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/30"
        initial={{ x: "-150%" }} animate={{ x: "500%" }}
        transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
      <motion.span className="relative" animate={{ y: [0, -2.5, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
        <Download size={15} />
      </motion.span>
      <span className="relative">Get the App</span>
    </Link>
  </motion.div>
);

const LoginButton = () => (
  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
    <Link
      to="/login"
      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:px-5"
    >
      <LogIn size={15} /> Log in
    </Link>
  </motion.div>
);

const menuLink =
  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600";

const AccountMenu = ({
  name, userRole, onLogout, pathname,
}: { name?: string; userRole?: string; onLogout: () => void; pathname: string }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(close, [pathname]);
  useDismiss(open, close, ref);

  /* ================= ROLE CHECKING ================= */
  const isSchoolDean = userRole?.startsWith("Dean_of_") && userRole !== "Dean_of_Students";
  const isVoter = userRole?.toLowerCase() === "voter";
  const isAccountant = userRole === "Accountants" || userRole === "Accounts";
  const assignedSchool = isSchoolDean ? userRole?.replace("Dean_of_", "").replace(/_/g, " ") : null;

  const roleLabel = isVoter
    ? "Verified voter"
    : isAccountant
      ? "Accounts officer"
      : isSchoolDean
        ? `Dean: ${assignedSchool}`
        : userRole === "Dean_of_Students"
          ? "Dean of Students"
          : "Admin";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-2 py-1.5 shadow-sm transition hover:border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:px-3 sm:py-2"
      >
        <div className="hidden text-right sm:block">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{roleLabel}</p>
          <p className="max-w-[120px] truncate text-xs font-black uppercase text-slate-900">{name}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 transition-colors group-hover:bg-red-600 group-hover:text-white ${open ? "bg-red-600 text-white" : "bg-red-50 text-red-600"}`}>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
            <ChevronDown size={16} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 z-[110] mt-3 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"
          >
            <li className="mb-1 border-b border-slate-50 px-4 py-3">
              <p className="truncate text-xs font-black uppercase text-slate-900 sm:hidden">{name}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isVoter ? "Voter menu" : "Your pages"}</p>
            </li>

            {isVoter ? (
              <li className="m-1 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-4">
                <UserX size={18} className="shrink-0 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Voter access</p>
                  <p className="text-[11px] leading-tight text-slate-500">You can vote now.</p>
                </div>
              </li>
            ) : userRole === "Dean_of_Students" ? (
              <li role="none">
                <Link role="menuitem" to="/dean-student-dashboard/" className={`${menuLink} hover:bg-red-50 hover:text-red-600`}>
                  <GraduationCap size={16} className="text-red-600" /> Students dashboard
                </Link>
              </li>
            ) : isSchoolDean ? (
              <li role="none">
                <Link role="menuitem" to="/dean-school-dashboard/" className={`${menuLink} hover:bg-red-50 hover:text-red-600`}>
                  <School size={16} className="text-red-600" /> Dean: {assignedSchool}
                </Link>
              </li>
            ) : isAccountant ? (
              <li role="none">
                <Link role="menuitem" to="/accounts-dashboard/" className={`${menuLink} hover:bg-emerald-50 hover:text-emerald-700`}>
                  <Wallet size={16} className="text-emerald-600" /> Accounts dashboard
                </Link>
              </li>
            ) : (
              <li role="none">
                <Link role="menuitem" to="/admindashboard/AllElections" className={`${menuLink} hover:bg-slate-50 hover:text-slate-900`}>
                  <MdDashboard size={16} className="text-slate-500" /> Admin dashboard
                </Link>
              </li>
            )}

            <li role="none" className="mt-1 border-t border-slate-100 pt-1">
              <button role="menuitem" onClick={onLogout} className={`${menuLink} w-full text-red-600 hover:bg-red-50`}>
                <LogOut size={16} /> Log out
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const Hamburger = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => (
  <motion.button
    whileTap={{ scale: 0.88 }}
    onClick={onToggle}
    aria-label={open ? "Close menu" : "Open menu"}
    aria-expanded={open}
    className="relative z-[130] flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm transition-colors hover:border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 lg:hidden"
  >
    <span className="relative block h-4 w-5">
      <motion.span className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-slate-900"
        animate={open ? { y: 7, rotate: 45, backgroundColor: "#dc2626" } : { y: 0, rotate: 0, backgroundColor: "#0f172a" }} />
      <motion.span className="absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-slate-900"
        animate={open ? { opacity: 0, x: 16 } : { opacity: 1, x: 0 }} />
      <motion.span className="absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-slate-900"
        animate={open ? { y: -7, rotate: -45, backgroundColor: "#dc2626" } : { y: 0, rotate: 0, backgroundColor: "#0f172a" }} />
    </span>
  </motion.button>
);

/** Phone menu that slides in from the right */
const Drawer = ({ open, onClose, isCurrent }: { open: boolean; onClose: () => void; isCurrent: (p: string) => boolean }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[120] lg:hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
        <motion.aside
          role="dialog" aria-modal="true" aria-label="Menu"
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="absolute right-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col overflow-hidden bg-white pt-24 shadow-2xl"
        >
          <motion.div aria-hidden className="pointer-events-none absolute -right-10 top-24 h-48 w-48 rounded-full bg-red-600/10 blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div aria-hidden className="pointer-events-none absolute -left-10 bottom-40 h-56 w-56 rounded-full bg-red-600/10 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }} transition={{ duration: 10, repeat: Infinity }} />

          <motion.ul variants={drawerList} initial="hidden" animate="show" className="relative flex-1 space-y-2 overflow-y-auto px-4 pb-4">
            {PAGE_LINKS.map(({ to, label, icon: Icon }) => {
              const active = isCurrent(to);
              return (
                <motion.li key={to} variants={drawerItem}>
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 ${
                      active ? "bg-red-600 text-white shadow-lg shadow-red-600/30" : "bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-active:rotate-12 group-active:scale-90 ${active ? "bg-white/20" : "bg-white text-red-600 shadow-sm"}`}>
                      <Icon size={19} />
                    </span>
                    {label}
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Big download card at the bottom of the menu */}
          <motion.div variants={drawerItem} initial="hidden" animate="show" transition={{ delay: 0.6 }} className="relative px-4 pb-6">
            <Link
              to={APP.to}
              className="group relative block overflow-hidden rounded-2xl bg-red-600 p-5 text-white shadow-xl shadow-red-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <motion.span aria-hidden className="absolute -bottom-6 -right-4 text-white/15"
                animate={{ rotate: [10, 20, 10], y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
                <Smartphone size={110} />
              </motion.span>
              <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/25"
                initial={{ x: "-150%" }} animate={{ x: "500%" }}
                transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }} />
              <div className="relative">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><Download size={20} /></motion.span>
                </div>
                <p className="text-lg font-black">Get the app</p>
                <p className="max-w-[12rem] text-xs font-medium text-red-100">Vote from your phone in under a minute.</p>
              </div>
            </Link>
          </motion.div>
        </motion.aside>
      </div>
    )}
  </AnimatePresence>
);

/** One tab in the phone bottom bar */
const TabItem = ({ link, active }: { link: NavLink; active: boolean }) => {
  const Icon = link.icon;
  return (
    <li>
      <Link
        to={link.to}
        aria-current={active ? "page" : undefined}
        className="relative flex min-h-[3.4rem] flex-col items-center justify-center gap-0.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        {active && (
          <motion.span layoutId="mobile-pill" transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="absolute inset-x-1 inset-y-0.5 rounded-2xl bg-white/10">
            <span className="absolute left-1/2 top-0 h-0.5 w-6 -translate-x-1/2 rounded-full bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)]" />
          </motion.span>
        )}
        <motion.span
          key={String(active)}
          animate={active ? { y: [0, -9, -2], scale: [1, 1.35, 1.15] } : { y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          whileTap={{ scale: 0.8 }}
          className={`relative ${active ? "text-red-500" : "text-slate-400"}`}
        >
          <Icon size={20} strokeWidth={active ? 2.6 : 2} />
        </motion.span>
        <span className={`relative text-[10px] font-bold uppercase tracking-wide ${active ? "text-white" : "text-slate-400"}`}>{link.label}</span>
      </Link>
    </li>
  );
};

const BottomBar = ({ isCurrent }: { isCurrent: (p: string) => boolean }) => {
  const appActive = isCurrent(APP.to);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <motion.nav
        aria-label="Quick links"
        initial={{ y: 120, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 14, delay: 0.3 }}
        className="pointer-events-auto relative w-full max-w-sm rounded-[1.75rem] border border-slate-700/60 bg-slate-900/95 px-2 py-1.5 shadow-2xl shadow-slate-900/40 backdrop-blur-xl"
      >
        <ul className="grid grid-cols-5 items-end">
          {TAB_LEFT.map((l) => <TabItem key={l.to} link={l} active={isCurrent(l.to)} />)}

          {/* Raised App button */}
          <li className="flex justify-center">
            <Link to={APP.to} aria-label="Get the app" aria-current={appActive ? "page" : undefined}
              className="-mt-8 flex flex-col items-center focus-visible:outline-none">
              <motion.span whileTap={{ scale: 0.85, rotate: -8 }} whileHover={{ scale: 1.08 }} className="relative flex h-16 w-16 items-center justify-center">
                <motion.span aria-hidden className="absolute inset-0 rounded-[1.25rem] bg-[conic-gradient(from_0deg,#dc2626,#fecaca,#dc2626,#7f1d1d,#dc2626)]"
                  animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                <motion.span aria-hidden className="absolute inset-0 rounded-[1.25rem] bg-red-600"
                  animate={{ scale: [1, 1.5], opacity: [0.45, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
                <span className="relative flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/50">
                  <motion.span animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                    <Download size={24} />
                  </motion.span>
                </span>
              </motion.span>
              <span className={`mt-1 text-[10px] font-extrabold uppercase tracking-wide ${appActive ? "text-white" : "text-red-400"}`}>App</span>
            </Link>
          </li>

          {TAB_RIGHT.map((l) => <TabItem key={l.to} link={l} active={isCurrent(l.to)} />)}
        </ul>
      </motion.nav>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */

export const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const scrolled = useScrolled();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user?.user);

  const isCurrent = (path: string) => location.pathname === path;
  const closeDrawer = () => setDrawerOpen(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(closeDrawer, [location.pathname]);
  useDismiss(drawerOpen, closeDrawer);
  useLockScroll(drawerOpen);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className={`fixed left-0 top-0 z-[100] w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200/80 bg-white/90 py-2.5 shadow-sm backdrop-blur-md"
            : "border-slate-200/40 bg-slate-50/80 py-3.5 backdrop-blur-sm"
        }`}
      >
        <motion.div style={{ scaleX: progress }} className="absolute inset-x-0 bottom-[-1px] h-0.5 origin-left bg-red-600" />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Logo />
          <DesktopLinks isCurrent={isCurrent} />

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <AppButton active={isCurrent(APP.to)} />
            {isAuthenticated ? (
              <AccountMenu name={user?.name} userRole={user?.role} onLogout={handleLogout} pathname={location.pathname} />
            ) : (
              <LoginButton />
            )}
            <Hamburger open={drawerOpen} onToggle={() => setDrawerOpen((o) => !o)} />
          </div>
        </div>
      </motion.header>

      <Drawer open={drawerOpen} onClose={closeDrawer} isCurrent={isCurrent} />
      <BottomBar isCurrent={isCurrent} />
    </MotionConfig>
  );
};