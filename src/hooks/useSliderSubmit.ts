import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAddSliderMutation, useEditSliderMutation } from "@/redux/slider/sliderApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const useSliderSubmit = () => {
  const [img, setImg] = useState<string>("");
  const [status, setStatus] = useState<string>("active");
  const [bgType, setBgType] = useState<string>("green_bg");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();

  const [addSlider] = useAddSliderMutation();
  const [editSlider] = useEditSliderMutation();

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const handleSubmitSlider = async (data: any) => {
    try {
      if (!img) return notifyError("Please upload slider image");
      const slider_data = {
        img,
        title: data.title || "",
        link: data.link || "/shop",
        pre_title_text: data.pre_title_text || "Starting at",
        pre_title_price: Number(data.pre_title_price) || 0,
        subtitle_text_1: data.subtitle_text_1 || "",
        subtitle_percent: Number(data.subtitle_percent) || 0,
        subtitle_text_2: data.subtitle_text_2 || "",
        bg_type: bgType,
        status,
        order: Number(data.order) || 0,
      };
      const res = await addSlider(slider_data);
      if ("error" in res) {
        const errorData = (res.error as any)?.data;
        return notifyError(errorData?.message || "Something went wrong");
      }
      notifySuccess("Slider added successfully");
      setIsSubmitted(true);
      reset();
      setImg("");
    } catch (error) {
      notifyError("Something went wrong");
    }
  };

  const handleSubmitEditSlider = async (data: any, id: string) => {
    try {
      const slider_data = {
        img,
        title: data.title || "",
        link: data.link || "/shop",
        pre_title_text: data.pre_title_text,
        pre_title_price: Number(data.pre_title_price),
        subtitle_text_1: data.subtitle_text_1,
        subtitle_percent: Number(data.subtitle_percent),
        subtitle_text_2: data.subtitle_text_2,
        bg_type: bgType,
        status,
        order: Number(data.order),
      };
      const res = await editSlider({ id, data: slider_data });
      if ("error" in res) {
        const errorData = (res.error as any)?.data;
        return notifyError(errorData?.message || "Something went wrong");
      }
      notifySuccess("Slider updated successfully");
      router.push("/slider");
    } catch (error) {
      notifyError("Something went wrong");
    }
  };

  return {
    register, handleSubmit, errors,
    setImg, img,
    setStatus, setBgType, bgType,
    handleSubmitSlider, handleSubmitEditSlider,
    isSubmitted, setIsSubmitted,
  };
};

export default useSliderSubmit;
