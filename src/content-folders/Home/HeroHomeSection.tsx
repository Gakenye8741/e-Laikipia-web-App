import '../../animations/TrueFocus.css';
import { useSelector } from 'react-redux';
import { useRef, useEffect } from 'react';
import Typed from 'typed.js';
import type { RootState } from '../../App/store';
import TrueFocus from '../../animations/TextFocus';
import { Link } from 'react-router-dom';

const backgroundImage =
  'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1920&q=80';

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.firstName ?? 'Admin';

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 15) return 'Good Afternoon';
    if (h < 18) return 'Good Evening';
    return 'Hello';
  })();

  const typedNameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!typedNameRef.current) return;

    const typed = new Typed(typedNameRef.current, {
      strings: [firstName],
      typeSpeed: 100,
      backSpeed: 1000,
      showCursor: true,
      cursorChar: '👋',
      loop: false,
    });

    return () => typed.destroy();
  }, [firstName]);

  // Hardcoded stats
  const stats = [
    { title: 'Active Elections', value: 3 },
    { title: 'Registered Voters', value: 1250 },
    { title: 'Approved Candidates', value: 18 },
    { title: 'Votes Cast Today', value: 432 },
  ];

  // Hardcoded upcoming elections
  const upcomingElections = [
    { title: 'Student Council President', date: '2025-12-20' },
    { title: 'Faculty Representative', date: '2025-12-22' },
    { title: 'Sports Committee Chair', date: '2025-12-25' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-20"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-base-100/60 backdrop-blur z-10" />

      <div className="relative z-20 text-center px-6 animate-fadeIn max-w-7xl w-full">
        {/* Hero Title */}
        <TrueFocus
          sentence="University E-Voting Administration Portal"
          manualMode={false}
          blurAmount={2}
          borderColor="cyan"
          animationDuration={2}
          pauseBetweenAnimations={2}
        />

        <div className="mt-12 bg-base-200/80 backdrop-blur-xl rounded-2xl p-10 shadow-xl border border-base-300 flex flex-col gap-8 animate-fadeInUp">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary animate-fadeInUp">
              {greeting},{' '}
              <span ref={typedNameRef} className="text-secondary" />
            </h1>

            <p className="leading-relaxed animate-fadeInUp text-lg">
              Welcome to the <span className="font-semibold text-accent">E-Voting Administration Portal</span>. 
              Here, you can manage elections, approve candidates, verify voters, monitor real-time vote counts, 
              and ensure the integrity and transparency of all university elections.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fadeInUp">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-4 bg-base-300/50 rounded-xl shadow border border-base-300">
                  <h3 className="font-bold text-lg">{stat.title}</h3>
                  <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Elections */}
            <div className="mt-6 text-left animate-fadeInUp">
              <h2 className="text-xl font-bold mb-2">Upcoming Elections</h2>
              <ul className="space-y-2">
                {upcomingElections.map((election, idx) => (
                  <li key={idx} className="bg-base-300/50 px-4 py-2 rounded hover:bg-base-300 transition flex justify-between">
                    <span>{election.title}</span>
                    <span className="text-sm text-secondary">{election.date}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 animate-fadeInUp">
              <Link to="/dashboard" className="btn btn-primary px-6 py-3 rounded-xl shadow font-bold">
                Admin Dashboard
              </Link>
              <Link to="/elections" className="btn btn-secondary px-6 py-3 rounded-xl shadow font-semibold">
                Manage Elections
              </Link>
              <Link to="/voters" className="btn btn-accent px-6 py-3 rounded-xl shadow font-semibold">
                Verify Voters
              </Link>
              <Link to="/candidates" className="btn btn-info px-6 py-3 rounded-xl shadow font-semibold">
                Approve Candidates
              </Link>
            </div>

            {/* Security / Integrity Notice */}
            <div className="mt-6 p-4 bg-base-300/40 rounded-xl border border-base-300 shadow-sm animate-fadeInUp">
              <p className="text-sm">
                🔒 All actions are logged and securely encrypted. 
                The system ensures complete transparency and accountability for all election-related activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
