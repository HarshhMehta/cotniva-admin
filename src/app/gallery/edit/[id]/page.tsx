"use client";
import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "@/app/components/breadcrumb/breadcrumb";
import GlobalImgUpload from "@/app/components/category/global-img-upload";
import { useGetGalleryQuery } from "@/redux/gallery/galleryApi";
import useGallerySubmit from "@/hooks/useGallerySubmit";

export default function EditGalleryPage() {
  const { id } = useParams() as { id: string };
  const { data: gallery, isLoading } = useGetGalleryQuery(id);
  const {
    register,
    handleSubmit,
    setImg,
    setStatus,
    handleSubmitEditGallery,
    isSubmitted,
    setIsSubmitted,
  } = useGallerySubmit();

  useEffect(() => {
    if (gallery?.img) setImg(gallery.img);
    if (gallery?.status) setStatus(gallery.status);
  }, [gallery, setImg, setStatus]);

  if (isLoading) return <div className="p-8">Loading...</div>;

  return (
    <Wrapper>
      <Breadcrumb title="Edit Gallery" subtitle="Gallery" />
      <div className="body-content px-8 py-8 bg-slate-100">
        <div className="max-w-xl bg-white px-8 py-8 rounded-md">
          <h2 className="text-base font-semibold text-heading mb-4">
            Edit Gallery Image
          </h2>
          <form
            onSubmit={handleSubmit((data) =>
              handleSubmitEditGallery(data, id)
            )}
          >
            <GlobalImgUpload
              isSubmitted={isSubmitted}
              setImage={setImg}
              image={gallery?.img || ""}
              setIsSubmitted={setIsSubmitted}
            />

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">
                URL / Link
              </label>
              <input
                {...register("link")}
                defaultValue={gallery?.link || "/shop"}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="/shop or https://..."
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-heading">
                Display Order
              </label>
              <input
                type="number"
                {...register("order")}
                defaultValue={gallery?.order}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-heading">
                Status
              </label>
              <select
                defaultValue={gallery?.status}
                onChange={(e) =>
                  setStatus(e.target.value as "active" | "inactive")
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button type="submit" className="tp-btn px-7 py-2">
              Update Gallery Image
            </button>
          </form>
        </div>
      </div>
    </Wrapper>
  );
}
