import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// -------------------- TYPES --------------------
export interface VoteRecord {
  id: string;
  voter_id: string;
  candidate_id: string;
  position_id: string;
  election_id: string;
  transaction_hash: string;
  created_at: string;
}

/**
 * Updated to handle:
 * 1. Success (Match)
 * 2. Conflict (Mismatch)
 * 3. Not Found
 */
export interface DisputeVerificationResult {
  verified?: boolean;      // Optional because NOT_FOUND doesn't always include it
  integrityMatch?: boolean; 
  status?: string;         // Captures "NOT_FOUND"
  message: string;         // Captures the explanation string
  details?: {
    blockNumber: number;
    timestamp: number;
    dateRecorded: string;
    onChainChoice: string;
    onChainCoalition: string;
  };
}

// -------------------- API --------------------
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://online-voting-system-r2za.onrender.com/api/",
    prepareHeaders: (headers, { getState }) => {
      let token = (getState() as any).auth.token;

      if (!token) {
        token = localStorage.getItem("token") || undefined;
      }

      if (token) {
        // Essential: Clean escaped quotes from Redux-Persist
        const cleanToken = token.replace(/[\\"]/g, '').trim();
        headers.set("Authorization", `Bearer ${cleanToken}`);
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Audit", "Dispute"],
  endpoints: (builder) => ({
    // Fetches all votes for an election
    getElectionAudit: builder.query<VoteRecord[], string>({
      query: (electionId) => `votes/audit/election/${electionId}`,
      providesTags: ["Audit"],
      transformResponse: (response: { data: VoteRecord[] } | VoteRecord[]) => 
        Array.isArray(response) ? response : response.data || [],
    }),

    // Fetches votes targeted at a specific candidate
    getCandidateAudit: builder.query<VoteRecord[], string>({
      query: (candidateId) => `votes/audit/candidate/${candidateId}`,
      providesTags: ["Audit"],
      transformResponse: (response: { data: VoteRecord[] } | VoteRecord[]) => 
        Array.isArray(response) ? response : response.data || [],
    }),

    // Cross-references DB with Blockchain (Sepolia)
    // Now perfectly aligned with your JSON examples
    verifyDispute: builder.query<DisputeVerificationResult, { regNo: string; electionId: string; positionId: string }>({
      query: (params) => ({
        url: 'votes/verify-dispute',
        method: 'GET',
        params,
      }),
      // Keeps the full structure: { verified, integrityMatch, message, details, status }
      providesTags: ["Dispute"],
    }),
  }),
});

export const {
  useGetElectionAuditQuery,
  useGetCandidateAuditQuery,
  useVerifyDisputeQuery,
} = adminApi;