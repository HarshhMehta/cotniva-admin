
import { useGetAllBrandsQuery } from "@/redux/brand/brandApi";
import { ProductFormData } from "@/types/product-type";
import React, { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

type Props = {
  register: any; // from react-hook-form
  setValue: UseFormSetValue<ProductFormData>;
  default_value?: {
    id: string;
    name: string;
  };
};

export default function BrandSelect({ register, setValue, default_value }: Props) {
  const { data: brands, isLoading, isError } = useGetAllBrandsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [selectedBrandId, setSelectedBrandId] = useState<string>(default_value?.id ?? "");

  // initialize default value if provided
  useEffect(() => {
    if (default_value && brands?.result) {
      setValue("brand", {
        name: default_value.name,
        id: default_value.id
      });
      setSelectedBrandId(default_value.id);
    }
  }, [default_value, brands, setValue]);

  const handleBrandChange = (id:string) => {
    setSelectedBrandId(id);

    const brandItem = brands?.result.find((b: any) => b._id === id);
    const brandName = brandItem ? brandItem.name : "";

    // update form fields
    setValue("brand", {
      name: brandName,
      id: brandItem?._id as string,
    });
  };

  if (isLoading) {
    return (
      <div>
        <label className="block font-medium text-gray-700 mb-1.5">
          Brand <span className="text-red">*</span>
        </label>
        <div className="h-11 flex items-center px-3 rounded-md border border-gray6">
          Loading brands...
        </div>
      </div>
    );
  }

  if (isError || !brands?.success) {
    return (
      <div>
        <label className="block font-medium text-gray-700 mb-1.5">
          Brand <span className="text-red">*</span>
        </label>
        <div className="h-11 flex items-center px-3 rounded-md border border-gray6 text-red">
          Unable to load brands
        </div>
      </div>
    );
  }

  const brandItems = brands.result ?? [];

  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1.5">
        Brand <span className="text-red">*</span>
      </label>
      <select
        value={selectedBrandId}
        onChange={(e) => handleBrandChange(e.target.value)}
        className="w-full h-[44px] rounded-md border border-gray6 px-4 text-base focus:border-blue-500 bg-white"
      >
        <option value="">-- Select brand --</option>
        {brandItems.map((brand: any) => (
          <option key={brand._id} value={brand._id}>
            {brand.name}
          </option>
        ))}
      </select>
    </div>
  );
}
