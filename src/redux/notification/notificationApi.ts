import { apiSlice } from "../api/apiSlice";

export type NotificationType =
  | "new_order"
  | "payment_success"
  | "payment_failed"
  | "cod_order"
  | "order_cancelled"
  | "return_request"
  | "low_stock";

export type AdminNotification = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedOrderId?: string;
  relatedCustomerId?: string;
  isRead: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
};

export type NotificationsRes = {
  success: boolean;
  data: AdminNotification[];
  meta: {
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
};

export const notificationApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsRes,
      { limit?: number; page?: number; unreadOnly?: boolean } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.limit) q.set("limit", String(params.limit));
        if (params?.page) q.set("page", String(params.page));
        if (params?.unreadOnly) q.set("unreadOnly", "true");
        const qs = q.toString();
        return `/api/notifications${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Notifications"],
      // Poll so new orders ring the bell without Socket.io yet
      keepUnusedDataFor: 5,
    }),
    getUnreadNotificationCount: builder.query<
      { success: boolean; unreadCount: number },
      void
    >({
      query: () => `/api/notifications/unread-count`,
      providesTags: ["NotificationCount"],
      keepUnusedDataFor: 5,
    }),
    markNotificationRead: builder.mutation<
      { success: boolean; data: AdminNotification },
      string
    >({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "NotificationCount"],
    }),
    markAllNotificationsRead: builder.mutation<
      { success: boolean; modifiedCount: number },
      void
    >({
      query: () => ({
        url: `/api/notifications/read-all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "NotificationCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
