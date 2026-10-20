import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import {
  FaSearch,
  FaSync,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaGavel,
  FaWallet,
  FaUniversity,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
} from "react-icons/fa";
import { MdBallot } from "react-icons/md";

import {
  useDeleteApplicationMutation,
  useGetAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "../../features/APIS/Applcation.Api";
import { useGetUserByIdQuery } from "../../features/APIS/UserApi";
import { useGetPositionByIdQuery } from "../../features/APIS/Position.APi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

const MySwal = withReactContent(Swal);

/* ============================== Types & constants ============================== */
type StatusKey = "PENDING" | "APPROVED" | "REJECTED";
type ApproverRole = "school_dean" | "accounts" | "admin";

const ITEMS_PER_PAGE = 9;

const STATUS_STYLE: Record<StatusKey, { label: string; badge: string; dot: string }> = {
  PENDING: { label: "Pending", badge: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", badge: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", badge: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-600" },
};

const ROLE_LABEL: Record<ApproverRole, string> = {
  school_dean: "School dean",
  accounts: "Accounts office",
  admin: "Admin",
};

const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: "rounded-3xl p-6",
    title: "text-2xl font-black text-slate-900",
    htmlContainer: "text-slate-600",
    input: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10",
    confirmButton: "mx-1 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800",
    cancelButton: "mx-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50",
  },
};

const selectClass =
  "w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10";

/* ================================== Helpers ================================== */
const schoolLabel = (s?: string) => (s || "").replace(/_/g, " ");
const statusOf = (app: any): StatusKey => {
  const s = String(app?.overall_status || "PENDING").toUpperCase();
  return (s in STATUS_STYLE ? s : "PENDING") as StatusKey;
};

const getAdminId = () => {
  try {
    const userString = localStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      return user.id || user._id;
    }
    const persistAuth = localStorage.getItem("persist:auth");
    if (persistAuth) {
      const authObj = JSON.parse(persistAuth);
      const userObj = JSON.parse(authObj.user);
      return userObj.user?.id || userObj.id;
    }
  } catch {
    /* fall through to null */
  }
  return null;
};

/* ================================== Motion ================================== */
const page: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ====================== Small components that fetch their own data ====================== */
const CandidateName = ({ id, large = false }: { id: string; large?: boolean }) => {
  const { data, isLoading } = useGetUserByIdQuery(id);
  const user = (data as any)?.data || (data as any)?.user || data;
  return (
    <h3 className={`font-black leading-tight text-slate-900 ${large ? "text-2xl" : "text-xl"}`}>
      {user?.name || (isLoading ? "Loading..." : "Unknown candidate")}
    </h3>
  );
};

const PositionName = ({ id }: { id: string }) => {
  const { data, isLoading } = useGetPositionByIdQuery(id);
  const pos = (data as any)?.data || (data as any)?.position || data;
  return <p className="mt-1 text-sm font-bold text-red-700">{pos?.name || (isLoading ? "Loading..." : "Unknown position")}</p>;
};

const PositionOption = ({ id }: { id: string }) => {
  const { data } = useGetPositionByIdQuery(id);
  const pos = (data as any)?.data || (data as any)?.position || data;
  return <option value={id}>{pos?.name || "Loading..."}</option>;
};

