"use client";
import React, { useEffect } from "react";
import CouponTable from "./coupon-table";
import useCouponSubmit from "@/hooks/useCouponSubmit";
import { useGetCouponQuery } from "@/redux/coupon/couponApi";
import Loading from "../common/loading";
import ErrorMsg from "../common/error-msg";
import CouponFormField from "../brand/form-field-two";
import CouponCategorySelect, {
  ALL_OPTION,
} from "./coupon-category-select";
import dayjs from "dayjs";

const CouponEditArea = ({ id }: { id: string }) => {
  const {
    errors,
    handleSubmit,
    register,
    setOpenSidebar,
    neverExpires,
    setNeverExpires,
    discountType,
    setDiscountType,
    handleGenerateCode,
    selectedCategories,
    setSelectedCategories,
    handleSubmitEditCoupon,
    setValue,
  } = useCouponSubmit();

  const { data: coupon, isError, isLoading } = useGetCouponQuery(id);

  useEffect(() => {
    if (!coupon) return;
    setNeverExpires(Boolean(coupon.neverExpires));
    const type =
      String(coupon.discountType || "percentage").toLowerCase() === "fixed"
        ? "fixed"
        : "percentage";
    setDiscountType(type);
    if (coupon.endTime && !coupon.neverExpires) {
      setValue("endtime", dayjs(coupon.endTime).format("YYYY-MM-DD"));
    }
    const discountVal =
      type === "fixed"
        ? coupon.discountAmount ?? coupon.discountPercentage
        : coupon.discountPercentage;
    setValue("discountvalue", discountVal);
    setValue("minimumamount", coupon.minimumAmount ?? 0);
    setValue(
      "maxuses",
      coupon.maxUses != null && Number(coupon.maxUses) > 0
        ? coupon.maxUses
        : ""
    );
    setValue(
      "maxusesperuser",
      coupon.maxUsesPerUser != null && Number(coupon.maxUsesPerUser) > 0
        ? coupon.maxUsesPerUser
        : ""
    );
    const cats = Array.isArray(coupon.applicableCategories)
      ? coupon.applicableCategories
      : [];
    if (cats.length > 0) {
      setSelectedCategories(
        cats.map((c: any) => ({
          value: String(c?._id || c),
          label: String(c?.parent || c?.name || "Category"),
        }))
      );
    } else {
      setSelectedCategories([ALL_OPTION]);
    }
  }, [
    coupon,
    setNeverExpires,
    setDiscountType,
    setSelectedCategories,
    setValue,
  ]);

  let content = null;
  if (isLoading) {
    content = <Loading loading={isLoading} spinner="fade" />;
  }
  if (!coupon && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (coupon && !isError) {
    content = (
      <div className="col-span-12 lg:col-span-4">
        <form
          onSubmit={handleSubmit((data) => handleSubmitEditCoupon(data, id))}
        >
          <div className="mb-6 bg-white px-6 py-6 rounded-md shadow-xs">
            <h3 className="text-lg font-semibold text-[#1f1f1f] mb-1">
              Edit Coupon
            </h3>
            <p className="text-xs text-[#888] mb-5">
              Update discount settings (amounts in ₹)
            </p>

            <CouponFormField
              register={register}
              errors={errors}
              name="Name"
              isReq={true}
              default_val={coupon.title}
            />

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Coupon Code <span className="text-danger">*</span>
              </p>
              <div className="flex gap-2 mt-1">
                <input
                  {...register("code", { required: "Coupon code is required!" })}
                  className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base uppercase"
                  type="text"
                  defaultValue={coupon.couponCode}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="shrink-0 h-[44px] px-4 rounded-md border border-gray6 text-sm font-medium text-[#4a1f1a]"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Discount Type
              </p>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(
                    e.target.value === "fixed" ? "fixed" : "percentage"
                  )
                }
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (₹)</option>
              </select>
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Discount Value
              </p>
              <input
                {...register("discountvalue", {
                  required: "Discount value is required!",
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
                type="text"
                inputMode="decimal"
                defaultValue={
                  String(coupon.discountType || "").toLowerCase() === "fixed"
                    ? coupon.discountAmount ?? coupon.discountPercentage
                    : coupon.discountPercentage
                }
              />
              <p className="mb-0 mt-1 text-xs text-[#888]">
                {discountType === "fixed"
                  ? "Enter ₹ amount"
                  : "Enter % off"}
              </p>
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Min Order Amount (₹)
              </p>
              <input
                {...register("minimumamount")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
                type="text"
                inputMode="decimal"
                defaultValue={coupon.minimumAmount}
              />
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Per Customer Limit
              </p>
              <input
                {...register("maxusesperuser")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 1"
                defaultValue={
                  coupon.maxUsesPerUser != null && Number(coupon.maxUsesPerUser) > 0
                    ? coupon.maxUsesPerUser
                    : undefined
                }
              />
              <p className="mb-0 mt-1 text-xs text-[#888]">
                Har customer kitni baar (1 = welcome / first order only)
              </p>
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Max Total Uses (all customers)
              </p>
              <input
                {...register("maxuses")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
                type="number"
                min={1}
                step={1}
                placeholder="Leave blank = unlimited"
                defaultValue={
                  coupon.maxUses != null && Number(coupon.maxUses) > 0
                    ? coupon.maxUses
                    : undefined
                }
              />
              <p className="mb-0 mt-1 text-xs text-[#888]">
                Used {Number(coupon.usedCount) || 0}
                {coupon.maxUses != null && Number(coupon.maxUses) > 0
                  ? ` / ${coupon.maxUses} total`
                  : " (unlimited total)"}
                {coupon.maxUsesPerUser != null && Number(coupon.maxUsesPerUser) > 0
                  ? ` · ${coupon.maxUsesPerUser} per customer`
                  : ""}
              </p>
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                  Expires At
                </p>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={neverExpires}
                    onChange={(e) => setNeverExpires(e.target.checked)}
                    className="w-4 h-4 accent-[#4a1f1a] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#4a1f1a]">
                    Never expire
                  </span>
                </label>
              </div>
              {!neverExpires ? (
                <input
                  {...register("endtime", {
                    required: neverExpires ? false : "End date is required!",
                  })}
                  className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base"
                  type="date"
                  defaultValue={
                    coupon.endTime
                      ? dayjs(coupon.endTime).format("YYYY-MM-DD")
                      : ""
                  }
                />
              ) : (
                <div className="h-[44px] rounded-md border border-dashed border-[#d9cfc9] bg-[#faf8f7] px-4 flex items-center text-sm text-[#6b6b6b]">
                  This coupon will not expire
                </div>
              )}
            </div>

            <CouponCategorySelect
              value={selectedCategories}
              onChange={setSelectedCategories}
            />

            <button type="submit" className="tp-btn px-7 py-2 mt-2">
              Save Coupon
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {content}
      <div className="col-span-12 lg:col-span-8">
        <div className="relative overflow-x-auto bg-white px-8 py-4 rounded-md">
          <div className="overflow-scroll 2xl:overflow-visible">
            <CouponTable
              cls="w-[975px] 2xl:w-full"
              setOpenSidebar={setOpenSidebar}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponEditArea;
