import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaUniversity,
  FaVoteYea,
} from "react-icons/fa";
import { MdBallot } from "react-icons/md";
import { toast } from "sonner";

import {
  useGetAllPositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from "../../features/APIS/Position.APi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

const MySwal = withReactContent(Swal);

/* ============================== Types & constants ============================== */
const TIERS = ["school", "university"] as const;
const SCHOOLS = [
  "Science",
  "Education",
  "Business",
  "Humanities and Developmental_Studies",
  "TVET",
] as const;

const ITEMS_PER_PAGE = 6;

interface Position {
  id: string;
  name: string;
  description?: string;
  tier: string;
  school?: string | null;
  election_id: string;
  [key: string]: any;
}
interface Election {
  id: string;
  name: string;
  [key: string]: any;
}
interface PositionForm {
  name: string;
  description: string;
  tier: string;
  school: string | null;
  election_id: string;
}

/* Dialog styling: buttons use Tailwind instead of the SweetAlert defaults */
const swalField =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 disabled:cursor-not-allowed disabled:opacity-50";
const swalLabel = "mb-1 block text-sm font-semibold text-slate-700";
const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: "rounded-3xl p-6",
    title: "text-2xl font-black text-slate-900",
    htmlContainer: "text-slate-600",
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

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const schoolLabel = (s?: string | null) => (s || "").replace(/_/g, " ");

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

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <motion.div variants={item} className="bg-white p-5">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
      <Counter to={value} />
    </p>
  </motion.div>
);

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

const PositionCard = ({
  position, electionName, index, deleting, onEdit, onDelete,
}: {
  position: Position; electionName?: string; index: number; deleting: boolean;
  onEdit: (p: Position) => void; onDelete: (p: Position) => void;
}) => {
  const isUniversity = position.tier === "university";
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
            isUniversity ? "border-amber-200 bg-amber-50 text-amber-700" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {isUniversity ? <FaUniversity size={10} /> : <MdBallot size={12} />}
          {cap(position.tier || "Not set")}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {isUniversity ? "All schools" : schoolLabel(position.school) || "No school chosen"}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-black leading-snug text-slate-900">{position.name || "Untitled position"}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">{position.description || "No description added."}</p>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm">
        <FaVoteYea className="shrink-0 text-red-700" />
        <span className="text-slate-500">Election:</span>
        <span className="truncate font-bold text-slate-800">{electionName || "Not linked"}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <ActionButton label="Edit" icon={<FaEdit />} onClick={() => onEdit(position)} />
        <ActionButton label="Delete" icon={deleting ? <FaSync className="animate-spin" /> : <FaTrash />} onClick={() => onDelete(position)} danger disabled={deleting} />
      </div>
    </motion.article>
  );
};

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

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10";

