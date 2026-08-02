import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, AlertTriangle } from "lucide-react";
import { MdSupportAgent, MdAlternateEmail, MdOutlineContactSupport } from "react-icons/md";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Blockchain Verification Issues",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submissions disabled due to dummy/non-functional state
  };

  const contactMethods = [
    { 
      icon: <Mail size={18} className="text-red-600" />, 
      label: "Official Email", 
      value: "support@laikipia.ac.ke",
      sub: "General Inquiries"
    },
    { 
      icon: <Phone size={18} className="text-red-600" />, 
      label: "Support Line", 
      value: "+254 700 000 000",
      sub: "Technical Emergencies"
    },
    { 
      icon: <MapPin size={18} className="text-red-600" />, 
      label: "Physical Office", 
      value: "Computing & Informatics Dept",
      sub: "Main Campus, Nyahururu"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          
          {/* HEADER SECTION */}
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Support & <span className="text-red-600">Contact</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* SIDEBAR: CONTACT METHODS */}
            <aside className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm sticky top-28 space-y-8">
                <div className="p-6 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                  <MdSupportAgent className="text-red-600 text-5xl" />
                </div>

                <div className="space-y-6">
                  {contactMethods.map((method, i) => (
                    <div key={i} className="group border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        {method.icon}
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {method.label}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 ml-7 group-hover:text-red-600 transition-colors">
                        {method.value}
                      </p>
                      <p className="text-xs text-slate-500 ml-7">
                        {method.sub}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Globe size={16} className="text-emerald-500" />
                    <span>Secure Vote Status: <span className="text-emerald-600 font-extrabold">Online</span></span>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT: CONTACT FORM */}
            <article className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                    <MdOutlineContactSupport className="text-red-600" size={24} /> Send a Message
                  </h2>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">
                    Form Disabled (Dummy)
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Full Name</label>
                      <input 
                        disabled
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Gakenye Ndiritu" 
                        className="w-full bg-slate-100 border border-slate-200/85 rounded-xl p-4 text-sm font-medium text-slate-400 cursor-not-allowed outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Student or Staff Email</label>
                      <div className="relative">
                        <input 
                          disabled
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@laikipia.ac.ke" 
                          className="w-full bg-slate-100 border border-slate-200/85 rounded-xl p-4 pl-12 text-sm font-medium text-slate-400 cursor-not-allowed outline-none" 
                        />
                        <MdAlternateEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Subject of Inquiry</label>
                    <select 
                      disabled
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full bg-slate-100 border border-slate-200/85 rounded-xl p-4 text-xs font-bold uppercase text-slate-400 cursor-not-allowed outline-none"
                    >
                      <option value="Blockchain Verification Issues">Blockchain Verification Issues</option>
                      <option value="Voter Registration Support">Voter Registration Support</option>
                      <option value="Candidate Approval Query">Candidate Approval Query</option>
                      <option value="Other Technical Assistance">Other Technical Assistance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Your Message</label>
                    <textarea 
                      disabled
                      rows={5} 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your issue or question clearly..." 
                      className="w-full bg-slate-100 border border-slate-200/85 rounded-xl p-4 text-sm font-medium text-slate-400 cursor-not-allowed outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <button 
                      disabled={true}
                      type="submit"
                      className="w-full py-4 bg-slate-200 text-slate-400 rounded-xl font-bold text-sm uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send size={16} /> Submit Message (Disabled)
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-semibold bg-amber-50 py-2.5 px-4 rounded-xl border border-amber-200">
                      <AlertTriangle size={14} />
                      <span>This form is currently disabled as it is a non-functional interface template.</span>
                    </div>
                  </div>
                </form>

                {/* FORM FOOTER NOTE */}
                <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-slate-400" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Automated Support System Offline
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Direct form submissions are temporarily offline. Please use the official support email or phone contact listed in the sidebar.
                  </p>
                </div>
              </div>
            </article>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;