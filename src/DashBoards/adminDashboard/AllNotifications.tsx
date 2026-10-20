import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  useBroadcastNotificationMutation,
  useSendBulkNotificationsMutation,
  useGetAllNotificationsQuery,
  useDeleteNotificationMutation
} from '../../features/APIS/Notification.Api';
import { useGetAllUsersQuery } from '../../features/APIS/UserApi';

/* Small animations. They switch off for people who prefer less motion. */
const animations = `
@keyframes nm-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes nm-pop { 0% { opacity: 0; transform: scale(.9); } 60% { transform: scale(1.04); } 100% { opacity: 1; transform: scale(1); } }
@keyframes nm-slide { from { opacity: 0; transform: translateY(24px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes nm-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes nm-drop { from { opacity: 0; transform: translateY(-10px); max-height: 0; } to { opacity: 1; transform: translateY(0); max-height: 140px; } }
@keyframes nm-ring { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.45); } 100% { box-shadow: 0 0 0 18px rgba(16,185,129,0); } }
@keyframes nm-wiggle { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(14deg); } 30% { transform: rotate(-12deg); } 45% { transform: rotate(8deg); } 60% { transform: rotate(-6deg); } 75% { transform: rotate(0); } }
@keyframes nm-float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(18px, -24px); } }
@keyframes nm-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
@keyframes nm-draw { from { stroke-dashoffset: 30; } to { stroke-dashoffset: 0; } }

.nm-rise { animation: nm-rise .55s cubic-bezier(.22,1,.36,1) both; }
.nm-pop { animation: nm-pop .45s cubic-bezier(.22,1,.36,1) both; }
.nm-slide { animation: nm-slide .45s cubic-bezier(.22,1,.36,1) both; }
.nm-fade { animation: nm-fade .25s ease-out both; }
.nm-drop { animation: nm-drop .35s ease-out both; overflow: hidden; }
.nm-ring { animation: nm-ring 1.6s ease-out 2; }
.nm-wiggle { animation: nm-wiggle 1.2s ease-in-out .6s 1; transform-origin: 50% 10%; }
.nm-float { animation: nm-float 14s ease-in-out infinite; }
.nm-float-slow { animation: nm-float 20s ease-in-out infinite reverse; }
.nm-draw { stroke-dasharray: 30; animation: nm-draw .6s ease-out .25s both; }
.nm-skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 800px 100%;
  animation: nm-shimmer 1.4s linear infinite;
}

/* Clear outline when moving around with a keyboard */
.nm-root button:focus-visible,
.nm-root select:focus-visible,
.nm-root input:focus-visible,
.nm-root textarea:focus-visible {
  outline: 3px solid rgba(220,38,38,.35);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .nm-rise, .nm-pop, .nm-slide, .nm-fade, .nm-drop, .nm-ring, .nm-wiggle, .nm-float, .nm-float-slow, .nm-draw, .nm-skeleton,
  .animate-spin, .animate-pulse, .animate-ping { animation: none !important; }
}
`;

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 outline-none transition duration-200 hover:border-slate-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 sm:text-sm";