/* ============================== Small components ============================== */
const Counter = ({ to }: { to: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 0.9, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [seen, to]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
};

const StatCard = ({ label, value, dot }: { label: string; value: number; dot?: string }) => (
  <div className="bg-white p-5">
    <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
    </p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
      <Counter to={value} />
    </p>
  </div>
);

const StatusPill = ({ status }: { status: StatusKey }) => {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${s.badge}`}>
      <span className="relative flex h-2 w-2">
        {status === "PENDING" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
};

const ApplicationCard = ({
  app, index, onReview, onDelete,
}: { app: any; index: number; onReview: (a: any) => void; onDelete: (a: any) => void }) => (
  <motion.article
    layout="position"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
    exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
  >
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
        {schoolLabel(app.school) || "No school"}
      </span>
      <StatusPill status={statusOf(app)} />
    </div>

    <div className="mt-4">
      <CandidateName id={app.student_id} />
      <PositionName id={app.position_id} />
    </div>

    <div className="mt-4 flex-1 border-l-2 border-red-100 pl-4">
      <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">{app.manifesto || "No manifesto added."}</p>
    </div>

    <div className="mt-5 flex gap-2">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onReview(app)}
        className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20"
      >
        Review application
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onDelete(app)}
        aria-label="Delete application"
        title="Delete application"
        className="rounded-xl border border-red-100 bg-red-50 px-4 text-red-700 transition-colors hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600/20"
      >
        <FaTrash size={13} />
      </motion.button>
    </div>
  </motion.article>
);

const Pagination = ({
  page: current, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    <button
      disabled={current <= 1}
      onClick={() => onChange(current - 1)}
      aria-label="Previous page"
      className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaChevronLeft size={11} />
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        aria-current={n === current ? "page" : undefined}
        className={`h-10 w-10 rounded-lg text-sm font-bold transition ${
          n === current ? "bg-red-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-700"
        }`}
      >
        {n}
      </button>
    ))}
    <button
      disabled={current >= totalPages}
      onClick={() => onChange(current + 1)}
      aria-label="Next page"
      className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaChevronRight size={11} />
    </button>
  </div>
);

/** Dark backdrop with a panel that pops in. Closes on Escape or a click outside. */
const Modal = ({
  title, subtitle, onClose, children,
}: { title: ReactNode; subtitle?: string; onClose: () => void; children: ReactNode }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 220, damping: 22 } }}
        exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.15 } }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/10"
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
};

const DecisionButton = ({
  icon, title, hint, onClick, disabled, tone = "light",
}: { icon: ReactNode; title: string; hint: string; onClick: () => void; disabled?: boolean; tone?: "light" | "dark" }) => (
  <motion.button
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors focus:outline-none focus:ring-4 focus:ring-red-600/15 disabled:opacity-50 ${
      tone === "dark"
        ? "border-slate-900 bg-slate-900 text-white hover:bg-red-700"
        : "border-slate-200 bg-white text-slate-800 hover:border-red-200 hover:bg-red-50"
    }`}
  >
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === "dark" ? "bg-white/10" : "bg-red-50 text-red-700"}`}>{icon}</span>
    <span className="min-w-0">
      <span className="block text-sm font-bold">{title}</span>
      <span className={`block text-xs ${tone === "dark" ? "text-slate-300" : "text-slate-500"}`}>{hint}</span>
    </span>
  </motion.button>
);

/* ================================ The page ================================ */
const CandidateApplication = () => {
  /* ---------- Data ---------- */
  const { data: applications, isLoading, refetch, isFetching } = useGetAllApplicationsQuery();
  const { data: electionsData, isLoading: isLoadingElections } = useGetAllElectionsQuery();

  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();

  /* ---------- Filters ---------- */
  const [filter, setFilter] = useState("ALL");
  const [selectedElectionId, setSelectedElectionId] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("ALL");
  const [selectedPosition, setSelectedPosition] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const [reviewing, setReviewing] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const elections = useMemo(() => {
    if (!electionsData) return [];
    const data = (electionsData as any)?.elections || (electionsData as any)?.data || electionsData;
    return Array.isArray(data) ? data : [];
  }, [electionsData]);

  const allApps: any[] = useMemo(() => {
    const raw = Array.isArray(applications) ? applications : (applications as any)?.applications;
    return Array.isArray(raw) ? raw : [];
  }, [applications]);

  const uniqueSchools = useMemo(() => Array.from(new Set(allApps.map((a) => a.school).filter(Boolean))) as string[], [allApps]);
  const uniquePositions = useMemo(() => Array.from(new Set(allApps.map((a) => a.position_id).filter(Boolean))) as string[], [allApps]);

  /* Everything except the status filter, so the status chips can show their counts */
  const baseFiltered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allApps.filter(
      (app) =>
        (selectedElectionId === "ALL" || app.election_id === selectedElectionId) &&
        (selectedSchool === "ALL" || app.school === selectedSchool) &&
        (selectedPosition === "ALL" || app.position_id === selectedPosition) &&
        (term === "" || app.manifesto?.toLowerCase().includes(term))
    );
  }, [allApps, selectedElectionId, selectedSchool, selectedPosition, searchTerm]);

  const statusCounts = useMemo(() => {
    const c = { ALL: baseFiltered.length, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    baseFiltered.forEach((a) => (c[statusOf(a)] += 1));
    return c;
  }, [baseFiltered]);

  const filteredApps = useMemo(
    () => (filter === "ALL" ? baseFiltered : baseFiltered.filter((a) => statusOf(a) === filter)),
    [baseFiltered, filter]
  );

  const totals = useMemo(() => {
    const t = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
    allApps.forEach((a) => (t[statusOf(a)] += 1));
    return t;
  }, [allApps]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredApps.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const hasFilters = filter !== "ALL" || selectedElectionId !== "ALL" || selectedSchool !== "ALL" || selectedPosition !== "ALL" || !!searchTerm;
  const clearFilters = () => {
    setFilter("ALL");
    setSelectedElectionId("ALL");
    setSelectedSchool("ALL");
    setSelectedPosition("ALL");
    setSearchTerm("");
  };

  useEffect(() => setCurrentPage(1), [filter, selectedElectionId, selectedSchool, selectedPosition, searchTerm]);

  /* ---------- Actions ---------- */
  /** Asks for notes, then saves the decision. Returns true when it was saved. */
  const confirmAction = async (app: any, role: ApproverRole, status: "APPROVED" | "REJECTED") => {
    const approving = status === "APPROVED";
    const { value: comment, isConfirmed } = await MySwal.fire({
      ...swalBase,
      icon: approving ? "question" : "warning",
      title: approving ? "Approve this application?" : "Reject this application?",
      text: `You are acting as: ${ROLE_LABEL[role]}`,
      input: "textarea",
      inputPlaceholder: "Write a short note about your decision",
      inputValue: approving ? "Requirements verified. Approved." : "Criteria not met. Rejected.",
      showCancelButton: true,
      confirmButtonText: approving ? "Yes, approve" : "Yes, reject",
      cancelButtonText: "Go back",
    });
    if (!isConfirmed) return false;

    try {
      await updateStatus({
        applicationId: app.id,
        approverRole: role as any,
        approverId: getAdminId(),
        status,
        comment: comment || "",
      }).unwrap();

      toast.success(`The application was ${approving ? "approved" : "rejected"}`);
      setReviewing(null);
      refetch();
      return true;
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not save your decision. Please try again.");
      return false;
    }
  };

  const handleDeleteRecord = async (app: any) => {
    const res = await MySwal.fire({
      ...swalBase,
      icon: "warning",
      title: "Delete this application?",
      text: "It will be removed for good. This cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep it",
    });
    if (!res.isConfirmed) return;

    setDeletingId(app.id);
    try {
      await deleteApplication(app.id).unwrap();
      toast.success("The application was deleted");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not delete the application");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Loading ---------- */
  if (isLoading || isLoadingElections) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading applications...</p>
      </div>
    );
  }

  const chips = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <motion.header variants={item} className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                <MdBallot className="text-red-700" /> Candidate applications
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">Read each application, then approve it or reject it.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <label htmlFor="search" className="sr-only">Search manifestos</label>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search manifestos"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10 md:w-72"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh the list"
                title="Refresh the list"
                className="rounded-xl border border-slate-200 bg-white p-3.5 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10"
              >
                <FaSync className={isFetching ? "animate-spin text-red-700" : ""} />
              </motion.button>
            </div>
          </motion.header>

          {/* Numbers */}
          <motion.div variants={item} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
            <StatCard label="All applications" value={allApps.length} />
            <StatCard label="Pending" value={totals.PENDING} dot="bg-amber-500" />
            <StatCard label="Approved" value={totals.APPROVED} dot="bg-emerald-500" />
            <StatCard label="Rejected" value={totals.REJECTED} dot="bg-red-600" />
          </motion.div>

          {/* Filters */}
          <motion.div variants={item} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="f-election" className="mb-1 block text-sm font-semibold text-slate-600">Election</label>
                <select id="f-election" value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)} className={selectClass}>
                  <option value="ALL">All elections</option>
                  {elections.map((election: any) => (
                    <option key={election.id || election._id} value={election.id || election._id}>
                      {election.name || election.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-school" className="mb-1 block text-sm font-semibold text-slate-600">School</label>
                <select id="f-school" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} className={selectClass}>
                  <option value="ALL">All schools</option>
                  {uniqueSchools.map((school) => (
                    <option key={school} value={school}>{schoolLabel(school)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-position" className="mb-1 block text-sm font-semibold text-slate-600">Position</label>
                <select id="f-position" value={selectedPosition} onChange={(e) => setSelectedPosition(e.target.value)} className={selectClass}>
                  <option value="ALL">All positions</option>
                  {uniquePositions.map((posId) => (
                    <PositionOption key={posId} id={posId} />
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => {
                  const active = filter === chip.value;
                  return (
                    <button
                      key={chip.value}
                      onClick={() => setFilter(chip.value)}
                      aria-pressed={active}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition ${
                        active ? "border-red-700 bg-red-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-700"
                      }`}
                    >
                      {chip.label} <span className={active ? "text-red-100" : "text-slate-400"}>{statusCounts[chip.value as keyof typeof statusCounts]}</span>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {hasFilters && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={clearFilters}
                    className="text-sm font-bold text-red-700 hover:underline"
                  >
                    Clear filters
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* List */}
          <motion.div variants={item} className="space-y-5">
            <p className="text-sm text-slate-500">
              {filteredApps.length.toLocaleString()} {filteredApps.length === 1 ? "application" : "applications"}
              {hasFilters ? " match your filters" : ""}
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence initial={false}>
                {pageItems.map((app, i) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    index={i}
                    onReview={setReviewing}
                    onDelete={deletingId === app.id ? () => undefined : handleDeleteRecord}
                  />
                ))}
              </AnimatePresence>
            </div>

            {pageItems.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <MdBallot className="mx-auto mb-4 text-slate-200" size={52} />
                <p className="text-sm font-bold text-slate-700">{hasFilters ? "No applications match your filters" : "There are no applications yet"}</p>
                <p className="mt-1 text-sm text-slate-500">{hasFilters ? "Try different filters or clear them." : "New applications will show up here."}</p>
              </motion.div>
            )}

            {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} />}
          </motion.div>
        </motion.div>

        {/* Review window */}
        <AnimatePresence>
          {reviewing && (
            <Modal key="review" title="Review application" subtitle="Choose who you are acting as, or reject the application" onClose={() => setReviewing(null)}>
              <div className="space-y-5 p-6">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusPill status={statusOf(reviewing)} />
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {schoolLabel(reviewing.school) || "No school"}
                    </span>
                  </div>
                  <CandidateName id={reviewing.student_id} large />
                  <PositionName id={reviewing.position_id} />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="flex items-center gap-2 text-sm font-bold text-red-800">
                    <FaQuoteLeft size={11} /> Manifesto
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {reviewing.manifesto || "This candidate did not add a manifesto."}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700">Approve as</p>
                  <DecisionButton
                    icon={<FaUniversity />}
                    title="School dean"
                    hint="The academic approval"
                    onClick={() => confirmAction(reviewing, "school_dean", "APPROVED")}
                    disabled={isUpdating}
                  />
                  <DecisionButton
                    icon={<FaWallet />}
                    title="Accounts office"
                    hint="The finance check"
                    onClick={() => confirmAction(reviewing, "accounts", "APPROVED")}
                    disabled={isUpdating}
                  />
                  <DecisionButton
                    icon={<FaGavel />}
                    title="Admin"
                    hint="The final approval"
                    onClick={() => confirmAction(reviewing, "admin", "APPROVED")}
                    disabled={isUpdating}
                    tone="dark"
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => confirmAction(reviewing, "admin", "REJECTED")}
                    disabled={isUpdating}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-100 py-3.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:opacity-50"
                  >
                    <FaTimesCircle /> Reject application
                  </motion.button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default CandidateApplication;