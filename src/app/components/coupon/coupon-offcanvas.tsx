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
                Add Coupon
              </p>
              <p className="mb-0 text-xs text-[#888]">
                Create a discount code for your store
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
            <CouponFormField
              register={register}
              errors={errors}
              name="Code"
              isReq={true}
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
                  placeholder="End date"
                />
              ) : (
                <div className="h-[44px] rounded-md border border-dashed border-[#d9cfc9] bg-[#faf8f7] px-4 flex items-center text-sm text-[#6b6b6b]">
                  This coupon will not expire
                </div>
              )}
              {!neverExpires && errors?.endtime ? (
                <p className="text-danger text-xs mt-1">
                  {(errors.endtime.message as string) || ""}
                </p>
              ) : null}
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
                />
                {errors?.discountpercentage ? (
                  <p className="text-danger text-xs mt-1">
                    {(errors.discountpercentage.message as string) || ""}
                  </p>
                ) : null}
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
                />
                {errors?.minimumamount ? (
                  <p className="text-danger text-xs mt-1">
                    {(errors.minimumamount.message as string) || ""}
                  </p>
                ) : null}
              </div>
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
              Add Coupon
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
