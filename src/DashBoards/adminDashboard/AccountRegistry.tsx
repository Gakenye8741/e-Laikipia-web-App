import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { PuffLoader } from "react-spinners";
import {
  FaUserPlus,
  FaSearch,
  FaSync,
  FaUserShield,
  FaUserGraduate,
  FaTrash,
  FaIdCard,
  FaLock,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import { MdOutlineVerifiedUser, MdAdminPanelSettings } from "react-icons/md";
import { toast } from "sonner";

// Make sure these paths match your project structure
import { useRegisterMutation } from "../../features/APIS/Auth.Api";
import { useGetAllUsersQuery, useDeleteUserMutation } from "../../features/APIS/UserApi";

const MySwal = withReactContent(Swal);

/* ============================== Constants ============================== */
export const allowedRoles = [
  "voter",
  "admin",
  "Dean_of_Science",
  "Dean_of_Education",
  "Dean_of_Business",
  "Dean_of_Humanities_and_Developmental_Studies",
  "Dean_of_TVET",
  "Dean_of_Students",
  "Accountants",
] as const;

const ITEMS_PER_PAGE = 6;

interface Account {
  id?: string;
  _id?: string;
  reg_no: string;
  role: string;
  created_at?: string;
  [key: string]: any;
}

/* Shared styles for the pop-up dialogs (buttons are styled with Tailwind instead of SweetAlert defaults) */
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

const swalField =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10";
const swalLabel = "mb-1 block text-sm font-semibold text-slate-700";

/* ============================== Helpers ============================== */
const accountId = (a: Account) => a.id || a._id || "";
const isStaff = (role: string) => role !== "voter";

/** "Dean_of_Science" becomes "Dean of Science", "voter" becomes "Voter" */
const roleLabel = (role: string) => {
  const text = (role || "").replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

/* ============================ Small components ============================ */
const StatCard = ({ label, value, note }: { label: string; value: number; note?: string }) => (
  <div className="bg-white p-5">
    <p className="text-sm font-semibold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">{value.toLocaleString()}</p>
    {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
  </div>
);

const RoleBadge = ({ role }: { role: string }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
      isStaff(role) ? "bg-slate-900 text-white" : "bg-red-50 text-red-700"
    }`}
  >
    {roleLabel(role)}
  </span>
);

const RoleIcon = ({ role }: { role: string }) => {
  if (role === "voter") return <FaUserGraduate size={18} />;
  if (role === "admin") return <MdAdminPanelSettings size={22} />;
  return <FaUserShield size={18} />;
};

const AccountRow = ({
  account, deleting, onDelete,
}: { account: Account; deleting: boolean; onDelete: (a: Account) => void }) => {
  const added = formatDate(account.created_at);
  return (
    <li className="group flex items-center justify-between gap-4 border-l-4 border-transparent px-5 py-4 transition hover:border-red-600 hover:bg-red-50/40 sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isStaff(account.role) ? "bg-slate-900 text-white" : "bg-red-50 text-red-700"
          }`}
        >
          <RoleIcon role={account.role} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900">{account.reg_no}</h3>
            {isStaff(account.role) && <FaLock className="shrink-0 text-xs text-slate-400" title="Protected by a password" />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <RoleBadge role={account.role} />
            {added && <span className="text-xs text-slate-500">Added {added}</span>}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(account)}
        disabled={deleting}
        aria-label={`Delete ${account.reg_no}`}
        title="Delete account"
        className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:border-red-200 hover:text-red-600 focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-red-600/10 disabled:opacity-50 lg:opacity-0 lg:group-hover:opacity-100"
      >
        {deleting ? <FaSync size={12} className="animate-spin" /> : <FaTrash size={12} />}
      </button>
    </li>
  );
};

const Pagination = ({
  page, totalPages, from, to, total, onChange,
}: { page: number; totalPages: number; from: number; to: number; total: number; onChange: (p: number) => void }) => (
  <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm sm:px-6">
    <p className="text-slate-500">
      Showing <span className="font-bold text-slate-700">{from}</span> to <span className="font-bold text-slate-700">{to}</span> of{" "}
      <span className="font-bold text-slate-700">{total}</span>
    </p>
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaChevronLeft size={11} />
      </button>
      <span className="min-w-[88px] text-center font-semibold text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaChevronRight size={11} />
      </button>
    </div>
  </div>
);

