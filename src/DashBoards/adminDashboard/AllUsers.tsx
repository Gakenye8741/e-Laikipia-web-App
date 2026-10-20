import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { toast } from "sonner";
import { AnimatePresence, MotionConfig, animate, motion, useInView, type Variants } from "framer-motion";
import {
  FaKey,
  FaEdit,
  FaSearch,
  FaTrash,
  FaUserShield,
  FaUserGraduate,
  FaInfoCircle,
  FaSync,
  FaFilter,
  FaUniversity,
  FaCalendarAlt,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../../features/APIS/UserApi";
import { useUpdatePasswordMutation } from "../../features/APIS/Auth.Api";

import "../adminDashboard/style.css";

const MySwal = withReactContent(Swal);

/* ============================== Types & constants ============================== */
interface UserNode {
  id: string;
  name: string;
  reg_no: string;
  role: string;
  email?: string;
  school?: string;
  expected_graduation?: string;
}

const ITEMS_PER_PAGE = 8;

const ROLES = [
  "voter",
  "admin",
  "Dean_of_Science",
  "Dean_of_Education",
  "Dean_of_Business",
  "Dean_of_Humanities_and_Developmental_Studies",
  "Dean_of_TVET",
  "Dean_of_Students",
  "Accountants",
];

/* Dialog styling: buttons use Tailwind instead of the SweetAlert defaults */
const swalBase = {
  buttonsStyling: false,
  customClass: {
    popup: "rounded-3xl p-6",
    title: "text-2xl font-black text-slate-900",
    htmlContainer: "text-slate-600",
    confirmButton: "mx-1 rounded-xl bg-red-800 px-5 py-3 text-sm font-bold text-white hover:bg-red-900",
    cancelButton: "mx-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50",
  },
};
const swalField =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/10";
const swalLabel = "mb-1 block text-sm font-semibold text-slate-700";

/* ================================== Helpers ================================== */
const isStaff = (role: string) => role !== "voter";

/** "Dean_of_Science" becomes "Dean of Science" */
const roleLabel = (role: string) => {
  const text = (role || "").replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Keeps typed text from being read as HTML inside dialogs */
const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

const FilterSelect = ({
  icon, label, value, onChange, allLabel, options,
}: {
  icon: ReactNode; label: string; value: string; onChange: (v: string) => void; allLabel: string;
  options: { value: string; label: string }[];
}) => (
  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-red-700 focus-within:ring-4 focus-within:ring-red-700/10">
    <span className="text-sm text-red-800">{icon}</span>
    <span className="sr-only">{label}</span>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer bg-transparent py-3 text-sm font-semibold text-slate-700 outline-none">
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </label>
);

const IconButton = ({
  label, onClick, disabled, children, danger = false,
}: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode; danger?: boolean }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-red-700/10 disabled:opacity-40 ${
      danger ? "hover:border-red-200 hover:text-red-700" : "hover:text-red-800"
    }`}
  >
    {children}
  </motion.button>
);

const RoleBadge = ({ role }: { role: string }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${isStaff(role) ? "bg-slate-900 text-white" : "bg-red-50 text-red-800"}`}>
    {roleLabel(role)}
  </span>
);

const UserRow = ({
  user, index, deleting, onView, onPassword, onEdit, onDelete,
}: {
  user: UserNode; index: number; deleting: boolean;
  onView: (u: UserNode) => void; onPassword: (u: UserNode) => void; onEdit: (u: UserNode) => void; onDelete: (u: UserNode) => void;
}) => (
  <motion.tr
    layout="position"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.035, duration: 0.3 } }}
    exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }}
    className="group transition-colors hover:bg-red-50/40"
  >
    <td className="px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-red-800 group-hover:text-white">
          {user.role === "admin" ? <FaUserShield /> : <FaUserGraduate />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.school || "No school added"}</p>
        </div>
      </div>
    </td>
    <td className="px-5 py-4 text-sm font-bold text-red-800">{user.reg_no}</td>
    <td className="px-5 py-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <FaEnvelope className="shrink-0 text-xs text-slate-300" />
        <span className="truncate">{user.email || "No email linked"}</span>
      </div>
    </td>
    <td className="px-5 py-4">
      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
        {user.expected_graduation || "Not set"}
      </span>
    </td>
    <td className="px-5 py-4">
      <RoleBadge role={user.role} />
    </td>
    <td className="px-5 py-4">
      <div className="flex justify-end gap-2">
        <IconButton label="View details" onClick={() => onView(user)}><FaInfoCircle /></IconButton>
        <IconButton label="Change password" onClick={() => onPassword(user)}><FaKey /></IconButton>
        <IconButton label="Edit user" onClick={() => onEdit(user)}><FaEdit /></IconButton>
        <IconButton label="Delete user" onClick={() => onDelete(user)} disabled={deleting} danger>
          {deleting ? <FaSync className="animate-spin" /> : <FaTrash />}
        </IconButton>
      </div>
    </td>
  </motion.tr>
);

