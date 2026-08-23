import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "",
    credentials: "include",
    prepareHeaders: async (headers) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({}),
  tagTypes: [
    "DashboardAmount",
    "DashboardSalesReport",
    "DashboardMostSellingCategory",
    "DashboardRecentOrders",
    "AllProducts",
    "StockOutProducts",
    "AllCategory",
    "AllBrands",
    "getCategory",
    "AllOrders",
    "getBrand",
    "ReviewProducts",
    "AdminReviews",
    "ReviewStats",
    "AllCoupons",
    "Coupon",
    "AllStaff",
    "Stuff",
    "AllSliders",
    "getSlider",
    "AllGallery",
    "getGallery",
    "Notifications",
    "NotificationCount",
    "Customers",
    "NewsletterStats",
    "NewsletterSubscribers",
    "NewsletterCampaigns",
  ],
});
