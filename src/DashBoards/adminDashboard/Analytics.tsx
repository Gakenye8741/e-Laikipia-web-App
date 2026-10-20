import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { PuffLoader } from "react-spinners";
import { motion, MotionConfig, useInView, animate, type Variants } from "framer-motion";
import { Download, RotateCcw, Lightbulb, AlertTriangle } from "lucide-react";
import { useGetAllPositionsQuery } from "../../features/APIS/Position.APi";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetAllUsersQuery } from "../../features/APIS/UserApi";
import { useGetAllNotificationsQuery } from "../../features/APIS/Notification.Api";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
  Funnel,
  FunnelChart,
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Treemap,
} from "recharts";

/* =============================== Types =============================== */
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

/* ============================== Constants ============================== */
const RED = "#b91c1c";
const DARK_RED = "#7f1d1d";
const ROSE = "#f87171";
const SLATE = "#475569";
const MUTED = "#cbd5e1";
const PALETTE = [RED, SLATE, ROSE, DARK_RED, "#94a3b8", "#d97706", "#0f766e", "#7c3aed"];

const DAY = 24 * 60 * 60 * 1000;
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15,23,42,0.10)",
  fontSize: 12,
  fontWeight: 600,
};
const axisTick = { fill: "#64748b", fontSize: 11, fontWeight: 600 };
const legendStyle = { fontSize: 12, fontWeight: 600 };

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-700/10";

const reveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const cell: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ============================== Helpers ============================== */
const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : s);
const validTime = (s: string) => {
  const t = new Date(s).getTime();
  return Number.isNaN(t) ? null : t;
};

type Range = { start: number; end: number };
const within = (s: string, r: Range) => {
  if (r.start === -Infinity && r.end === Infinity) return true;
  const t = validTime(s);
  return t !== null && t >= r.start && t <= r.end;
};

