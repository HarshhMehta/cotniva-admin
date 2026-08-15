import { apiSlice } from "../api/apiSlice";

type ReviewListArgs = {
  page?: number;
  limit?: number;
  status?: string;
  rating?: string;
  q?: string;
};

export const reviewModerationApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getReviewStats: builder.query<any, void>({
      query: () => `/api/review/admin/stats`,
      providesTags: ["ReviewStats"],
    }),
    getAdminReviews: builder.query<any, ReviewListArgs>({
      query: ({ page = 1, limit = 20, status = "", rating = "", q = "" }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        if (rating) params.set("rating", String(rating));
        if (q) params.set("q", q);
        return `/api/review/admin/list?${params.toString()}`;
      },
      providesTags: ["AdminReviews"],
    }),
    updateReviewStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/review/admin/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["AdminReviews", "ReviewStats", "ReviewProducts"],
    }),
    deleteAdminReview: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/review/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminReviews", "ReviewStats", "ReviewProducts"],
    }),
  }),
});

export const {
  useGetReviewStatsQuery,
  useGetAdminReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteAdminReviewMutation,
} = reviewModerationApi;
