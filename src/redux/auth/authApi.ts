import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn, userLoggedOut } from "./authSlice";
import {
  IAddStuff,
  IAdminGetRes,
  IAdminLoginAdd,
  IAdminRegisterAdd,
  IAdminUpdate,
  IStuff,
} from "@/types/admin-type";
import { API_BASE } from "@/utils/admin-auth-headers";

type AdminSessionUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  phone?: string;
};

type SessionResponse = {
  success?: boolean;
  user: AdminSessionUser;
};

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    registerAdmin: builder.mutation<SessionResponse, IAdminRegisterAdd>({
      query: (data) => ({
        url: "api/admin/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch {
          /* ignore */
        }
      },
    }),
    loginAdmin: builder.mutation<SessionResponse, IAdminLoginAdd>({
      query: (data) => ({
        url: "api/admin/login",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch {
          /* ignore */
        }
      },
    }),
    logoutAdmin: builder.mutation<{ success: boolean; message?: string }, void>({
      query: () => ({
        url: "api/admin/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          /* still clear local state */
        }
        dispatch(userLoggedOut());
      },
    }),
    adminMe: builder.query<SessionResponse, void>({
      query: () => "/api/admin/me",
    }),
    forgetPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: "api/admin/forget-password",
        method: "PATCH",
        body: data,
      }),
    }),
    adminConfirmForgotPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: (data) => ({
        url: "api/admin/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),
    adminChangePassword: builder.mutation<
      { message: string },
      { email: string; oldPass: string; newPass: string }
    >({
      query: (data) => ({
        url: "api/admin/change-password",
        method: "PATCH",
        body: data,
      }),
    }),
    updateProfile: builder.mutation<
      SessionResponse,
      { id: string; data: IAdminUpdate }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/admin/update-stuff/${id}`,
        method: "PATCH",
        body: data.data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch {
          /* ignore */
        }
      },
      invalidatesTags: ["AllStaff"],
    }),
    addStaff: builder.mutation<{ message: string }, IAddStuff>({
      query: (data) => ({
        url: "api/admin/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AllStaff"],
    }),
    getAllStaff: builder.query<IAdminGetRes, void>({
      query: () => `/api/admin/all`,
      providesTags: ["AllStaff"],
      keepUnusedDataFor: 600,
    }),
    deleteStaff: builder.mutation<{ message: string }, string>({
      query(id: string) {
        return {
          url: `/api/admin/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["AllStaff"],
    }),
    getStuff: builder.query<IStuff, string>({
      query: (id) => `/api/admin/get/${id}`,
      providesTags: ["Stuff"],
    }),
    bootstrapStatus: builder.query<
      { bootstrapped: boolean; needsBootstrapSecret: boolean },
      void
    >({
      query: () => "api/admin/bootstrap-status",
    }),
  }),
});

export const {
  useLoginAdminMutation,
  useRegisterAdminMutation,
  useLogoutAdminMutation,
  useAdminMeQuery,
  useForgetPasswordMutation,
  useAdminConfirmForgotPasswordMutation,
  useAdminChangePasswordMutation,
  useUpdateProfileMutation,
  useGetAllStaffQuery,
  useAddStaffMutation,
  useDeleteStaffMutation,
  useGetStuffQuery,
  useBootstrapStatusQuery,
} = authApi;

export async function refreshAdminSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}
