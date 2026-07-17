

// ProductCategory.tsx
import { useGetAllCategoriesQuery } from "@/redux/category/categoryApi";
import { ProductFormData } from "@/types/product-type";
import React, { useEffect, useMemo, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

type Props = {
  register: any;
  setValue: UseFormSetValue<ProductFormData>;
  default_value?: {
    parent: string;
    id: string;
    children: string;
  };
  parentErr?: string;
  childrenErr?: string;
};

export default function ProductCategory({ register, setValue, default_value,childrenErr,parentErr }: Props) {
  const { data: categories, isLoading, isError } = useGetAllCategoriesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedChild, setSelectedChild] = useState<string>("");

  // Derive children list for selected parent
  const parentChildren = useMemo(() => {
    if (!categories?.result || !selectedParentId) return [] as string[];
    const parent = categories.result.find((c: any) => c._id === selectedParentId);
    return (parent?.children as string[]) || [];
  }, [categories, selectedParentId]);

  // Initialize form values when categories are loaded AND default_value exists
  useEffect(() => {
    if (default_value && categories?.result) {
      
      // Set local state
      setSelectedParentId(default_value.id);
      setSelectedChild(default_value.children);

      // Set form values
      setValue("parent", default_value.parent);
      setValue("children", default_value.children);
      setValue("category", {
        name: default_value.parent,
        id: default_value.id,
      });
    }
  }, [default_value, categories, setValue]);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    
    setSelectedParentId(id);

    // Find parent name
    const parentItem = categories?.result.find((c: any) => c._id === id);
    const parentName = parentItem ? parentItem.parent : "";

    // Update form fields
    setValue("parent", parentName);
    setValue("category", {
      name: parentName,
      id: id,
    });

    // Clear child selection when parent changes
    setSelectedChild("");
    setValue("children", "");
  };

  const handleChildChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const child = e.target.value;
    setSelectedChild(child);
    setValue("children", child);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-gray-700 mb-1.5">
            Parent Category <span className="text-red">*</span>
          </label>
          <div className="h-[44px] flex items-center px-4 rounded-md border border-gray6 bg-gray-50">
            Loading categories...
          </div>
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-1.5">
            Children Category <span className="text-red">*</span>
          </label>
          <div className="h-[44px] flex items-center px-4 rounded-md border border-gray6 bg-gray-50">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !categories?.success) {
    return (
      <div className="col-span-2">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          Unable to load categories. Please try again.
        </div>
      </div>
    );
  }

  const categoryItems: any[] = categories.result ?? [];

  return (
    <>
      {/* Parent Category */}
      <div>
        <label className="block font-medium text-gray-700 mb-1.5">
          Parent Category <span className="text-red">*</span>
        </label>
        <select
          value={selectedParentId}
          onChange={handleParentChange}
          className="w-full h-[44px] rounded-md border border-gray6 px-4 text-base focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="">-- Select parent category --</option>
          {categoryItems.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.parent}
            </option>
          ))}
        </select>
        
        {/* Hidden inputs for react-hook-form */}
        {parentErr && <p className="text-red mt-1">{parentErr}</p>}
      </div>

      {/* Children Category */}
      <div>
        <label className="block font-medium text-gray-700 mb-1.5">
          Children Category <span className="text-red">*</span>
        </label>
        <select
          value={selectedChild}
          onChange={handleChildChange}
          disabled={!selectedParentId || parentChildren.length === 0}
          className="w-full h-[44px] rounded-md border border-gray6 px-4 text-base focus:border-blue-500 focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {!selectedParentId
              ? "-- Select parent first --"
              : parentChildren.length === 0
              ? "-- No children available --"
              : "-- Select child category --"}
          </option>

          {parentChildren.map((child: string, idx: number) => (
            <option key={idx} value={child}>
              {child}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}