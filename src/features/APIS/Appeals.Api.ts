import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* ================================
   Type Definitions
================================ */
export interface Appeal {
  id: string;
  application_id: string;
  rejected_stage: string; 
  reason: string;
  supporting_document_url: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewer_id?: string;
  reviewer_comment?: string;
  created_at: string;
  updated_at: string;
  application?: any; 
  reviewer?: any;
}

export interface CreateAppealPayload {
  application_id: string;
  rejected_stage: string;
  reason: string;
  supporting_document_url: string;
}

// Fixed: Added 'stage' property and made comment optional
export interface ResolveAppealPayload {
  appealId: string;
  status: "APPROVED" | "REJECTED";
  comment?: string;
  stage?: string; 
}

export interface GetAppealsByRoleArgs {
  role: string;
  history?: boolean; 
}

/* ================================
   API Configuration
================================ */
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

export const appealsApi = createApi({
  reducerPath: "appealsApi",
  baseQuery,
  tagTypes: ["Appeals", "Applications"],
  endpoints: (builder) => ({
    
    // 1️⃣ Submit a new appeal (Student)
    createAppeal: builder.mutation<Appeal, CreateAppealPayload>({
      query: (body) => ({
        url: "appeals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appeals"],
    }),

    // 2️⃣ Get all appeals (Admin)
    getAllAppeals: builder.query<Appeal[], void>({
      query: () => "appeals",
      providesTags: ["Appeals"],
    }),

    // 3️⃣ Get appeals by role (Pending or History)
    getAppealsByRole: builder.query<Appeal[], GetAppealsByRoleArgs>({
      query: ({ role, history = false }) => 
        `appeals/pending/role?role=${role}${history ? '&history=true' : ''}`,
      providesTags: ["Appeals"],
    }),

    // 4️⃣ Get a specific appeal by ID
    getAppealById: builder.query<Appeal, string>({
      query: (id) => `appeals/${id}`,
      providesTags: (result, error, id) => [{ type: "Appeals", id }],
    }),

    // 5️⃣ Resolve or Re-evaluate an appeal
    // Updated to handle the additional stage property
    resolveAppeal: builder.mutation<Appeal, ResolveAppealPayload>({
      query: ({ appealId, ...body }) => ({
        url: `appeals/${appealId}/resolve`,
        method: "PUT",
        body, // Includes status, comment, and stage
      }),
      invalidatesTags: (result, error, { appealId }) => [
        "Appeals",
        "Applications",
        { type: "Appeals", id: appealId },
      ],
    }),

    // 6️⃣ Delete an appeal (Admin)
    deleteAppeal: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `appeals/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Appeals"],
    }),
  }),
});

/* ================================
   Auto-generated Hooks
================================ */
export const {
  useCreateAppealMutation,
  useGetAllAppealsQuery,
  useGetAppealsByRoleQuery, 
  useGetAppealByIdQuery,
  useResolveAppealMutation,
  useDeleteAppealMutation,
} = appealsApi;