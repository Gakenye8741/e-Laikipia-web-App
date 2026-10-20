// import { useState, useMemo } from "react";
// import { PuffLoader } from "react-spinners";
// import { 
//   FaSearch, FaSync, FaShieldAlt, FaUserShield, FaCheckCircle, 
//   FaDatabase, FaLink, FaUserCircle, FaArrowLeft, FaExclamationTriangle, FaListUl, FaUndo, FaSearchMinus 
// } from "react-icons/fa";
// import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
// import { useGetElectionAuditQuery, useVerifyDisputeQuery, useGetCandidateAuditQuery } from "../../features/APIS/Admin.Apis";
// import { useGetCandidatesByElectionQuery } from "../../features/APIS/CandidateApi";
// import { useGetPositionsByElectionQuery } from "../../features/APIS/Position.APi";

// export const AllVotesAudit = () => {
//   const [selectedElection, setSelectedElection] = useState<string>("");
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [candidateFilter, setCandidateFilter] = useState<string>(""); 
  
//   const [disputeRegNo, setDisputeRegNo] = useState("");
//   const [disputePosId, setDisputePosId] = useState("");
//   const [runDispute, setRunDispute] = useState(false);

//   /* 1. DATA FETCHING */
//   const { data: electionsData } = useGetAllElectionsQuery(undefined);
  
//   const { data: candidatesData, isLoading: isCandidatesLoading } = useGetCandidatesByElectionQuery(selectedElection, {
//     skip: !selectedElection,
//   });

//   const { data: positionsData, isLoading: isPositionsLoading } = useGetPositionsByElectionQuery(selectedElection, {
//     skip: !selectedElection,
//   });

//   const { data: auditVotes, isLoading: isAuditLoading, refetch, isFetching: isAuditFetching } = useGetElectionAuditQuery(selectedElection, {
//     skip: !selectedElection || !!candidateFilter,
//   });

//   const { data: candidateVotes, isLoading: isCandidateLoading, isFetching: isCandidateFetching } = useGetCandidateAuditQuery(candidateFilter, {
//     skip: !candidateFilter,
//   });

//   const { data: disputeResult, isFetching: isVerifying, refetch: refetchDispute, error: disputeError } = useVerifyDisputeQuery(
//     { regNo: disputeRegNo, electionId: selectedElection, positionId: disputePosId },
//     { skip: !runDispute || !selectedElection || !disputePosId }
//   );

//   /* 2. DATA LOGIC */
//   const electionsList = useMemo(() => {
//     if (!electionsData) return [];
//     return (electionsData as any).elections || (Array.isArray(electionsData) ? electionsData : []);
//   }, [electionsData]);

//   const candidatesList = useMemo(() => {
//     if (!candidatesData) return [];
//     return (candidatesData as any).candidates || [];
//   }, [candidatesData]);

//   const positionsList = useMemo(() => {
//     if (!positionsData) return [];
//     return (positionsData as any).positions || (Array.isArray(positionsData) ? positionsData : []);
//   }, [positionsData]);

//   const activeData = useMemo(() => {
//     if (candidateFilter) return Array.isArray(candidateVotes) ? candidateVotes : [];
//     return Array.isArray(auditVotes) ? auditVotes : [];
//   }, [candidateFilter, candidateVotes, auditVotes]);

//   const filteredVotes = useMemo(() => {
//     if (!searchTerm.trim()) return activeData;
//     return activeData.filter((v: any) => 
//       v.voter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       v.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [activeData, searchTerm]);

//   const handleResetDispute = () => {
//     setDisputeRegNo("");
//     setDisputePosId("");
//     setRunDispute(false);
//   };

//   const isLoading = isAuditLoading || isCandidateLoading;
//   const isFetching = isAuditFetching || isCandidateFetching;

//   return (
//     <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-600">
//       <div className="max-w-7xl mx-auto">
        
//         {/* HEADER */}
//         <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
//           <div>
//             <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
//               <FaShieldAlt className="text-red-600 animate-pulse" size={10} />
//               <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Verification Protocol</span>
//             </div>
//             <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
//               Vote <span className="text-red-700">Audit</span>
//             </h1>
//           </div>

