import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  useAddGalleryMutation,
  useEditGalleryMutation,
} from "@/redux/gallery/galleryApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const useGallerySubmit = () => {
  const [img, setImg] = useState<string>("");
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

  const handleSubmitGallery = async (data: any) => {
    try {
      if (!img) return notifyError("Please upload gallery image");
      const gallery_data = {
        img,
        link: data.link || "/shop",
        status,
        order: Number(data.order) || 0,
      };
      const res = await addGallery(gallery_data);
      if ("error" in res) {
        const errorData = (res.error as any)?.data;
        return notifyError(errorData?.message || "Something went wrong");
      }
      notifySuccess("Gallery image added successfully");
      setIsSubmitted(true);
      reset();
      setImg("");
    } catch (error) {
      notifyError("Something went wrong");
    }
  };

  const handleSubmitEditGallery = async (data: any, id: string) => {
    try {
      if (!img) return notifyError("Please upload gallery image");
      const gallery_data = {
        img,
        link: data.link || "/shop",
        status,
        order: Number(data.order) || 0,
      };
      const res = await editGallery({ id, data: gallery_data });
      if ("error" in res) {
        const errorData = (res.error as any)?.data;
        return notifyError(errorData?.message || "Something went wrong");
      }
      notifySuccess("Gallery image updated successfully");
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
    setStatus,
    handleSubmitGallery,
    handleSubmitEditGallery,
    isSubmitted,
    setIsSubmitted,
  };
};

export default useGallerySubmit;
