import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define interfaces for your data types to get better IDE support
export interface CandidateApplication {
  id: string;
  student_id: string;
  position_id: string;
  manifesto: string;
  documents_url: string[];
  school: string;
  election_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  // Add other fields as per your backend response
}

export interface ApprovalPayload {
  applicationId: string;
  approverRole: "school_dean" | "accounts" | "dean_of_students";
  approverId: string;
  status: "APPROVED" | "REJECTED";
  comment: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: "https://online-voting-system-r2za.onrender.com/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const applicationApi = createApi({
  reducerPath: "applicationApi",
  baseQuery,
  tagTypes: ["Applications"],
  endpoints: (builder) => ({
    // 1️⃣ Create a new candidate application
    createApplication: builder.mutation<any, Partial<CandidateApplication>>({
      query: (body) => ({
        url: "candidate-applications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),

    // 2️⃣ Get all candidate applications
    getAllApplications: builder.query<CandidateApplication[], void>({
      query: () => "candidate-applications",
      providesTags: ["Applications"],
    }),

    // 3️⃣ Get a specific application by ID
    getApplicationById: builder.query<CandidateApplication, string>({
      query: (id) => `candidate-applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Applications", id }],
    }),

    // 4️⃣ Get applications for logged-in student
    getMyApplications: builder.query<CandidateApplication[], void>({
      query: () => "candidate-applications/student/me",
      providesTags: ["Applications"],
    }),

    // 5️⃣, 6️⃣, 7️⃣ Update application status (Universal Approval Endpoint)
    // Works for School Dean, Accountant, and Dean of Students
    updateApplicationStatus: builder.mutation<any, ApprovalPayload>({
      query: ({ applicationId, ...approvalData }) => ({
        url: `candidate-applications/${applicationId}`,
        method: "PUT",
        body: approvalData,
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        "Applications",
        { type: "Applications", id: applicationId },
      ],
    }),

    // 8️⃣ Get pending applications filtered by role
    getPendingByRole: builder.query<CandidateApplication[], string>({
      query: (role) => `candidate-applications/pending/approver?role=${role}`,
      providesTags: ["Applications"],
    }),

    // 9️⃣ Delete a candidate application
    deleteApplication: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `candidate-applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Applications"],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useGetAllApplicationsQuery,
  useGetApplicationByIdQuery,
  useGetMyApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetPendingByRoleQuery,
  useDeleteApplicationMutation,
} = applicationApi;