//           <div className="flex gap-3 w-full lg:w-auto">
//             {candidateFilter && (
//               <button 
//                 onClick={() => setCandidateFilter("")}
//                 className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
//               >
//                 <FaArrowLeft /> Full Audit
//               </button>
//             )}
//             <select 
//               className="flex-1 lg:min-w-[300px] bg-white border border-slate-200 rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-sm"
//               value={selectedElection}
//               onChange={(e) => { 
//                 setSelectedElection(e.target.value); 
//                 handleResetDispute();
//                 setCandidateFilter(""); 
//               }}
//             >
//               <option value="">Select Election Context...</option>
//               {electionsList.map((e: any) => (
//                 <option key={e._id || e.id} value={e._id || e.id}>{e.title || e.name}</option>
//               ))}
//             </select>
//             <button onClick={() => refetch()} className="px-6 py-3 bg-red-700 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center">
//               <FaSync className={isFetching ? "animate-spin" : ""} />
//             </button>
//           </div>
//         </div>

//         {/* TOP ROW: DISPUTE ENGINE & CANDIDATE SELECT */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
//           {/* DISPUTE ENGINE */}
//           <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
//             <div className="flex justify-between items-center mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="p-2.5 bg-red-50 rounded-xl border border-red-100"><FaUserShield className="text-red-600" size={18} /></div>
//                 <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Integrity Dispute Engine</h2>
//               </div>
//               <div className="flex gap-2">
//                  <button onClick={handleResetDispute} title="Clear Inputs" className="p-2 text-slate-400 hover:text-red-600 transition-colors">
//                     <FaUndo size={12} />
//                  </button>
//                  <button onClick={() => refetchDispute()} title="Re-verify" className="p-2 text-slate-400 hover:text-red-600 transition-colors">
//                     <FaSync size={12} className={isVerifying ? "animate-spin" : ""} />
//                  </button>
//               </div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <input 
//                 placeholder="Voter Reg No..." 
//                 className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all"
//                 value={disputeRegNo} onChange={(e) => setDisputeRegNo(e.target.value)}
//               />
              
//               <div className="relative">
//                 <select 
//                   className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 appearance-none cursor-pointer"
//                   value={disputePosId}
//                   onChange={(e) => setDisputePosId(e.target.value)}
//                   disabled={!selectedElection || isPositionsLoading}
//                 >
//                   <option value="">{isPositionsLoading ? "Loading Positions..." : "-- Select Position --"}</option>
//                   {positionsList.map((p: any) => (
//                     <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
//                   ))}
//                 </select>
//                 <FaListUl className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={10} />
//               </div>

//               <button 
//                 onClick={() => setRunDispute(true)}
//                 disabled={!disputeRegNo || !disputePosId}
//                 className="bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl py-4 hover:bg-slate-900 transition-all shadow-lg disabled:opacity-30"
//               >
//                 {isVerifying ? "Comparing Chains..." : "Check Integrity"}
//               </button>
//             </div>
//           </div>

//           {/* CANDIDATE DROPDOWN SELECTOR */}
//           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100"><FaUserCircle className="text-slate-800" size={18} /></div>
//               <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Audit by Candidate</h2>
//             </div>
//             <div className="flex flex-col gap-3">
//               <select 
//                 className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer"
//                 value={candidateFilter}
//                 onChange={(e) => setCandidateFilter(e.target.value)}
//                 disabled={!selectedElection || isCandidatesLoading}
//               >
//                 <option value="">{isCandidatesLoading ? "Loading Names..." : "-- Select Name --"}</option>
//                 {candidatesList.map((c: any) => (
//                   <option key={c.id} value={c.id}>{c.name}</option>
//                 ))}
//               </select>
//               <p className="text-[9px] text-slate-400 uppercase font-black text-center italic mt-2">
//                 {selectedElection ? "Targeting specific candidate audit logs" : "Election context required"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* DISPUTE RESULTS SECTION */}
//         {(disputeResult || disputeError) && runDispute && (
//           <div className={`mb-10 p-8 rounded-[2rem] border-l-[6px] transition-all duration-700 shadow-lg bg-white
//             ${(disputeResult?.integrityMatch && !disputeError) 
//               ? 'border-emerald-500' 
//               : 'border-red-600 shadow-red-100'}`}
//           >
//              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//               <div className="flex items-center gap-4">
//                 {(disputeResult?.integrityMatch && !disputeError) ? (
//                   <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100"><FaCheckCircle className="text-emerald-500 text-2xl" /></div>
//                 ) : (
//                   <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
//                     {disputeResult?.status === "NOT_FOUND" ? <FaSearchMinus className="text-red-600 text-2xl" /> : <FaExclamationTriangle className="text-red-600 text-2xl" />}
//                   </div>
//                 )}
//                 <div>
//                   <h3 className={`text-sm font-black uppercase tracking-tighter ${(disputeResult?.integrityMatch && !disputeError) ? 'text-emerald-600' : 'text-red-700'}`}>
//                     {disputeError ? "Network Verification Error" : (disputeResult?.status === "NOT_FOUND" ? "RECORD NOT FOUND ON-CHAIN" : (disputeResult?.integrityMatch ? "Vote Verified: Blockchain matches Database" : "Integrity Conflict: Data Mismatch Detected"))}
//                   </h3>
//                   <p className="text-[10px] text-slate-400 font-black uppercase mt-1">
//                     Node Status: <span className="text-slate-800">{disputeResult?.verified ? 'Verified on Sepolia Node' : 'Node Verification Failed'}</span>
//                   </p>
//                 </div>
//               </div>
//               <button onClick={handleResetDispute} className="text-[9px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors border border-slate-100 px-4 py-2 rounded-xl">Dismiss</button>
//             </div>

