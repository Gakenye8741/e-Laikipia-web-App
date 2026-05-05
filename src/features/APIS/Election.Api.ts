import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://laikipiavotingsystem-f3aabefwhrendaae.southafricanorth-01.azurewebsites.net/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const electionApi = createApi({
  reducerPath: "electionApi",
  baseQuery,
  tagTypes: ["Elections"],
  endpoints: (builder) => ({
    getAllElections: builder.query<any[], void>({
      query: () => "elections",
      providesTags: ["Elections"],
    }),
    getElectionById: builder.query<any, string>({
      query: (id) => `elections/${id}`,
      providesTags: ["Elections"],
    }),
    createElection: builder.mutation<any, any>({
      query: (body) => ({
        url: "elections",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Elections"],
    }),
    updateElection: builder.mutation<any, any>({
      query: ({ electionId, ...body }) => ({
        url: `elections/${electionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Elections"],
    }),
    deleteElection: builder.mutation<any, string>({
      query: (id) => ({
        url: `elections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Elections"],
    }),
    changeElectionStatus: builder.mutation<any, { electionId: string; status: string }>({
      query: ({ electionId, status }) => ({
        url: `elections/${electionId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Elections"],
    }),
  }),
});

export const {
  useGetAllElectionsQuery,
  useGetElectionByIdQuery,
  useCreateElectionMutation,
  useUpdateElectionMutation,
  useDeleteElectionMutation,
  useChangeElectionStatusMutation,
} = electionApi;
