"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "@/app/components/breadcrumb/breadcrumb";
import GlobalImgUpload from "@/app/components/category/global-img-upload";
import { useGetSliderQuery } from "@/redux/slider/sliderApi";
import useSliderSubmit from "@/hooks/useSliderSubmit";

export default function EditSliderPage() {
  const { id } = useParams() as { id: string };
  const { data: slider, isLoading } = useGetSliderQuery(id);
  const {
    register, handleSubmit, errors,
    setImg, img, setBgType, bgType, setStatus,
    handleSubmitEditSlider, isSubmitted, setIsSubmitted,
  } = useSliderSubmit();

  useEffect(() => {
    if (slider?.img) setImg(slider.img);
    if (slider?.bg_type) setBgType(slider.bg_type);
    if (slider?.status) setStatus(slider.status);
  }, [slider]);

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <Wrapper>
      <Breadcrumb title="Edit Slider" subtitle="Slider" />
      <div className="body-content px-8 py-8 bg-slate-100">
        <div className="max-w-xl bg-white px-8 py-8 rounded-md">
          <h2 className="text-base font-semibold text-heading mb-4">Edit Slider</h2>
          <form onSubmit={handleSubmit((data) => handleSubmitEditSlider(data, id))}>
            <GlobalImgUpload isSubmitted={isSubmitted} setImage={setImg} image={slider?.img || ""} setIsSubmitted={setIsSubmitted} />

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Title</label>
              <input {...register("title", { required: "Title is required" })} defaultValue={slider?.title} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>

            {/* ✅ Link field */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Button Link</label>
              <input {...register("link")} defaultValue={slider?.link || "/shop"} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="/shop" />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Pre Title Text</label>
              <input {...register("pre_title_text")} defaultValue={slider?.pre_title_text} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Price</label>
              <input type="number" {...register("pre_title_price")} defaultValue={slider?.pre_title_price} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Subtitle Text 1</label>
              <input {...register("subtitle_text_1")} defaultValue={slider?.subtitle_text_1} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Discount %</label>
              <input type="number" {...register("subtitle_percent")} defaultValue={slider?.subtitle_percent} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Subtitle Text 2</label>
              <input {...register("subtitle_text_2")} defaultValue={slider?.subtitle_text_2} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Background Type</label>
              <select value={bgType} onChange={(e) => setBgType(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="green_bg">Green Dark</option>
                <option value="light">Light Blue</option>
                <option value="default">Default</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">Display Order</label>
              <input type="number" {...register("order")} defaultValue={slider?.order} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-heading">Status</label>
              <select defaultValue={slider?.status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">

                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" className="tp-btn px-7 py-2">Update Slider</button>
          </form>
        </div>
      </div>
    </Wrapper>
  );
}