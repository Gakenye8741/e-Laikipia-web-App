import React, { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { 
  useBroadcastNotificationMutation, 
  useSendBulkNotificationsMutation, 
  useGetAllNotificationsQuery,
  useDeleteNotificationMutation 
} from '../../features/APIS/Notification.Api';
import { useGetAllUsersQuery } from '../../features/APIS/UserApi';

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
          type: formData.type,
          is_read: false
        }).unwrap();
      } else {
        if (!formData.selectedUserId) return toast.error("Please select a recipient");
        await sendBulk({
          userIds: [formData.selectedUserId],
          payload: { title: formData.title, message: formData.message, type: formData.type, is_read: false }
        }).unwrap();
      }

      setShowConfirmModal(true); // Show confirmation modal
      setFormData({ ...formData, title: '', message: '', selectedUserId: '' });
      refetchHistory();
    } catch (err: any) {
      toast.error(err?.data?.message || "Transmission failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotify(id).unwrap();
      toast.info("Notification purged from records");
      refetchHistory();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans relative">
      
      {/* --- CONFIRMATION MODAL --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Dispatch Success</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Your message has been transmitted and logged successfully.</p>
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
            >Dismiss</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full mb-3">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Admin Console</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Notification Hub</h1>
          </div>
          
          {/* Global Refresh */}
          <button 
            onClick={() => { refetchHistory(); refetchUsers(); toast.success("Data Synchronized"); }}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            System Sync
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Sent</p>
                <p className="text-2xl font-black text-slate-900">{historyList.length}</p>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Active Users</p>
                  <p className="text-2xl font-black text-blue-600">{userList.length}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Unread Logs</p>
                <p className="text-2xl font-black text-rose-600">{historyList.filter((n: any) => !n.is_read).length}</p>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">System Status</p>
                <p className="text-xs font-black text-emerald-500 uppercase">● Online</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-8">
              <h2 className="text-lg font-black text-slate-800 uppercase mb-6 tracking-tight">Create New Alert</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 ml-1">Send To:</label>
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button type="button" onClick={() => setTargetType('ALL')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${targetType === 'ALL' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>EVERYONE</button>
                    <button type="button" onClick={() => setTargetType('SPECIFIC')} className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${targetType === 'SPECIFIC' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}>SPECIFIC USER</button>
                  </div>
                </div>

                {targetType === 'SPECIFIC' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Select Recipient</label>
                    <select value={formData.selectedUserId} onChange={e => setFormData({...formData, selectedUserId: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none transition-all">
                      <option value="">{usersLoading ? "Fetching..." : "-- Select User --"}</option>
                      {userList.map((user: any) => (
                        <option key={user.id} value={user.id}>{user.name} — {user.reg_no}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Title</label>
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-xs font-bold text-slate-700 outline-none" placeholder="Message Headline" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Category</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none">
                            <option value="SYSTEM">System</option>
                            <option value="REMINDER">Reminder</option>
                            <option value="ELECTION">Election</option>
                            <option value="WARNING">Warning</option>
                            <option value="ANNOUNCEMENT">Announcement</option>
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Body Message</label>
                  <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 text-xs font-medium text-slate-700 outline-none resize-none" placeholder="Write message here..." />
                </div>

                <button disabled={isBroadcasting || isBulking} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg disabled:bg-slate-300">
                  {isBroadcasting || isBulking ? 'Deploying...' : 'Deploy Alert'}
                </button>
              </form>
            </div>
          </div>

          {/* History Side */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[900px]">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Transmission Feed</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{filteredHistory.length} entries</span>
                </div>
                
                {/* --- SEARCH INPUT --- */}
                <div className="relative">
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or content..."
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-10 text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto">
                {historyLoading ? (
                  <div className="p-20 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent mb-4"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Synchronizing...</p>
                  </div>
                ) : filteredHistory.length > 0 ? (
                  filteredHistory.map((note: any) => (
                    <div key={note.id} className="p-6 hover:bg-blue-50/30 transition-colors group relative">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] ${
                          note.type === 'ALERT' || note.type === 'WARNING' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {note.type}
                        </span>
                        
                        {/* --- DELETE BUTTON --- */}
                        <button 
                          onClick={() => handleDelete(note.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 transition-all text-[10px] font-black uppercase flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          Purge
                        </button>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 uppercase mb-1">{note.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[90%]">{note.message}</p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                           <span className={`w-1.5 h-1.5 rounded-full ${note.is_read ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
                           {note.is_read ? 'Seen' : 'Delivered'}
                        </span>
                        <span className="text-[8px] text-slate-300 font-bold uppercase italic ml-auto">
                            Logged: {new Date(note.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center text-slate-300">
                    <p className="text-[10px] font-black uppercase tracking-widest">No matching records</p>
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