//             {disputeResult?.details && (
//               <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
//                 <div>
//                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Block Hash</p>
//                   <p className="text-[11px] font-mono font-black text-slate-800">#{disputeResult.details?.blockNumber || '---'}</p>
//                 </div>
//                 <div>
//                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">On-Chain Value</p>
//                   <p className={`text-[10px] font-black truncate w-32 ${disputeResult?.integrityMatch ? 'text-emerald-600' : 'text-red-600'}`} title={disputeResult.details?.onChainChoice}>
//                     {disputeResult.details?.onChainChoice || 'NULL'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sync Status</p>
//                   <p className={`text-[10px] font-black uppercase ${disputeResult?.integrityMatch ? 'text-emerald-600' : 'text-red-600'}`}>
//                     {disputeResult?.integrityMatch ? 'MATCHED' : 'MISMATCHED'}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Audit Time</p>
//                   <p className="text-[10px] font-black text-slate-800 uppercase">{disputeResult.details?.dateRecorded || 'JUST NOW'}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* AUDIT TABLE SECTION */}
//         <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
//           <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="flex items-center gap-4 w-full md:w-auto">
//               {candidateFilter && (
//                 <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
//                   <FaUserCircle className="text-red-600" size={14} />
//                   <span className="text-[10px] font-black text-red-700 uppercase italic tracking-tighter">Targeted Candidate Log</span>
//                 </div>
//               )}
//               <div className="relative w-full md:w-80">
//                 <input 
//                   type="text" placeholder="Search Voter Hash or Tx..." 
//                   className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-sm"
//                   value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//                 <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Records</p>
//               <p className="text-2xl font-black text-slate-900">{filteredVotes.length}</p>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             {isLoading ? (
//               <div className="p-32 flex flex-col items-center gap-4">
//                 <PuffLoader color="#b91c1c" size={50} />
//                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] animate-pulse">Syncing Distributed Ledger</p>
//               </div>
//             ) : (
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-slate-50/50 border-b border-slate-100">
//                     <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Voter ID (SHA-256)</th>
//                     <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Candidate Mapping</th>
//                     <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Blockchain Anchor</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filteredVotes.length === 0 ? (
//                     <tr>
//                       <td colSpan={3} className="p-24 text-center">
//                          <div className="flex flex-col items-center gap-3">
//                            <FaDatabase className="text-slate-100" size={40} />
//                            <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">No Audit Trails Found</p>
//                          </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredVotes.map((vote: any) => (
//                       <tr key={vote.id} className="hover:bg-red-50/30 transition-all group border-l-4 border-transparent hover:border-red-600">
//                         <td className="p-6">
//                           <div className="flex items-center gap-3">
//                             <FaDatabase size={10} className="text-slate-300 group-hover:text-red-600 transition-colors" />
//                             <p className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-900 truncate w-48">{vote.voter_id}</p>
//                           </div>
//                         </td>
//                         <td className="p-6">
//                           <div className="space-y-1">
//                             <button 
//                               onClick={() => setCandidateFilter(vote.candidate_id)}
//                               className="text-[10px] font-black text-slate-700 hover:text-red-700 transition-colors flex items-center gap-1.5 uppercase"
//                             >
//                               <FaUserCircle size={10} className="text-slate-300" /> {vote.candidate_id.substring(0, 18)}...
//                             </button>
//                             <p className="text-[9px] font-black text-slate-400 uppercase">
//                               Position: <span className="text-slate-600">{vote.position_id.substring(0, 12)}...</span>
//                             </p>
//                           </div>
//                         </td>
//                         <td className="p-6">
//                           <div className="flex flex-col gap-1">
//                             <a 
//                               href={`https://sepolia.etherscan.io/tx/${vote.transaction_hash}`} 
//                               target="_blank" rel="noreferrer"
//                               className="text-[10px] font-mono font-black text-red-600 flex items-center gap-2 hover:underline tracking-tight"
//                             >
//                               <FaLink size={10} /> {vote.transaction_hash?.substring(0, 28)}...
//                             </a>
//                             <p className="text-[9px] text-slate-400 font-black mt-1 uppercase">
//                               {new Date(vote.created_at).toLocaleString()}
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import {
  FaSearch, FaSync, FaShieldAlt, FaCheckCircle, FaDatabase, FaLink,
  FaUserCircle, FaArrowLeft, FaExclamationTriangle, FaListUl, FaUndo,
  FaSearchMinus, FaTimes, FaClipboardCheck, FaVoteYea,
} from "react-icons/fa";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetElectionAuditQuery, useVerifyDisputeQuery, useGetCandidateAuditQuery } from "../../features/APIS/Admin.Apis";
import { useGetCandidatesByElectionQuery } from "../../features/APIS/CandidateApi";
import { useGetPositionsByElectionQuery } from "../../features/APIS/Position.APi";

