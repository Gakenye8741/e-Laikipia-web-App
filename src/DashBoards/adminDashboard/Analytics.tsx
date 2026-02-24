import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { useGetAllPositionsQuery } from "../../features/APIS/Position.APi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetAllUsersQuery } from "../../features/APIS/UserApi";
import { useGetAllNotificationsQuery } from "../../features/APIS/Notification.Api"; // Added Notification API
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ===== Type Definitions =====
interface User {
  id: string;
  election_id: string;
  created_at: string;
  [key: string]: any;
}

interface Position {
  id: string;
  name: string;
  election_id: string;
  tier: string;
}

interface Election {
  id: string;
  name: string;
}

interface Notification {
  id: string;
  is_read: boolean;
  type?: string;
  created_at: string;
}

export const Analytics = () => {
  // ===== Hooks =====
  const { data: usersData, isLoading: loadingUsers } = useGetAllUsersQuery(undefined);
  const { data: positionsData, isLoading: loadingPositions } = useGetAllPositionsQuery();
  const { data: electionsData, isLoading: loadingElections } = useGetAllElectionsQuery();
  const { data: notifyData, isLoading: loadingNotify } = useGetAllNotificationsQuery();

  const [selectedElection, setSelectedElection] = useState<string | "all">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ===== University Branding Colors =====
  const PRIMARY_RED = "#b91c1c"; 
  const DARK_RED = "#7f1d1d";
  const GRAY_ACCENT = "#475569";
  const COLORS = [PRIMARY_RED, GRAY_ACCENT, DARK_RED, "#f87171"];

  // ===== Normalize data =====
  const users = useMemo((): User[] => {
    const raw = usersData?.users || usersData;
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);

  const positions = useMemo((): Position[] => {
    // @ts-ignore
    const raw = positionsData?.positions || positionsData;
    return Array.isArray(raw) ? raw : [];
  }, [positionsData]);

  const elections = useMemo((): Election[] => {
    // @ts-ignore
    const raw = electionsData?.elections || electionsData;
    return Array.isArray(raw) ? raw : [];
  }, [electionsData]);

  const notifications = useMemo((): Notification[] => {
    // @ts-ignore
    const raw = notifyData?.notifications || notifyData;
    return Array.isArray(raw) ? raw : [];
  }, [notifyData]);

  // ===== Filtered data =====
  const filteredUsers = useMemo(() => {
    let filtered = selectedElection === "all"
      ? users
      : users.filter((u: User) => u.election_id === selectedElection);

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
      filtered = filtered.filter(u => {
        const created = new Date(u.created_at).getTime();
        return created >= start && created <= end;
      });
    }
    return filtered;
  }, [users, selectedElection, startDate, endDate]);

  const filteredPositions = useMemo(() => {
    return selectedElection === "all"
      ? positions
      : positions.filter((p: Position) => p.election_id === selectedElection);
  }, [positions, selectedElection]);

  // ===== Notification Analytics Logic =====
  const readStatusData = useMemo(() => {
    const read = notifications.filter(n => n.is_read).length;
    const unread = notifications.length - read;
    return [
      { name: "Opened", value: read },
      { name: "Pending", value: unread }
    ];
  }, [notifications]);

  const notifyByType = useMemo(() => {
    const map: Record<string, number> = {};
    notifications.forEach(n => {
      const type = n.type || "General";
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [notifications]);

  // ===== Existing Totals =====
  const totalVoters = filteredUsers.length;
  const totalPositions = filteredPositions.length;
  const totalElections = elections.length;

  // ===== Chart data =====
  const positionsPerElection = elections.map(e => ({
    election: e.name,
    positions: positions.filter(p => p.election_id === e.id).length,
  }));

  const usersPerElection = elections.map(e => ({
    election: e.name,
    users: users.filter(u => u.election_id === e.id)?.length ?? 0,
  }));

  const tiers = ["school", "university"];
  const positionsByTier = tiers.map(tier => ({
    name: tier.toUpperCase(),
    value: filteredPositions.filter(p => p.tier === tier).length,
  }));

  const now = Date.now();
  const votersByDate = useMemo(() => {
    const map: Record<string, number> = {};
    filteredUsers.forEach(u => {
      const date = new Date(u.created_at).toLocaleDateString();
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredUsers]);

  const last7DaysCount = filteredUsers.filter(
    u => new Date(u.created_at).getTime() > now - 7 * 24 * 60 * 60 * 1000
  ).length;

  const last30DaysCount = filteredUsers.filter(
    u => new Date(u.created_at).getTime() > now - 30 * 24 * 60 * 60 * 1000
  ).length;

  // ===== Loading State =====
  if (loadingUsers || loadingPositions || loadingElections || loadingNotify) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-screen bg-white">
        <PuffLoader color={PRIMARY_RED} size={100} />
        <p className="text-red-700 font-bold animate-pulse uppercase tracking-widest text-sm">Synchronizing University Data...</p>
      </div>
    );
  }

  // ===== JSX =====
  return (
    <div className="p-8 space-y-8 bg-white min-h-screen">
      <div className="border-b-4 border-red-700 pb-4">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
          Voting <span className="text-red-700">Analytics Dashboard</span>
        </h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap mb-4 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-red-700 uppercase ml-1">Election Filter</label>
          <select
            className="select select-bordered w-64 border-red-200 focus:border-red-700"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
          >
            <option value="all">All Elections</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-red-700 uppercase ml-1">Start Date</label>
          <input
            type="date"
            className="input input-bordered border-red-200 focus:border-red-700"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-red-700 uppercase ml-1">End Date</label>
          <input
            type="date"
            className="input input-bordered border-red-200 focus:border-red-700"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Voters", value: totalVoters },
          { title: "Total Positions", value: totalPositions },
          { title: "Total Elections", value: totalElections },
          { title: "Notifications", value: notifications.length },
        ].map(card => (
          <div key={card.title} className="border-2 border-red-50 shadow-xl rounded-3xl p-6 bg-white flex flex-col items-center justify-center transition-transform hover:scale-105">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</h3>
            <p className="text-3xl font-black text-red-700">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* NEW: Notification Engagement Pie */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Notification Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={readStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label
              >
                <Cell fill={PRIMARY_RED} />
                <Cell fill={GRAY_ACCENT} />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* NEW: Notification Categories Bar */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Notification Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={notifyByType} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={10} />
              <YAxis dataKey="name" type="category" fontSize={10} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill={DARK_RED} radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Positions per Election */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Positions per Election</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={positionsPerElection}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="election" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip cursor={{fill: '#fef2f2'}} />
              <Legend />
              <Bar dataKey="positions" fill={PRIMARY_RED} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Users per Election */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Voters per Election</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usersPerElection}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="election" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip cursor={{fill: '#fef2f2'}} />
              <Legend />
              <Bar dataKey="users" fill={GRAY_ACCENT} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Positions by Tier */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Positions by Tier</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={positionsByTier}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label
              >
                {positionsByTier.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Voter Registration Trends */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white lg:col-span-2">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Voter Registration Trends</h3>
          {votersByDate.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={votersByDate}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke={PRIMARY_RED} strokeWidth={4} dot={{r: 6, fill: PRIMARY_RED}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-20">No data available for the selected range</p>
          )}
        </div>

        {/* Voter registration last 7 and 30 days */}
        <div className="border border-slate-100 rounded-[2rem] shadow-2xl p-8 bg-white lg:col-span-2">
          <h3 className="text-sm font-black text-slate-800 uppercase mb-6 border-l-4 border-red-700 pl-4">Recent Voter Registrations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { period: "Last 7 Days", count: last7DaysCount },
              { period: "Last 30 Days", count: last30DaysCount },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip cursor={{fill: '#fef2f2'}} />
              <Legend />
              <Bar dataKey="count" fill={DARK_RED} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};