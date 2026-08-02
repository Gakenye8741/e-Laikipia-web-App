import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://online-voting-system-r2za.onrender.com/api/positions/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const positionApi = createApi({
  reducerPath: "positionApi",
  baseQuery,
  tagTypes: ["Positions"],
  endpoints: (builder) => ({
    // GET ALL POSITIONS
    getAllPositions: builder.query<any[], void>({
      query: () => "",
      providesTags: ["Positions"],
    }),

    // GET POSITION BY ID
    getPositionById: builder.query<any, string>({
      query: (id) => `by-id/${id}`,
      providesTags: ["Positions"],
    }),

    // GET POSITIONS BY NAME
    getPositionsByName: builder.query<any[], string>({
      query: (name) => `by-name?name=${name}`,
      providesTags: ["Positions"],
    }),

    // GET POSITIONS BY SCHOOL
    getPositionsBySchool: builder.query<any[], string>({
      query: (school) => `by-school?school=${school}`,
      providesTags: ["Positions"],
    }),

    // GET POSITIONS BY TIER
    getPositionsByTier: builder.query<any[], string>({
      query: (tier) => `by-tier?tier=${tier}`,
      providesTags: ["Positions"],
    }),

    // GET POSITIONS BY ELECTION ID
    getPositionsByElection: builder.query<any[], string>({
      query: (electionId) => `by-election?election_id=${electionId}`,
      providesTags: ["Positions"],
    }),

    // CREATE POSITION
    createPosition: builder.mutation<any, any>({
      query: (body) => ({
        url: "create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Positions"],
    }),

    // UPDATE POSITION
    updatePosition: builder.mutation<any, any>({
      query: ({ positionId, ...body }) => ({
        url: `update/${positionId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Positions"],
    }),

    // DELETE POSITION
    deletePosition: builder.mutation<any, string>({
      query: (id) => ({
        url: `delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Positions"],
    }),

    // COUNT POSITIONS
    countPositions: builder.query<any, void>({
      query: () => "count",
      providesTags: ["Positions"],
    }),

    // COUNT POSITIONS BY SCHOOL
    countPositionsBySchool: builder.query<any, string>({
      query: (school) => `count-by-school?school=${school}`,
      providesTags: ["Positions"],
    }),
  }),
});

export const {
  useGetAllPositionsQuery,
  useGetPositionByIdQuery,
  useGetPositionsByNameQuery,
  useGetPositionsBySchoolQuery,
  useGetPositionsByTierQuery,
  useGetPositionsByElectionQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
  useCountPositionsQuery,
  useCountPositionsBySchoolQuery,
} = positionApi;