/** Counts per calendar day with gaps filled, plus a running total */
const buildDaily = (dates: string[]) => {
  const map = new Map<string, number>();
  dates.forEach((s) => {
    const t = validTime(s);
    if (t === null) return;
    const k = toKey(new Date(t));
    map.set(k, (map.get(k) || 0) + 1);
  });
  const keys = [...map.keys()].sort();
  if (!keys.length) return [];
  const out: { date: string; label: string; count: number; total: number }[] = [];
  const cur = new Date(`${keys[0]}T00:00:00`);
  const last = new Date(`${keys[keys.length - 1]}T00:00:00`);
  let total = 0;
  let guard = 0;
  while (cur <= last && guard++ < 3660) {
    const k = toKey(cur);
    const count = map.get(k) || 0;
    total += count;
    out.push({ date: k, label: fmtDay(cur), count, total });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);

/** 7 weekdays x 24 hours grid of counts */
const buildHeat = (dates: string[]) => {
  const grid = DOW.map(() => Array.from({ length: 24 }, () => 0));
  dates.forEach((s) => {
    const t = validTime(s);
    if (t === null) return;
    const d = new Date(t);
    grid[(d.getDay() + 6) % 7][d.getHours()] += 1;
  });
  return grid;
};

/* ============================ UI building blocks ============================ */
const Counter = ({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const c = animate(0, to, { duration: 1.1, ease: "easeOut", onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [seen, to]);
  return (
    <span ref={ref}>
      {n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

const Metric = ({
  label, value, decimals, suffix, note, tone,
}: {
  label: string; value: number; decimals?: number; suffix?: string; note?: string; tone?: "up" | "down" | "flat";
}) => (
  <motion.div variants={cell} className="bg-white p-4 sm:p-5">
    <p className="text-xs font-semibold text-slate-500">{label}</p>
    <p className="mt-1 text-3xl font-black tabular-nums text-slate-900">
      <Counter to={value} decimals={decimals} suffix={suffix} />
    </p>
    {note && (
      <p
        className={`mt-1 text-xs font-semibold ${
          tone === "up" ? "text-emerald-700" : tone === "down" ? "text-red-700" : "text-slate-500"
        }`}
      >
        {note}
      </p>
    )}
  </motion.div>
);

const Section = ({ id, title, blurb, children }: { id: string; title: string; blurb: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-28 space-y-4">
    <div className="border-l-4 border-red-700 pl-3">
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{blurb}</p>
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>
  </section>
);

const ChartCard = ({
  title, hint, children, wide = false, empty = false, height = 280, action,
}: {
  title: string; hint: string; children: ReactNode; wide?: boolean; empty?: boolean; height?: number; action?: ReactNode;
}) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 ${wide ? "lg:col-span-2" : ""}`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h4 className="text-sm font-black text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      {action}
    </div>
    {empty ? (
      <div className="flex items-center justify-center text-center text-sm text-slate-400" style={{ height }}>
        Nothing to show yet. Try widening the filters.
      </div>
    ) : (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const ScatterTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={tooltipStyle} className="bg-white px-3 py-2 text-slate-700">
      <p className="font-black">{p.name}</p>
      <p>{p.positions} positions</p>
      <p>{p.voters} voters</p>
    </div>
  );
};

/* ======================= Extra building blocks (added) ======================= */
const PlainCard = ({
  title, hint, children, wide = false,
}: { title: string; hint: string; children: ReactNode; wide?: boolean }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 ${wide ? "lg:col-span-2" : ""}`}>
    <div className="mb-4">
      <h4 className="text-sm font-black text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
    {children}
  </div>
);

const Heatmap = ({ grid, noun }: { grid: number[][]; noun: string }) => {
  const max = Math.max(1, ...grid.flat());
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="ml-10 grid text-[10px] font-semibold text-slate-400" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="text-center">{h % 3 === 0 ? `${String(h).padStart(2, "0")}` : ""}</span>
          ))}
        </div>
        {grid.map((row, d) => (
          <div key={DOW[d]} className="mt-1 flex items-center gap-2">
            <span className="w-8 text-xs font-bold text-slate-500">{DOW[d]}</span>
            <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {row.map((v, h) => (
                <div
                  key={h}
                  title={`${DOW[d]} ${String(h).padStart(2, "0")}:00, ${v} ${noun}`}
                  className="h-6 rounded-sm"
                  style={{ background: v ? `rgba(185, 28, 28, ${0.12 + (v / max) * 0.88})` : "#f1f5f9" }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="mt-3 flex items-center justify-end gap-2 text-[11px] font-semibold text-slate-400">
          Fewer
          {[0.15, 0.4, 0.65, 0.9].map((a) => (
            <span key={a} className="h-3 w-5 rounded-sm" style={{ background: `rgba(185, 28, 28, ${a})` }} />
          ))}
          More
        </div>
      </div>
    </div>
  );
};

const Spark = ({
  id, title, value, data, dataKey, color,
}: { id: string; title: string; value: number; data: any[]; dataKey: string; color: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold text-slate-500">{title}</p>
    <p className="text-2xl font-black tabular-nums text-slate-900">{value.toLocaleString()}</p>
    <div className="mt-2 h-14">
      {data.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#sp-${id})`} dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <p className="pt-4 text-xs text-slate-400">Not enough days yet</p>
      )}
    </div>
  </div>
);

const TreeCell = (props: any) => {
  const { x, y, width, height, index, name, size, depth } = props;
  if (depth === 0 || width < 2 || height < 2) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={PALETTE[(index || 0) % PALETTE.length]} stroke="#fff" strokeWidth={2} />
      {width > 70 && height > 38 && (
        <>
          <text x={x + 8} y={y + 20} fill="#fff" fontSize={12} fontWeight={800}>{name}</text>
          <text x={x + 8} y={y + 36} fill="#fff" fillOpacity={0.9} fontSize={11}>{Number(size).toLocaleString()}</text>
        </>
      )}
    </g>
  );
};

/* ================================ Page ================================ */
export const Analytics = () => {
  const { data: usersData, isLoading: loadingUsers } = useGetAllUsersQuery(undefined);
  const { data: positionsData, isLoading: loadingPositions } = useGetAllPositionsQuery();
  const { data: electionsData, isLoading: loadingElections } = useGetAllElectionsQuery();
  const { data: notifyData, isLoading: loadingNotify } = useGetAllNotificationsQuery();

  const [selectedElection, setSelectedElection] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [breakdownField, setBreakdownField] = useState("");

  /* ---------- Normalize ---------- */
  const users = useMemo((): User[] => {
    const raw = (usersData as any)?.users || usersData;
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);
  const positions = useMemo((): Position[] => {
    const raw = (positionsData as any)?.positions || positionsData;
    return Array.isArray(raw) ? raw : [];
  }, [positionsData]);
  const elections = useMemo((): Election[] => {
    const raw = (electionsData as any)?.elections || electionsData;
    return Array.isArray(raw) ? raw : [];
  }, [electionsData]);
  const notifications = useMemo((): Notification[] => {
    const raw = (notifyData as any)?.notifications || notifyData;
    return Array.isArray(raw) ? raw : [];
  }, [notifyData]);

  /* ---------- Filters ---------- */
  const range = useMemo<Range>(
    () => ({
      start: startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity,
      end: endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : Infinity,
    }),
    [startDate, endDate]
  );
  const hasFilters = selectedElection !== "all" || !!startDate || !!endDate;

  const setPreset = (days: number | null) => {
    if (days === null) {
      setStartDate("");
      setEndDate("");
      return;
    }
    const end = new Date();
    const start = new Date(Date.now() - (days - 1) * DAY);
    setStartDate(toKey(start));
    setEndDate(toKey(end));
  };
  const resetAll = () => {
    setSelectedElection("all");
    setStartDate("");
    setEndDate("");
  };

  const usersInRange = useMemo(() => users.filter((u) => within(u.created_at, range)), [users, range]);
  const filteredUsers = useMemo(
    () => (selectedElection === "all" ? usersInRange : usersInRange.filter((u) => u.election_id === selectedElection)),
    [usersInRange, selectedElection]
  );
  const filteredPositions = useMemo(
    () => (selectedElection === "all" ? positions : positions.filter((p) => p.election_id === selectedElection)),
    [positions, selectedElection]
  );
  const filteredNotifs = useMemo(
    () => notifications.filter((n) => within(n.created_at, range)),
    [notifications, range]
  );

  /* ---------- Voters over time ---------- */
  const dailyVoters = useMemo(() => buildDaily(filteredUsers.map((u) => u.created_at)), [filteredUsers]);

  const weeklyVoters = useMemo(() => {
    const map = new Map<string, number>();
    dailyVoters.forEach((d) => {
      const dt = new Date(`${d.date}T00:00:00`);
      dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
      const k = toKey(dt);
      map.set(k, (map.get(k) || 0) + d.count);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, count]) => ({ label: `Wk ${fmtDay(new Date(`${k}T00:00:00`))}`, count }));
  }, [dailyVoters]);

  const votersByWeekday = useMemo(() => {
    const arr = DOW.map((day) => ({ day, count: 0 }));
    filteredUsers.forEach((u) => {
      const t = validTime(u.created_at);
      if (t !== null) arr[(new Date(t).getDay() + 6) % 7].count += 1;
    });
    return arr;
  }, [filteredUsers]);

  const votersByHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, count: 0 }));
    filteredUsers.forEach((u) => {
      const t = validTime(u.created_at);
      if (t !== null) arr[new Date(t).getHours()].count += 1;
    });
    return arr;
  }, [filteredUsers]);

  const recent = useMemo(() => {
    const now = Date.now();
    let last7 = 0, prev7 = 0, last30 = 0;
    filteredUsers.forEach((u) => {
      const t = validTime(u.created_at);
      if (t === null) return;
      if (t > now - 7 * DAY) last7++;
      else if (t > now - 14 * DAY) prev7++;
      if (t > now - 30 * DAY) last30++;
    });
    return { last7, prev7, last30, delta: prev7 ? ((last7 - prev7) / prev7) * 100 : null };
  }, [filteredUsers]);

  /* ---------- Voter breakdown (auto-detects small-choice fields on the user record) ---------- */
  const breakdownFields = useMemo(() => {
    const skip = /(^|_)(id|email|phone|password|token|name|url|avatar|image)$|_at$/i;
    const sample = users.slice(0, 300);
    if (!sample.length) return [] as string[];
    const keys = new Set<string>();
    sample.forEach((u) => Object.keys(u).forEach((k) => !skip.test(k) && keys.add(k)));
    return [...keys].filter((k) => {
      const vals = new Set<string>();
      let filled = 0;
      sample.forEach((u) => {
        const v = u[k];
        if (v !== null && v !== undefined && v !== "" && typeof v !== "object") {
          filled++;
          vals.add(String(v));
        }
      });
      return vals.size >= 2 && vals.size <= 12 && filled >= sample.length * 0.5;
    });
  }, [users]);

  const activeField = breakdownFields.includes(breakdownField) ? breakdownField : breakdownFields[0] || "";
  const breakdownData = useMemo(() => {
    if (!activeField) return [];
    const map: Record<string, number> = {};
    filteredUsers.forEach((u) => {
      const v = u[activeField];
      const key = v === null || v === undefined || v === "" ? "Not set" : cap(String(v));
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredUsers, activeField]);

  /* ---------- Elections & positions ---------- */
  const tiers = useMemo(() => {
    const set = new Set<string>();
    positions.forEach((p) => p.tier && set.add(p.tier));
    return [...set].sort();
  }, [positions]);

  const electionStats = useMemo(() => {
    return elections
      .map((e) => {
        const ps = positions.filter((p) => p.election_id === e.id);
        const row: Record<string, any> = {
          id: e.id,
          name: e.name,
          voters: usersInRange.filter((u) => u.election_id === e.id).length,
          positions: ps.length,
        };
        tiers.forEach((t) => (row[t] = ps.filter((p) => p.tier === t).length));
        return row;
      })
      .sort((a, b) => b.voters - a.voters);
  }, [elections, positions, usersInRange, tiers]);

  const positionsByTier = useMemo(
    () => tiers.map((t) => ({ name: cap(t), value: filteredPositions.filter((p) => p.tier === t).length })).filter((d) => d.value > 0),
    [tiers, filteredPositions]
  );

  const topPositionNames = useMemo(() => {
    const map: Record<string, number> = {};
    filteredPositions.forEach((p) => (map[p.name] = (map[p.name] || 0) + 1));
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredPositions]);

  const voterShare = useMemo(
    () => electionStats.filter((e) => e.voters > 0).map((e) => ({ name: e.name, value: e.voters })),
    [electionStats]
  );

  /* ---------- Notifications ---------- */
  const readCount = filteredNotifs.filter((n) => n.is_read).length;
  const unreadCount = filteredNotifs.length - readCount;
  const readStatusData = [
    { name: "Opened", value: readCount },
    { name: "Pending", value: unreadCount },
  ];

  const notifyByType = useMemo(() => {
    const map: Record<string, { opened: number; pending: number }> = {};
    filteredNotifs.forEach((n) => {
      const t = cap(n.type || "General");
      map[t] = map[t] || { opened: 0, pending: 0 };
      n.is_read ? map[t].opened++ : map[t].pending++;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, total: v.opened + v.pending, rate: Math.round(pct(v.opened, v.opened + v.pending)) }))
      .sort((a, b) => b.total - a.total);
  }, [filteredNotifs]);

  const dailyNotifs = useMemo(() => buildDaily(filteredNotifs.map((n) => n.created_at)), [filteredNotifs]);

  /* ---------- Headline numbers ---------- */
  const totalVoters = filteredUsers.length;
  const totalPositions = filteredPositions.length;
  const electionCount = selectedElection === "all" ? elections.length : 1;
  const openRate = pct(readCount, filteredNotifs.length);
  const avgPerDay = dailyVoters.length ? totalVoters / dailyVoters.length : 0;

  /* ---------- Extra analytics (added) ---------- */
  const voterHeat = useMemo(() => buildHeat(filteredUsers.map((u) => u.created_at)), [filteredUsers]);
  const notifHeat = useMemo(() => buildHeat(filteredNotifs.map((n) => n.created_at)), [filteredNotifs]);

  const monthlyVoters = useMemo(() => {
    const map = new Map<string, number>();
    filteredUsers.forEach((u) => {
      const t = validTime(u.created_at);
      if (t === null) return;
      const d = new Date(t);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(k, (map.get(k) || 0) + 1);
    });
    const keys = [...map.keys()].sort();
    return keys.map((k, i) => {
      const count = map.get(k) || 0;
      const prev = i ? map.get(keys[i - 1]) || 0 : 0;
      const [y, m] = k.split("-").map(Number);
      return {
        label: new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        count,
        change: i && prev ? Math.round(((count - prev) / prev) * 100) : null,
      };
    });
  }, [filteredUsers]);

  const periodCompare = useMemo(() => {
    const now = Date.now();
    const len = 30;
    const arr = Array.from({ length: len }, (_, i) => ({
      day: i === len - 1 ? "Today" : `${len - 1 - i}d ago`,
      thisPeriod: 0,
      lastPeriod: 0,
    }));
    filteredUsers.forEach((u) => {
      const t = validTime(u.created_at);
      if (t === null) return;
      const age = Math.floor((now - t) / DAY);
      if (age < 0) return;
      if (age < len) arr[len - 1 - age].thisPeriod++;
      else if (age < len * 2) arr[len * 2 - 1 - age].lastPeriod++;
    });
    return arr;
  }, [filteredUsers]);
  const periodHasData = periodCompare.some((d) => d.thisPeriod || d.lastPeriod);

  const topDays = useMemo(
    () => [...dailyVoters].filter((d) => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 5),
    [dailyVoters]
  );

  const votersPerPosition = useMemo(
    () =>
      electionStats
        .map((e) => ({ name: e.name, ratio: e.positions ? Math.round((e.voters / e.positions) * 10) / 10 : 0 }))
        .sort((a, b) => b.ratio - a.ratio),
    [electionStats]
  );

  const radarElections = useMemo(() => electionStats.slice(0, 5), [electionStats]);
  const radarData = useMemo(() => {
    const metrics = ["voters", "positions", ...tiers];
    return metrics.map((m) => {
      const max = Math.max(1, ...electionStats.map((e) => Number(e[m]) || 0));
      const row: Record<string, any> = { metric: cap(m) };
      radarElections.forEach((e) => (row[e.name] = Math.round(((Number(e[m]) || 0) / max) * 100)));
      return row;
    });
  }, [electionStats, radarElections, tiers]);

  const treemapData = useMemo(() => voterShare.map((v) => ({ name: v.name, size: v.value })), [voterShare]);

  const electionGroups = useMemo(() => {
    if (!activeField) return { rows: [] as Record<string, any>[], keys: [] as string[] };
    const keySet = new Set<string>();
    const rows = elections.map((e) => {
      const row: Record<string, any> = { name: e.name };
      usersInRange
        .filter((u) => u.election_id === e.id)
        .forEach((u) => {
          const v = u[activeField];
          const k = v === null || v === undefined || v === "" ? "Not set" : cap(String(v));
          keySet.add(k);
          row[k] = (row[k] || 0) + 1;
        });
      return row;
    });
    return { rows, keys: [...keySet] };
  }, [elections, usersInRange, activeField]);

  const noPositionsList = useMemo(() => electionStats.filter((e) => e.positions === 0).map((e) => e.name), [electionStats]);
  const noVotersList = useMemo(() => electionStats.filter((e) => e.voters === 0).map((e) => e.name), [electionStats]);

  const notifStatusDaily = useMemo(() => {
    const map = new Map<string, { opened: number; pending: number }>();
    filteredNotifs.forEach((n) => {
      const t = validTime(n.created_at);
      if (t === null) return;
      const k = toKey(new Date(t));
      const row = map.get(k) || { opened: 0, pending: 0 };
      n.is_read ? row.opened++ : row.pending++;
      map.set(k, row);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ label: fmtDay(new Date(`${k}T00:00:00`)), ...v }));
  }, [filteredNotifs]);

  const openRateByHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({ hour: `${String(h).padStart(2, "0")}:00`, sent: 0, opened: 0, rate: 0 }));
    filteredNotifs.forEach((n) => {
      const t = validTime(n.created_at);
      if (t === null) return;
      const row = arr[new Date(t).getHours()];
      row.sent++;
      if (n.is_read) row.opened++;
    });
    arr.forEach((r) => (r.rate = Math.round(pct(r.opened, r.sent))));
    return arr;
  }, [filteredNotifs]);

  const funnelData = useMemo(
    () => [
      { name: "Sent", value: filteredNotifs.length, fill: SLATE },
      { name: "Opened", value: filteredNotifs.filter((n) => n.is_read).length, fill: RED },
    ],
    [filteredNotifs]
  );

  /* ---------- Plain-language insights ---------- */
  const insights = useMemo(() => {
    const out: string[] = [];
    const top = electionStats[0];
    if (top && top.voters > 0)
      out.push(`${top.name} has the most voters: ${top.voters.toLocaleString()} (${pct(top.voters, usersInRange.length).toFixed(0)}% of all voters).`);
    const noPositions = electionStats.filter((e) => e.positions === 0).length;
    if (noPositions) out.push(`${noPositions} election${noPositions > 1 ? "s have" : " has"} no positions yet.`);
    const best = dailyVoters.reduce((m, d) => (d.count > m.count ? d : m), { label: "", count: 0 } as any);
    if (best.count > 0) out.push(`Most voters joined on ${best.label}: ${best.count.toLocaleString()} in one day.`);
    const peakHour = votersByHour.reduce((m, h) => (h.count > m.count ? h : m), votersByHour[0]);
    if (peakHour && peakHour.count > 0) out.push(`Voters most often register around ${peakHour.hour}.`);
    const peakDay = votersByWeekday.reduce((m, d) => (d.count > m.count ? d : m), votersByWeekday[0]);
    if (peakDay && peakDay.count > 0) out.push(`${peakDay.day} is the busiest day of the week for new voters.`);
    if (filteredNotifs.length)
      out.push(`${openRate.toFixed(0)}% of notifications have been opened. ${unreadCount.toLocaleString()} are still waiting.`);
    const weakest = [...notifyByType].filter((t) => t.total >= 3).sort((a, b) => a.rate - b.rate)[0];
    if (weakest && weakest.rate < 100) out.push(`${weakest.name} notifications get opened least (${weakest.rate}%).`);
    if (recent.delta !== null)
      out.push(`New voters in the last 7 days are ${recent.delta >= 0 ? "up" : "down"} ${Math.abs(recent.delta).toFixed(0)}% on the 7 days before.`);
    return out;
  }, [electionStats, usersInRange.length, dailyVoters, votersByHour, votersByWeekday, filteredNotifs.length, openRate, unreadCount, notifyByType, recent.delta]);

  /* ---------- Export ---------- */
  const exportCsv = () => {
    const head = ["Election", "Voters", "Positions", ...tiers.map(cap)];
    const rows = electionStats.map((e) => [e.name, e.voters, e.positions, ...tiers.map((t) => e[t])]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "election-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Loading ---------- */
  if (loadingUsers || loadingPositions || loadingElections || loadingNotify) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white">
        <PuffLoader color={RED} size={100} />
        <p className="animate-pulse text-sm font-bold text-red-700">Loading your data...</p>
      </div>
    );
  }

  const metrics = [
    { label: "Voters", value: totalVoters },
    { label: "Positions", value: totalPositions },
    { label: "Elections", value: electionCount },
    { label: "Voters per election", value: electionCount ? totalVoters / electionCount : 0, decimals: 1 },
    { label: "Positions per election", value: electionCount ? totalPositions / electionCount : 0, decimals: 1 },
    {
      label: "New voters, 7 days",
      value: recent.last7,
      note: recent.delta === null ? "No earlier week to compare" : `${recent.delta >= 0 ? "+" : ""}${recent.delta.toFixed(0)}% vs previous 7 days`,
      tone: recent.delta === null ? "flat" : recent.delta >= 0 ? "up" : "down",
    },
    { label: "New voters, 30 days", value: recent.last30 },
    { label: "Voters per day", value: avgPerDay, decimals: 1, note: dailyVoters.length ? `Across ${dailyVoters.length} days` : undefined },
    { label: "Notifications", value: filteredNotifs.length, note: `${unreadCount.toLocaleString()} pending` },
    { label: "Open rate", value: openRate, decimals: 0, suffix: "%", note: `${readCount.toLocaleString()} opened` },
  ] as const;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen space-y-8 overflow-x-hidden bg-slate-50 p-4 sm:p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Voting analytics</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Voters, elections, positions and notifications, all in one place. Change a filter and every chart updates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold">
            {[
              ["voters", "Voters"],
              ["elections", "Elections"],
              ["positions", "Positions"],
              ["notifications", "Notifications"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-slate-600 transition hover:border-red-700 hover:text-red-700">
                {label}
              </a>
            ))}
            <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-1.5 text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-700/20">
              <Download size={14} /> Download summary
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="sticky top-2 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="election" className="text-xs font-bold text-slate-600">Election</label>
              <select id="election" className={fieldClass} value={selectedElection} onChange={(e) => setSelectedElection(e.target.value)}>
                <option value="all">All elections</option>
                {elections.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="start" className="text-xs font-bold text-slate-600">From</label>
              <input id="start" type="date" className={fieldClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="end" className="text-xs font-bold text-slate-600">To</label>
              <input id="end" type="date" className={fieldClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-600">Quick range</span>
              <div className="flex flex-wrap gap-2">
                {[["7 days", 7], ["30 days", 30], ["90 days", 90], ["All time", null]].map(([label, d]) => (
                  <button key={label as string} onClick={() => setPreset(d as number | null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-700 hover:text-red-700">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {totalVoters.toLocaleString()} voters, {totalPositions.toLocaleString()} positions and {filteredNotifs.length.toLocaleString()} notifications.
              Notifications follow the date range only. Position counts follow the election only.
            </span>
            {hasFilters && (
              <button onClick={resetAll} className="inline-flex items-center gap-1 font-bold text-red-700 hover:underline">
                <RotateCcw size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Key numbers */}
        <motion.div variants={reveal} initial="hidden" animate="show" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-5">
          {metrics.map((m) => (
            <Metric key={m.label} {...(m as any)} />
          ))}
        </motion.div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-red-800">
              <Lightbulb size={16} /> What the data says
            </div>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm text-slate-700 md:grid-cols-2">
              {insights.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-700" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trends at a glance (added) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Spark id="nv" title="New voters per day" value={totalVoters} data={dailyVoters} dataKey="count" color={RED} />
          <Spark id="tv" title="Total voters over time" value={totalVoters} data={dailyVoters} dataKey="total" color={SLATE} />
          <Spark id="ns" title="Notifications sent per day" value={filteredNotifs.length} data={dailyNotifs} dataKey="count" color={DARK_RED} />
          <Spark id="nt" title="Notifications running total" value={filteredNotifs.length} data={dailyNotifs} dataKey="total" color={ROSE} />
        </div>

        {/* ============ Voters ============ */}
        <Section id="voters" title="Voters" blurb="When voters join, and how that changes over time.">
          <ChartCard wide title="New voters each day" hint="Bars show each day. The line shows the running total." empty={!dailyVoters.length}>
            <ComposedChart data={dailyVoters}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={axisTick} minTickGap={24} />
              <YAxis yAxisId="l" tick={axisTick} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar yAxisId="l" dataKey="count" name="New voters" fill={ROSE} radius={[4, 4, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="total" name="Total voters" stroke={RED} strokeWidth={3} dot={false} />
            </ComposedChart>
          </ChartCard>

          <ChartCard title="New voters each week" hint="Weeks start on Monday." empty={!weeklyVoters.length}>
            <AreaChart data={weeklyVoters}>
              <defs>
                <linearGradient id="wk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={axisTick} minTickGap={24} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" name="New voters" stroke={RED} strokeWidth={3} fill="url(#wk)" />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Joins by day of the week" hint="Which weekdays are busiest" empty={!totalVoters}>
            <BarChart data={votersByWeekday}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="New voters" fill={SLATE} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard wide title="Joins by hour of the day" hint="Which hours voters register in your local time" empty={!totalVoters} height={240}>
            <BarChart data={votersByHour}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={axisTick} interval={1} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="New voters" fill={DARK_RED} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>

          {breakdownFields.length > 0 && (
            <ChartCard
              wide
              title={`Voters by ${cap(activeField).toLowerCase()}`}
              hint="Picked from the details stored on each voter"
              empty={!breakdownData.length}
              action={
                <select aria-label="Group voters by" className={`${fieldClass} !w-auto !py-1.5 text-xs`} value={activeField} onChange={(e) => setBreakdownField(e.target.value)}>
                  {breakdownFields.map((f) => (
                    <option key={f} value={f}>{cap(f)}</option>
                  ))}
                </select>
              }
            >
              <BarChart data={breakdownData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tick={axisTick} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={110} tick={axisTick} />
                <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Voters" radius={[0, 8, 8, 0]}>
                  {breakdownData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>
          )}

          <ChartCard title="Voters each month" hint="Bars show joins. The line shows growth against the month before." empty={!monthlyVoters.length}>
            <ComposedChart data={monthlyVoters}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={axisTick} />
              <YAxis yAxisId="l" tick={axisTick} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" tick={axisTick} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar yAxisId="l" dataKey="count" name="New voters" fill={SLATE} radius={[8, 8, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="change" name="Growth %" stroke={RED} strokeWidth={3} />
            </ComposedChart>
          </ChartCard>

          <ChartCard title="Last 30 days vs the 30 before" hint="Are more voters joining than in the previous month?" empty={!periodHasData}>
            <ComposedChart data={periodCompare}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={axisTick} minTickGap={28} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Line type="monotone" dataKey="thisPeriod" name="Last 30 days" stroke={RED} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="lastPeriod" name="30 days before" stroke={MUTED} strokeWidth={3} strokeDasharray="5 4" dot={false} />
            </ComposedChart>
          </ChartCard>

          <PlainCard wide title="Busy times for new voters" hint="Darker squares mean more voters joined at that weekday and hour">
            {totalVoters ? <Heatmap grid={voterHeat} noun="voters" /> : <p className="py-10 text-center text-sm text-slate-400">Nothing to show yet. Try widening the filters.</p>}
          </PlainCard>

          <PlainCard title="Top 5 busiest days" hint="Days with the most new voters">
            {topDays.length ? (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500">
                  <tr>
                    <th className="py-2 font-bold">Day</th>
                    <th className="py-2 font-bold">New voters</th>
                    <th className="py-2 font-bold">Share of all joins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topDays.map((d) => (
                    <tr key={d.date}>
                      <td className="py-2.5 font-bold text-slate-800">{new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="py-2.5 tabular-nums">{d.count.toLocaleString()}</td>
                      <td className="py-2.5 tabular-nums text-slate-500">{pct(d.count, totalVoters).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">Nothing to show yet. Try widening the filters.</p>
            )}
          </PlainCard>
        </Section>

        {/* ============ Elections ============ */}
        <Section id="elections" title="Elections" blurb="How voters and positions are spread across elections. The selected election is highlighted.">
          <ChartCard title="Voters per election" hint="Ranked from most to least" empty={!electionStats.length} height={Math.max(260, electionStats.length * 38)}>
            <BarChart data={electionStats} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={110} tick={axisTick} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Bar dataKey="voters" name="Voters" radius={[0, 8, 8, 0]}>
                {electionStats.map((e) => (
                  <Cell key={e.id} fill={selectedElection === "all" || selectedElection === e.id ? RED : MUTED} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>

          <ChartCard title="Positions per election" hint="How many seats each election has" empty={!electionStats.length} height={Math.max(260, electionStats.length * 38)}>
            <BarChart data={electionStats} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={110} tick={axisTick} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Bar dataKey="positions" name="Positions" radius={[0, 8, 8, 0]}>
                {electionStats.map((e) => (
                  <Cell key={e.id} fill={selectedElection === "all" || selectedElection === e.id ? SLATE : MUTED} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>

          <ChartCard title="Share of voters" hint="Each election's slice of all voters" empty={!voterShare.length}>
            <PieChart>
              <Pie data={voterShare} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} label>
                {voterShare.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" wrapperStyle={legendStyle} />
            </PieChart>
          </ChartCard>

          <ChartCard title="Voters compared with positions" hint="Each dot is an election. Far right means more seats, high up means more voters." empty={!electionStats.length}>
            <ScatterChart margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="positions" name="Positions" tick={axisTick} allowDecimals={false} />
              <YAxis type="number" dataKey="voters" name="Voters" tick={axisTick} allowDecimals={false} />
              <ZAxis range={[120, 120]} />
              <Tooltip content={<ScatterTip />} />
              <Scatter data={electionStats} fill={RED} />
            </ScatterChart>
          </ChartCard>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-2">
            <div className="border-b border-slate-100 px-5 py-4">
              <h4 className="text-sm font-black text-slate-800">Election summary</h4>
              <p className="text-xs text-slate-500">Every election side by side</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">Election</th>
                    <th className="px-5 py-3 font-bold">Voters</th>
                    <th className="px-5 py-3 font-bold">Share</th>
                    <th className="px-5 py-3 font-bold">Positions</th>
                    {tiers.map((t) => (
                      <th key={t} className="px-5 py-3 font-bold">{cap(t)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {electionStats.map((e) => {
                    const share = pct(e.voters, usersInRange.length);
                    return (
                      <tr key={e.id} className={selectedElection === e.id ? "bg-red-50/60" : ""}>
                        <td className="px-5 py-3 font-bold text-slate-800">{e.name}</td>
                        <td className="px-5 py-3 tabular-nums">{e.voters.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-red-700" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-xs tabular-nums text-slate-500">{share.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 tabular-nums">{e.positions}</td>
                        {tiers.map((t) => (
                          <td key={t} className="px-5 py-3 tabular-nums">{e[t]}</td>
                        ))}
                      </tr>
                    );
                  })}
                  {!electionStats.length && (
                    <tr>
                      <td className="px-5 py-8 text-center text-slate-400" colSpan={4 + tiers.length}>No elections yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <ChartCard title="Voters for every position" hint="Voters divided by positions. A high number means a crowded election." empty={!votersPerPosition.length} height={Math.max(260, votersPerPosition.length * 38)}>
            <BarChart data={votersPerPosition} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={axisTick} />
              <YAxis dataKey="name" type="category" width={110} tick={axisTick} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Bar dataKey="ratio" name="Voters per position" fill={DARK_RED} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Compare elections" hint="Top 5 elections. 100 means the highest of all elections." empty={!radarElections.length || radarData.length < 3}>
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={axisTick} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {radarElections.map((e, i) => (
                <Radar key={e.id} name={e.name} dataKey={e.name} stroke={PALETTE[i % PALETTE.length]} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
            </RadarChart>
          </ChartCard>

          <ChartCard title="Election sizes" hint="Bigger boxes mean more voters" empty={!treemapData.length}>
            <Treemap data={treemapData} dataKey="size" stroke="#fff" content={<TreeCell />} isAnimationActive={false} />
          </ChartCard>

          {activeField && (
            <ChartCard title={`Voters by ${cap(activeField).toLowerCase()} in each election`} hint="Stacked by the field chosen in the Voters section" empty={!electionGroups.rows.length || !electionGroups.keys.length}>
              <BarChart data={electionGroups.rows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={axisTick} />
                <YAxis tick={axisTick} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={legendStyle} />
                {electionGroups.keys.map((k, i) => (
                  <Bar key={k} dataKey={k} stackId="g" fill={PALETTE[i % PALETTE.length]} radius={i === electionGroups.keys.length - 1 ? [8, 8, 0, 0] : 0} />
                ))}
              </BarChart>
            </ChartCard>
          )}

          {(noPositionsList.length > 0 || noVotersList.length > 0) && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 lg:col-span-2">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-amber-800">
                <AlertTriangle size={16} /> Needs attention
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-2">
                <div>
                  <p className="mb-1 font-bold">Elections with no positions</p>
                  {noPositionsList.length ? (
                    <ul className="list-disc pl-5">{noPositionsList.map((n) => <li key={n}>{n}</li>)}</ul>
                  ) : (
                    <p className="text-slate-500">None. Every election has positions.</p>
                  )}
                </div>
                <div>
                  <p className="mb-1 font-bold">Elections with no voters</p>
                  {noVotersList.length ? (
                    <ul className="list-disc pl-5">{noVotersList.map((n) => <li key={n}>{n}</li>)}</ul>
                  ) : (
                    <p className="text-slate-500">None. Every election has voters.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ============ Positions ============ */}
        <Section id="positions" title="Positions" blurb="What kinds of positions exist and where they sit.">
          <ChartCard title="Positions by level" hint="School and university positions" empty={!positionsByTier.length}>
            <PieChart>
              <Pie data={positionsByTier} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4} label>
                {positionsByTier.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" wrapperStyle={legendStyle} />
            </PieChart>
          </ChartCard>

          <ChartCard title="Levels within each election" hint="Positions stacked by level" empty={!electionStats.length || !tiers.length}>
            <BarChart data={electionStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              {tiers.map((t, i) => (
                <Bar key={t} dataKey={t} name={cap(t)} stackId="tier" fill={PALETTE[i % PALETTE.length]} radius={i === tiers.length - 1 ? [8, 8, 0, 0] : 0} />
              ))}
            </BarChart>
          </ChartCard>

          <ChartCard wide title="Most common position names" hint="Top 8 across the elections shown" empty={!topPositionNames.length}>
            <BarChart data={topPositionNames} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={140} tick={axisTick} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Times used" fill={RED} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ChartCard>
        </Section>

        {/* ============ Notifications ============ */}
        <Section id="notifications" title="Notifications" blurb="Whether people are opening what you send.">
          <ChartCard title="Opened and pending" hint="Share of notifications that have been opened" empty={!filteredNotifs.length}>
            <PieChart>
              <Pie data={readStatusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4} label>
                <Cell fill={RED} />
                <Cell fill={MUTED} />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" wrapperStyle={legendStyle} />
            </PieChart>
          </ChartCard>

          <ChartCard title="Notification types" hint="How many of each type, split by opened and pending" empty={!notifyByType.length}>
            <BarChart data={notifyByType} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={axisTick} allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={90} tick={axisTick} />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="opened" name="Opened" stackId="n" fill={RED} />
              <Bar dataKey="pending" name="Pending" stackId="n" fill={MUTED} radius={[0, 8, 8, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Open rate by type" hint="Percent opened for each type" empty={!notifyByType.length}>
            <BarChart data={notifyByType}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={axisTick} />
              <YAxis tick={axisTick} domain={[0, 100]} unit="%" />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
              <Bar dataKey="rate" name="Open rate" fill={SLATE} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Notifications sent each day" hint="Daily volume, with the running total" empty={!dailyNotifs.length}>
            <ComposedChart data={dailyNotifs}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={axisTick} minTickGap={24} />
              <YAxis yAxisId="l" tick={axisTick} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar yAxisId="l" dataKey="count" name="Sent" fill={ROSE} radius={[4, 4, 0, 0]} />
              <Line yAxisId="r" type="monotone" dataKey="total" name="Total" stroke={DARK_RED} strokeWidth={3} dot={false} />
            </ComposedChart>
          </ChartCard>

          <ChartCard title="Opened and pending over time" hint="Is the pile of unopened notifications growing?" empty={!notifStatusDaily.length}>
            <AreaChart data={notifStatusDaily}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={axisTick} minTickGap={24} />
              <YAxis tick={axisTick} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Area type="monotone" dataKey="opened" name="Opened" stackId="s" stroke={RED} fill={RED} fillOpacity={0.55} />
              <Area type="monotone" dataKey="pending" name="Pending" stackId="s" stroke={MUTED} fill={MUTED} fillOpacity={0.7} />
            </AreaChart>
          </ChartCard>

          <PlainCard title="Open rate meter" hint="Out of every 100 notifications, how many were opened">
            {filteredNotifs.length ? (
              <div className="relative h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="78%" innerRadius="75%" outerRadius="110%" startAngle={180} endAngle={0} data={[{ name: "Open rate", value: Math.round(openRate), fill: RED }]}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar dataKey="value" background={{ fill: "#f1f5f9" }} cornerRadius={12} angleAxisId={0} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-x-0 bottom-6 text-center">
                  <p className="text-4xl font-black tabular-nums text-slate-900">{Math.round(openRate)}%</p>
                  <p className="text-xs font-semibold text-slate-500">{readCount.toLocaleString()} of {filteredNotifs.length.toLocaleString()} opened</p>
                </div>
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-slate-400">Nothing to show yet. Try widening the filters.</p>
            )}
          </PlainCard>

          <ChartCard title="From sent to opened" hint="How many notifications make it to being opened" empty={!filteredNotifs.length}>
            <FunnelChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive={false}>
                <LabelList position="right" fill="#334155" stroke="none" dataKey="name" />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
              </Funnel>
            </FunnelChart>
          </ChartCard>

          <ChartCard title="Open rate by hour sent" hint="Which sending hours get the most opens" empty={!filteredNotifs.length}>
            <BarChart data={openRateByHour}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={axisTick} interval={2} />
              <YAxis tick={axisTick} domain={[0, 100]} unit="%" />
              <Tooltip cursor={{ fill: "#fef2f2" }} contentStyle={tooltipStyle} formatter={(v: any) => `${v}%`} />
              <Bar dataKey="rate" name="Open rate" fill={SLATE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>

          <PlainCard wide title="When notifications are sent" hint="Darker squares mean more notifications were sent at that weekday and hour">
            {filteredNotifs.length ? <Heatmap grid={notifHeat} noun="notifications" /> : <p className="py-10 text-center text-sm text-slate-400">Nothing to show yet. Try widening the filters.</p>}
          </PlainCard>
        </Section>
      </div>
    </MotionConfig>
  );
};