/* ================================ The page ================================ */
export const AllPositions = () => {
  /* ---------- Data ---------- */
  const { data: positionsRaw, isLoading: isLoadingPositions, isError, isFetching: fetchingPositions, refetch: refetchPositions } = useGetAllPositionsQuery();
  const { data: electionsRaw, isLoading: isLoadingElections, isFetching: fetchingElections, refetch: refetchElections } = useGetAllElectionsQuery();

  const [createPosition] = useCreatePositionMutation();
  const [updatePosition] = useUpdatePositionMutation();
  const [deletePosition] = useDeletePositionMutation();

  /* ---------- State ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [electionFilter, setElectionFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const defaultElectionApplied = useRef(false);

  const positions = useMemo((): Position[] => {
    const data = (positionsRaw as any)?.positions || positionsRaw;
    return Array.isArray(data) ? data : [];
  }, [positionsRaw]);

  const elections = useMemo((): Election[] => {
    const data = (electionsRaw as any)?.elections || electionsRaw;
    return Array.isArray(data) ? data : [];
  }, [electionsRaw]);

  /* Start on the newest election, once. Choosing "All elections" later is kept. */
  useEffect(() => {
    if (elections.length > 0 && !defaultElectionApplied.current) {
      defaultElectionApplied.current = true;
      setElectionFilter(elections[elections.length - 1].id);
    }
  }, [elections]);

  const electionMap = useMemo(
    () =>
      elections.reduce((acc: Record<string, string>, e) => {
        acc[e.id] = e.name;
        return acc;
      }, {}),
    [elections]
  );

  const filteredPositions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return positions.filter(
      (p) =>
        (p.name?.toLowerCase().includes(term) ?? false) &&
        (tierFilter ? p.tier === tierFilter : true) &&
        (schoolFilter ? p.school === schoolFilter : true) &&
        (electionFilter ? p.election_id === electionFilter : true)
    );
  }, [positions, searchTerm, tierFilter, schoolFilter, electionFilter]);

  /* Counts for the tier chips follow the chosen election */
  const tierCounts = useMemo(() => {
    const inElection = positions.filter((p) => (electionFilter ? p.election_id === electionFilter : true));
    return {
      all: inElection.length,
      school: inElection.filter((p) => p.tier === "school").length,
      university: inElection.filter((p) => p.tier === "university").length,
    };
  }, [positions, electionFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPositions.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filteredPositions.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const hasFilters = !!(searchTerm || tierFilter || schoolFilter || electionFilter);
  const clearFilters = () => {
    setSearchTerm("");
    setTierFilter("");
    setSchoolFilter("");
    setElectionFilter("");
  };

  useEffect(() => setCurrentPage(1), [searchTerm, tierFilter, schoolFilter, electionFilter]);

  const handleRefresh = () => Promise.all([refetchPositions(), refetchElections()]);

  /* ---------- Shared create and edit dialog ---------- */
  const openPositionForm = async (opts: {
    title: string;
    confirmText: string;
    initial?: Partial<Position>;
  }): Promise<PositionForm | undefined> => {
    const i = opts.initial || {};
    const tierOptions = TIERS.map((t) => `<option value="${t}" ${t === i.tier ? "selected" : ""}>${cap(t)}</option>`).join("");
    const schoolOptions = SCHOOLS.map((s) => `<option value="${s}" ${s === i.school ? "selected" : ""}>${escapeHtml(schoolLabel(s))}</option>`).join("");
    const electionOptions = elections
      .map((e) => `<option value="${escapeHtml(e.id)}" ${e.id === i.election_id ? "selected" : ""}>${escapeHtml(e.name)}</option>`)
      .join("");

    const { value } = await MySwal.fire({
      ...swalBase,
      title: opts.title,
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="${swalLabel}" for="pos-name">Position name</label>
            <input id="pos-name" class="${swalField}" placeholder="For example Secretary general" value="${escapeHtml(i.name)}" />
          </div>
          <div>
            <label class="${swalLabel}" for="pos-description">What does this role do?</label>
            <input id="pos-description" class="${swalField}" placeholder="For example Speaks for the student council" value="${escapeHtml(i.description)}" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="${swalLabel}" for="pos-tier">Level</label>
              <select id="pos-tier" class="${swalField}">${tierOptions}</select>
            </div>
            <div>
              <label class="${swalLabel}" for="pos-school">School</label>
              <select id="pos-school" class="${swalField}">
                <option value="">All schools (university-wide)</option>
                ${schoolOptions}
              </select>
            </div>
          </div>
          <div>
            <label class="${swalLabel}" for="pos-election">Election</label>
            <select id="pos-election" class="${swalField}">${electionOptions}</select>
          </div>
        </div>
      `,
      width: 620,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: opts.confirmText,
      cancelButtonText: "Cancel",
      didOpen: () => {
        const tier = document.getElementById("pos-tier") as HTMLSelectElement;
        const school = document.getElementById("pos-school") as HTMLSelectElement;
        const sync = () => {
          const universityWide = tier.value === "university";
          school.disabled = universityWide;
          if (universityWide) school.value = "";
        };
        tier.addEventListener("change", sync);
        sync();
      },
      preConfirm: (): PositionForm | false => {
        const get = (id: string) => (document.getElementById(id) as HTMLInputElement).value;
        const name = get("pos-name").trim();
        const description = get("pos-description").trim();
        const tier = get("pos-tier");
        const school = get("pos-school");
        const election_id = get("pos-election");

        const fail = (message: string) => {
          Swal.showValidationMessage(message);
          return false as const;
        };

        if (!name || !description || !tier) return fail("Fill in the name, description and level");
        if (!election_id) return fail("Choose an election for this position");
        // School positions need a school. University positions are open to every school.
        if (tier === "school" && !school) return fail("A school-level position needs a school");

        return { name, description, tier, school: tier === "school" ? school : null, election_id };
      },
    });
    return value || undefined;
  };

  /* ---------- Actions ---------- */
  const handleAddPosition = async () => {
    const form = await openPositionForm({ title: "Add a new position", confirmText: "Add position" });
    if (!form) return;

    try {
      await createPosition(form).unwrap();
      toast.success(`${form.name} was added`);
      refetchPositions();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.data?.error || "Could not add the position");
    }
  };

  const handleEditPosition = async (position: Position) => {
    const form = await openPositionForm({ title: "Edit position", confirmText: "Save changes", initial: position });
    if (!form) return;

    try {
      await updatePosition({ positionId: position.id, ...form }).unwrap();
      toast.success(`${form.name} was updated`);
      refetchPositions();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.data?.error || "Could not update the position");
    }
  };

  const handleDeletePosition = async (position: Position) => {
    const res = await MySwal.fire({
      ...swalBase,
      icon: "warning",
      title: "Delete this position?",
      text: `${position.name} will be removed for good. This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep it",
    });
    if (!res.isConfirmed) return;

    setDeletingId(position.id);
    try {
      await deletePosition(position.id).unwrap();
      toast.success(`${position.name} was deleted`);
      refetchPositions();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.data?.error || "Could not delete the position");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Loading and error ---------- */
  if (isLoadingPositions || isLoadingElections) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading positions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <FaExclamationTriangle className="text-red-600" size={32} />
        <h2 className="text-xl font-black text-slate-900">We could not load the positions</h2>
        <p className="max-w-sm text-sm text-slate-500">Check your connection and try again.</p>
        <button onClick={handleRefresh} className="mt-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800">
          Try again
        </button>
      </div>
    );
  }

  const chips = [
    { value: "", label: "All levels", count: tierCounts.all },
    { value: "school", label: "School", count: tierCounts.school },
    { value: "university", label: "University", count: tierCounts.university },
  ];

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <motion.header variants={item} className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                <MdBallot className="text-red-700" /> Positions
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">Add the seats people can run for, and link each one to an election.</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleRefresh}
                aria-label="Refresh the list"
                title="Refresh the list"
                className="rounded-xl border border-slate-200 bg-white p-3.5 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10"
              >
                <FaSync className={fetchingPositions || fetchingElections ? "animate-spin" : ""} />
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddPosition}
                className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20"
              >
                <FaPlus /> Add position
              </motion.button>
            </div>
          </motion.header>

          {/* Numbers */}
          <motion.div variants={item} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
            <StatCard label="All positions" value={positions.length} />
            <StatCard label="Matching your filters" value={filteredPositions.length} />
            <StatCard label="Elections" value={elections.length} />
            <StatCard label="University-wide positions" value={positions.filter((p) => p.tier === "university").length} />
          </motion.div>

          {/* Filters */}
          <motion.div variants={item} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <label htmlFor="search" className="sr-only">Search positions</label>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${selectClass} pl-11`}
                />
              </div>
              <div>
                <label htmlFor="election-filter" className="sr-only">Election</label>
                <select id="election-filter" value={electionFilter} onChange={(e) => setElectionFilter(e.target.value)} className={`${selectClass} cursor-pointer`}>
                  <option value="">All elections</option>
                  {elections.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="school-filter" className="sr-only">School</label>
                <select id="school-filter" value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className={`${selectClass} cursor-pointer`}>
                  <option value="">All schools</option>
                  {SCHOOLS.map((s) => (
                    <option key={s} value={s}>{schoolLabel(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {chips.map((chip) => {
                  const active = tierFilter === chip.value;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => setTierFilter(chip.value)}
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
              {filteredPositions.length.toLocaleString()} {filteredPositions.length === 1 ? "position" : "positions"}
              {hasFilters ? " match your filters" : ""}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AnimatePresence initial={false}>
                {pageItems.map((p, i) => (
                  <PositionCard
                    key={p.id}
                    position={p}
                    electionName={electionMap[p.election_id]}
                    index={i}
                    deleting={deletingId === p.id}
                    onEdit={handleEditPosition}
                    onDelete={handleDeletePosition}
                  />
                ))}
              </AnimatePresence>
            </div>

            {pageItems.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <MdBallot className="mx-auto mb-4 text-slate-200" size={52} />
                <p className="text-sm font-bold text-slate-700">{hasFilters ? "No positions match your filters" : "There are no positions yet"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasFilters ? "Try a different search or clear the filters." : "Select “Add position” to create the first one."}
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