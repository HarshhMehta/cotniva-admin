"use client";
import React from "react";
import useSliderSubmit from "@/hooks/useSliderSubmit";
import GlobalImgUpload from "../category/global-img-upload";
import SliderTable from "./slider-table";

const AddSlider = () => {
  const {
    errors, handleSubmit, register,
    setImg, setBgType, bgType, setStatus,
    handleSubmitSlider, isSubmitted, setIsSubmitted,
  } = useSliderSubmit();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <form onSubmit={handleSubmit(handleSubmitSlider)}>
          <div className="mb-6 bg-white px-8 py-8 rounded-md">
            <h2 className="text-base font-semibold text-heading mb-4">Add Slider</h2>
            <GlobalImgUpload isSubmitted={isSubmitted} setImage={setImg} image="" setIsSubmitted={setIsSubmitted} />

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Title</label>
              <input {...register("title")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Slider title" />
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Button Link</label>
              <input {...register("link")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="/shop" defaultValue="/shop" />
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Subtitle Text</label>
              <input {...register("subtitle_text_1")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Exclusive offer" />
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Pre Title Text</label>
              <input {...register("pre_title_text")} defaultValue="Starting at" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Price</label>
              <input type="number" {...register("pre_title_price")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="0" />
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Background Type</label>
              <select value={bgType} onChange={(e) => setBgType(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                <option value="green_bg">Green Dark</option>
                <option value="light">Light</option>
                <option value="default">Default</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">Display Order</label>
              <input type="number" {...register("order")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="0" />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-heading">Status</label>
              <select onChange={(e) => setStatus(e.target.value as "active" | "inactive")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">

                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button type="submit" className="tp-btn px-7 py-2">Add Slider</button>
          </div>
        </form>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <SliderTable />
      </div>
    </div>
  );
};

export default AddSlider;
