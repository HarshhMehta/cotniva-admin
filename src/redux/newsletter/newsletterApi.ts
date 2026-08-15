import { apiSlice } from "../api/apiSlice";

type SubscriberListArgs = {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
};

type CampaignListArgs = {
  page?: number;
  limit?: number;
};

export const newsletterApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getNewsletterStats: builder.query<any, void>({
      query: () => `/api/newsletter/admin/stats`,
      providesTags: ["NewsletterStats"],
    }),
    getNewsletterSubscribers: builder.query<any, SubscriberListArgs>({
      query: ({ page = 1, limit = 20, status = "", q = "" }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (status) params.set("status", status);
        if (q) params.set("q", q);
        return `/api/newsletter/admin/list?${params.toString()}`;
      },
      providesTags: ["NewsletterSubscribers"],
    }),
    getNewsletterCampaigns: builder.query<any, CampaignListArgs>({
      query: ({ page = 1, limit = 20 }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        return `/api/newsletter/admin/campaigns?${params.toString()}`;
      },
      providesTags: ["NewsletterCampaigns"],
    }),
    sendNewsletterTest: builder.mutation<
      any,
      { subject: string; content: string }
    >({
      query: (body) => ({
        url: `/api/newsletter/admin/campaigns/test`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["NewsletterCampaigns"],
    }),
    sendNewsletterCampaign: builder.mutation<
      any,
      { subject: string; content: string; confirm: boolean }
    >({
      query: (body) => ({
        url: `/api/newsletter/admin/campaigns/send`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["NewsletterCampaigns", "NewsletterStats"],
    }),
  }),
});

export const {
  useGetNewsletterStatsQuery,
  useGetNewsletterSubscribersQuery,
  useGetNewsletterCampaignsQuery,
  useSendNewsletterTestMutation,
  useSendNewsletterCampaignMutation,
} = newsletterApi;
