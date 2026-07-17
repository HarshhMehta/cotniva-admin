/* eslint-disable @next/next/no-img-element */

"use client";
import { AdditionalInfo, ProductFormData, Variant } from "@/types/product-type";
import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import VariantModal from "./variant-product-modal";
import Breadcrumb from "../../breadcrumb/breadcrumb";
import ProductCategory from "../../category/product-category";
import BrandSelect from "./product-type-brand";
import ProductTypeSelect from "./product-type";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRouter } from "next/navigation";
import { formatDateForInput } from "@/utils/utils";

type IProps = {
  productEdit?: any | null;
}

// Main Product Form Component
export default function ProductForm({ productEdit }: IProps) {
  const router = useRouter();
  
  // Add loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProductFormData>({
    defaultValues: {
      title: "",
      sku: "",
      unit: "",
      price: 0,
      discount_percentage: 0,
      quantity: 0,
      parent: "",
      children: "",
      brand: {
        name: "",
        id: "",
      },
      category: {
        name: "",
        id: "",
      },
      status: "in-stock",
      productType: "",
      description: "",
      youtube_video_Id: "",
      tags: "",
      sizes: "",
      offerStartDate: "",
      offerEndDate: "",
      featured: false,
    },
  });
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [variantError, setVariantError] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([]);

  const handleAddVariant = () => {
    setIsModalOpen(true);
  };

  const handleSaveVariant = (variantData: Variant) => {
    // validation
    if (!variantData.color?.trim()) {
      setVariantError("Variant color is required");
      return;
    }
    if (!variantData.img) {
      setVariantError("Variant image is required");
      return;
    }

    let newVariants = [...variants];

    // CASE 1: No variants yet → make this one default automatically
    if (newVariants.length === 0) {
      variantData.isDefault = true;
    }

    // CASE 2: User selected "isDefault" manually → clear defaults
    if (variantData.isDefault) {
      newVariants = newVariants.map(v => ({ ...v, isDefault: false }));
    }

    // push new variant
    newVariants.push(variantData);

    setVariants(newVariants);
    setVariantError("");
  };


  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddAdditionalInfo = () => {
    setAdditionalInfo([...additionalInfo, { key: "", value: "" }]);
  };

  const handleRemoveAdditionalInfo = (index: number) => {
    setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
  };

  const handleAdditionalInfoChange = (index: number, field: "key" | "value", value: string) => {
    const updated = additionalInfo.map((info, i) => {
      if (i === index) {
        return { ...info, [field]: value };
      }
      return info;
    });
    setAdditionalInfo(updated);
  };

  // populate form when editing
  useEffect(() => {
    if (!productEdit) return;
    reset({
      title: productEdit.title ?? "",
      sku: productEdit.sku ?? "",
      unit: productEdit.unit ?? "",
      price: productEdit.price ?? 0,
      discount_percentage: productEdit.discount ?? 0,
      quantity: productEdit.quantity ?? 0,
      parent: productEdit.parent ?? "",
      children: productEdit.children ?? "",
      brand: {
        name: productEdit.brand?.name ?? "",
        id: productEdit.brand?.id ?? "",
      },
      category: {
        name: productEdit.category?.name ?? "",
        id: productEdit.category?.id ?? "",
      },
      status: productEdit.status ?? "in-stock",
      productType: productEdit.productType ?? "",
      description: productEdit.description ?? "",
      youtube_video_Id: productEdit.videoId ?? "",
      tags: (productEdit.tags ?? []).join(", "),
      sizes: productEdit.sizes ?? "",
      offerStartDate: formatDateForInput (productEdit.offerDate?.startDate),
      offerEndDate: formatDateForInput(productEdit.offerDate?.endDate),
      featured: !!productEdit.featured,
    });

    if (Array.isArray(productEdit.imageURLs)) {
      const v = productEdit.imageURLs.map((imgObj: any) => ({
        color: imgObj.color?.name ?? "",
        img: imgObj.img ?? "",
        size: (imgObj.sizes ?? []).join(","),
        isDefault: !!imgObj.isDefault,
      }));
      setVariants(v);
    } else {
      setVariants([]);
    }

    setAdditionalInfo(productEdit.additionalInformation ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productEdit]);

  // Memoize default values to prevent unnecessary resets in child components
  const categoryDefaultValue = useMemo(() => ({
    id: productEdit?.category?.id || "",
    parent: productEdit?.parent || "",
    children: productEdit?.children || "",
  }), [productEdit]);

  const brandDefaultValue = useMemo(() => ({
    id: productEdit?.brand?.id || "",
    name: productEdit?.brand?.name || "",
  }), [productEdit]);

  const productTypeDefaultValue = useMemo(() => productEdit?.productType || "", [productEdit]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // Validate variants
    if (variants.length === 0) {
      notifyError("At least one product variant is required");
      return;
    }
    if(!data.parent || !data.children) {
      notifyError("Please select a valid category");
      return;
    }
 

    // Set loading state to true
    setIsSubmitting(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Add basic fields
      formData.append("title", data.title);
      formData.append("sku", data.sku || "");
      formData.append("unit", data.unit);
      formData.append("price", data.price.toString());
      formData.append("discount", (data.discount_percentage || 0).toString());
      formData.append("quantity", data.quantity.toString());
      formData.append("parent", data.parent);
      formData.append("children", data.children);
      formData.append("status", data.status);
      formData.append("productType", (data.productType || "").toLowerCase());
      formData.append("newArrival", data.newArrival ? "true" : "false");
      formData.append("description", data.description);
      formData.append("videoId", data.youtube_video_Id || "");
      formData.append("featured", data.featured ? "true" : "false");

      formData.append("brand", JSON.stringify({
        name: data.brand?.name || null,
        id: data.brand?.id || null,  // "" ki jagah null
      }));

      formData.append("category", JSON.stringify({
        name: data.category?.name,
        id: data.category?.id,
      }));

      formData.append("offerDate", JSON.stringify({
        startDate: data.offerStartDate || null,
        endDate: data.offerEndDate || null,
      }));

      const tags = data.tags ? data.tags.split(",").map((t) => t.trim()) : [];
      formData.append("tags", JSON.stringify(tags));

      const additionalInformation = additionalInfo.filter(
        (info) => info.key?.trim() && info.value?.trim()
      );
      formData.append("additionalInformation", JSON.stringify(additionalInformation));

      const variantsData = variants.map((v) => ({
        color: v.color,
        colorCode: "",
        size: v.size || "",
        isDefault: v.isDefault || false,
        img: typeof v.img === "string" ? v.img : "",
      }));
      formData.append("variants", JSON.stringify(variantsData));

      if (productEdit && productEdit._id) {
        const oldImages = (productEdit.imageURLs || []).map((img: any) => img.img);
        formData.append("oldImages", JSON.stringify(oldImages));
      }

      variants.forEach((variant, index) => {
        if (variant.img instanceof File) {
          formData.append(`variant_image_${index}`, variant.img);
        }
      });

      const apiUrl = productEdit && productEdit._id
        ? `/api/product/${productEdit._id}`
        : "/api/product";

      const method = productEdit && productEdit._id ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = result.message || "Failed to save product";
        notifyError(typeof message === "string" ? message : "Failed to save product");
        return;
      }

      notifySuccess(
        productEdit ? "Product updated successfully" : "Product created successfully"
      );

      reset();
      setVariants([]);
      setAdditionalInfo([]);

      router.push("/product-grid");
    } catch (err) {
      console.error(err);
      notifyError("An unexpected error occurred");
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <Breadcrumb title={productEdit ? "Edit Product" : "Add Product"} subtitle={
        productEdit ? "Edit your product details" : "Add a new product"
      } />
      
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Product Title <span className="text-red">*</span>
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  minLength: { value: 3, message: "Title must be at least 3 characters" },
                  maxLength: { value: 200, message: "Title is too long" },
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="Enter product title"
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-red mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">SKU</label>
              <input
                {...register("sku")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="Enter SKU"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Unit <span className="text-red">*</span>
              </label>
              <input
                {...register("unit", { required: "Unit is required" })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="e.g., pcs, kg, ltr"
                disabled={isSubmitting}
              />
              {errors.unit && (
                <p className="text-red mt-1">{errors.unit.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Price <span className="text-red">*</span>
              </label>
              <input
                type="number"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be at least 1" },
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="text-red mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Discount Percentage
              </label>
              <input
                type="number"
                step="0.01"
                {...register("discount_percentage", {
                  min: { value: 0, message: "Discount cannot be negative" },
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.discount_percentage && (
                <p className="text-red mt-1">{errors.discount_percentage.message}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Quantity <span className="text-red">*</span>
              </label>
              <input
                type="number"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 1, message: "Quantity greater than 0" },
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="0"
                disabled={isSubmitting}
              />
              {errors.quantity && (
                <p className="text-red mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <ProductCategory
              register={register}
              setValue={setValue}
              default_value={categoryDefaultValue}
              parentErr={errors.parent?.message}
              childrenErr={errors.children?.message}
            />

            <BrandSelect
              register={register}
              setValue={setValue}
              default_value={brandDefaultValue}
            />

            <ProductTypeSelect
              register={register}
              setValue={setValue}
              default_value={productTypeDefaultValue}
            />

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Status <span className="text-red">*</span>
              </label>
              <select
                {...register("status")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                disabled={isSubmitting}
              >
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          {/* Offer Dates */}
          <div className="border border-gray2 rounded-lg p-4 my-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Offer Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Offer Start Date
                </label>
                <input
                  type="date"
                  {...register("offerStartDate")}
                  className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1.5">
                  Offer End Date
                </label>
                <input
                  type="date"
                  {...register("offerEndDate")}
                  className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Product Variants Section */}
          <div className="border border-gray2 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Product Variants <span className="text-red">*</span>
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="tp-btn px-5 py-2"
                disabled={isSubmitting}
              >
                <span className="text-lg">+</span>
                Add item
              </button>
            </div>

            {variantError && (
              <p className="text-red mb-3">{variantError}</p>
            )}

            {variants.length > 0 && (
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray2 border-b border-gray2">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Thumbnail
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Color
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Size
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Is Default
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={index} className="border-b border-gray2 bg-white">
                        <td className="py-3 px-4">
                          <img
                            src={
                              typeof variant.img === "string"
                                ? variant.img
                                : URL.createObjectURL(variant.img)
                            }
                            alt="Variant"
                            className="w-12 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div>{variant.color}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {variant.size || "-"}
                        </td>
                        <td className="py-3 px-4">
                          {variant.isDefault && (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-red hover:border-red hover:text-white transition-colors"
                            disabled={isSubmitting}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block font-medium mb-1.5">
              Description <span className="text-red">*</span>
            </label>
            <textarea
              {...register("description", { required: "Description is required" })}
              rows={4}
              className="input h-[120px] resize-none w-full py-3 text-base"
              placeholder="Enter product description"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Additional Information */}
          <div className="border border-gray2 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
              <button
                type="button"
                onClick={handleAddAdditionalInfo}
                className="tp-btn px-5 py-2"
                disabled={isSubmitting}
              >
                <span className="text-lg">+</span>
                Add Info
              </button>
            </div>

            {additionalInfo.length > 0 && (
              <div className="space-y-3">
                {additionalInfo.map((info, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={info.key}
                      onChange={(e) => handleAdditionalInfoChange(index, "key", e.target.value)}
                      placeholder="Key (e.g., Weight)"
                      className="flex-1 px-4 py-2.5 border border-gray2 rounded-lg focus:outline-none focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      value={info.value}
                      onChange={(e) => handleAdditionalInfoChange(index, "value", e.target.value)}
                      placeholder="Value (e.g., 180g)"
                      className="flex-1 px-4 py-2.5 border border-gray2 rounded-lg focus:outline-none focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalInfo(index)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-red hover:border-red hover:text-white transition-colors"
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags, Sizes and Video */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                {...register("tags")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="e.g., phone, mobile, electronics"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1.5">
                YouTube Video ID
              </label>
              <input
                {...register("youtube_video_Id")}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="Enter YouTube video ID"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              {...register("featured")}
              className="w-4 h-4 text-blue-600 border-gray3 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="featured" className="">
              Featured Product
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t border-gray2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? "Saving..." : (productEdit ? "Update Product" : "Create Product")}
            </button>
          </div>
        </form>
      </div>

      {/* Variant Modal */}
      <VariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVariant}
      />
    </div>
  );
}