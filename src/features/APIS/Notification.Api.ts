import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  // Pointing to the root API to keep endpoint definitions clean
  baseUrl: "https://online-voting-system-oq4p.onrender.com/api", 
  prepareHeaders: (headers) => {
    // Ensure we are grabbing the token exactly how your auth system saves it
    const token = localStorage.getItem("token");
    if (token) {
      // Standard JWT format: Bearer <token>
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
    // GET ALL (Admin) - Fetches from /api/notifications
    getAllNotifications: builder.query<any[], void>({
      query: () => "/notifications",
      providesTags: ["Notifications"],
    }),
    
    // GET BY USER ID - Fetches from /api/notifications/user/:userId
    getUserNotifications: builder.query<any[], string>({
      query: (userId) => `/notifications/user/${userId}`,
      providesTags: ["Notifications"],
    }),

    // CREATE SINGLE (Admin)
    createNotification: builder.mutation<any, any>({
      query: (body) => ({
        url: "/notifications/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // BULK SEND (Admin)
    sendBulkNotifications: builder.mutation<any, { userIds: string[]; payload: any }>({
      query: (body) => ({
        url: "/notifications/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // BROADCAST ALL (Admin)
    broadcastNotification: builder.mutation<any, any>({
      query: (body) => ({
        url: "/notifications/broadcast",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // MARK AS READ
    markAsRead: builder.mutation<any, string>({
      query: (notificationId) => ({
        url: `/notifications/mark-read/${notificationId}`,
        method: "PUT",
        body: { is_read: true },
      }),
      invalidatesTags: ["Notifications"],
    }),

    // MARK ALL READ
    markAllRead: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/notifications/mark-all-read/${userId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // DELETE ONE
    deleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notifications/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // DELETE ALL FOR USER
    deleteAllUserNotifications: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/notifications/delete-all/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useGetUserNotificationsQuery,
  useCreateNotificationMutation,
  useSendBulkNotificationsMutation,
  useBroadcastNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllUserNotificationsMutation,
} = notificationApi;