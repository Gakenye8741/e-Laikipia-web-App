import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import { PuffLoader } from "react-spinners";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import { FaSearch, FaSync, FaTrash, FaUserSlash, FaTimes, FaQuoteLeft } from "react-icons/fa";
import { MdBallot } from "react-icons/md";

import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetAllPositionsQuery } from "../../features/APIS/Position.APi";
import {
  useGetCandidatesByElectionQuery,
  useDisqualifyCandidateMutation,
  useDeleteCandidateMutation,
} from "../../features/APIS/CandidateApi";
import { useGetApplicationByIdQuery } from "../../features/APIS/Applcation.Api";

/* ============================== Types & helpers ============================== */
type Application = { name?: string; school?: string; manifesto?: string; photo_url?: string };

type Candidate = {
  id: string;
  name?: string;
  position_id: string;
  application_id: string;
  photo_url?: string;
  manifesto?: string;
  application?: Application;
};

type Dialog =
  | { type: "view"; cand: Candidate }
  | { type: "disqualify"; cand: Candidate }
  | { type: "delete"; cand: Candidate }
  | null;

const selectClass =
  "w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10";

// The API can return a list OR an object like { elections: [...] }. This handles both.
const toList = (data: any, key: string): any[] => data?.[key] ?? data?.data ?? (Array.isArray(data) ? data : []);

