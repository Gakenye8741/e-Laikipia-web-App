import { useState, useMemo, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "sonner";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaSearch,
  FaEye,
  FaGlobe,
  FaUserTie,
  FaTimes,
  FaQuoteLeft,
} from "react-icons/fa";
import {
  useGetCoalitionsByElectionQuery,
  useCreateCoalitionMutation,
  useUpdateCoalitionMutation,
  useDeleteCoalitionMutation,
  useGetCoalitionFullSlateQuery,
} from "../../features/APIS/CoalitionApi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";

const MySwal = withReactContent(Swal);

/* ============================== Constants ============================== */
const EMPTY_FORM = {
  name: "",
  acronym: "",
  slogan: "",
  color_code: "#b91c1c",
  logo_url: "",
};

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10";

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
  <div className="bg-white p-5">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
      <Counter to={value} />
    </p>
  </div>
);

/** Shows a logo, and falls back to an icon if there is no image or it fails to load */
const Logo = ({ url, color, size = 56, icon }: { url?: string; color?: string; size?: number; icon?: ReactNode }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 bg-white"
      style={{ width: size, height: size, borderColor: color || "#e2e8f0" }}
    >
      {url && !failed ? (
        <img src={url} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        icon || <FaUsers className="text-slate-300" />
      )}
    </span>
  );
};

const ActionButton = ({
  label, icon, onClick, danger = false,
}: { label: string; icon: ReactNode; onClick: () => void; danger?: boolean }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition-colors focus:outline-none focus:ring-4 focus:ring-red-600/10 ${
      danger ? "hover:border-red-200 hover:bg-red-50 hover:text-red-700" : "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    {icon} {label}
  </motion.button>
);

const CoalitionCard = ({
  coalition, index, onView, onEdit, onDelete,
}: {
  coalition: any; index: number;
  onView: (id: string) => void; onEdit: (c: any) => void; onDelete: (c: any) => void;
}) => {
  const color = coalition.color_code || "#cbd5e1";
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05, duration: 0.35 } }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg hover:shadow-slate-200/60"
    >
      <div className="h-2" style={{ backgroundColor: color }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-4">
          <Logo url={coalition.logo_url} color={color} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black leading-tight text-slate-900">{coalition.name}</h3>
            <span
              className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {coalition.acronym || "Coalition"}
            </span>
          </div>
        </div>

        <div className="mt-4 flex-1 rounded-xl bg-slate-50 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <FaQuoteLeft size={10} /> Slogan
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{coalition.slogan || "No slogan set"}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton label="View members" icon={<FaEye />} onClick={() => onView(coalition.id)} />
          <ActionButton label="Edit" icon={<FaEdit />} onClick={() => onEdit(coalition)} />
          <ActionButton label="Delete" icon={<FaTrash />} onClick={() => onDelete(coalition)} danger />
        </div>
      </div>
    </motion.article>
  );
};