/* ================================== Dialogs ================================== */
const detailBox = (label: string, value: string, tone = "bg-slate-50") =>
  `<div class="rounded-xl ${tone} p-3">
     <p class="text-xs font-semibold text-slate-500">${label}</p>
     <p class="mt-0.5 break-words text-sm font-bold text-slate-900">${escapeHtml(value)}</p>
   </div>`;

/* ================================= The page ================================= */
export const AllUsers = () => {
  /* ---------- API ---------- */
  const { data: allUsersData, isLoading, isError, isFetching, refetch } = useGetAllUsersQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [updatePassword] = useUpdatePasswordMutation();

  /* ---------- State ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [gradFilter, setGradFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const admin = useSelector((state: any) => state.auth.user);
  const adminName = admin?.name || "Admin";

  /* ---------- Data ---------- */
  const usersArray = useMemo((): UserNode[] => {
    const raw = (allUsersData as any)?.users || allUsersData;
    return Array.isArray(raw) ? raw : [];
  }, [allUsersData]);

  const schoolOptions = useMemo(
    () => (Array.from(new Set(usersArray.map((u) => u.school).filter(Boolean))) as string[]).sort().map((s) => ({ value: s, label: s })),
    [usersArray]
  );
  const gradOptions = useMemo(
    () => (Array.from(new Set(usersArray.map((u) => u.expected_graduation).filter(Boolean))) as string[]).sort().map((g) => ({ value: g, label: g })),
    [usersArray]
  );
  const roleOptions = useMemo(() => {
    const present = usersArray.map((u) => u.role).filter(Boolean);
    return Array.from(new Set([...ROLES, ...present])).map((r) => ({ value: r, label: roleLabel(r) }));
  }, [usersArray]);

  const voterCount = usersArray.filter((u) => u.role === "voter").length;

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return usersArray.filter((u) => {
      const matchesSearch =
        !term ||
        u.name?.toLowerCase().includes(term) ||
        u.reg_no?.toLowerCase().includes(term) ||
        (u.email?.toLowerCase().includes(term) ?? false);
      return (
        matchesSearch &&
        (roleFilter ? u.role === roleFilter : true) &&
        (schoolFilter ? u.school === schoolFilter : true) &&
        (gradFilter ? u.expected_graduation === gradFilter : true)
      );
    });
  }, [usersArray, searchTerm, roleFilter, schoolFilter, gradFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const hasFilters = !!(searchTerm || roleFilter || schoolFilter || gradFilter);
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setSchoolFilter("");
    setGradFilter("");
  };

  useEffect(() => setCurrentPage(1), [searchTerm, roleFilter, schoolFilter, gradFilter]);

  /* ---------- Action: view details ---------- */
  const handleViewDetails = (user: UserNode) => {
    MySwal.fire({
      ...swalBase,
      title: "User details",
      html: `
        <div class="space-y-3 pt-2 text-left">
          ${detailBox("Full name", user.name, "bg-red-50")}
          <div class="grid grid-cols-2 gap-3">
            ${detailBox("Registration number", user.reg_no)}
            ${detailBox("Role", roleLabel(user.role))}
          </div>
          ${detailBox("Email", user.email || "No email linked")}
          <div class="grid grid-cols-2 gap-3">
            ${detailBox("School or department", user.school || "Not specified")}
            ${detailBox("Class of", user.expected_graduation || "Not set")}
          </div>
        </div>
      `,
      confirmButtonText: "Close",
    });
  };

  /* ---------- Action: change password ---------- */
  const handleUpdatePassword = async (user: UserNode) => {
    const { value: password } = await MySwal.fire({
      ...swalBase,
      title: "Change password",
      html: `
        <div class="space-y-4 text-left">
          <p class="text-sm text-slate-500">You are changing the password for <b class="text-slate-800">${escapeHtml(user.reg_no)}</b>.</p>
          <div>
            <label class="${swalLabel}" for="p1">New password</label>
            <div class="relative">
              <input id="p1" type="password" class="${swalField} pr-16" placeholder="Enter a new password" autocomplete="new-password" />
              <button type="button" id="toggleEye" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-red-800">Show</button>
            </div>
          </div>
          <div>
            <label class="${swalLabel}" for="p2">Confirm password</label>
            <input id="p2" type="password" class="${swalField}" placeholder="Type it again" autocomplete="new-password" />
            <p id="match-status" class="mt-1 text-sm font-semibold"></p>
          </div>
        </div>
      `,
      focusConfirm: false,
      didOpen: () => {
        const p1 = document.getElementById("p1") as HTMLInputElement;
        const p2 = document.getElementById("p2") as HTMLInputElement;
        const eye = document.getElementById("toggleEye") as HTMLButtonElement;
        const status = document.getElementById("match-status") as HTMLElement;
        const checkMatch = () => {
          if (p1.value && p2.value) {
            const match = p1.value === p2.value;
            status.innerText = match ? "The passwords match" : "The passwords do not match";
            status.style.color = match ? "#059669" : "#dc2626";
          } else {
            status.innerText = "";
          }
        };
        p1.addEventListener("input", checkMatch);
        p2.addEventListener("input", checkMatch);
        eye.onclick = () => {
          const hidden = p1.type === "password";
          p1.type = p2.type = hidden ? "text" : "password";
          eye.innerText = hidden ? "Hide" : "Show";
        };
      },
      showCancelButton: true,
      confirmButtonText: "Update password",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const v1 = (document.getElementById("p1") as HTMLInputElement).value;
        const v2 = (document.getElementById("p2") as HTMLInputElement).value;
        if (!v1) {
          Swal.showValidationMessage("Enter a new password");
          return false;
        }
        if (v1 !== v2) {
          Swal.showValidationMessage("The passwords do not match");
          return false;
        }
        return v1;
      },
    });

    if (!password) return;
    try {
      await updatePassword({ reg_no: user.reg_no, password }).unwrap();
      toast.success(`Password updated for ${user.reg_no}`);
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Could not update the password");
    }
  };

  /* ---------- Action: edit a user ---------- */
  const handleEdit = async (user: UserNode) => {
    const roles = ROLES.includes(user.role) ? ROLES : [...ROLES, user.role];
    const { value: formValues } = await MySwal.fire({
      ...swalBase,
      title: "Edit user",
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="${swalLabel}" for="sw-n">Full name</label>
            <input id="sw-n" class="${swalField}" placeholder="Full name" value="${escapeHtml(user.name)}" />
          </div>
          <div>
            <label class="${swalLabel}" for="sw-s">School or department</label>
            <input id="sw-s" class="${swalField}" placeholder="School or department" value="${escapeHtml(user.school || "")}" />
          </div>
          <div>
            <label class="${swalLabel}" for="sw-g">Expected graduation</label>
            <input id="sw-g" class="${swalField}" placeholder="For example 2027" value="${escapeHtml(user.expected_graduation || "")}" />
          </div>
          <div>
            <label class="${swalLabel}" for="sw-r">Role</label>
            <select id="sw-r" class="${swalField}">
              ${roles.map((r) => `<option value="${escapeHtml(r)}" ${r === user.role ? "selected" : ""}>${escapeHtml(roleLabel(r))}</option>`).join("")}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save changes",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const name = (document.getElementById("sw-n") as HTMLInputElement).value.trim();
        if (!name) {
          Swal.showValidationMessage("Enter a name");
          return false;
        }
        return {
          userId: user.id,
          name,
          school: (document.getElementById("sw-s") as HTMLInputElement).value.trim(),
          expected_graduation: (document.getElementById("sw-g") as HTMLInputElement).value.trim(),
          role: (document.getElementById("sw-r") as HTMLSelectElement).value,
        };
      },
    });

    if (!formValues) return;
    try {
      await updateUser(formValues).unwrap();
      toast.success(`${formValues.name} was updated`);
    } catch (err: any) {
      toast.error(err?.data?.error || err?.data?.message || "Could not save the changes");
    }
  };

  /* ---------- Action: delete a user ---------- */
  const handleDelete = async (user: UserNode) => {
    const confirm = await MySwal.fire({
      ...swalBase,
      icon: "warning",
      title: "Delete this user?",
      text: `${user.name} (${user.reg_no}) will be removed for good. This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep user",
    });
    if (!confirm.isConfirmed) return;

    setDeletingId(user.id);
    try {
      await deleteUser(user.id).unwrap();
      toast.success(`${user.name} was deleted`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Could not delete the user");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Loading and error ---------- */
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <PuffLoader color="#991b1b" />
        <p className="mt-4 animate-pulse text-sm font-semibold text-slate-500">Loading users...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center">
        <FaExclamationTriangle className="text-red-700" size={32} />
        <h2 className="text-xl font-black text-slate-900">We could not load the users</h2>
        <p className="max-w-sm text-sm text-slate-500">Check your connection and try again.</p>
        <button onClick={() => refetch()} className="mt-2 rounded-xl bg-red-800 px-5 py-3 text-sm font-bold text-white hover:bg-red-900">
          Try again
        </button>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen border-t-[10px] border-red-800 bg-slate-50 p-4 sm:p-8">
        <motion.div variants={page} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <motion.header variants={item} className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-700" />
                </span>
                Signed in as {adminName}
              </p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                All <span className="text-red-800">users</span>
              </h1>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-800" />
                <input
                  type="text"
                  placeholder="Search name, number or email"
                  aria-label="Search users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-700/10 md:w-72"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => refetch()}
                aria-label="Refresh the list"
                title="Refresh the list"
                className="rounded-xl bg-red-800 p-3.5 text-white shadow-sm transition-colors hover:bg-red-900 focus:outline-none focus:ring-4 focus:ring-red-700/20"
              >
                <FaSync className={isFetching ? "animate-spin" : ""} />
              </motion.button>
            </div>
          </motion.header>

          {/* Numbers */}
          <motion.div variants={item} className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
            <StatCard label="All users" value={usersArray.length} />
            <StatCard label="Voters" value={voterCount} />
            <StatCard label="Staff and admins" value={usersArray.length - voterCount} />
            <StatCard label="Matching your filters" value={filteredUsers.length} />
          </motion.div>

          {/* Filters */}
          <motion.div variants={item} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <FilterSelect icon={<FaFilter />} label="Filter by role" value={roleFilter} onChange={setRoleFilter} allLabel="All roles" options={roleOptions} />
              <FilterSelect icon={<FaUniversity />} label="Filter by school" value={schoolFilter} onChange={setSchoolFilter} allLabel="All schools and departments" options={schoolOptions} />
              <FilterSelect icon={<FaCalendarAlt />} label="Filter by graduation year" value={gradFilter} onChange={setGradFilter} allLabel="All graduation years" options={gradOptions} />
            </div>
            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={clearFilters}
                  className="overflow-hidden text-sm font-bold text-red-800 hover:underline"
                >
                  Clear all filters
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Table */}
          <motion.div variants={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="bg-red-800 text-sm text-white">
                    <th className="px-5 py-4 font-bold">User</th>
                    <th className="px-5 py-4 font-bold">Registration number</th>
                    <th className="px-5 py-4 font-bold">Email</th>
                    <th className="px-5 py-4 font-bold">Class of</th>
                    <th className="px-5 py-4 font-bold">Role</th>
                    <th className="px-5 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {paginatedUsers.map((user, i) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        index={i}
                        deleting={deletingId === user.id}
                        onView={handleViewDetails}
                        onPassword={handleUpdatePassword}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {paginatedUsers.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-16 text-center">
                <FaUsers className="mx-auto mb-4 text-slate-200" size={48} />
                <p className="text-sm font-bold text-slate-700">{hasFilters ? "No users match your filters" : "There are no users yet"}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasFilters ? "Try a different search or clear the filters." : "New users will appear here once they are added."}
                </p>
              </motion.div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm">
              <p className="text-slate-500">
                {filteredUsers.length
                  ? `Showing ${startIndex + 1} to ${startIndex + paginatedUsers.length} of ${filteredUsers.length}`
                  : "No results"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(safePage - 1)}
                  aria-label="Previous page"
                  className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronLeft size={11} />
                </button>
                <span className="min-w-[92px] text-center font-semibold text-slate-600">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(safePage + 1)}
                  aria-label="Next page"
                  className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FaChevronRight size={11} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MotionConfig>
  );
};