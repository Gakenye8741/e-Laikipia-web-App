import React, { useState } from 'react';
import { Shield, CheckCircle, Smartphone, Globe, Lock, Cpu, Server, ChevronRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';

interface VotingStep {
  id: number;
  title: string;
  description: string;
}

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const SecureVoteDownload: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'student' | 'admin'>('student');

  const votingSteps: VotingStep[] = [
    {
      id: 1,
      title: "Voter Authentication",
      description: "Log in securely with your student credentials to verify your voter eligibility status."
    },
    {
      id: 2,
      title: "Coalition Selection",
      description: "Browse and choose your preferred coalition directly from the mobile interface."
    },
    {
      id: 3,
      title: "Security Clearance",
      description: "Enter your unique secret code and pass biometric verification to authorize the ballot."
    },
    {
      id: 4,
      title: "Blockchain Anchor",
      description: "Your vote is instantly encrypted, transmitted to our online backend, and permanently anchored onto the blockchain."
    }
  ];

  const securityFeatures: FeatureCard[] = [
    {
      icon: <Cpu className="w-6 h-6 text-red-600" />,
      title: "Decentralized Trust",
      description: "Built utilizing robust Solidity smart contracts on the Ethereum Sepolia Testnet, ensuring absolute immutability."
    },
    {
      icon: <Lock className="w-6 h-6 text-red-600" />,
      title: "Delegate-Driven Coalitions",
      description: "Advanced voting logic restricts coalition voting exclusively to verified, authenticated delegates."
    },
    {
      icon: <Server className="w-6 h-6 text-red-600" />,
      title: "Always Cloud-Connected",
      description: "Fully online backend architecture ensures real-time synchronicity without relying on local offline storage."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-red-600 selection:text-white">
      
     <Navbar/>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-slate-100 bg-gradient-to-b from-red-50/30 to-transparent">
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            The Future of Campus Elections <br />
            <span className="text-red-600">is Fully Secure.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Vote seamlessly from your mobile device or manage the entire election lifecycle with tamper-proof blockchain technology. Fully verified, decentralized, and transparent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#download-client" 
              onClick={() => setActivePlatform('student')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Download Android App (APK)
            </a>
            <a 
              href="https://laikipia.ac.ke"
              onClick={() => setActivePlatform('admin')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 transition"
            >
              Launch Web Admin Portal
            </a>
          </div>
        </div>
      </section>

      {/* PLATFORM SWITCHER & DOWNLOAD AREA */}
      <section id="download-client" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">Choose Your Gateway</h2>
          <p className="text-slate-600">Access the platform based on your role in the election.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1.5 max-w-md mx-auto bg-slate-100 rounded-xl mb-12 border border-slate-200">
          <button
            onClick={() => setActivePlatform('student')}
            className={`w-full py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              activePlatform === 'student'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Students (Mobile)</span>
          </button>
          <button
            onClick={() => setActivePlatform('admin')}
            className={`w-full py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              activePlatform === 'admin'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Administrators (Web)</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-white border-2 border-slate-100 shadow-xl shadow-slate-100/70 rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto">
          {activePlatform === 'student' ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Student Portal</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2 mb-4">Cast your ballot in under 60 seconds.</h3>
                <ul className="space-y-3 text-slate-600 mb-8">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Secure biometric verification sync.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Real-time, tamper-proof vote casting.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Direct verification payload on Sepolia Testnet.</li>
                </ul>
                <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                  <span>Download Mobile Client</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between h-48 relative overflow-hidden">
                <Smartphone className="w-32 h-32 text-slate-200/60 absolute -right-4 -bottom-4 transform rotate-12" />
                <div>
                  <div className="text-xs font-semibold text-slate-500">Current Stable Release</div>
                  <div className="text-lg font-mono font-bold text-slate-900 mt-1">v1.2.0-beta</div>
                </div>
                <div className="text-xs text-slate-500 font-mono">Requires Android 8.0+ | APK Size: ~24MB</div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Electoral Suite</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2 mb-4">Manage candidates, coalitions, and real-time audits.</h3>
                <ul className="space-y-3 text-slate-600 mb-8">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Centralized administrative control dashboard.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Delegate configuration and coalition registration.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Live, immutable cryptographic results streaming.</li>
                </ul>
                <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                  <span>Access Admin Suite</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between h-48 relative overflow-hidden">
                <Globe className="w-32 h-32 text-slate-200/60 absolute -right-4 -bottom-4 transform -rotate-12" />
                <div>
                  <div className="text-xs font-semibold text-slate-500">Web App Access</div>
                  <Link to="https.laikipia.netlify.app" className="text-lg font-mono font-bold text-slate-900 mt-1">admin.securevote.internal</Link>
                </div>
                <div className="text-xs text-slate-500 font-mono">Authorized Hardware Key Required</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VOTING PROCESS STEPPER */}
      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">The Mobile Voting Pipeline</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Our streamlined secure interface ensures your step-by-step voting sequence is intuitive yet locked down.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {votingSteps.map((step) => (
              <div key={step.id} className="bg-white border border-slate-200 p-6 rounded-xl relative shadow-sm">
                <div className="absolute top-4 right-4 text-3xl font-mono font-black text-slate-100 select-none">
                  0{step.id}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 pr-8">{step.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY & SPECIFICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">Architecture & Protocol Guidelines</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {securityFeatures.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="p-3 bg-red-50 rounded-lg mb-4 border border-red-100">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 text-slate-500 py-8 text-center text-sm">
        <p className="mb-2 font-semibold">© 2026 SECURE-VOTE. Empowering transparent student leadership.</p>
        <p className="text-slate-400 font-mono text-xs">Built for modern campus governance.</p>
      </footer>

    </div>
  );
};