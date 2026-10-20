import '../../animations/TrueFocus.css';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import TrueFocus from '../../animations/TextFocus';
import {
  Blocks,
  Lock,
  Activity,
  Gavel,
  Users,
  Loader2,
  ChevronRight,
  Wallet,
  GraduationCap,
  School,
  LayoutDashboard,
  Vote,
  BarChart3,
  Smartphone,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import type { RootState } from '../../App/store';

// API hooks
import { useGetAllElectionsQuery } from '../../features/APIS/Election.Api';
import { useCountPositionsQuery } from '../../features/APIS/Position.APi';
import { useGetAllCandidatesQuery } from '../../features/APIS/CandidateApi';
import { useGetAllUsersQuery } from '../../features/APIS/UserApi';

type QuickAction = { to: string; label: string; icon: LucideIcon };

const getQuickActions = (role?: string, school?: string): QuickAction[] => {
  switch (role) {
    case 'Admin':
    case 'SuperAdmin':
      return [
        { to: '/admindashboard/AllElections', label: 'Elections', icon: Vote },
        { to: '/admindashboard', label: 'Admin panel', icon: LayoutDashboard },
        { to: '/results', label: 'Results', icon: BarChart3 },
      ];
    case 'Accountant':
    case 'Accounts':
      return [
        { to: '/accounts-dashboard/', label: 'Financial records', icon: Wallet },
        { to: '/results', label: 'Results', icon: BarChart3 },
      ];
    case 'Dean_of_Students':
      return [
        { to: '/dean-student-dashboard/', label: 'Student affairs', icon: GraduationCap },
        { to: '/results', label: 'Results', icon: BarChart3 },
      ];
    case 'Dean_of_School':
      return [
        { to: '/dean-school-dashboard/', label: school ? `${school} portal` : 'School portal', icon: School },
        { to: '/results', label: 'Results', icon: BarChart3 },
      ];
    default:
      return [];
  }
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const roleLabel = (role?: string) => (role ? role.replace(/_/g, ' ') : 'Staff');

const HeroHomeSection = () => {
  const authUser = useSelector((state: RootState) => state.auth.user?.user);
  const firstName = authUser?.name?.split(' ')[0] ?? 'there';
  const userRole = authUser?.role;
  const assignedSchool = authUser?.school;

  // --- DATA ---
  const { data: electionsRaw, isLoading: loadingElections } = useGetAllElectionsQuery();
  const { data: posData, isLoading: loadingPositions } = useCountPositionsQuery();
  const { data: candData, isLoading: loadingCandidates } = useGetAllCandidatesQuery();
  const { data: usersData, isLoading: loadingUsers } = useGetAllUsersQuery(undefined);

  const elections = useMemo<any[]>(
    () => (Array.isArray(electionsRaw) ? electionsRaw : []),
    [electionsRaw]
  );
  const users = useMemo<any[]>(() => {
    const raw = (usersData as any)?.users || usersData;
    return Array.isArray(raw) ? raw : [];
  }, [usersData]);

  const electionName = (e: any) => e.title ?? e.name ?? 'Untitled election';

  const activeCount = useMemo(
    () => elections.filter((e) => e.status === 'active').length,
    [elections]
  );

  const upcomingElections = useMemo(
    () => elections.filter((e) => e.status === 'upcoming' || e.status === 'pending').slice(0, 4),
    [elections]
  );

  const voterDistribution = useMemo(
    () =>
      elections.slice(0, 5).map((e) => {
        const name = electionName(e);
        return {
          name: name.length > 12 ? `${name.slice(0, 12)}…` : name,
          voters: users.filter((u) => u.election_id === e.id).length,
        };
      }),
    [users, elections]
  );

  const registrationTrend = useMemo(() => {
    const days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      })
      .reverse();

    const counts: Record<string, number> = {};
    users.forEach((u) => {
      if (!u.created_at) return;
      const key = new Date(u.created_at).toISOString().slice(0, 10);
      counts[key] = (counts[key] || 0) + 1;
    });

    return days.map((d) => ({
      date: d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }),
      count: counts[d.toISOString().slice(0, 10)] || 0,
    }));
  }, [users]);

  const newThisWeek = registrationTrend.reduce((sum, d) => sum + d.count, 0);
  const quickActions = getQuickActions(userRole, assignedSchool);
  const isVoter = userRole === 'Voter';

  const Spinner = <Loader2 size={18} className="animate-spin text-slate-400" />;

  const stats = [
    {
      label: 'Registered voters',
      value: loadingUsers ? Spinner : users.length.toLocaleString(),
      icon: Users,
      tint: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Candidates',
      value: loadingCandidates ? Spinner : ((candData as any)?.candidates?.length ?? 0),
      icon: Activity,
      tint: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Open seats',
      value: loadingPositions ? Spinner : ((posData as any)?.count ?? 0),
      icon: Gavel,
      tint: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Network',
      value: 'Sepolia',
      icon: ShieldCheck,
      tint: 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-24 pb-16 text-slate-900 selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
              <ShieldCheck size={24} />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                SECURE-VOTE APP
              </h1>
              <p className="text-sm text-slate-500">
                {greeting()}, {firstName}
                <span className="mx-2 text-slate-300">|</span>
                {new Date().toLocaleDateString('en-KE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              {roleLabel(userRole)}
            </span>
            <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Laikipia University
            </span>
          </div>
        </header>

        {/* VOTERS: students use the mobile app */}
        {isVoter && (
          <div className="flex items-start gap-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="font-semibold">Voting happens in the mobile app</h2>
              <p className="mt-1 max-w-prose text-sm text-slate-500">
                This dashboard is for election administrators. Open the Secure-Vote mobile app on
                your phone to see elections and cast your vote.
              </p>
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        {!isVoter && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* BALANCE-STYLE HERO CARD */}
            <section className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-red-800 p-6 text-white shadow-lg sm:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-black/10"
                />

                <div className="relative mb-8">
                  <TrueFocus sentence="SECURE-VOTE APP" blurAmount={3} borderColor="#ffffff" />
                  <p className="mt-3 flex items-center gap-2 text-sm text-red-100">
                    <Blocks size={16} /> Blockchain-secured campus elections
                  </p>
                </div>

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm text-red-100">Live elections</p>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-5xl font-bold tabular-nums tracking-tight sm:text-6xl">
                        {loadingElections ? '–' : activeCount}
                      </span>
                      <span className="text-sm text-red-100">of {elections.length} total</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                    Ethereum Sepolia
                  </span>
                </div>

                <div className="relative mt-6 flex items-end justify-between gap-6">
                  <div>
                    <p className="text-xs text-red-100">New voters this week</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">+{newThisWeek}</p>
                  </div>
                  <div className="h-16 w-40 sm:w-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={registrationTrend}>
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#ffffff"
                          strokeWidth={2.5}
                          dot={false}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              {quickActions.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {quickActions.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group flex flex-col items-center gap-2 rounded-2xl bg-white px-3 py-4 text-center ring-1 ring-slate-200 transition hover:ring-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                        <Icon size={20} />
                      </span>
                      <span className="text-xs font-medium text-slate-700">{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* UPCOMING ELECTIONS (transaction-list style) */}
            <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Upcoming elections</h2>
                <Link
                  to="/admindashboard/AllElections"
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  See all
                </Link>
              </div>

              {upcomingElections.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {upcomingElections.map((e, idx) => (
                    <li key={e.id ?? idx} className="flex items-center gap-3 py-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Vote size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{electionName(e)}</p>
                        <p className="text-xs capitalize text-slate-500">{e.status}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-slate-300" />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <p className="text-sm font-medium">Nothing scheduled</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Create an election and it will show up here.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {/* STAT TILES */}
        {!isVoter && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tint }) => (
              <div key={label} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full ${tint}`}>
                  <Icon size={17} />
                </span>
                <p className="text-xs text-slate-500">{label}</p>
                <div className="mt-1 flex min-h-[2rem] items-center text-xl font-bold tabular-nums">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BLOCKCHAIN TRUST STRIP */}
        {!isVoter && (
          <div className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-600">
                <Lock size={20} />
              </span>
              <div>
                <h2 className="font-semibold">Every vote is recorded on the blockchain</h2>
                <p className="mt-1 max-w-prose text-sm text-slate-400">
                  Students vote in the SECURE-VOTE mobile app. Ballots are written to Ethereum
                  Sepolia, so results can be checked and can't be changed afterwards.
                </p>
              </div>
            </div>
            <Link
              to="/results"
              className="shrink-0 rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              View results
            </Link>
          </div>
        )}

        {/* CHARTS */}
        {!isVoter && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
              <h2 className="mb-1 font-semibold">Voters per election</h2>
              <p className="mb-4 text-xs text-slate-500">First five elections</p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={voterDistribution}>
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="voters" fill="#dc2626" radius={[8, 8, 0, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
              <h2 className="mb-1 font-semibold">Voter sign-ups</h2>
              <p className="mb-4 text-xs text-slate-500">Last 7 days</p>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={registrationTrend}>
                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      axisLine={false}
                      tickLine={false}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#dc2626' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroHomeSection;