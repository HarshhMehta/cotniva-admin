import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  useAddCouponMutation,
  useEditCouponMutation,
} from "@/redux/coupon/couponApi";
import dayjs from "dayjs";
import { CouponCategoryOption } from "@/app/components/coupon/coupon-category-select";

/** Accepts "10", "10%", "10.5" → number; invalid → NaN */
const parseNumberInput = (raw: unknown): number => {
  if (typeof raw === "number") return raw;
  const cleaned = String(raw ?? "")
    .replace(/%/g, "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
};

const useCouponSubmit = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [neverExpires, setNeverExpires] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<
    CouponCategoryOption[]
  >([]);
  const [editId, setEditId] = useState<string>("");
  const router = useRouter();

  const [addCoupon] = useAddCouponMutation();
  const [editCoupon] = useEditCouponMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm();

  useEffect(() => {
    if (!openSidebar) {
      setNeverExpires(false);
      setSelectedCategories([]);
      reset();
    }
  }, [openSidebar, reset]);

  const buildPayload = (data: any) => {
    const cats = selectedCategories.filter((c) => c.value !== "all");
    const isAll =
      selectedCategories.length === 0 ||
      selectedCategories.some((c) => c.value === "all");
    return {
      logo: "",
      title: data?.name,
      couponCode: data?.code,
      neverExpires,
      endTime: neverExpires
        ? null
        : data?.endtime
          ? dayjs(data.endtime).format("YYYY-MM-DDTHH:mm:ss.SSSZ")
          : null,
      discountPercentage: parseNumberInput(data?.discountpercentage),
      minimumAmount: parseNumberInput(data?.minimumamount) || 0,
      productType: "all",
      applicableCategories: isAll ? [] : cats.map((c) => c.value),
    };
  };

  const handleCouponSubmit = async (data: any) => {
    try {
      if (!neverExpires && !data?.endtime) {
        return notifyError("Please select an end date or enable Never Expire");
      }
      const coupon_data = buildPayload(data);
      if (
        !Number.isFinite(coupon_data.discountPercentage) ||
        coupon_data.discountPercentage <= 0
      ) {
        return notifyError("Enter a valid discount percentage (e.g. 10)");
      }
      if (
        !Number.isFinite(coupon_data.minimumAmount) ||
        coupon_data.minimumAmount < 0
      ) {
        return notifyError("Enter a valid minimum amount (e.g. 500)");
      }
      const res = await addCoupon({ ...coupon_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as {
            message?: string;
            errorMessages?: Array<{ message?: string }>;
          };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
          const first = errorData.errorMessages?.[0]?.message;
          if (first) return notifyError(first);
        }
        return notifyError("Failed to add coupon");
      }
      notifySuccess("Coupon added successfully");
      setIsSubmitted(true);
      setOpenSidebar(false);
      setNeverExpires(false);
      setSelectedCategories([]);
      reset();
    } catch (error) {
      console.log(error);
      notifyError("Something went wrong");
    }
  };

  const handleSubmitEditCoupon = async (data: any, id: string) => {
    try {
      if (!neverExpires && !data?.endtime) {
        return notifyError("Please select an end date or enable Never Expire");
      }

      const coupon_data = buildPayload(data);
      if (
        !Number.isFinite(coupon_data.discountPercentage) ||
        coupon_data.discountPercentage <= 0
      ) {
        return notifyError("Enter a valid discount percentage (e.g. 10)");
      }
      const res = await editCoupon({ id, data: coupon_data });
      if ("error" in res) {
        if ("data" in res.error) {
          const errorData = res.error.data as {
            message?: string;
            errorMessages?: Array<{ message?: string }>;
          };
          if (typeof errorData.message === "string") {
            return notifyError(errorData.message);
          }
          const first = errorData.errorMessages?.[0]?.message;
          if (first) return notifyError(first);
        }
        return notifyError("Failed to update coupon");
      }
      notifySuccess("Coupon updated successfully");
      router.push("/coupon");
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.log(error);
      notifyError("Something went wrong");
    }
  };

  return {
    handleCouponSubmit,
    isSubmitted,
    setIsSubmitted,
    register,
    handleSubmit,
    errors,
    openSidebar,
    setOpenSidebar,
    control,
    setValue,
    neverExpires,
    setNeverExpires,
    selectedCategories,
    setSelectedCategories,
    handleSubmitEditCoupon,
    setEditId,
  };
};

export default useCouponSubmit;
