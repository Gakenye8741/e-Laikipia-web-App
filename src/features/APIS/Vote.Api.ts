import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// --- UPDATED TYPES TO MATCH SMART CONTRACT V2 & BACKEND JSON ---
export interface ElectionResult {
  candidate_id: string;
  candidate_name: string | null;
  position_id: string;
  votes_count: number | string;
  coalition_id?: string; 
}

export interface VoteRecord {
  id: string;
  voter_id: string;      
  candidate_id: string;
  position_id: string;
  election_id: string;
  transaction_hash: string;
  created_at: string;    // Matches your backend's "created_at"
  createdAt?: string;    // Fallback for UI consistency
  block_number?: number;
}

export interface DisputeResponse {
  verified: boolean;
  integrityMatch: boolean;
  message: string;
  details: {
    blockNumber: number;
    timestamp: number;
    dateRecorded: string;
    onChainChoice: string;
    onChainCoalition: string;
  };
}

export const votesApi = createApi({
  reducerPath: 'votesApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://online-voting-system-r2za.onrender.com/api/',
    prepareHeaders: (headers) => {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          const token = user.token || user.authToken || user.data?.token || user.access_token;
          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          }
        } catch (error) {
          console.error("Auth header parsing error:", error);
        }
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ['Votes', 'Results', 'MyHistory', 'Dispute'],
  endpoints: (builder) => ({
    
    // 1. Voter: Cast single vote
    castVote: builder.mutation<any, { election_id: string; candidate_id: string; position_id: string; coalition_id?: string }>({
      query: (body) => ({
        url: '/votes/cast',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Results', 'MyHistory', 'Votes'],
    }),

    // 2. Voter: Cast bulk votes
    castBulkVotes: builder.mutation<any, { votesList: any[] }>({
      query: (body) => ({
        url: '/votes/cast-bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Results', 'MyHistory', 'Votes'],
    }),

    // 3. Voter: Get personal history
    getMyVotes: builder.query<{ data: { votes: VoteRecord[], totalCast: string } }, string>({
      query: (electionId) => `/votes/my-votes/${electionId}`,
      providesTags: ['MyHistory'],
    }),

    // 4. Public/Admin: Get Results
    getElectionResults: builder.query<{ data: ElectionResult[] }, string>({
      query: (electionId) => `/votes/results/${electionId}`,
      providesTags: ['Results'],
    }),

    // --- AUDIT ENDPOINTS ---

    // 5. Admin/Dean: Audit an entire election
    getElectionAudit: builder.query<VoteRecord[], string>({
      query: (electionId) => `/votes/audit/election/${electionId}`,
      providesTags: ['Votes'],
      transformResponse: (response: { data: any[] }) => {
        return (response.data || []).map((vote) => ({
          ...vote,
          createdAt: vote.created_at || vote.createdAt 
        }));
      },
    }),

    // 6. Admin: Audit specific candidate
    getCandidateAudit: builder.query<VoteRecord[], string>({
      query: (candidateId) => `/votes/audit/candidate/${candidateId}`,
      providesTags: ['Votes'],
      transformResponse: (response: { data: any[] }) => {
        return (response.data || []).map((vote) => ({
          ...vote,
          createdAt: vote.created_at || vote.createdAt
        }));
      },
    }),

    // 7. Security: Admin Dispute Verification
    verifyDispute: builder.query<DisputeResponse, { regNo: string; electionId: string; positionId: string }>({
      query: ({ regNo, electionId, positionId }) => ({
        url: '/votes/verify-dispute',
        params: { regNo, electionId, positionId },
      }),
      providesTags: ['Dispute'],
      // Returning the full response object to access .details in the UI
      transformResponse: (response: DisputeResponse) => response,
    }),
  }),
});

export const { 
  useCastVoteMutation, 
  useCastBulkVotesMutation, 
  useGetMyVotesQuery, 
  useGetElectionResultsQuery, 
  useGetElectionAuditQuery,
  useGetCandidateAuditQuery,
  useVerifyDisputeQuery 
} = votesApi;