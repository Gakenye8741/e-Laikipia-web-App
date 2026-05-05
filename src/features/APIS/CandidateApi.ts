import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the Candidate interface based on your schema
export interface Candidate {
  id: string;
  name: string;
  manifesto: string;
  position_id: string;
  school: string;
  coalition_id?: string;
  photo_url?: string;
  created_at?: string;
}

export const candidatesApi = createApi({
  reducerPath: "candidatesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://laikipiavotingsystem-f3aabefwhrendaae.southafricanorth-01.azurewebsites.net/api/candidates",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Candidates", "CandidateCount"],
  endpoints: (builder) => ({
    // --- Public / Auth User Routes ---
    getAllCandidates: builder.query<{ candidates: Candidate[] }, void>({
      query: () => "/",
      providesTags: ["Candidates"],
    }),

    getCandidateById: builder.query<{ candidate: Candidate }, string>({
      query: (id) => `/by-id/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Candidates", id }],
    }),

   // In your Candidate.Api.ts
getCandidatesByElection: builder.query<{ candidates: Candidate[] }, string>({
  query: (electionId) => `/by-election/${electionId}`,
}),

    // --- Admin Counts ---
    getCandidatesCount: builder.query<{ count: number }, void>({
      query: () => "/count",
      providesTags: ["CandidateCount"],
    }),

    // --- Mutations ---
    createCandidate: builder.mutation<{ message: string; candidate: Candidate }, Partial<Candidate>>({
      query: (newCandidate) => ({
        url: "/create",
        method: "POST",
        body: newCandidate,
      }),
      invalidatesTags: ["Candidates", "CandidateCount"],
    }),

    updateCandidate: builder.mutation<{ message: string; candidate: Candidate }, { id: string; updates: Partial<Candidate> }>({
      query: ({ id, updates }) => ({
        url: `/update/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => ["Candidates", { type: "Candidates", id }],
    }),

    deleteCandidate: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidates", "CandidateCount"],
    }),

    // NEW: Disqualify Candidate (Deletes both Candidate & Application)
    disqualifyCandidate: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/disqualify/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidates", "CandidateCount"],
    }),
  }),
});

export const {
  useGetAllCandidatesQuery,
  useGetCandidateByIdQuery,
  useGetCandidatesByElectionQuery,
  useGetCandidatesCountQuery,
  useCreateCandidateMutation,
  useUpdateCandidateMutation,
  useDeleteCandidateMutation,
  useDisqualifyCandidateMutation, // Exported mutation
} = candidatesApi;