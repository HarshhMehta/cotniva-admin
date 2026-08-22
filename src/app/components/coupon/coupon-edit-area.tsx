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
    selectedCategories,
    setSelectedCategories,
    handleSubmitEditCoupon,
    setValue,
  } = useCouponSubmit();

  const { data: coupon, isError, isLoading } = useGetCouponQuery(id);

  useEffect(() => {
    if (!coupon) return;
    setNeverExpires(Boolean(coupon.neverExpires));
    if (coupon.endTime && !coupon.neverExpires) {
      setValue("endtime", dayjs(coupon.endTime).format("YYYY-MM-DD"));
    }
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
  }, [coupon, setNeverExpires, setSelectedCategories, setValue]);

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
              Update discount settings and category scope
            </p>

            <CouponFormField
              register={register}
              errors={errors}
              name="Name"
              isReq={true}
              default_val={coupon.title}
            />
            <CouponFormField
              register={register}
              errors={errors}
              name="Code"
              isReq={true}
              default_val={coupon.couponCode}
            />

            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                  End date
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

            <div className="grid grid-cols-2 gap-3">
              <div className="mb-5">
                <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                  Discount %
                </p>
                <input
                  {...register("discountpercentage", {
                    required: "Discount percentage is required!",
                  })}
                  className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 10"
                  defaultValue={coupon.discountPercentage}
                />
              </div>
              <div className="mb-5">
                <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                  Minimum amount
                </p>
                <input
                  {...register("minimumamount", {
                    required: "Minimum amount is required!",
                  })}
                  className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 500"
                  defaultValue={coupon.minimumAmount}
                />
              </div>
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
