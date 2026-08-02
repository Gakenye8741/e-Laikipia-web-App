import React, { useState } from 'react';
import { Shield, CheckCircle, Smartphone, Globe, Lock, Cpu, Server, ChevronRight, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
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

  // Official Expo build link for the secure app
  const expoBuildUrl = "https://expo.dev/accounts/gakenye123/projects/LaikipiaE-Vote/builds/e7c1ef3c-2536-45e2-aa05-db7abf678ec5";
  
  // Official published Google Docs project profile and documentation link
  const docsUrl = "https://docs.google.com/document/d/e/2PACX-1vRk--qA-Z7Idgj4UVNsCl4XrS3_AmWylzqbfB32ePQX-kY-O07IrLF42-Z4JJWcWf4Bzxf-PB0jIyOT/pub";

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
      
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-slate-100 bg-gradient-to-b from-red-50/40 via-red-50/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Published Innovation Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            The Future of Campus Elections <br />
            <span className="text-red-600">is Fully Secure.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Vote seamlessly from your mobile device or manage the entire election lifecycle with tamper-proof blockchain technology. Fully verified, decentralized, and transparent.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href={expoBuildUrl} 
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActivePlatform('student')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              <span>Get Mobile Build (Expo)</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
            
            <a 
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 text-base font-bold text-slate-800 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-200 transition shadow-sm cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-red-600" />
              <span>Read Project Documentation</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
          </div>
        </div>
      </section>

      {/* PLATFORM SWITCHER & DOWNLOAD AREA */}
      <section id="download-client" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Choose Your Gateway</h2>
          <p className="text-slate-600">Access the platform based on your role in the election.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1.5 max-w-md mx-auto bg-slate-100 rounded-xl mb-12 border border-slate-200 shadow-inner">
          <button
            onClick={() => setActivePlatform('student')}
            className={`w-full py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
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
            className={`w-full py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
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
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-100">Student Portal</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3 mb-4">Cast your ballot in under 60 seconds.</h3>
                <ul className="space-y-3 text-slate-600 mb-8 text-sm sm:text-base">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Secure biometric verification sync.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Real-time, tamper-proof vote casting.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Direct verification payload on Sepolia Testnet.</li>
                </ul>
                <a 
                  href={expoBuildUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-lg transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Download App</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 flex flex-col justify-between h-52 relative overflow-hidden group shadow-sm">
                <Smartphone className="w-32 h-32 text-slate-200/80 absolute -right-4 -bottom-4 transform rotate-12 transition-transform duration-300 group-hover:scale-105" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Stable Release</div>
                  <div className="text-lg font-mono font-bold text-slate-900 mt-1">v1.2.0-beta</div>
                </div>
                <div className="text-xs text-slate-600 font-mono bg-white px-3 py-2 rounded border border-slate-200 w-fit shadow-xs">
                  Hosted on Expo (EAS Build)
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-100">Electoral Suite</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3 mb-4">Manage candidates, coalitions, and real-time audits.</h3>
                <ul className="space-y-3 text-slate-600 mb-8 text-sm sm:text-base">
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Centralized administrative control dashboard.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Delegate configuration and coalition registration.</li>
                  <li className="flex items-start"><CheckCircle className="w-5 h-5 text-red-600 mr-2.5 shrink-0 mt-0.5" /> Live, immutable cryptographic results streaming.</li>
                </ul>
                <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-lg transition shadow-md flex items-center justify-center space-x-2 cursor-pointer">
                  <span>Access Admin Suite</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 flex flex-col justify-between h-52 relative overflow-hidden group shadow-sm">
                <Globe className="w-32 h-32 text-slate-200/80 absolute -right-4 -bottom-4 transform -rotate-12 transition-transform duration-300 group-hover:scale-105" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Web App Access</div>
                  <Link to="https.laikipia.netlify.app" className="text-base sm:text-lg font-mono font-bold text-slate-900 mt-1 hover:text-red-600 transition block truncate">
                    Admin Portal
                  </Link>
                </div>
                <div className="text-xs text-slate-600 font-mono bg-white px-3 py-2 rounded border border-slate-200 w-fit shadow-xs">
                  Authorized Hardware Key Required
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VOTING PROCESS STEPPER */}
      <section className="bg-slate-50/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">The Mobile Voting Pipeline</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Our streamlined secure interface ensures your step-by-step voting sequence is intuitive yet locked down.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {votingSteps.map((step) => (
              <div key={step.id} className="bg-white border border-slate-200/80 p-6 rounded-xl relative shadow-sm hover:shadow-md transition">
                <div className="absolute top-4 right-4 text-3xl font-mono font-black text-slate-100 select-none">
                  0{step.id}
                </div>
                <div className="w-7 h-7 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs font-mono mb-3 border border-red-100">
                  {step.id}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2 pr-6">{step.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY & SPECIFICATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Architecture & Protocol Guidelines</h2>
          <p className="text-slate-600 text-sm">Engineered with robust security standards at every layer.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {securityFeatures.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-start p-6 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-red-50 rounded-lg mb-4 border border-red-100 shadow-xs">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mb-1 font-semibold text-slate-700">© 2026 SECURE-VOTE. Empowering transparent student leadership.</p>
          <p className="text-slate-400 font-mono text-xs">Built for modern campus governance.</p>
        </div>
      </footer>

    </div>
  );
};