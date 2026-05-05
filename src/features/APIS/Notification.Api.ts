import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "REMINDER" | "ELECTION";
  user_id: string | null;
  election_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  message?: string;
}

const baseQuery = fetchBaseQuery({
  // Backend Production URL
  baseUrl: "https://laikipiavotingsystem-f3aabefwhrendaae.southafricanorth-01.azurewebsites.net/api/notifications", 
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery,
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    
    // ==========================================
    // ADMIN SENDING ACTIONS
    // ==========================================

    /** * BROADCAST: Sends to ALL students and triggers push 
     */
    broadcastNotification: builder.mutation<any, Partial<Notification>>({
      query: (body) => ({
        url: "/broadcast",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    /** * BULK: Sends to a list of specific userIds 
     */
    sendBulkNotifications: builder.mutation<any, { userIds: string[]; payload: Partial<Notification> }>({
      query: (body) => ({
        url: "/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    /** * CREATE: Sends a single notification 
     */
    createNotification: builder.mutation<any, Partial<Notification>>({
      query: (body) => ({
        url: "/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // ==========================================
    // DATA RETRIEVAL
    // ==========================================

    /**
     * Fetch all system notifications (Admin View)
     */
    getAllNotifications: builder.query<Notification[], void>({
      query: () => "/",
      transformResponse: (response: NotificationsResponse) => response.notifications || [],
      providesTags: ["Notifications"],
    }),

    /**
     * Fetch notifications for a specific user
     */
   getUserNotifications: builder.query<Notification[], string>({
  query: (userId) => `user/${userId}`,
  // This is the critical fix:
  transformResponse: (response: { notifications: Notification[] }) => {
    return response.notifications || [];
  },
  providesTags: ["Notifications"],
}),

    // ==========================================
    // MANAGEMENT ACTIONS
    // ==========================================

    markAsRead: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `/mark-read/${notificationId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    deleteAllUserNotifications: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/delete-all/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    /** * Register device token for push notifications
     */
    registerPushToken: builder.mutation<{ message: string }, { userId: string; pushToken: string }>({
      query: (body) => ({
        url: "/register-token",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useBroadcastNotificationMutation,
  useSendBulkNotificationsMutation,
  useCreateNotificationMutation,
  useGetAllNotificationsQuery,
  useGetUserNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllUserNotificationsMutation,
  useRegisterPushTokenMutation,
} = notificationApi;