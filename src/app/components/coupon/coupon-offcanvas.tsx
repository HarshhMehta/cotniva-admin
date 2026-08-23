import React from "react";
import { CloseTwo } from "@/svg";
import {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import CouponFormField from "../brand/form-field-two";
import CouponCategorySelect, {
  CouponCategoryOption,
} from "./coupon-category-select";

type IPropType = {
  propsItems: {
    openSidebar: boolean;
    setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
    handleCouponSubmit: (data: any) => void;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    handleSubmit: UseFormHandleSubmit<any, undefined>;
    control: Control;
    neverExpires: boolean;
    setNeverExpires: React.Dispatch<React.SetStateAction<boolean>>;
    discountType: "percentage" | "fixed";
    setDiscountType: React.Dispatch<
      React.SetStateAction<"percentage" | "fixed">
    >;
    handleGenerateCode: () => void;
    selectedCategories: CouponCategoryOption[];
    setSelectedCategories: React.Dispatch<
      React.SetStateAction<CouponCategoryOption[]>
    >;
  };
};

const CouponOffcanvas = ({ propsItems }: IPropType) => {
  const {
    openSidebar,
    setOpenSidebar,
    errors,
    handleCouponSubmit,
    handleSubmit,
    register,
    neverExpires,
    setNeverExpires,
    discountType,
    setDiscountType,
    handleGenerateCode,
    selectedCategories,
    setSelectedCategories,
  } = propsItems;

  return (
    <>
      <div
        className={`offcanvas-area fixed top-0 right-0 h-full max-h-[100dvh] bg-white w-[320px] sm:w-[440px] z-[999] shadow-md translate-x-[calc(100%+80px)] transition duration-300 flex flex-col overflow-hidden ${
          openSidebar ? "offcanvas-opened" : ""
        }`}
      >
        <form
          onSubmit={handleSubmit((data) => handleCouponSubmit(data))}
          className="flex flex-col h-full min-h-0"
        >
          <div className="flex items-center space-x-3 py-4 px-6 border-b border-gray6 shrink-0 bg-white z-10">
            <button
              type="button"
              onClick={() => setOpenSidebar(false)}
              className="text-black offcanvas-close-btn"
            >
              <CloseTwo />
            </button>
            <div>
              <p className="mb-0 text-[16px] font-semibold text-[#1f1f1f]">
                Create Coupon
              </p>
              <p className="mb-0 text-xs text-[#888]">
                Discount code for your Cotniva store (₹)
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-5 pb-6">
            <CouponFormField
              register={register}
              errors={errors}
              name="Name"
              isReq={true}
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
                  placeholder="E.G. SAVE20"
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="shrink-0 h-[44px] px-4 rounded-md border border-gray6 text-sm font-medium text-[#4a1f1a] hover:bg-[#faf8f7]"
                >
                  Generate
                </button>
              </div>
              {errors?.code ? (
                <p className="text-danger text-xs mt-1">
                  {(errors.code.message as string) || ""}
                </p>
              ) : null}
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">
                Discount Type <span className="text-danger">*</span>
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
                Discount Value <span className="text-danger">*</span>
              </p>
              <input
                {...register("discountvalue", {
                  required: "Discount value is required!",
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
                type="text"
                inputMode="decimal"
                placeholder={discountType === "fixed" ? "e.g. 100" : "e.g. 20"}
              />
              <p className="mb-0 mt-1 text-xs text-[#888]">
                {discountType === "fixed"
                  ? "Enter ₹ amount (e.g. 100 for ₹100 off)"
                  : "Enter % off (e.g. 20 for 20% off)"}
              </p>
              {errors?.discountvalue ? (
                <p className="text-danger text-xs mt-1">
                  {(errors.discountvalue.message as string) || ""}
                </p>
              ) : null}
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
                placeholder="0"
                defaultValue={0}
              />
              <p className="mb-0 mt-1 text-xs text-[#888]">
                Cart subtotal must be at least this much in ₹
              </p>
            </div>

            <div className="mb-5">
              <p className="mb-0 text-sm font-medium text-[#1f1f1f]">Max Uses</p>
              <input
                {...register("maxuses")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base mt-1"
                type="number"
                min={1}
                step={1}
                placeholder="Leave blank = unlimited"
              />
              <p className="mb-0 mt-1 text-xs text-[#888]">
                How many times this code can be used in total
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
                />
              ) : (
                <div className="h-[44px] rounded-md border border-dashed border-[#d9cfc9] bg-[#faf8f7] px-4 flex items-center text-sm text-[#6b6b6b]">
                  Leave blank = never expires
                </div>
              )}
              {!neverExpires && errors?.endtime ? (
                <p className="text-danger text-xs mt-1">
                  {(errors.endtime.message as string) || ""}
                </p>
              ) : null}
            </div>

            <CouponCategorySelect
              value={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>

          <div className="flex items-center gap-3 py-4 px-6 shrink-0 bg-white border-t border-gray6">
            <button
              type="submit"
              className="tp-btn flex-1 items-center justify-center"
            >
              Create Coupon
            </button>
            <button
              type="button"
              onClick={() => setOpenSidebar(false)}
              className="tp-btn flex-1 items-center justify-center border border-gray6 bg-white text-black hover:text-white hover:border-danger hover:bg-danger"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <div
        onClick={() => setOpenSidebar(false)}
        className={`body-overlay fixed bg-black/40 top-0 left-0 w-full h-full z-[60] invisible opacity-0 transition-all duration-300 ${
          openSidebar ? "opened" : ""
        }`}
      ></div>
    </>
  );
};

export default CouponOffcanvas;
