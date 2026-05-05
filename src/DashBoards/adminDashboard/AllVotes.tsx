import { useState, useMemo } from "react";
import { PuffLoader } from "react-spinners";
import { FaSearch, FaSync, FaExternalLinkAlt, FaShieldAlt, FaUserShield, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { useGetAllElectionsQuery } from "../../features/APIS/Election.Api";
import { useGetElectionAuditQuery, useVerifyDisputeQuery } from "../../features/APIS/Vote.Api";

export const AllVotesAudit = () => {
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Dispute States
  const [disputeRegNo, setDisputeRegNo] = useState("");
  const [disputePosId, setDisputePosId] = useState("");
  const [runDispute, setRunDispute] = useState(false);

  /* 1. DATA FETCHING */
  const { data: electionsData } = useGetAllElectionsQuery(undefined);
  const { data: auditVotes, isLoading, refetch, isFetching } = useGetElectionAuditQuery(selectedElection, {
    skip: !selectedElection,
  });

  // Verify Dispute Query
  const { data: disputeResult, isFetching: isVerifying } = useVerifyDisputeQuery(
    { regNo: disputeRegNo, electionId: selectedElection, positionId: disputePosId },
    { skip: !runDispute || !selectedElection }
  );

  /* 2. FILTERING LOGIC */
  const filteredVotes = useMemo(() => {
    const data = Array.isArray(auditVotes) ? auditVotes : [];
    if (!searchTerm.trim()) return data;
    return data.filter((v: any) => 
      v.voter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.transaction_hash?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [auditVotes, searchTerm]);

  const electionsList = (electionsData as any)?.elections || (Array.isArray(electionsData) ? electionsData : []);

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              System <span className="text-red-700">Auditor</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Cross-referencing Database records with Blockchain Ledger
            </p>
          </div>

          <div className="flex gap-3">
            <select 
              className="bg-white border-2 border-slate-200 rounded-2xl p-4 text-[10px] font-black uppercase outline-none focus:border-red-600 shadow-sm min-w-[280px]"
              value={selectedElection}
              onChange={(e) => { setSelectedElection(e.target.value); setRunDispute(false); }}
            >
              <option value="">Select Election To Audit</option>
              {electionsList.map((e: any) => (
                <option key={e._id} value={e._id}>{e.name || e.title}</option>
              ))}
            </select>
            <button onClick={() => refetch()} className="px-6 bg-slate-900 text-white rounded-2xl hover:bg-red-700 transition-all">
              <FaSync className={isFetching ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* DISPUTE VERIFICATION TOOL (Matches your verify-dispute JSON) */}
        <div className="mb-10 bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <FaUserShield className="text-red-600" size={24} />
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-800">Admin Dispute Resolution</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Enter Student Reg No..." 
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              value={disputeRegNo}
              onChange={(e) => setDisputeRegNo(e.target.value)}
            />
            <input 
              placeholder="Position ID..." 
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              value={disputePosId}
              onChange={(e) => setDisputePosId(e.target.value)}
            />
            <button 
              onClick={() => setRunDispute(true)}
              className="bg-red-700 text-white font-black text-[10px] uppercase rounded-xl py-4 hover:bg-slate-900 transition-all shadow-lg shadow-red-100"
            >
              {isVerifying ? "Verifying On-Chain..." : "Query Blockchain Integrity"}
            </button>
          </div>

          {disputeResult && (
            <div className={`mt-6 p-6 rounded-2xl border-2 ${disputeResult.integrityMatch ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                {disputeResult.verified ? <FaCheckCircle className="text-emerald-600" /> : <FaTimesCircle className="text-red-600" />}
                <span className="font-black text-xs uppercase text-slate-800">{disputeResult.message}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Block Number</p>
                  <p className="text-xs font-mono font-bold text-slate-700">#{disputeResult.details?.blockNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">On-Chain Choice</p>
                  <p className="text-[10px] font-bold text-slate-700 truncate w-32">{disputeResult.details?.onChainChoice}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Recorded Date</p>
                  <p className="text-[10px] font-bold text-slate-700">{disputeResult.details?.dateRecorded}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Status</p>
                  <p className="text-[10px] font-black text-emerald-600 uppercase">Immutable</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FULL AUDIT TABLE (Matches your audit/election JSON) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Search Voter ID or Tx Hash..." 
                className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-10 text-xs font-bold outline-none focus:ring-2 focus:ring-red-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Records: {filteredVotes.length}</p>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 flex justify-center"><PuffLoader color="#b91c1c" /></div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Anonymized Voter ID</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Election IDs</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Blockchain Anchor (Tx Hash)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredVotes.map((vote: any) => (
                    <tr key={vote.id} className="hover:bg-slate-50 transition-all">
                      <td className="p-6">
                        <p className="text-[10px] font-mono font-bold text-slate-600 truncate w-48">{vote.voter_id}</p>
                        <span className="text-[9px] font-black text-slate-300 uppercase italic">Encrypted</span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-slate-700">Candidate: {vote.candidate_id.substring(0, 8)}...</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase">Pos: {vote.position_id.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${vote.transaction_hash}`} 
                            target="_blank" rel="noreferrer"
                            className="text-[10px] font-mono text-red-600 hover:underline flex items-center gap-1"
                          >
                            {vote.transaction_hash?.substring(0, 20)}... <FaExternalLinkAlt size={8} />
                          </a>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(vote.created_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};