/* Small animations. They switch off for people who prefer less motion. */
const animations = `
@keyframes va-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes va-pop { 0% { opacity: 0; transform: scale(.94); } 60% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }
@keyframes va-ring { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.45); } 100% { box-shadow: 0 0 0 16px rgba(16,185,129,0); } }
.va-rise { animation: va-rise .5s ease-out both; }
.va-pop { animation: va-pop .45s ease-out both; }
.va-ring { animation: va-ring 1.6s ease-out 2; }
@media (prefers-reduced-motion: reduce) {
  .va-rise, .va-pop, .va-ring, .animate-spin, .animate-pulse { animation: none !important; }
}
`;

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export const AllVotesAudit = () => {
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [candidateFilter, setCandidateFilter] = useState<string>("");

  const [disputeRegNo, setDisputeRegNo] = useState("");
  const [disputePosId, setDisputePosId] = useState("");
  const [runDispute, setRunDispute] = useState(false);

  /* 1. DATA FETCHING */
  const { data: electionsData } = useGetAllElectionsQuery(undefined);

  const { data: candidatesData, isLoading: isCandidatesLoading } = useGetCandidatesByElectionQuery(selectedElection, {
    skip: !selectedElection,
  });

  const { data: positionsData, isLoading: isPositionsLoading } = useGetPositionsByElectionQuery(selectedElection, {
    skip: !selectedElection,
  });

  const { data: auditVotes, isLoading: isAuditLoading, refetch, isFetching: isAuditFetching } = useGetElectionAuditQuery(selectedElection, {
    skip: !selectedElection || !!candidateFilter,
  });

  const { data: candidateVotes, isLoading: isCandidateLoading, isFetching: isCandidateFetching } = useGetCandidateAuditQuery(candidateFilter, {
    skip: !candidateFilter,
  });

  const { data: disputeResult, isFetching: isVerifying, refetch: refetchDispute, error: disputeError } = useVerifyDisputeQuery(
    { regNo: disputeRegNo, electionId: selectedElection, positionId: disputePosId },
    { skip: !runDispute || !selectedElection || !disputePosId }
  );

  /* 2. DATA LOGIC */
  const electionsList = useMemo(() => {
    if (!electionsData) return [];
    return (electionsData as any).elections || (Array.isArray(electionsData) ? electionsData : []);
  }, [electionsData]);

  const candidatesList = useMemo(() => {
    if (!candidatesData) return [];
    return (candidatesData as any).candidates || [];
  }, [candidatesData]);

  const positionsList = useMemo(() => {
    if (!positionsData) return [];
    return (positionsData as any).positions || (Array.isArray(positionsData) ? positionsData : []);
  }, [positionsData]);

  // Look up a readable name from an id (falls back to a short id)
  const candidateName = (id: string) =>
    candidatesList.find((c: any) => c.id === id)?.name || `${(id || "").substring(0, 12)}...`;
  const positionName = (id: string) =>
    positionsList.find((p: any) => (p.id || p._id) === id)?.name || `${(id || "").substring(0, 10)}...`;

  const activeData = useMemo(() => {
    if (candidateFilter) return Array.isArray(candidateVotes) ? candidateVotes : [];
    return Array.isArray(auditVotes) ? auditVotes : [];
  }, [candidateFilter, candidateVotes, auditVotes]);

  const filteredVotes = useMemo(() => {
    if (!searchTerm.trim()) return activeData;
    const term = searchTerm.toLowerCase();
    return activeData.filter((v: any) =>
      v.voter_id?.toLowerCase().includes(term) ||
      v.transaction_hash?.toLowerCase().includes(term)
    );
  }, [activeData, searchTerm]);

  const handleResetDispute = () => {
    setDisputeRegNo("");
    setDisputePosId("");
    setRunDispute(false);
  };

  const isLoading = isAuditLoading || isCandidateLoading;
  const isFetching = isAuditFetching || isCandidateFetching;

  // One simple answer for the check result
  const verdict: "error" | "notfound" | "match" | "mismatch" | null = !runDispute
    ? null
    : disputeError
    ? "error"
    : !disputeResult
    ? null
    : disputeResult.status === "NOT_FOUND"
    ? "notfound"
    : disputeResult.integrityMatch
    ? "match"
    : "mismatch";

  const verdictCopy = {
    match: {
      title: "This vote is safe",
      text: "The blockchain record and our database say the same thing.",
      icon: <FaCheckCircle className="text-emerald-500" size={26} />,
      tone: "border-emerald-200 bg-emerald-50/60",
      iconBox: "bg-white va-ring",
      heading: "text-emerald-700",
    },
    mismatch: {
      title: "The records do not match",
      text: "The blockchain and the database show different results for this vote.",
      icon: <FaExclamationTriangle className="text-red-600" size={26} />,
      tone: "border-red-200 bg-red-50/60",
      iconBox: "bg-white",
      heading: "text-red-700",
    },
    notfound: {
      title: "No vote found on the blockchain",
      text: "We could not find a vote for this voter and position. Check the reg number and try again.",
      icon: <FaSearchMinus className="text-amber-600" size={26} />,
      tone: "border-amber-200 bg-amber-50/60",
      iconBox: "bg-white",
      heading: "text-amber-700",
    },
    error: {
      title: "Something went wrong",
      text: "We could not reach the network. Please try again in a moment.",
      icon: <FaExclamationTriangle className="text-red-600" size={26} />,
      tone: "border-red-200 bg-red-50/60",
      iconBox: "bg-white",
      heading: "text-red-700",
    },
  };

  const selectedElectionName =
    electionsList.find((e: any) => (e._id || e.id) === selectedElection)?.title ||
    electionsList.find((e: any) => (e._id || e.id) === selectedElection)?.name;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-red-50/30 px-4 py-6 font-sans text-slate-600 sm:px-6 sm:py-10 lg:px-8">
      <style>{animations}</style>

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="va-rise mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-700 text-white shadow-lg shadow-red-700/30 sm:h-14 sm:w-14">
              <FaShieldAlt size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Vote audit</h1>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                See every vote and check that it matches the blockchain.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            {candidateFilter && (
              <button
                onClick={() => setCandidateFilter("")}
                className="va-pop flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:bg-slate-50"
              >
                <FaArrowLeft size={12} /> All votes
              </button>
            )}
            <select
              className={`${inputBase} font-semibold shadow-sm lg:min-w-[300px]`}
              value={selectedElection}
              onChange={(e) => {
                setSelectedElection(e.target.value);
                handleResetDispute();
                setCandidateFilter("");
                setSearchTerm("");
              }}
            >
              <option value="">Choose an election</option>
              {electionsList.map((e: any) => (
                <option key={e._id || e.id} value={e._id || e.id}>{e.title || e.name}</option>
              ))}
            </select>
            <button
              onClick={() => refetch()}
              disabled={!selectedElection || !!candidateFilter}
              title="Refresh votes"
              className="flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition hover:bg-red-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FaSync className={isFetching ? "animate-spin" : ""} size={13} />
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </header>

        {/* TOP ROW: CHECK A VOTE + FILTER BY CANDIDATE */}
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* CHECK A VOTE */}
          <section className="va-rise rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2" style={{ animationDelay: "80ms" }}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-2.5 text-red-600"><FaClipboardCheck size={18} /></div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Check a vote</h2>
                  <p className="text-xs text-slate-500">Enter a voter and a position to compare the two records.</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={handleResetDispute} title="Clear" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                  <FaUndo size={13} />
                </button>
                <button onClick={() => refetchDispute()} disabled={!runDispute} title="Check again" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                  <FaSync size={13} className={isVerifying ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input
                placeholder="Voter reg number"
                className={inputBase}
                value={disputeRegNo}
                onChange={(e) => { setDisputeRegNo(e.target.value); setRunDispute(false); }}
              />

              <div className="relative">
                <select
                  className={`${inputBase} cursor-pointer appearance-none pr-10`}
                  value={disputePosId}
                  onChange={(e) => { setDisputePosId(e.target.value); setRunDispute(false); }}
                  disabled={!selectedElection || isPositionsLoading}
                >
                  <option value="">{!selectedElection ? "Choose an election first" : isPositionsLoading ? "Loading positions..." : "Choose a position"}</option>
                  {positionsList.map((p: any) => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
                <FaListUl className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              </div>

              <button
                onClick={() => setRunDispute(true)}
                disabled={!disputeRegNo || !disputePosId || isVerifying}
                className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-700/25 transition hover:bg-red-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {isVerifying ? "Checking..." : "Check vote"}
              </button>
            </div>
          </section>

          {/* FILTER BY CANDIDATE */}
          <section className="va-rise rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" style={{ animationDelay: "160ms" }}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700"><FaUserCircle size={18} /></div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Votes by candidate</h2>
                <p className="text-xs text-slate-500">Show only one person's votes.</p>
              </div>
            </div>
            <select
              className={`${inputBase} cursor-pointer`}
              value={candidateFilter}
              onChange={(e) => setCandidateFilter(e.target.value)}
              disabled={!selectedElection || isCandidatesLoading}
            >
              <option value="">{isCandidatesLoading ? "Loading names..." : "Choose a candidate"}</option>
              {candidatesList.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {!selectedElection && (
              <p className="mt-3 text-xs text-slate-400">Choose an election first.</p>
            )}
          </section>
        </div>

        {/* CHECK RESULT */}
        {verdict && (
          <section className={`va-pop mb-8 rounded-3xl border p-5 shadow-sm sm:p-7 ${verdictCopy[verdict].tone}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${verdictCopy[verdict].iconBox}`}>
                  {verdictCopy[verdict].icon}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${verdictCopy[verdict].heading}`}>{verdictCopy[verdict].title}</h3>
                  <p className="mt-0.5 text-sm text-slate-600">{verdictCopy[verdict].text}</p>
                  {verdict !== "error" && (
                    <p className="mt-1 text-xs text-slate-500">
                      Blockchain check: {disputeResult?.verified ? "passed on the Sepolia network" : "did not pass"}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleResetDispute}
                className="flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 transition hover:text-red-600 sm:self-center"
              >
                <FaTimes size={10} /> Close
              </button>
            </div>

            {disputeResult?.details && (
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white bg-white/80 p-4 sm:p-5 md:grid-cols-4">
                <div>
                  <p className="mb-1 text-xs text-slate-400">Block number</p>
                  <p className="font-mono text-sm font-bold text-slate-800">#{disputeResult.details?.blockNumber || "---"}</p>
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-400">Vote on blockchain</p>
                  <p
                    className={`truncate text-sm font-bold ${disputeResult?.integrityMatch ? "text-emerald-600" : "text-red-600"}`}
                    title={disputeResult.details?.onChainChoice}
                  >
                    {disputeResult.details?.onChainChoice || "None"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-400">Result</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      disputeResult?.integrityMatch ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {disputeResult?.integrityMatch ? "Match" : "No match"}
                  </span>
                </div>
                <div>
                  <p className="mb-1 text-xs text-slate-400">Recorded</p>
                  <p className="text-sm font-bold text-slate-800">{disputeResult.details?.dateRecorded || "Just now"}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* VOTES LIST */}
        <section className="va-rise overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: "240ms" }}>
          <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 p-5 sm:p-7 md:flex-row md:items-center md:justify-between">
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
              {candidateFilter && (
                <div className="va-pop flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5">
                  <FaUserCircle className="text-red-600" size={13} />
                  <span className="text-xs font-semibold text-red-700">{candidateName(candidateFilter)}</span>
                </div>
              )}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search by voter ID or transaction"
                  className={`${inputBase} pl-11 shadow-sm`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={13} />
              </div>
            </div>
            <div className="flex items-center gap-3 md:text-right">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600 md:hidden"><FaVoteYea size={16} /></div>
              <div>
                <p className="text-xs text-slate-400">
                  {searchTerm ? "Votes found" : "Total votes"}
                  {selectedElectionName ? ` · ${selectedElectionName}` : ""}
                </p>
                <p className="text-2xl font-extrabold leading-tight text-slate-900">{filteredVotes.length}</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center gap-4 p-20 sm:p-28">
              <PuffLoader color="#b91c1c" size={50} />
              <p className="animate-pulse text-sm text-slate-400">Loading votes...</p>
            </div>
          ) : filteredVotes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-16 text-center sm:p-24">
              <div className="rounded-full bg-slate-50 p-5"><FaDatabase className="text-slate-200" size={32} /></div>
              <p className="text-sm font-semibold text-slate-500">
                {selectedElection ? "No votes found" : "Choose an election to see its votes"}
              </p>
              {selectedElection && searchTerm && (
                <p className="text-xs text-slate-400">Try a different search.</p>
              )}
            </div>
          ) : (
            <>
              {/* PHONE: cards */}
              <ul className="divide-y divide-slate-100 md:hidden">
                {filteredVotes.map((vote: any, i: number) => (
                  <li
                    key={vote.id || vote.transaction_hash}
                    className="va-rise space-y-3 p-5"
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <div>
                      <p className="text-xs text-slate-400">Voter ID</p>
                      <p className="break-all font-mono text-xs text-slate-600">{vote.voter_id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setCandidateFilter(vote.candidate_id)}
                        className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition active:scale-95"
                      >
                        <FaUserCircle size={11} className="text-slate-400" /> {candidateName(vote.candidate_id)}
                      </button>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                        {positionName(vote.position_id)}
                      </span>
                    </div>
                    <div>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${vote.transaction_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 break-all font-mono text-xs font-semibold text-red-600"
                      >
                        <FaLink size={10} className="shrink-0" /> {vote.transaction_hash?.substring(0, 24)}...
                      </a>
                      <p className="mt-1 text-xs text-slate-400">{new Date(vote.created_at).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* TABLET AND UP: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-400">
                      <th className="px-6 py-4">Voter ID</th>
                      <th className="px-6 py-4">Candidate and position</th>
                      <th className="px-6 py-4">Blockchain record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVotes.map((vote: any, i: number) => (
                      <tr
                        key={vote.id || vote.transaction_hash}
                        className="va-rise group border-l-4 border-transparent transition hover:border-red-600 hover:bg-red-50/40"
                        style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <FaDatabase size={11} className="shrink-0 text-slate-300 transition group-hover:text-red-600" />
                            <p className="w-48 truncate font-mono text-xs text-slate-500 transition group-hover:text-slate-900" title={vote.voter_id}>
                              {vote.voter_id}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => setCandidateFilter(vote.candidate_id)}
                            title="Show only this candidate's votes"
                            className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 transition hover:text-red-700"
                          >
                            <FaUserCircle size={12} className="text-slate-300" /> {candidateName(vote.candidate_id)}
                          </button>
                          <p className="mt-0.5 text-xs text-slate-400">
                            For <span className="text-slate-600">{positionName(vote.position_id)}</span>
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${vote.transaction_hash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 font-mono text-xs font-semibold text-red-600 hover:underline"
                          >
                            <FaLink size={10} /> {vote.transaction_hash?.substring(0, 28)}...
                          </a>
                          <p className="mt-0.5 text-xs text-slate-400">{new Date(vote.created_at).toLocaleString()}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};