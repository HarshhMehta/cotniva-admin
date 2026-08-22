"use client";
import React, { useMemo } from "react";
import ReactSelect, { MultiValue, SingleValue, StylesConfig } from "react-select";
import { useGetAllCategoriesQuery } from "@/redux/category/categoryApi";
import ErrorMsg from "../common/error-msg";

export type CouponCategoryOption = {
  value: string;
  label: string;
};

type Props = {
  value: CouponCategoryOption[];
  onChange: (opts: CouponCategoryOption[]) => void;
  error?: string;
};

const ALL_OPTION: CouponCategoryOption = {
  value: "all",
  label: "All categories",
};

const selectStyles: StylesConfig<CouponCategoryOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderRadius: 8,
    borderColor: state.isFocused ? "#4a1f1a" : "#e5e5e5",
    boxShadow: state.isFocused ? "0 0 0 1px #4a1f1a" : "none",
    "&:hover": { borderColor: "#4a1f1a" },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 10000,
  }),
  menu: (base) => ({
    ...base,
    zIndex: 10000,
    borderRadius: 8,
    overflow: "hidden",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f3ebe7",
    borderRadius: 6,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#4a1f1a",
    fontWeight: 600,
    fontSize: 12,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#4a1f1a",
    cursor: "pointer",
    ":hover": { backgroundColor: "#4a1f1a", color: "#fff" },
  }),
};

const CouponCategorySelect = ({ value, onChange, error }: Props) => {
  const { data, isLoading, isError } = useGetAllCategoriesQuery();

  const options = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.result || [];
    const cats = (list as any[])
      .filter((c) => c?._id && c?.parent)
      .map((c) => ({
        value: String(c._id),
        label: String(c.parent),
      }));
    return [ALL_OPTION, ...cats];
  }, [data]);

  const handleChange = (
    next: MultiValue<CouponCategoryOption> | SingleValue<CouponCategoryOption>
  ) => {
    // Allow empty — user can clear "All" and pick specific categories
    const arr = Array.isArray(next) ? [...next] : next ? [next] : [];
    if (!arr.length) {
      onChange([]);
      return;
    }

    const last = arr[arr.length - 1];
    // Picking All clears everything else
    if (last.value === "all") {
      onChange([ALL_OPTION]);
      return;
    }
    // Picking a category drops All if it was selected
    onChange(arr.filter((o) => o.value !== "all"));
  };

  return (
    <div className="mb-2">
      <p className="mb-1.5 text-sm font-medium text-[#1f1f1f]">Categories</p>
      <p className="mb-2 text-xs text-[#6b6b6b]">
        Choose <strong>All categories</strong> for whole store, or pick specific
        ones. You can clear and re-select anytime.
      </p>
      <ReactSelect
        isMulti
        isClearable
        isLoading={isLoading}
        options={options}
        value={value}
        onChange={handleChange}
        placeholder="Select categories…"
        classNamePrefix="coupon-cat"
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
        styles={selectStyles}
      />
      {isError ? <ErrorMsg msg="Could not load categories" /> : null}
      {error ? <ErrorMsg msg={error} /> : null}
    </div>
  );
};

export default CouponCategorySelect;
export { ALL_OPTION };