const getProfile = (cand: Candidate, app?: Application) => {
  const name = app?.name || cand.application?.name || cand.name || "Unknown candidate";
  return {
    name,
    school: (app?.school || cand.application?.school || "General Science").replace(/_/g, " "),
    manifesto: app?.manifesto || cand.application?.manifesto || cand.manifesto || "",
    photo:
      app?.photo_url ||
      cand.application?.photo_url ||
      cand.photo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=b91c1c`,
  };
};

// Loads the application for one candidate. The result is cached, so asking twice is free.
const useProfile = (cand: Candidate) => {
  const { data, isLoading } = useGetApplicationByIdQuery(cand.application_id, { skip: !cand.application_id });
  const app: Application | undefined = (data as any)?.application || (data as any);
  return { profile: getProfile(cand, app), isLoading };
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

const OnBallotPill = () => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
    <span className="h-2 w-2 rounded-full bg-emerald-500" />
    On ballot
  </span>
);

const Avatar = ({ src, name, size = "h-16 w-16" }: { src: string; name: string; size?: string }) => (
  <img
    src={src}
    alt={name}
    onError={(e) => {
      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
    }}
    className={`${size} shrink-0 rounded-2xl border-2 border-red-50 bg-slate-100 object-cover`}
  />
);

/** Dark backdrop with a panel that pops in. Closes on Escape or a click outside. */
const Modal = ({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: ReactNode;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) => {
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

const cancelBtn =
  "rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10";
const dangerBtn =
  "rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-600/20 disabled:opacity-50";

/* ================================== Dialogs ================================== */
const ViewDialog = ({ cand, onClose }: { cand: Candidate; onClose: () => void }) => {
  const { profile } = useProfile(cand);
  const appId = String(cand.application_id || cand.id).slice(-10);

  return (
    <Modal title="Candidate profile" subtitle="Details from the approved application" onClose={onClose}>
      <div className="space-y-5 p-6">
        <div className="flex items-center gap-4">
          <Avatar src={profile.photo} name={profile.name} />
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <OnBallotPill />
              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {profile.school}
              </span>
            </div>
            <h3 className="text-2xl font-black leading-tight text-slate-900">{profile.name}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-red-800">
            <FaQuoteLeft size={11} /> Manifesto
          </p>
          <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {profile.manifesto || "This candidate did not add a manifesto."}
          </p>
        </div>

        <p className="text-xs font-semibold text-slate-400">Application ID: #{appId}</p>

        <div className="flex justify-end">
          <button onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DisqualifyDialog = ({
  cand,
  busy,
  onConfirm,
  onClose,
}: {
  cand: Candidate;
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) => {
  const [reason, setReason] = useState("");
  const { profile } = useProfile(cand);

  return (
    <Modal title="Disqualify this candidate?" subtitle={`${profile.name} will be removed from the active ballot`} onClose={onClose}>
      <div className="space-y-4 p-6">
        <div>
          <label htmlFor="reason" className="mb-1 block text-sm font-semibold text-slate-600">
            Reason
          </label>
          <textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Write why this candidate is being disqualified"
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={cancelBtn}>
            Go back
          </button>
          <button onClick={() => onConfirm(reason.trim())} disabled={busy || !reason.trim()} className={dangerBtn}>
            {busy ? "Working..." : "Yes, disqualify"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const DeleteDialog = ({
  cand,
  busy,
  onConfirm,
  onClose,
}: {
  cand: Candidate;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const { profile } = useProfile(cand);
  return (
    <Modal title="Delete this candidate?" subtitle="The record will be removed for good. This cannot be undone." onClose={onClose}>
      <div className="space-y-4 p-6">
        <p className="text-sm text-slate-600">
          You are about to delete <strong className="text-slate-900">{profile.name}</strong>.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className={cancelBtn}>
            Keep it
          </button>
          <button onClick={onConfirm} disabled={busy} className={dangerBtn}>
            {busy ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* ================================ Candidate card ================================ */
const CandidateCard = ({
  cand,
  index,
  onView,
  onDisqualify,
  onDelete,
}: {
  cand: Candidate;
  index: number;
  onView: () => void;
  onDisqualify: () => void;
  onDelete: () => void;
}) => {
  const { profile, isLoading } = useProfile(cand);

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {profile.school}
        </span>
        <OnBallotPill />
      </div>

      <button
        onClick={onView}
        aria-label={`View profile of ${profile.name}`}
        className="mt-4 flex items-center gap-4 rounded-xl text-left focus:outline-none focus:ring-4 focus:ring-red-600/15"
      >
        <Avatar src={profile.photo} name={profile.name} />
        <h3 className="text-xl font-black leading-tight text-slate-900">{profile.name}</h3>
      </button>

      <div className="mt-4 flex-1 border-l-2 border-red-100 pl-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
          {isLoading ? "Loading manifesto..." : profile.manifesto || "No manifesto added."}
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDisqualify}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-600/20"
        >
          <FaUserSlash /> Disqualify
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onDelete}
          aria-label="Delete candidate"
          title="Delete candidate"
          className="rounded-xl border border-red-100 bg-red-50 px-4 text-red-700 transition-colors hover:bg-red-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-600/20"
        >
          <FaTrash size={13} />
        </motion.button>
      </div>
    </motion.article>
  );
};

/* ================================== The page ================================== */
export const AdminCandidateManager = () => {
  const [selectedElection, setSelectedElection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [busy, setBusy] = useState(false);

  /* ---------- Data ---------- */
  const { data: electionsData, isLoading: loadingElections, refetch: refetchElections } = useGetAllElectionsQuery();
  const { data: positionsData } = useGetAllPositionsQuery();
  const {
    data: candidatesData,
    isFetching,
    refetch: refetchCandidates,
  } = useGetCandidatesByElectionQuery(selectedElection, {
    skip: !selectedElection,
    refetchOnMountOrArgChange: true,
  });

  const [disqualifyCandidate] = useDisqualifyCandidateMutation();
  const [deleteCandidate] = useDeleteCandidateMutation();

  const elections = toList(electionsData, "elections");
  const positions = toList(positionsData, "positions");
  const candidates: Candidate[] = toList(candidatesData, "candidates");

  // Group candidates by position, after the search filter
  const groups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return positions
      .filter((p: any) => p.election_id === selectedElection)
      .map((pos: any) => ({
        pos,
        items: candidates.filter((c) => c.position_id === pos.id && (!term || c.name?.toLowerCase().includes(term))),
      }));
  }, [positions, candidates, selectedElection, searchTerm]);

  const totalShown = groups.reduce((sum: number, g: any) => sum + g.items.length, 0);

  /* ---------- Actions ---------- */
  const closeDialog = () => setDialog(null);

  const handleDisqualify = async (cand: Candidate, _reason: string) => {
    setBusy(true);
    try {
      // NOTE: the reason is not sent yet. Add it here if your API accepts it.
      await disqualifyCandidate(cand.id).unwrap();
      toast.success("The candidate was disqualified");
      refetchCandidates();
      closeDialog();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not disqualify this candidate. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (cand: Candidate) => {
    setBusy(true);
    try {
      await deleteCandidate(cand.id).unwrap();
      toast.success("The candidate was deleted");
      refetchCandidates();
      closeDialog();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not delete this candidate. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = () => {
    refetchElections();
    if (selectedElection) refetchCandidates();
  };

  /* ---------- Loading ---------- */
  if (loadingElections) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading elections...</p>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <motion.header
            variants={item}
            className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                <MdBallot className="text-red-700" /> Candidates
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">
                Review, disqualify or delete candidates for each election.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <label htmlFor="search" className="sr-only">
                  Search by name
                </label>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10 md:w-72"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleRefresh}
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
          <motion.div
            variants={item}
            className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3"
          >
            <StatCard label="Elections" value={elections.length} />
            <StatCard label="Positions in this election" value={selectedElection ? groups.length : 0} dot="bg-amber-500" />
            <StatCard label="Candidates in this election" value={selectedElection ? candidates.length : 0} dot="bg-emerald-500" />
          </motion.div>

          {/* Election picker */}
          <motion.div variants={item} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <label htmlFor="election" className="mb-1 block text-sm font-semibold text-slate-600">
              Election
            </label>
            <select
              id="election"
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose an election</option>
              {elections.map((e: any) => (
                <option key={e.id} value={e.id}>
                  {e.name || e.title}
                </option>
              ))}
            </select>
          </motion.div>

          {/* List */}
          <motion.div variants={item} className="space-y-8">
            {!selectedElection ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <MdBallot className="mx-auto mb-4 text-slate-200" size={52} />
                <p className="text-sm font-bold text-slate-700">No election selected</p>
                <p className="mt-1 text-sm text-slate-500">Choose an election above to see its candidates.</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                <MdBallot className="mx-auto mb-4 text-slate-200" size={52} />
                <p className="text-sm font-bold text-slate-700">This election has no positions yet</p>
                <p className="mt-1 text-sm text-slate-500">Add positions first. Candidates will show here.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500" aria-live="polite">
                  {isFetching ? "Updating..." : `${totalShown} ${totalShown === 1 ? "candidate" : "candidates"}`}
                  {searchTerm ? " match your search" : ""}
                </p>

                {groups.map(({ pos, items }: any) => (
                  <section key={pos.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-slate-900">{pos.name}</h2>
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {items.length}
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    {items.length > 0 ? (
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence initial={false}>
                          {items.map((cand: Candidate, i: number) => (
                            <CandidateCard
                              key={cand.id}
                              cand={cand}
                              index={i}
                              onView={() => setDialog({ type: "view", cand })}
                              onDisqualify={() => setDialog({ type: "disqualify", cand })}
                              onDelete={() => setDialog({ type: "delete", cand })}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                        <p className="text-sm font-bold text-slate-700">
                          {searchTerm ? "No candidate matches your search" : "No candidates for this position yet"}
                        </p>
                      </div>
                    )}
                  </section>
                ))}
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Dialogs */}
        <AnimatePresence>
          {dialog?.type === "view" && <ViewDialog key="view" cand={dialog.cand} onClose={closeDialog} />}
          {dialog?.type === "disqualify" && (
            <DisqualifyDialog
              key="disqualify"
              cand={dialog.cand}
              busy={busy}
              onClose={closeDialog}
              onConfirm={(reason) => handleDisqualify(dialog.cand, reason)}
            />
          )}
          {dialog?.type === "delete" && (
            <DeleteDialog
              key="delete"
              cand={dialog.cand}
              busy={busy}
              onClose={closeDialog}
              onConfirm={() => handleDelete(dialog.cand)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

export default AdminCandidateManager;