// ProductCategory.tsx — single parent category only
import { useGetAllCategoriesQuery } from "@/redux/category/categoryApi";
import { ProductFormData } from "@/types/product-type";
import React, { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

type Props = {
  register: any;
  setValue: UseFormSetValue<ProductFormData>;
  default_value?: {
    parent: string;
    id: string;
    children?: string;
  };
  parentErr?: string;
};

export default function ProductCategory({
  register,
  setValue,
  default_value,
  parentErr,
}: Props) {
  const { data: categories, isLoading, isError } = useGetAllCategoriesQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  useEffect(() => {
    if (default_value && categories?.result) {
      setSelectedParentId(default_value.id);
      setValue("parent", default_value.parent);
      setValue("children", "");
      setValue("category", {
        name: default_value.parent,
        id: default_value.id,
      });
    }
  }, [default_value, categories, setValue]);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedParentId(id);

    const parentItem = categories?.result.find((c: any) => c._id === id);
    const parentName = parentItem ? parentItem.parent : "";

    setValue("parent", parentName);
    setValue("children", "");
    setValue("category", {
      name: parentName,
      id: id,
    });
  };

  if (isLoading) {
    return (
      <div>
        <label className="block font-medium text-gray-700 mb-1.5">
          Category <span className="text-red">*</span>
        </label>
        <div className="h-[44px] flex items-center px-4 rounded-md border border-gray6 bg-gray-50">
          Loading categories...
        </div>
      </div>
    );
  }

  if (isError || !categories?.success) {
    return (
      <div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          Unable to load categories. Please try again.
        </div>
      </div>
    );
  }

  const categoryItems: any[] = categories.result ?? [];

  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1.5">
        Category <span className="text-red">*</span>
      </label>
      <select
        value={selectedParentId}
        onChange={handleParentChange}
        className="w-full h-[44px] rounded-md border border-gray6 px-4 text-base focus:border-blue-500 focus:outline-none bg-white"
      >
        <option value="">-- Select category --</option>
        {categoryItems.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.parent}
          </option>
        ))}
      </select>
      {parentErr && <p className="text-red mt-1">{parentErr}</p>}
    </div>
  );
}
