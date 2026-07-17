import { apiSlice } from "../api/apiSlice";

export interface ISlider {
  _id?: string;
  img: string;
  title: string;
  link?: string;
  pre_title_text?: string;
  pre_title_price?: number;
  subtitle_text_1?: string;
  subtitle_percent?: number;
  subtitle_text_2?: string;
  bg_type?: "green_bg" | "light" | "default";
  status?: "active" | "inactive";
  order?: number;
}

export interface SliderResponse {
  success: boolean;
  result: ISlider[];
}

export const sliderApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAllSliders: builder.query<SliderResponse, void>({
      query: () => `/api/slider/all`,
      providesTags: ["AllSliders"],
      keepUnusedDataFor: 600,
    }),
    addSlider: builder.mutation<{ status: string; data: ISlider }, Partial<ISlider>>({
      query(data) {
        return { url: `/api/slider/add`, method: "POST", body: data };
      },
      invalidatesTags: ["AllSliders"],
    }),
    editSlider: builder.mutation<{ status: boolean; data: ISlider }, { id: string; data: Partial<ISlider> }>({
      query({ id, data }) {
        return { url: `/api/slider/edit/${id}`, method: "PATCH", body: data };
      },
      invalidatesTags: ["AllSliders", "getSlider"],
    }),
    getSlider: builder.query<ISlider, string>({
      query: (id) => `/api/slider/get/${id}`,
      providesTags: ["getSlider"],
    }),
    deleteSlider: builder.mutation<{ success: boolean }, string>({
      query(id) {
        return { url: `/api/slider/delete/${id}`, method: "DELETE" };
      },
      invalidatesTags: ["AllSliders"],
    }),
  }),
});

export const {
  useGetAllSlidersQuery,
  useAddSliderMutation,
  useEditSliderMutation,
  useGetSliderQuery,
  useDeleteSliderMutation,
} = sliderApi;