/* Friendly names and colours for each kind of message (looks only) */
const typeStyles: Record<string, { label: string; badge: string; dot: string }> = {
  SYSTEM: { label: 'General', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  REMINDER: { label: 'Reminder', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  ELECTION: { label: 'Election', badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  WARNING: { label: 'Warning', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  ALERT: { label: 'Alert', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  ANNOUNCEMENT: { label: 'News', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

const NotificationManager = () => {
  // 1. Fetching Data
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useGetAllNotificationsQuery(undefined);
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetAllUsersQuery(undefined);

  // 2. Mutations
  const [broadcast, { isLoading: isBroadcasting }] = useBroadcastNotificationMutation();
  const [sendBulk, { isLoading: isBulking }] = useSendBulkNotificationsMutation();
  const [deleteNotify] = useDeleteNotificationMutation();

  // 3. Local State
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM',
    selectedUserId: ''
  });

  // --- DATA GUARDS ---
  const userList = useMemo(() => Array.isArray(users) ? users : (users as any)?.users || [], [users]);
  const historyList = useMemo(() => Array.isArray(history) ? history : (history as any)?.notifications || [], [history]);

  // --- SEARCH LOGIC ---
  const filteredHistory = useMemo(() => {
    const reversed = [...historyList].reverse();
    if (!searchTerm) return reversed;
    return reversed.filter(n =>
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyList, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return toast.error("Title and message are required");

    try {
      if (targetType === 'ALL') {
        await broadcast({
          title: formData.title,
          message: formData.message,
          type: formData.type as any,
          is_read: false
        }).unwrap();
      } else {
        if (!formData.selectedUserId) return toast.error("Please choose a user");
        await sendBulk({
          userIds: [formData.selectedUserId],
          payload: {
            title: formData.title,
            message: formData.message,
            type: formData.type as any,
            is_read: false
          }
        }).unwrap();
      }

      setShowConfirmModal(true);
      setFormData({ ...formData, title: '', message: '', selectedUserId: '', type: 'SYSTEM' });
      refetchHistory();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not send. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotify(id).unwrap();
      toast.info("Notification deleted");
      refetchHistory();
    } catch (err) {
      toast.error("Could not delete. Please try again.");
    }
  };

  const isSending = isBroadcasting || isBulking;
  const unreadCount = historyList.filter((n: any) => !n.is_read).length;

  return (
    <div className="nm-root relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/30 px-4 py-6 font-sans text-slate-600 sm:px-6 sm:py-10 lg:px-8">
      <style>{animations}</style>

      {/* Soft background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="nm-float absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-200/30 blur-3xl sm:h-96 sm:w-96"></div>
        <div className="nm-float-slow absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-amber-100/40 blur-3xl sm:h-80 sm:w-80"></div>
      </div>

      {/* --- PHONE PREVIEW --- */}
      {showPreview && (
        <div className="nm-slide fixed bottom-4 right-4 z-[90] w-[calc(100%-2rem)] max-w-[300px] sm:bottom-8 sm:right-8">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="absolute left-1/2 top-0 z-10 h-5 w-20 -translate-x-1/2 rounded-b-xl bg-black"></div>
            <div className="mt-8">
              <p className="mb-4 ml-2 text-xs text-white/50">Phone preview</p>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-lg" aria-live="polite">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-600 text-[9px] font-bold text-white">L</div>
                  <span className="text-xs font-semibold text-white/80">LUEC Official</span>
                  <span className="ml-auto text-[10px] text-white/40">now</span>
                </div>
                <h4 className="truncate text-sm font-bold text-white">{formData.title || "Title"}</h4>
                <p className="mt-1 line-clamp-2 break-words text-xs leading-snug text-white/60">
                  {formData.message || "Type a message to see how it will look."}
                </p>
              </div>
            </div>
            <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-white/20"></div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div
          className="nm-fade fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nm-sent-title"
        >
          <div className="nm-pop w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
            <div className="nm-ring mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path className="nm-draw" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 id="nm-sent-title" className="mb-2 text-xl font-extrabold text-slate-900">Notification sent</h3>
            <p className="mb-6 text-sm text-slate-500">Your message was sent and saved in the list.</p>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="min-h-[48px] w-full rounded-xl bg-red-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition hover:bg-red-800 hover:shadow-xl active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <header className="nm-rise mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-white shadow-lg shadow-red-700/30 sm:h-14 sm:w-14">
              <svg className="nm-wiggle h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Notifications</h1>
              <p className="mt-1 text-sm text-slate-500">Send messages to your users and see what you sent.</p>
            </div>
          </div>

          <button
            onClick={() => { refetchHistory(); refetchUsers(); toast.success("All up to date"); }}
            className="group flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:scale-95 sm:w-auto"
          >
            <svg className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </header>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          {[
            { label: "Total sent", value: historyList.length, color: "text-slate-900", bar: "bg-slate-800" },
            { label: "People", value: userList.length, color: "text-red-700", bar: "bg-red-600" },
            { label: "Not read yet", value: unreadCount, color: "text-amber-600", bar: "bg-amber-500" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="nm-rise group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${s.bar}`}></span>
              <p className="mb-1 text-xs text-slate-400">{s.label}</p>
              <p className={`text-2xl font-extrabold sm:text-3xl ${s.color}`}>{s.value}</p>
            </div>
          ))}
          <div className="nm-rise rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6" style={{ animationDelay: "290ms" }}>
            <p className="mb-1 text-xs text-slate-400">Status</p>
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-600 sm:text-base">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              Online
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Form Side */}
          <div className="lg:col-span-5">
            <div className="nm-rise rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8 lg:sticky lg:top-8" style={{ animationDelay: "150ms" }}>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-900">New notification</h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`min-h-[36px] shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition duration-200 active:scale-95 ${showPreview ? 'bg-red-700 text-white shadow-md shadow-red-700/25' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {showPreview ? 'Hide preview' : 'Show preview'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-slate-700">Send to</label>
                  <div className="flex rounded-2xl bg-slate-100 p-1.5">
                    <button type="button" onClick={() => setTargetType('ALL')} className={`min-h-[44px] flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${targetType === 'ALL' ? 'bg-white text-red-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Everyone</button>
                    <button type="button" onClick={() => setTargetType('SPECIFIC')} className={`min-h-[44px] flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-300 ${targetType === 'SPECIFIC' ? 'bg-white text-red-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>One user</button>
                  </div>
                </div>

                {targetType === 'SPECIFIC' && (
                  <div className="nm-drop">
                    <label className="mb-2 ml-1 block text-sm font-semibold text-slate-700">User</label>
                    <select value={formData.selectedUserId} onChange={e => setFormData({ ...formData, selectedUserId: e.target.value })} className={`${inputBase} cursor-pointer`}>
                      <option value="">{usersLoading ? "Loading users..." : "Choose a user"}</option>
                      {userList.map((user: any) => (
                        <option key={user.id} value={user.id}>{user.name} — {user.reg_no}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-slate-700">Title</label>
                  <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputBase} placeholder="Write a short title" />
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-slate-700">Kind of message</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className={`${inputBase} cursor-pointer`}>
                    <option value="SYSTEM">General</option>
                    <option value="REMINDER">Reminder</option>
                    <option value="ELECTION">Election</option>
                    <option value="WARNING">Warning</option>
                    <option value="ANNOUNCEMENT">News</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4} className={`${inputBase} resize-none`} placeholder="Write your message here" />
                </div>

                <button
                  disabled={isSending}
                  className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-red-700 py-4 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition duration-200 hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-xl active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isSending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>}
                  {isSending ? 'Sending...' : 'Send notification'}
                </button>
              </form>
            </div>
          </div>

          {/* History Side */}
          <div className="lg:col-span-7">
            <div className="nm-rise flex max-h-[75vh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:max-h-[900px]" style={{ animationDelay: "230ms" }}>
              <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-8">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">Sent notifications</h2>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{filteredHistory.length} {filteredHistory.length === 1 ? 'item' : 'items'}</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or message"
                    className={`${inputBase} pl-11 shadow-sm`}
                  />
                  <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto overscroll-contain">
                {historyLoading ? (
                  <div className="space-y-5 p-5 sm:p-8" aria-label="Loading notifications">
                    {[0, 1, 2].map(n => (
                      <div key={n} className="space-y-3">
                        <div className="nm-skeleton h-5 w-20 rounded-full"></div>
                        <div className="nm-skeleton h-4 w-2/3 rounded-md"></div>
                        <div className="nm-skeleton h-3 w-full rounded-md"></div>
                      </div>
                    ))}
                    <p className="animate-pulse text-center text-sm text-slate-400">Loading notifications...</p>
                  </div>
                ) : filteredHistory.length > 0 ? (
                  filteredHistory.map((note: any, i: number) => {
                    const style = typeStyles[note.type] || { label: note.type, badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
                    return (
                      <div
                        key={note.id}
                        className="nm-rise group relative border-l-4 border-transparent p-5 transition duration-200 hover:border-red-600 hover:bg-red-50/40 sm:p-6"
                        style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`}></span>
                            {style.label}
                          </span>

                          <button
                            onClick={() => handleDelete(note.id)}
                            aria-label={`Delete ${note.title}`}
                            className="flex min-h-[36px] shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-100 hover:text-red-700 active:scale-95 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete
                          </button>
                        </div>
                        <h3 className="mb-1 break-words text-base font-bold text-slate-900">{note.title}</h3>
                        <p className="max-w-full break-words text-sm leading-relaxed text-slate-500 sm:max-w-[90%]">{note.message}</p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <span className={`h-2 w-2 rounded-full ${note.is_read ? 'bg-emerald-500' : 'animate-pulse bg-red-500'}`}></span>
                            {note.is_read ? 'Read' : 'Not read yet'}
                          </span>
                          <span className="text-xs text-slate-400 sm:ml-auto">
                            Sent on {new Date(note.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="nm-fade p-12 text-center sm:p-20">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">No notifications found</p>
                    <p className="mt-1 text-xs text-slate-400">{searchTerm ? "Try a different search." : "Send your first one using the form."}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;