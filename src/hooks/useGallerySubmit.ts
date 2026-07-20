import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  useAddGalleryMutation,
  useEditGalleryMutation,
} from "@/redux/gallery/galleryApi";
import { notifyError, notifySuccess } from "@/utils/toast";

export type GalleryMediaType = "image" | "video";

const useGallerySubmit = () => {
  const [img, setImg] = useState<string>("");
  const [poster, setPoster] = useState<string>("");
  const [mediaType, setMediaType] = useState<GalleryMediaType>("image");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();

  const [addGallery] = useAddGalleryMutation();
  const [editGallery] = useEditGalleryMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const buildPayload = (data: any) => ({
    img,
    poster: mediaType === "video" ? poster || "" : "",
    mediaType,
    link: data.link || "/shop",
    status,
    order: Number(data.order) || 0,
  });

  const handleSubmitGallery = async (data: any) => {
    try {
      if (!img) {
        return notifyError(
          mediaType === "video"
            ? "Please upload a gallery video"
            : "Please upload a gallery image"
        );
      }
      const res = await addGallery(buildPayload(data));
      if ("error" in res) {
        const errorData = (res.error as any)?.data;
        return notifyError(errorData?.message || "Something went wrong");
      }
      notifySuccess(
        mediaType === "video"
          ? "Gallery video added successfully"
          : "Gallery image added successfully"
      );
      setIsSubmitted(true);
      reset();
      setImg("");
      setPoster("");
      setMediaType("image");
    } catch (error) {
      notifyError("Something went wrong");
    }
  };

  const handleSubmitEditGallery = async (data: any, id: string) => {
    try {
      if (!img) {
        return notifyError(
          mediaType === "video"
            ? "Please upload a gallery video"
            : "Please upload a gallery image"
        );
      }
      const res = await editGallery({ id, data: buildPayload(data) });
      if ("error" in res) {
        const errorData = (res.error as any)?.data;
        return notifyError(errorData?.message || "Something went wrong");
      }
      notifySuccess("Gallery item updated successfully");
      router.push("/gallery");
    } catch (error) {
      notifyError("Something went wrong");
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    setImg,
    img,
    poster,
    setPoster,
    mediaType,
    setMediaType,
    setStatus,
    handleSubmitGallery,
    handleSubmitEditGallery,
    isSubmitted,
    setIsSubmitted,
  };
};

export default useGallerySubmit;
