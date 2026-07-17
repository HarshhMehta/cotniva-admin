import React,{useEffect, useState} from "react";
import ReactSelect from "react-select";
import { FieldErrors, Controller, Control } from "react-hook-form";
import ErrorMsg from "../../common/error-msg";

import { ProductFormData } from "@/types/product-type";
import { UseFormSetValue } from "react-hook-form";



type Props = {
  register: any; // from react-hook-form
  setValue: UseFormSetValue<ProductFormData>;
  default_value?: string; // e.g. "electronics"
};

const options = [
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "jewelry", label: "Jewelry" },
];

export default function ProductTypeSelect({
  register,
  setValue,
  default_value,
}: Props) {
  const [selectedType, setSelectedType] = useState<string>(default_value ?? "");

  useEffect(() => {
    if (default_value) {
      setValue("productType", default_value);
      setSelectedType(default_value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedType(value);
    setValue("productType", value);
  };

  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1.5">
        Product Type <span className="text-red">*</span>
      </label>

      <select
        {...register("productType", { required: "Product type is required" })}
        value={selectedType}
        onChange={handleChange}
        className="w-full h-[44px] rounded-md border border-gray6 px-4 text-base focus:border-blue-500 bg-white"
      >
        <option value="">-- Select product type --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}



// product type two
type IPropTypeTwo = {
  errors: FieldErrors<any>;
  control: Control;
  setSelectProductType: React.Dispatch<React.SetStateAction<string>>;
  default_value?:string;
};

export const ProductTypeTwo = ({
  errors,
  control,
  default_value,
  setSelectProductType,
}: IPropTypeTwo) => {
  // handleSelectProduct
  const handleSelectProduct = (value: string) => {
    setSelectProductType(value);
  };
  // set default product
  useEffect(() => {
    if(default_value){
      setSelectProductType(default_value)
    }
  }, [default_value, setSelectProductType])
  
  return (
    <>
      <Controller
        name="productType"
        control={control}
        rules={{
          required: default_value
            ? false
            : "productType is required!",
        }}
        render={({ field }) => (
          <ReactSelect
            {...field}
            value={field.value}
            defaultValue={
              default_value
                ? {
                    label: default_value,
                    value: default_value,
                  }
                : {
                    label: "Select..",
                    value: 0,
                  }
            }
            onChange={(selectedOption) => {
              field.onChange(selectedOption);
              handleSelectProduct(selectedOption?.value);
            }}
            options={[
              { value: "electronics", label: "Electronics" },
              { value: "fashion", label: "Fashion" },
              { value: "beauty", label: "Beauty" },
              { value: "jewelry", label: "Jewelry" },
            ]}
          />
        )}
      />
      <ErrorMsg msg={errors?.productType?.message as string} />
    </>
  );
};


