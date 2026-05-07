import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { 
  FaSearch, FaSync, FaShieldAlt, FaUserShield, FaCheckCircle, 
  FaDatabase, FaLink, FaUserCircle, FaArrowLeft, FaExclamationTriangle, FaListUl, FaUndo, FaSearchMinus 
} from "react-icons/fa";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetElectionAuditQuery, useVerifyDisputeQuery, useGetCandidateAuditQuery } from "../../features/APIS/Admin.Apis";
import { useGetCandidatesByElectionQuery } from "../../features/APIS/CandidateApi";
import { useGetPositionsByElectionQuery } from "../../features/APIS/Position.APi";

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

  const activeData = useMemo(() => {
    if (candidateFilter) return Array.isArray(candidateVotes) ? candidateVotes : [];
    return Array.isArray(auditVotes) ? auditVotes : [];
  }, [candidateFilter, candidateVotes, auditVotes]);

  const filteredVotes = useMemo(() => {
    if (!searchTerm.trim()) return activeData;
    return activeData.filter((v: any) => 
      v.voter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeData, searchTerm]);

  const handleResetDispute = () => {
    setDisputeRegNo("");
    setDisputePosId("");
    setRunDispute(false);
  };

  const isLoading = isAuditLoading || isCandidateLoading;
  const isFetching = isAuditFetching || isCandidateFetching;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans text-slate-600">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full mb-3 border border-red-100">
              <FaShieldAlt className="text-red-600 animate-pulse" size={10} />
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Verification Protocol</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Vote <span className="text-red-700">Audit</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            {candidateFilter && (
              <button 
                onClick={() => setCandidateFilter("")}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <FaArrowLeft /> Full Audit
              </button>
            )}
            <select 
              className="flex-1 lg:min-w-[300px] bg-white border border-slate-200 rounded-2xl p-4 text-[10px] font-black uppercase text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-sm"
              value={selectedElection}
              onChange={(e) => { 
                setSelectedElection(e.target.value); 
                handleResetDispute();
                setCandidateFilter(""); 
              }}
            >
              <option value="">Select Election Context...</option>
              {electionsList.map((e: any) => (
                <option key={e._id || e.id} value={e._id || e.id}>{e.title || e.name}</option>
              ))}
            </select>
            <button onClick={() => refetch()} className="px-6 py-3 bg-red-700 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center">
              <FaSync className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* TOP ROW: DISPUTE ENGINE & CANDIDATE SELECT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* DISPUTE ENGINE */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 rounded-xl border border-red-100"><FaUserShield className="text-red-600" size={18} /></div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Integrity Dispute Engine</h2>
              </div>
              <div className="flex gap-2">
                 <button onClick={handleResetDispute} title="Clear Inputs" className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <FaUndo size={12} />
                 </button>
                 <button onClick={() => refetchDispute()} title="Re-verify" className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <FaSync size={12} className={isVerifying ? "animate-spin" : ""} />
                 </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                placeholder="Voter Reg No..." 
                className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all"
                value={disputeRegNo} onChange={(e) => setDisputeRegNo(e.target.value)}
              />
              
              <div className="relative">
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 appearance-none cursor-pointer"
                  value={disputePosId}
                  onChange={(e) => setDisputePosId(e.target.value)}
                  disabled={!selectedElection || isPositionsLoading}
                >
                  <option value="">{isPositionsLoading ? "Loading Positions..." : "-- Select Position --"}</option>
                  {positionsList.map((p: any) => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
                <FaListUl className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={10} />
              </div>

              <button 
                onClick={() => setRunDispute(true)}
                disabled={!disputeRegNo || !disputePosId}
                className="bg-red-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl py-4 hover:bg-slate-900 transition-all shadow-lg disabled:opacity-30"
              >
                {isVerifying ? "Comparing Chains..." : "Check Integrity"}
              </button>
            </div>
          </div>

          {/* CANDIDATE DROPDOWN SELECTOR */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100"><FaUserCircle className="text-slate-800" size={18} /></div>
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Audit by Candidate</h2>
            </div>
            <div className="flex flex-col gap-3">
              <select 
                className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer"
                value={candidateFilter}
                onChange={(e) => setCandidateFilter(e.target.value)}
                disabled={!selectedElection || isCandidatesLoading}
              >
                <option value="">{isCandidatesLoading ? "Loading Names..." : "-- Select Name --"}</option>
                {candidatesList.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 uppercase font-black text-center italic mt-2">
                {selectedElection ? "Targeting specific candidate audit logs" : "Election context required"}
              </p>
            </div>
          </div>
        </div>

        {/* DISPUTE RESULTS SECTION */}
        {(disputeResult || disputeError) && runDispute && (
          <div className={`mb-10 p-8 rounded-[2rem] border-l-[6px] transition-all duration-700 shadow-lg bg-white
            ${(disputeResult?.integrityMatch && !disputeError) 
              ? 'border-emerald-500' 
              : 'border-red-600 shadow-red-100'}`}
          >
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                {(disputeResult?.integrityMatch && !disputeError) ? (
                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100"><FaCheckCircle className="text-emerald-500 text-2xl" /></div>
                ) : (
                  <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
                    {disputeResult?.status === "NOT_FOUND" ? <FaSearchMinus className="text-red-600 text-2xl" /> : <FaExclamationTriangle className="text-red-600 text-2xl" />}
                  </div>
                )}
                <div>
                  <h3 className={`text-sm font-black uppercase tracking-tighter ${(disputeResult?.integrityMatch && !disputeError) ? 'text-emerald-600' : 'text-red-700'}`}>
                    {disputeError ? "Network Verification Error" : (disputeResult?.status === "NOT_FOUND" ? "RECORD NOT FOUND ON-CHAIN" : (disputeResult?.integrityMatch ? "Vote Verified: Blockchain matches Database" : "Integrity Conflict: Data Mismatch Detected"))}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1">
                    Node Status: <span className="text-slate-800">{disputeResult?.verified ? 'Verified on Sepolia Node' : 'Node Verification Failed'}</span>
                  </p>
                </div>
              </div>
              <button onClick={handleResetDispute} className="text-[9px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors border border-slate-100 px-4 py-2 rounded-xl">Dismiss</button>
            </div>

            {disputeResult?.details && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Block Hash</p>
                  <p className="text-[11px] font-mono font-black text-slate-800">#{disputeResult.details?.blockNumber || '---'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">On-Chain Value</p>
                  <p className={`text-[10px] font-black truncate w-32 ${disputeResult?.integrityMatch ? 'text-emerald-600' : 'text-red-600'}`} title={disputeResult.details?.onChainChoice}>
                    {disputeResult.details?.onChainChoice || 'NULL'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Sync Status</p>
                  <p className={`text-[10px] font-black uppercase ${disputeResult?.integrityMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                    {disputeResult?.integrityMatch ? 'MATCHED' : 'MISMATCHED'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Audit Time</p>
                  <p className="text-[10px] font-black text-slate-800 uppercase">{disputeResult.details?.dateRecorded || 'JUST NOW'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIT TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {candidateFilter && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
                  <FaUserCircle className="text-red-600" size={14} />
                  <span className="text-[10px] font-black text-red-700 uppercase italic tracking-tighter">Targeted Candidate Log</span>
                </div>
              )}
              <div className="relative w-full md:w-80">
                <input 
                  type="text" placeholder="Search Voter Hash or Tx..." 
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 pl-12 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-sm"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Records</p>
              <p className="text-2xl font-black text-slate-900">{filteredVotes.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-32 flex flex-col items-center gap-4">
                <PuffLoader color="#b91c1c" size={50} />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] animate-pulse">Syncing Distributed Ledger</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Voter ID (SHA-256)</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Candidate Mapping</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Blockchain Anchor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVotes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-24 text-center">
                         <div className="flex flex-col items-center gap-3">
                           <FaDatabase className="text-slate-100" size={40} />
                           <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">No Audit Trails Found</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVotes.map((vote: any) => (
                      <tr key={vote.id} className="hover:bg-red-50/30 transition-all group border-l-4 border-transparent hover:border-red-600">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <FaDatabase size={10} className="text-slate-300 group-hover:text-red-600 transition-colors" />
                            <p className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-900 truncate w-48">{vote.voter_id}</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setCandidateFilter(vote.candidate_id)}
                              className="text-[10px] font-black text-slate-700 hover:text-red-700 transition-colors flex items-center gap-1.5 uppercase"
                            >
                              <FaUserCircle size={10} className="text-slate-300" /> {vote.candidate_id.substring(0, 18)}...
                            </button>
                            <p className="text-[9px] font-black text-slate-400 uppercase">
                              Position: <span className="text-slate-600">{vote.position_id.substring(0, 12)}...</span>
                            </p>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${vote.transaction_hash}`} 
                              target="_blank" rel="noreferrer"
                              className="text-[10px] font-mono font-black text-red-600 flex items-center gap-2 hover:underline tracking-tight"
                            >
                              <FaLink size={10} /> {vote.transaction_hash?.substring(0, 28)}...
                            </a>
                            <p className="text-[9px] text-slate-400 font-black mt-1 uppercase">
                              {new Date(vote.created_at).toLocaleString()}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};