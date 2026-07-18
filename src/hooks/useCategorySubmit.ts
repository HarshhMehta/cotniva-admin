import { notifySuccess, notifyError } from "@/utils/toast";
import { useAddCategoryMutation, useEditCategoryMutation } from "@/redux/category/categoryApi";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const useCategorySubmit = () => {
  const [categoryImg, setCategoryImg] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();

  const [addCategory] = useAddCategoryMutation();
  const [editCategory] = useEditCategoryMutation();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm();

  const handleSubmitCategory = async (data: any) => {
    try {
      const category_data = {
        img: categoryImg,
        parent: data?.parent,
        description: data?.description || "",
        productType: "general",
        children: [],
      };

      const res = await addCategory({ ...category_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Category added successfully");
        setIsSubmitted(true);
        reset();
        setCategoryImg("");
      }
    } catch (error) {
      console.log(error);
      notifyError("Something went wrong");
    }
  };

  const handleSubmitEditCategory = async (data: any, id: string) => {
    try {
      const category_data = {
        img: categoryImg,
        parent: data?.parent,
        description: data?.description || "",
        productType: "general",
        children: [],
      };
      const res = await editCategory({ id, data: category_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as { message?: string };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
        }
      } else {
        notifySuccess("Category update successfully");
        router.push("/category");
        setIsSubmitted(true);
        reset();
      }
    } catch (error) {
      console.log(error);
      notifyError("Something went wrong");
    }
  };

  return {
    register,
    handleSubmit,
    setValue,
    errors,
    control,
    categoryImg,
    setCategoryImg,
    handleSubmitCategory,
    isSubmitted,
    handleSubmitEditCategory,
  };
};

export default useCategorySubmit;
