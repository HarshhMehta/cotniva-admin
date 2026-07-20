"use client";
import React from "react";
import useGallerySubmit from "@/hooks/useGallerySubmit";
import GalleryMediaUpload from "./gallery-media-upload";
import GalleryTable from "./gallery-table";

const AddGallery = () => {
  const {
    errors,
    handleSubmit,
    register,
    setImg,
    img,
    mediaType,
    setMediaType,
    setStatus,
    handleSubmitGallery,
    isSubmitted,
    setIsSubmitted,
  } = useGallerySubmit();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <form onSubmit={handleSubmit(handleSubmitGallery)}>
          <div className="mb-6 bg-white px-8 py-8 rounded-md">
            <h2 className="text-base font-semibold text-heading mb-4">
              Add Gallery Media
            </h2>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">
                Media Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("image");
                    setImg("");
                  }}
                  className={`flex-1 py-2 text-sm rounded border transition ${
                    mediaType === "image"
                      ? "bg-theme text-white border-theme"
                      : "border-gray-300 text-heading hover:border-theme"
                  }`}
                >
                  Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMediaType("video");
                    setImg("");
                  }}
                  className={`flex-1 py-2 text-sm rounded border transition ${
                    mediaType === "video"
                      ? "bg-theme text-white border-theme"
                      : "border-gray-300 text-heading hover:border-theme"
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            <GalleryMediaUpload
              mediaType={mediaType}
              mediaUrl={img}
              setMediaUrl={setImg}
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
            />

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">
                URL / Link
              </label>
              <input
                {...register("link")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="/shop or https://..."
                defaultValue="/shop"
              />
              {errors.link && (
                <p className="text-red text-xs mt-1">Link is required</p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-1 block text-sm font-medium text-heading">
                Display Order
              </label>
              <input
                type="number"
                {...register("order")}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-heading">
                Status
              </label>
              <select
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                defaultValue="active"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button type="submit" className="tp-btn px-7 py-2">
              Add Gallery {mediaType === "video" ? "Video" : "Image"}
            </button>
          </div>
        </form>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <GalleryTable />
      </div>
    </div>
  );
};

export default AddGallery;