/* ================================= Page ================================= */
export const AccountRegistry = () => {
  /* ---------- API ---------- */
  const { data: usersRaw, isLoading, isError, refetch, isFetching } = useGetAllUsersQuery();
  const [registerAccount, { isLoading: isRegistering }] = useRegisterMutation();
  const [deleteUser] = useDeleteUserMutation();

  /* ---------- State ---------- */
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------- Data ---------- */
  const allUsers = useMemo((): Account[] => {
    const data = (usersRaw as any)?.users || usersRaw;
    return Array.isArray(data) ? data : [];
  }, [usersRaw]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allUsers.forEach((u) => (counts[u.role] = (counts[u.role] || 0) + 1));
    return counts;
  }, [allUsers]);

  const voterCount = roleCounts["voter"] || 0;
  const staffCount = allUsers.length - voterCount;

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return allUsers.filter(
      (u) => (u.reg_no || "").toLowerCase().includes(term) && (roleFilter ? u.role === roleFilter : true)
    );
  }, [allUsers, searchTerm, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const hasFilters = !!searchTerm || !!roleFilter;
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
  };

  useEffect(() => setCurrentPage(1), [searchTerm, roleFilter]);

  /* ---------- Action: add an account ---------- */
  const handleRegister = async () => {
    const { value: formData } = await MySwal.fire({
      ...swalBase,
      title: "Add a new account",
      html: `
        <div class="space-y-4 p-1 text-left">
          <div>
            <label class="${swalLabel}" for="swal_reg_no">Registration or staff number</label>
            <input id="swal_reg_no" class="${swalField}" placeholder="For example ADM/001 or STUDENT/00022" autocomplete="off" />
          </div>
          <div>
            <label class="${swalLabel}" for="swal_role">Role</label>
            <select id="swal_role" class="${swalField}">
              ${allowedRoles.map((role) => `<option value="${role}">${roleLabel(role)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="${swalLabel}" for="swal_password">Password</label>
            <input id="swal_password" type="password" class="${swalField}" placeholder="Enter a password" autocomplete="new-password" />
            <p class="mt-1 text-xs text-slate-500">Required for every role except voter.</p>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create account",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const reg_no = (document.getElementById("swal_reg_no") as HTMLInputElement).value.trim();
        const role = (document.getElementById("swal_role") as HTMLSelectElement).value;
        const password = (document.getElementById("swal_password") as HTMLInputElement).value.trim();

        if (!reg_no) {
          Swal.showValidationMessage("Enter a registration or staff number");
          return false;
        }
        if (isStaff(role) && !password) {
          Swal.showValidationMessage("Enter a password for this role");
          return false;
        }
        return { reg_no, role, password };
      },
    });

    if (!formData) return;

    try {
      await registerAccount(formData).unwrap();
      await MySwal.fire({
        ...swalBase,
        icon: "success",
        title: "Account created",
        text: `${formData.reg_no} was added as ${roleLabel(formData.role).toLowerCase()}.`,
        confirmButtonText: "Done",
      });
      refetch();
    } catch (err: any) {
      MySwal.fire({
        ...swalBase,
        icon: "error",
        title: "Could not create the account",
        text: err?.data?.error || err?.data?.message || "Something went wrong. Please try again.",
        confirmButtonText: "Close",
      });
    }
  };

  /* ---------- Action: delete an account ---------- */
  const handleDelete = async (account: Account) => {
    const confirm = await MySwal.fire({
      ...swalBase,
      icon: "warning",
      title: "Delete this account?",
      text: `${account.reg_no} will be removed for good. This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Keep it",
    });
    if (!confirm.isConfirmed) return;

    const id = accountId(account);
    setDeletingId(id);
    try {
      await deleteUser(id).unwrap();
      toast.success(`${account.reg_no} was deleted`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Could not delete the account");
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Loading and error states ---------- */
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50">
        <PuffLoader color="#b91c1c" size={60} />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading accounts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
        <FaExclamationTriangle className="text-red-600" size={32} />
        <h2 className="text-xl font-black text-slate-900">We could not load the accounts</h2>
        <p className="max-w-sm text-sm text-slate-500">Check your connection and try again.</p>
        <button onClick={() => refetch()} className="mt-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800">
          Try again
        </button>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">User registry</h1>
            <p className="mt-1 max-w-lg text-sm text-slate-500">
              Add, find and remove the accounts that can use the voting system.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refetch()}
              aria-label="Refresh the list"
              title="Refresh the list"
              className="rounded-xl border border-slate-200 bg-white p-3.5 text-slate-500 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-red-600/10"
            >
              <FaSync className={isFetching ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20 disabled:opacity-60"
            >
              <FaUserPlus /> Add account
            </button>
          </div>
        </header>

        {/* Numbers */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
          <StatCard label="All accounts" value={allUsers.length} />
          <StatCard label="Voters" value={voterCount} />
          <StatCard label="Staff and admins" value={staffCount} note="These accounts need a password" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Filters */}
          <aside className="lg:col-span-4">
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-6">
              <div>
                <label htmlFor="search" className="mb-1.5 block text-sm font-semibold text-slate-700">Search</label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search by registration number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Role</p>
                <div className="flex flex-wrap gap-2">
                  {[{ value: "", label: "All roles", count: allUsers.length }, ...allowedRoles.map((r) => ({ value: r as string, label: roleLabel(r), count: roleCounts[r] || 0 }))].map((chip) => {
                    const active = roleFilter === chip.value;
                    return (
                      <button
                        key={chip.value || "all"}
                        onClick={() => setRoleFilter(chip.value)}
                        aria-pressed={active}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                          active
                            ? "border-red-700 bg-red-700 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-700"
                        }`}
                      >
                        {chip.label} <span className={active ? "text-red-100" : "text-slate-400"}>{chip.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="text-sm font-bold text-red-700 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          </aside>

          {/* Account list */}
          <section className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 text-base font-black text-slate-800">
                  <MdOutlineVerifiedUser className="text-red-700" size={22} /> Accounts
                </h2>
                <span className="text-sm text-slate-500">
                  {filteredUsers.length.toLocaleString()} {filteredUsers.length === 1 ? "account" : "accounts"}
                  {hasFilters ? " match" : ""}
                </span>
              </div>

              {pageUsers.length > 0 ? (
                <>
                  <ul className="divide-y divide-slate-100">
                    {pageUsers.map((user) => (
                      <AccountRow key={accountId(user) || user.reg_no} account={user} deleting={deletingId === accountId(user)} onDelete={handleDelete} />
                    ))}
                  </ul>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    from={startIndex + 1}
                    to={startIndex + pageUsers.length}
                    total={filteredUsers.length}
                    onChange={setCurrentPage}
                  />
                </>
              ) : (
                <div className="px-6 py-16 text-center">
                  <FaIdCard className="mx-auto mb-4 text-slate-200" size={48} />
                  <p className="text-sm font-bold text-slate-700">
                    {hasFilters ? "No accounts match your search" : "There are no accounts yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {hasFilters ? "Try a different number or choose another role." : "Select “Add account” to create the first one."}
                  </p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="mt-4 text-sm font-bold text-red-700 hover:underline">
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};