/** Dark backdrop with a panel that pops in. Closes on Escape or a click outside. */
const Modal = ({
  title, subtitle, onClose, children, maxWidth = "max-w-lg",
}: { title: ReactNode; subtitle?: string; onClose: () => void; children: ReactNode; maxWidth?: string }) => {
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
        className={`flex max-h-[88vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl`}
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

/* ================================ The page ================================ */
export const AdminCoalitionManager = () => {
  const [selectedElection, setSelectedElection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoalition, setEditingCoalition] = useState<any>(null);

  // Members view
  const [viewingSlateId, setViewingSlateId] = useState<string | null>(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const { data: electionsData } = useGetAllElectionsQuery(undefined);
  const { data: coalitionsData, isLoading } = useGetCoalitionsByElectionQuery(selectedElection, {
    skip: !selectedElection,
  });

  const { data: slateData, isLoading: isLoadingSlate } = useGetCoalitionFullSlateQuery(viewingSlateId!, {
    skip: !viewingSlateId,
  });

  const [createCoalition, { isLoading: isCreating }] = useCreateCoalitionMutation();
  const [updateCoalition, { isLoading: isUpdating }] = useUpdateCoalitionMutation();
  const [deleteCoalition] = useDeleteCoalitionMutation();

  const electionsList = (electionsData as any)?.elections || [];
  const coalitionsList: any[] = coalitionsData?.coalitions || [];
  const isSaving = isCreating || isUpdating;

  const filteredCoalitions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return coalitionsList.filter(
      (c) => c.name.toLowerCase().includes(term) || c.acronym?.toLowerCase().includes(term)
    );
  }, [coalitionsList, searchTerm]);

  const selectedElectionName = electionsList.find((e: any) => e.id === selectedElection)?.name;
  const slateCoalition: any = (slateData as any)?.coalition;
  const slateMembers: any[] = slateCoalition?.candidates ?? [];

  /* ---------- Actions ---------- */
  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingCoalition(null);
  };

  const closeForm = () => {
    setIsModalOpen(false);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditingCoalition(c);
    setFormData({
      ...c,
      name: c.name ?? "",
      acronym: c.acronym ?? "",
      slogan: c.slogan ?? "",
      color_code: c.color_code ?? EMPTY_FORM.color_code,
      logo_url: c.logo_url ?? "",
    } as any);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoalition) {
        await updateCoalition({ id: editingCoalition.id, body: formData }).unwrap();
        toast.success(`${formData.name} was updated`);
      } else {
        await createCoalition({
          creatorCandidateId: "ADMIN_ACTION", // Or your admin ID
          coalition: {
            ...formData,
            election_id: selectedElection,
          },
        }).unwrap();
        toast.success(`${formData.name} was created`);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.data?.error || "Could not save the coalition. Please check the details and try again.");
    }
  };

  const handleDelete = async (c: any) => {
    const res = await MySwal.fire({
      ...swalBase,
      icon: "warning",
      title: "Delete this coalition?",
      text: `${c.name} will be removed, and its members will no longer be linked to it.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep it",
    });
    if (!res.isConfirmed) return;

    try {
      await deleteCoalition(c.id).unwrap();
      toast.success(`${c.name} was deleted`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.data?.error || "Could not delete the coalition");
    }
  };

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <motion.header variants={item} className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                <FaUsers className="text-red-700" /> Coalitions
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-500">
                Choose an election to see its coalitions, add new ones, and view who has joined.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div>
                <label htmlFor="election" className="sr-only">Election</label>
                <select
                  id="election"
                  className={`${inputClass} min-w-[260px] cursor-pointer bg-white`}
                  value={selectedElection}
                  onChange={(e) => {
                    setSelectedElection(e.target.value);
                    setSearchTerm("");
                  }}
                >
                  <option value="">Choose an election</option>
                  {electionsList.map((e: any) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <AnimatePresence>
                {selectedElection && (
                  <motion.button
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20"
                  >
                    <FaPlus /> New coalition
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.header>

          {/* No election chosen */}
          {!selectedElection && (
            <motion.div variants={item} className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="inline-block">
                <FaGlobe className="mx-auto mb-4 text-slate-200" size={52} />
              </motion.div>
              <p className="text-sm font-bold text-slate-700">No election chosen yet</p>
              <p className="mt-1 text-sm text-slate-500">Pick an election above to manage its coalitions.</p>
            </motion.div>
          )}

          {/* Election chosen */}
          {selectedElection && (
            <>
              <motion.div variants={item} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200">
                <StatCard label={selectedElectionName ? `Coalitions in ${selectedElectionName}` : "Coalitions"} value={coalitionsList.length} />
                <StatCard label="Matching your search" value={filteredCoalitions.length} />
              </motion.div>

              <motion.div variants={item} className="relative max-w-md">
                <label htmlFor="search" className="sr-only">Search coalitions</label>
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-700" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by name or acronym"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} bg-white pl-11`}
                />
              </motion.div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <PuffLoader color="#b91c1c" size={60} />
                  <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading coalitions...</p>
                </div>
              ) : (
                <motion.div variants={item}>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence initial={false}>
                      {filteredCoalitions.map((c, i) => (
                        <CoalitionCard key={c.id} coalition={c} index={i} onView={setViewingSlateId} onEdit={openEdit} onDelete={handleDelete} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {filteredCoalitions.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                      <FaUsers className="mx-auto mb-4 text-slate-200" size={48} />
                      <p className="text-sm font-bold text-slate-700">
                        {searchTerm ? "No coalitions match your search" : "This election has no coalitions yet"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {searchTerm ? "Try a different name or acronym." : "Select “New coalition” to create the first one."}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </motion.div>

        {/* Members view */}
        <AnimatePresence>
          {viewingSlateId && (
            <Modal
              key="slate"
              maxWidth="max-w-2xl"
              onClose={() => setViewingSlateId(null)}
              title={slateCoalition?.name ? `${slateCoalition.name} members` : "Coalition members"}
              subtitle="Everyone in this coalition and the position they are running for"
            >
              <div className="p-6">
                {isLoadingSlate ? (
                  <div className="flex justify-center py-16">
                    <PuffLoader color="#b91c1c" />
                  </div>
                ) : slateMembers.length > 0 ? (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {slateMembers.map((member) => (
                      <motion.div key={member.id} variants={item} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <Logo url={member.photo_url} size={48} icon={<FaUserTie className="text-slate-300" />} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
                          <p className="truncate text-sm font-semibold text-red-700">{member.position?.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="py-12 text-center text-sm font-semibold text-slate-500">No candidates have joined this coalition yet.</p>
                )}
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Create and edit form */}
        <AnimatePresence>
          {isModalOpen && (
            <Modal
              key="form"
              onClose={closeForm}
              title={editingCoalition ? "Edit coalition" : "Create a new coalition"}
              subtitle={editingCoalition ? undefined : selectedElectionName ? `It will be added to ${selectedElectionName}` : undefined}
            >
              <form onSubmit={handleSubmit} className="space-y-4 p-6">
                {/* Live preview */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <Logo url={formData.logo_url} color={formData.color_code} />
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-900">{formData.name || "Coalition name"}</p>
                    <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: formData.color_code }}>
                      {formData.acronym || "Acronym"}
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="c-name" className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
                  <input id="c-name" type="text" placeholder="Full name of the coalition" required className={inputClass} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-acronym" className="mb-1 block text-sm font-semibold text-slate-700">Acronym</label>
                    <input id="c-acronym" type="text" placeholder="Short name" className={inputClass} value={formData.acronym} onChange={(e) => setFormData({ ...formData, acronym: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="c-color" className="mb-1 block text-sm font-semibold text-slate-700">Colour</label>
                    <div className="flex items-center gap-3">
                      <input id="c-color" type="color" className="h-[46px] w-16 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-1" value={formData.color_code} onChange={(e) => setFormData({ ...formData, color_code: e.target.value })} />
                      <span className="text-sm font-semibold uppercase text-slate-500">{formData.color_code}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="c-logo" className="mb-1 block text-sm font-semibold text-slate-700">Logo link</label>
                  <input id="c-logo" type="text" placeholder="Paste the web address of the logo" className={inputClass} value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} />
                </div>

                <div>
                  <label htmlFor="c-slogan" className="mb-1 block text-sm font-semibold text-slate-700">Slogan</label>
                  <textarea id="c-slogan" placeholder="A short line that sums up the coalition" className={`${inputClass} h-24 resize-none`} value={formData.slogan} onChange={(e) => setFormData({ ...formData, slogan: e.target.value })} />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeForm} className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    Cancel
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 rounded-xl bg-red-700 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : editingCoalition ? "Save changes" : "Create coalition"}
                  </motion.button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};