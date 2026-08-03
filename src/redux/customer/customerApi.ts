import { apiSlice } from "../api/apiSlice";

export type CustomerListItem = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  status?: string;
  registrationDate?: string;
  createdAt?: string;
  totalOrders: number;
  totalSpend: number;
  lastOrder?: string | null;
  lastLogin?: string | null;
};

export type CustomerDetail = CustomerListItem & {
  lifetimeSpend: number;
  savedAddresses: Array<Record<string, unknown>>;
  recentOrders: Array<Record<string, unknown>>;
  currentCart?: {
    items?: unknown[];
    updatedAt?: string;
  } | null;
  wishlistCount: number;
  cartUpdatedAt?: string | null;
  lastOrderAt?: string | null;
  imageURL?: string;
  address?: string;
  bio?: string;
};

export type CustomersListRes = {
  success: boolean;
  data: CustomerListItem[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export const customerApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCustomers: builder.query<
      CustomersListRes,
      {
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        status?: string;
      } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        if (params?.search) q.set("search", params.search);
        if (params?.sort) q.set("sort", params.sort);
        if (params?.status) q.set("status", params.status);
        const qs = q.toString();
        return `/api/customers${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Customers"],
    }),
    getCustomerById: builder.query<
      { success: boolean; data: CustomerDetail },
      string
    >({
      query: (id) => `/api/customers/${id}`,
      providesTags: (result, error, id) => [{ type: "Customers", id }],
    }),
    updateCustomerStatus: builder.mutation<
      { success: boolean },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/api/customers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerStatusMutation,
} = customerApi;
