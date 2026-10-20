import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaPlus,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { MdBallot } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import {
  useGetAllElectionsQuery,
  useCreateElectionMutation,
  useUpdateElectionMutation,
  useDeleteElectionMutation,
  useChangeElectionStatusMutation,
} from "../../features/APIS/Election.Api";
import type { RootState } from "../../App/store";

const MySwal = withReactContent(Swal);

/* ============================== Types & constants ============================== */
type Status = "upcoming" | "ongoing" | "finished";

interface Election {
  id: string;
  name: string;
  status: Status;
  start_date: string;
  end_date: string;
  delegate_start_date?: string;
  delegate_end_date?: string;
  created_by?: string;
  [key: string]: any;
}

interface ElectionForm {
  name: string;
  start_date: string | null;
  end_date: string | null;
  delegate_start_date: string | null;
  delegate_end_date: string | null;
}

const ITEMS_PER_PAGE = 6;

const STATUS_STYLE: Record<Status, { label: string; badge: string; dot: string }> = {
  ongoing: { label: "Ongoing", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  upcoming: { label: "Upcoming", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  finished: { label: "Finished", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

/* Dialog styling: buttons use Tailwind instead of the SweetAlert defaults */
const swalField =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10";
const swalLabel = "mb-1 block text-sm font-semibold text-slate-700";
const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: "rounded-3xl p-6",
    title: "text-2xl font-black text-slate-900",
    htmlContainer: "text-slate-600",
    input: swalField,
    confirmButton: "mx-1 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800",
    cancelButton: "mx-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50",
  },
};

/* ================================== Helpers ================================== */
const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const pad = (n: number) => String(n).padStart(2, "0");

/** Turns a saved date into the local time a datetime-local input expects */
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Turns a datetime-local value into a date string the server can save */
const toISODate = (local: string) => {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "Not set";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "Not set"
    : d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const spanText = (ms: number) => {
  const minutes = Math.round(Math.abs(ms) / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${Math.round(hours / 24)} days`;
};

/** A short sentence about where the election is in time */
const timeNote = (e: Election) => {
  const target = new Date(e.status === "upcoming" ? e.start_date : e.end_date).getTime();
  if (Number.isNaN(target)) return "";
  const diff = target - Date.now();
  const text = spanText(diff);
  if (e.status === "finished") return `Ended ${text} ago`;
  if (e.status === "upcoming") return diff > 0 ? `Starts in ${text}` : `Was due to start ${text} ago`;
  return diff > 0 ? `Ends in ${text}` : `Was due to end ${text} ago`;
};

const phaseState = (start?: string, end?: string) => {
  const s = start ? new Date(start).getTime() : NaN;
  const e = end ? new Date(end).getTime() : NaN;
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return { label: "Dates not set", percent: 0 };
  const now = Date.now();
  if (now < s) return { label: "Not started", percent: 0 };
  if (now >= e) return { label: "Done", percent: 100 };
  return { label: "Running now", percent: Math.round(((now - s) / (e - s)) * 100) };
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
  <motion.div variants={item} className="bg-white p-5">
    <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {label}
    </p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
      <Counter to={value} />
    </p>
  </motion.div>
);

const StatusBadge = ({ status }: { status: Status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.finished;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${s.badge}`}>
      <span className="relative flex h-2 w-2">
        {status === "ongoing" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.label}
    </span>
  );
};

const PhaseBlock = ({
  title, start, end, accent,
}: { title: string; start?: string; end?: string; accent: "slate" | "red" }) => {
  const state = phaseState(start, end);
  return (
    <div className={`rounded-xl p-4 ${accent === "red" ? "bg-red-50/70" : "bg-slate-50"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-sm font-bold ${accent === "red" ? "text-red-800" : "text-slate-800"}`}>{title}</p>
        <span className="text-xs font-semibold text-slate-500">{state.label}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
        <motion.div
          className={`h-full rounded-full ${accent === "red" ? "bg-red-700" : "bg-slate-700"}`}
          initial={{ width: 0 }}
          animate={{ width: `${state.percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        />
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Opens</dt>
          <dd className="text-right font-semibold text-slate-800">{formatDateTime(start)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">Closes</dt>
          <dd className="text-right font-semibold text-slate-800">{formatDateTime(end)}</dd>
        </div>
      </dl>
    </div>
  );
};

const ActionButton = ({
  label, icon, onClick, danger = false, disabled = false,
}: { label: string; icon: ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors focus:outline-none focus:ring-4 focus:ring-red-600/10 disabled:opacity-50 ${
      danger ? "hover:border-red-200 hover:bg-red-50 hover:text-red-700" : "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    {icon} {label}
  </motion.button>
);

const ElectionCard = ({
  election, index, deleting, onEdit, onStatus, onDelete,
}: {
  election: Election; index: number; deleting: boolean;
  onEdit: (e: Election) => void; onStatus: (e: Election) => void; onDelete: (e: Election) => void;
}) => (
  <motion.article
    layout="position"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
    className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60 sm:p-6"
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <StatusBadge status={election.status} />
          <span className="text-sm text-slate-500">{timeNote(election)}</span>
        </div>
        <h3 className="truncate text-xl font-black text-slate-900">{election.name}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton label="Edit" icon={<FaEdit />} onClick={() => onEdit(election)} />
        <ActionButton label="Change status" icon={<FaSyncAlt />} onClick={() => onStatus(election)} />
        <ActionButton label="Delete" icon={deleting ? <FaSync className="animate-spin" /> : <FaTrash />} onClick={() => onDelete(election)} danger disabled={deleting} />
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
      <PhaseBlock title="Voter phase" start={election.start_date} end={election.end_date} accent="slate" />
      <PhaseBlock title="Delegate phase" start={election.delegate_start_date} end={election.delegate_end_date} accent="red" />
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

/* ================================ The page ================================ */
export const AllElections = () => {
  /* ---------- Data ---------- */
  const { data: electionsRaw, isLoading, isError, isFetching, refetch } = useGetAllElectionsQuery(undefined);
  const { user } = useSelector((state: RootState) => state.auth);

  const [createElection] = useCreateElectionMutation();
  const [updateElection] = useUpdateElectionMutation();
  const [deleteElection] = useDeleteElectionMutation();
  const [changeStatus] = useChangeElectionStatusMutation();

  /* ---------- State ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const elections = useMemo((): Election[] => {
    const data = (electionsRaw as any)?.elections || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = { upcoming: 0, ongoing: 0, finished: 0 };
    elections.forEach((e) => {
      if (e.status in c) c[e.status] += 1;
    });
    return c;
  }, [elections]);

  const filteredElections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const from = startDateFilter ? new Date(`${startDateFilter}T00:00:00`).getTime() : null;
    const to = endDateFilter ? new Date(`${endDateFilter}T23:59:59.999`).getTime() : null;
    return elections.filter((e) => {
      const matchesName = (e.name || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter ? e.status === statusFilter : true;
      const matchesStart = from === null ? true : new Date(e.start_date).getTime() >= from;
      const matchesEnd = to === null ? true : new Date(e.end_date).getTime() <= to;
      return matchesName && matchesStatus && matchesStart && matchesEnd;
    });
  }, [elections, searchTerm, statusFilter, startDateFilter, endDateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredElections.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredElections.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const hasFilters = !!(searchTerm || statusFilter || startDateFilter || endDateFilter);
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter, startDateFilter, endDateFilter]);

  /* ---------- Shared create and edit dialog ---------- */
  const openElectionForm = async (opts: {
    title: string;
    confirmText: string;
    initial?: Partial<Election>;
  }): Promise<ElectionForm | undefined> => {
    const i = opts.initial || {};
    const dateField = (id: string, label: string, value?: string, tint = "bg-slate-50") => `
      <div>
        <label class="${swalLabel}" for="${id}">${label}</label>
        <input id="${id}" type="datetime-local" class="${swalField} ${tint}" value="${toLocalInput(value)}" />
      </div>`;

    const { value } = await MySwal.fire({
      ...swalBase,
      title: opts.title,
      html: `
        <div class="space-y-5 text-left">
          <div>
            <label class="${swalLabel}" for="el-name">Election name</label>
            <input id="el-name" class="${swalField}" placeholder="For example LUSA general election 2026" value="${escapeHtml(i.name)}" />
          </div>
          <div>
            <p class="mb-2 border-b border-slate-100 pb-1 text-sm font-black text-slate-800">Voter phase</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${dateField("el-start", "Opens", i.start_date)}
              ${dateField("el-end", "Closes", i.end_date)}
            </div>
          </div>
          <div>
            <p class="mb-2 border-b border-red-100 pb-1 text-sm font-black text-red-800">Delegate phase</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              ${dateField("el-dstart", "Opens", i.delegate_start_date, "!bg-red-50")}
              ${dateField("el-dend", "Closes", i.delegate_end_date, "!bg-red-50")}
            </div>
          </div>
        </div>
      `,
      width: 640,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: opts.confirmText,
      cancelButtonText: "Cancel",
      preConfirm: (): ElectionForm | false => {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
        const name = get("el-name").trim();
        const [s, e, ds, de] = [get("el-start"), get("el-end"), get("el-dstart"), get("el-dend")];

        if (!name) return Swal.showValidationMessage("Enter a name for the election"), false;
        if (!s || !e) return Swal.showValidationMessage("Choose when the voter phase opens and closes"), false;
        if (!ds || !de) return Swal.showValidationMessage("Choose when the delegate phase opens and closes"), false;
        if (new Date(e) <= new Date(s)) return Swal.showValidationMessage("The voter phase must close after it opens"), false;
        if (new Date(de) <= new Date(ds)) return Swal.showValidationMessage("The delegate phase must close after it opens"), false;

        return {
          name,
          start_date: toISODate(s),
          end_date: toISODate(e),
          delegate_start_date: toISODate(ds),
          delegate_end_date: toISODate(de),
        };
      },
    });
    return value || undefined;
  };

  /* ---------- Actions ---------- */
  const handleAddElection = async () => {
    const adminId = (user as any)?.user?.userId || (user as any)?.userId || (user as any)?.id;
    if (!adminId) {
      toast.error("Your session has expired. Please sign in again.");
      return;
    }

    const form = await openElectionForm({ title: "Create a new election", confirmText: "Create election" });
    if (!form) return;

    try {
      await createElection({ ...form, created_by: adminId }).unwrap();
      toast.success(`${form.name} was created`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not create the election");
    }
  };

  const handleEditElection = async (election: Election) => {
    const form = await openElectionForm({ title: "Edit election", confirmText: "Save changes", initial: election });
    if (!form) return;

    try {
      await updateElection({ electionId: election.id, ...form, created_by: election.created_by }).unwrap();
      toast.success(`${form.name} was updated`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update the election");
    }
  };

  const handleChangeStatus = async (election: Election) => {
    const { value: status } = await MySwal.fire({
      ...swalBase,
      title: "Change status",
      text: election.name,
      input: "select",
      inputOptions: { upcoming: "Upcoming", ongoing: "Ongoing", finished: "Finished" },
      inputValue: election.status,
      showCancelButton: true,
      confirmButtonText: "Save status",
      cancelButtonText: "Cancel",
    });
    if (!status || status === election.status) return;

    try {
      await changeStatus({ electionId: election.id, status }).unwrap();
      toast.success(`${election.name} is now ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not change the status");
    }
  };

  const handleDeleteElection = async (election: Election) => {
    const confirm = await MySwal.fire({
      ...swalBase,
      icon: "warning",
      title: "Delete this election?",
      text: `${election.name} will be removed for good. This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep it",
    });
    if (!confirm.isConfirmed) return;

    setDeletingId(election.id);
    try {
      await deleteElection(election.id).unwrap();
      toast.success(`${election.name} was deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not delete the election");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Loading and error ---------- */
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading elections...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <FaExclamationTriangle className="text-red-600" size={32} />
        <h2 className="text-xl font-black text-slate-900">We could not load the elections</h2>
        <p className="max-w-sm text-sm text-slate-500">Check your connection and try again.</p>
        <button onClick={() => refetch()} className="mt-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800">
          Try again
        </button>
      </div>
    );
  }

  const chips: { value: "" | Status; label: string; count: number }[] = [
    { value: "", label: "All", count: elections.length },
    { value: "ongoing", label: "Ongoing", count: counts.ongoing },
    { value: "upcoming", label: "Upcoming", count: counts.upcoming },
    { value: "finished", label: "Finished", count: counts.finished },
  ];

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <motion.header variants={item} className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                <MdBallot className="text-red-700" /> Elections
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">Create elections, follow their progress, and change their status.</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => refetch()}
                aria-label="Refresh the list"
                title="Refresh the list"
                className="rounded-xl border border-slate-200 bg-white p-3.5 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10"
              >
                <FaSync className={isFetching ? "animate-spin" : ""} />
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddElection}
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20"
              >
                <FaPlus /> Create election
              </motion.button>
            </div>
          </motion.header>

          {/* Numbers */}
          <motion.div variants={item} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
            <StatCard label="All elections" value={elections.length} />
            <StatCard label="Ongoing" value={counts.ongoing} dot="bg-emerald-500" />
            <StatCard label="Upcoming" value={counts.upcoming} dot="bg-amber-500" />
            <StatCard label="Finished" value={counts.finished} dot="bg-slate-400" />
          </motion.div>

          {/* Filters */}
          <motion.div variants={item} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative md:col-span-1">
                <label htmlFor="search" className="sr-only">Search elections</label>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                />
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-red-600 focus-within:ring-4 focus-within:ring-red-600/10">
                <FaRegCalendarAlt className="text-red-700" />
                <span className="shrink-0 text-sm font-semibold text-slate-500">Starts after</span>
                <input type="date" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} className="w-full bg-transparent py-3 text-sm font-semibold text-slate-700 outline-none" />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-red-600 focus-within:ring-4 focus-within:ring-red-600/10">
                <FaRegCalendarAlt className="text-red-700" />
                <span className="shrink-0 text-sm font-semibold text-slate-500">Ends before</span>
                <input type="date" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} className="w-full bg-transparent py-3 text-sm font-semibold text-slate-700 outline-none" />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => {
                  const active = statusFilter === chip.value;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => setStatusFilter(chip.value)}
                      aria-pressed={active}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-bold transition ${
                        active ? "border-red-700 bg-red-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-700"
                      }`}
                    >
                      {chip.label} <span className={active ? "text-red-100" : "text-slate-400"}>{chip.count}</span>
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
          <motion.div variants={item} className="space-y-4">
            <p className="text-sm text-slate-500">
              {filteredElections.length.toLocaleString()} {filteredElections.length === 1 ? "election" : "elections"}
              {hasFilters ? " match your filters" : ""}
            </p>

            <AnimatePresence initial={false} mode="popLayout">
              {pageItems.map((election, i) => (
                <ElectionCard
                  key={election.id}
                  election={election}
                  index={i}
                  deleting={deletingId === election.id}
                  onEdit={handleEditElection}
                  onStatus={handleChangeStatus}
                  onDelete={handleDeleteElection}
                />
              ))}
            </AnimatePresence>

            {pageItems.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <MdBallot className="mx-auto mb-4 text-slate-200" size={52} />
                <p className="text-sm font-bold text-slate-700">{hasFilters ? "No elections match your filters" : "There are no elections yet"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasFilters ? "Try a different search or clear the filters." : "Select “Create election” to set up the first one."}
                </p>
              </motion.div>
            )}

            {totalPages > 1 && <Pagination page={safePage} totalPages={totalPages} onChange={setCurrentPage} />}
          </motion.div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};