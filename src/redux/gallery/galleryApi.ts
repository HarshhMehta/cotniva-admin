import { apiSlice } from "../api/apiSlice";

export interface IGallery {
  _id?: string;
  img: string;
  link?: string;
  status?: "active" | "inactive";
  order?: number;
}

export interface GalleryResponse {
  success: boolean;
  result: IGallery[];
}

export const galleryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllGallery: builder.query<GalleryResponse, void>({
      query: () => `/api/gallery/all`,
      providesTags: ["AllGallery"],
      keepUnusedDataFor: 600,
    }),
    addGallery: builder.mutation<{ status: string; data: IGallery }, Partial<IGallery>>({
      query(data) {
        return { url: `/api/gallery/add`, method: "POST", body: data };
      },
      invalidatesTags: ["AllGallery"],
    }),
    editGallery: builder.mutation<
      { status: boolean; data: IGallery },
      { id: string; data: Partial<IGallery> }
    >({
      query({ id, data }) {
        return { url: `/api/gallery/edit/${id}`, method: "PATCH", body: data };
      },
      invalidatesTags: ["AllGallery", "getGallery"],
    }),
    getGallery: builder.query<IGallery, string>({
      query: (id) => `/api/gallery/get/${id}`,
      providesTags: ["getGallery"],
    }),
    deleteGallery: builder.mutation<{ success: boolean }, string>({
      query(id) {
        return { url: `/api/gallery/delete/${id}`, method: "DELETE" };
      },
      invalidatesTags: ["AllGallery"],
    }),
  }),
});

export const {
  useGetAllGalleryQuery,
  useAddGalleryMutation,
  useEditGalleryMutation,
  useGetGalleryQuery,
  useDeleteGalleryMutation,
} = galleryApi;
