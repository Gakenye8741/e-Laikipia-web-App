import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line 
} from "recharts";
import { Activity, Users, Globe, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Colors matched to your specific university branding
const PRIMARY_RED = "#b91c1c"; 
const DARK_RED = "#7f1d1d";

interface AnalyticsProps {
  users: any[];
  elections: any[];
  positions: any[];
}

const AnalyticsOverview = ({ users, elections }: AnalyticsProps) => {
  
  // 1. Logic: Voters per Election
  const voterDistribution = useMemo(() => {
    return elections.slice(0, 5).map(e => ({
      name: e.name.split(" ")[0], // Shorten name for UI
      voters: users.filter(u => u.election_id === e.id).length
    }));
  }, [users, elections]);

  // 2. Logic: Registration Trend (Last 7 Days)
  const registrationTrend = useMemo(() => {
    const map: Record<string, number> = {};
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString();
    }).reverse();

    users.forEach(u => {
      const date = new Date(u.created_at).toLocaleDateString();
      if (last7Days.includes(date)) {
        map[date] = (map[date] || 0) + 1;
      }
    });

    return last7Days.map(date => ({
      date: date.split('/')[0] + '/' + date.split('/')[1], // MM/DD format
      count: map[date] || 0
    }));
  }, [users]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
      
      {/* CARD 1: VOTER TURNOUT BY ELECTION */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Users size={14} className="text-red-600" /> Voter Distribution
          </h3>
          <Link to="/results" className="text-red-600 hover:scale-110 transition-transform">
            <ArrowUpRight size={18} />
          </Link>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={voterDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="voters" fill={PRIMARY_RED} radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 2: REGISTRATION TREND */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Activity size={14} className="text-emerald-600" /> Registration Activity
          </h3>
          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">LIVE</span>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" fontSize={9} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke={DARK_RED} 
                strokeWidth={3} 
                dot={{ r: 4, fill: DARK_RED, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: PRIMARY_RED }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 3: SYSTEM STATUS */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-900">
          <Globe size={120} />
        </div>
        
        <div className="relative z-10">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> System Status
          </h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">System Integrity</p>
                <p className="text-xl font-black italic tracking-tighter text-slate-900">99.98%</p>
              </div>
              <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-[99%]" />
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Server Speed</p>
                <p className="text-xl font-black italic tracking-tighter text-slate-900">14ms</p>
              </div>
              <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Optimized</div>
            </div>
          </div>
        </div>

        <Link 
          to="/results" 
          className="mt-8 w-full py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-center shadow-xs block"
        >
          View Election Results
        </Link>
      </div>

    </div>
  );
};

export default AnalyticsOverview;