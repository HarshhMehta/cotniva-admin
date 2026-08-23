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
    .replace(/₹/g, "")
    .replace(/rs\.?/gi, "")
    .replace(/,/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();
  if (!cleaned) return NaN;
  return Number(cleaned);
};

const generateCouponCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
};

const useCouponSubmit = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [neverExpires, setNeverExpires] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
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
      setDiscountType("percentage");
      setSelectedCategories([]);
      reset();
    }
  }, [openSidebar, reset]);

  const handleGenerateCode = () => {
    setValue("code", generateCouponCode(), { shouldValidate: true });
  };

  const buildPayload = (data: any) => {
    const cats = selectedCategories.filter((c) => c.value !== "all");
    const isAll =
      selectedCategories.length === 0 ||
      selectedCategories.some((c) => c.value === "all");

    const discountValue = parseNumberInput(
      data?.discountvalue ?? data?.discountpercentage
    );

    let maxUses: number | null = null;
    if (data?.maxuses !== undefined && data?.maxuses !== null && String(data.maxuses).trim() !== "") {
      const n = parseNumberInput(data.maxuses);
      if (Number.isFinite(n) && n > 0) maxUses = Math.floor(n);
    }

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
      discountType,
      discountValue,
      discountPercentage: discountType === "percentage" ? discountValue : 0,
      discountAmount: discountType === "fixed" ? discountValue : 0,
      minimumAmount: parseNumberInput(data?.minimumamount) || 0,
      maxUses,
      productType: "all",
      applicableCategories: isAll ? [] : cats.map((c) => c.value),
    };
  };

  const validatePayload = (coupon_data: ReturnType<typeof buildPayload>) => {
    if (!neverExpires && !coupon_data.endTime) {
      notifyError("Please select an end date or enable Never Expire");
      return false;
    }
    if (discountType === "fixed") {
      if (
        !Number.isFinite(coupon_data.discountAmount) ||
        coupon_data.discountAmount <= 0
      ) {
        notifyError("Enter a valid discount amount in ₹ (e.g. 100)");
        return false;
      }
    } else if (
      !Number.isFinite(coupon_data.discountPercentage) ||
      coupon_data.discountPercentage <= 0
    ) {
      notifyError("Enter a valid discount percentage (e.g. 10)");
      return false;
    }
    if (
      !Number.isFinite(coupon_data.minimumAmount) ||
      coupon_data.minimumAmount < 0
    ) {
      notifyError("Enter a valid minimum order amount in ₹ (e.g. 500)");
      return false;
    }
    return true;
  };

  const handleCouponSubmit = async (data: any) => {
    try {
      const coupon_data = buildPayload(data);
      if (!validatePayload(coupon_data)) return;
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
      setDiscountType("percentage");
      setSelectedCategories([]);
      reset();
    } catch (error) {
      console.log(error);
      notifyError("Something went wrong");
    }
  };

  const handleSubmitEditCoupon = async (data: any, id: string) => {
    try {
      const coupon_data = buildPayload(data);
      if (!validatePayload(coupon_data)) return;
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
    discountType,
    setDiscountType,
    handleGenerateCode,
    selectedCategories,
    setSelectedCategories,
    handleSubmitEditCoupon,
    setEditId,
  };
};

export default useCouponSubmit;
