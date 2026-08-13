/* eslint-disable @next/next/no-img-element */

"use client";
import { AdditionalInfo, ProductFormData, Variant } from "@/types/product-type";
import { useState, useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import VariantModal from "./variant-product-modal";
import Breadcrumb from "../../breadcrumb/breadcrumb";
import ProductCategory from "../../category/product-category";
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
      productHighlights: "",
      fabricCare: "",
      youtube_video_Id: "",
      tags: "",
      sizes: "",
      offerStartDate: "",
      offerEndDate: "",
      featured: false,
      newArrival: false,
      bestSeller: false,
    },
  });
  
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [variantError, setVariantError] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>([]);
  const [productSizes, setProductSizes] = useState<string[]>([]);
  const [sizeStock, setSizeStock] = useState<Record<string, number>>({});
  const [sizeStockDirty, setSizeStockDirty] = useState(false);
  const [initialSizes, setInitialSizes] = useState<string[]>([]);
  const [sizeGuides, setSizeGuides] = useState<{ _id: string; title: string }[]>([]);
  const [selectedSizeGuide, setSelectedSizeGuide] = useState<string>("");

  const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/size-guide/show`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSizeGuides(data.data || []);
      })
      .catch(() => {});
  }, []);

  const toggleSize = (size: string) => {
    setSizeStockDirty(true);
    setProductSizes((prev) => {
      if (prev.includes(size)) {
        setSizeStock((stock) => {
          const next = { ...stock };
          delete next[size];
          return next;
        });
        return prev.filter((s) => s !== size);
      }
      setSizeStock((stock) => ({ ...stock, [size]: stock[size] ?? 0 }));
      return [...prev, size];
    });
  };

  const setSizeQuantity = (size: string, raw: string) => {
    const n = Math.max(0, Math.floor(Number(raw) || 0));
    setSizeStockDirty(true);
    setSizeStock((prev) => ({ ...prev, [size]: n }));
  };

  const sizeInventoryPayload = productSizes.map((size) => ({
    size,
    quantity: Math.max(0, Number(sizeStock[size]) || 0),
  }));
  const sizeStockTotal = sizeInventoryPayload.reduce(
    (sum, row) => sum + row.quantity,
    0
  );

  const handleAddVariant = () => {
    setIsModalOpen(true);
  };

  const handleSaveVariant = (variantData: Variant) => {
    if (!variantData.img) {
      setVariantError("Gallery image is required");
      return;
    }

    let newVariants = [...variants];

    if (newVariants.length === 0) {
      variantData.isDefault = true;
    }

    if (variantData.isDefault) {
      newVariants = newVariants.map(v => ({ ...v, isDefault: false }));
    }

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
      productHighlights: productEdit.productHighlights ?? "",
      fabricCare: productEdit.fabricCare ?? "",
      youtube_video_Id: productEdit.videoId ?? "",
      tags: (productEdit.tags ?? []).join(", "),
      sizes: productEdit.sizes ?? "",
      offerStartDate: formatDateForInput (productEdit.offerDate?.startDate),
      offerEndDate: formatDateForInput(productEdit.offerDate?.endDate),
      featured: !!productEdit.featured,
      newArrival: !!productEdit.newArrival,
      bestSeller: !!productEdit.bestSeller,
    });

    if (Array.isArray(productEdit.imageURLs)) {
      const v = productEdit.imageURLs.map((imgObj: any) => ({
        color: imgObj?.color?.name ?? "",
        colorCode: imgObj?.color?.clrCode ?? "",
        img: imgObj.img ?? "",
        size: "",
        isDefault: !!imgObj.isDefault,
      }));
      setVariants(v);
    } else {
      setVariants([]);
    }

    const loadedSizes: string[] = Array.isArray(productEdit.sizes)
      ? productEdit.sizes
      : typeof productEdit.sizes === "string" && productEdit.sizes
        ? productEdit.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
    setProductSizes(loadedSizes);
    setInitialSizes(loadedSizes);
    setSizeStockDirty(false);

    const invMap: Record<string, number> = {};
    if (Array.isArray(productEdit.sizeInventory)) {
      productEdit.sizeInventory.forEach((row: { size?: string; quantity?: number }) => {
        const key = String(row?.size || "").trim();
        if (key) invMap[key] = Math.max(0, Number(row.quantity) || 0);
      });
    }
    const nextStock: Record<string, number> = {};
    loadedSizes.forEach((size: string) => {
      nextStock[size] = invMap[size] ?? 0;
    });
    setSizeStock(nextStock);

    const sg = productEdit.sizeGuide;
    setSelectedSizeGuide(
      typeof sg === "string" ? sg : sg?._id ? String(sg._id) : ""
    );

    setAdditionalInfo(productEdit.additionalInformation ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productEdit]);

  // Memoize default values to prevent unnecessary resets in child components
  const categoryDefaultValue = useMemo(() => ({
    id: productEdit?.category?.id || "",
    parent: productEdit?.parent || "",
    children: productEdit?.children || "",
  }), [productEdit]);

  useEffect(() => {
    if (productSizes.length > 0) {
      setValue("quantity", sizeStockTotal, { shouldValidate: true });
    }
  }, [productSizes.length, sizeStockTotal, setValue]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // Validate variants
    if (variants.length === 0) {
      notifyError("At least one gallery image is required");
      return;
    }
    if (!data.parent || !data.category?.id) {
      notifyError("Please select a category");
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
      formData.append(
        "quantity",
        (productSizes.length > 0 ? sizeStockTotal : data.quantity).toString()
      );
      formData.append("parent", data.parent);
      formData.append("children", "");
      formData.append("status", data.status);
      formData.append("productType", "general");
      formData.append("newArrival", data.newArrival ? "true" : "false");
      formData.append("bestSeller", data.bestSeller ? "true" : "false");
      formData.append("description", data.description);
      formData.append("productHighlights", data.productHighlights || "");
      formData.append("fabricCare", data.fabricCare || "");
      formData.append("videoId", data.youtube_video_Id || "");
      formData.append("featured", data.featured ? "true" : "false");

      formData.append("brand", JSON.stringify({
        name: "",
        id: null,
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
        color: v.color || "",
        colorCode: v.colorCode || "",
        size: "",
        isDefault: v.isDefault || false,
        img: typeof v.img === "string" ? v.img : "",
      }));
      formData.append("variants", JSON.stringify(variantsData));
      formData.append("sizes", JSON.stringify(productSizes));
      const sizesChanged =
        JSON.stringify([...productSizes].sort()) !==
        JSON.stringify([...initialSizes].sort());
      if (!productEdit?._id || sizeStockDirty || sizesChanged) {
        formData.append("sizeInventory", JSON.stringify(sizeInventoryPayload));
      }
      formData.append("sizeGuide", selectedSizeGuide || "");

      if (productEdit && productEdit._id) {
        const oldImages = (productEdit.imageURLs || []).map((img: any) => img.img);
        formData.append("oldImages", JSON.stringify(oldImages));
      }

      variants.forEach((variant, index) => {
        if (variant.img instanceof File) {
          formData.append(`variant_image_${index}`, variant.img);
        }
      });

      const apiUrl = "/api/product";
      const method = "POST";
      if (productEdit && productEdit._id) {
        formData.append("productId", String(productEdit._id));
      }

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
                  required: productSizes.length === 0 ? "Quantity is required" : false,
                  min: {
                    value: 0,
                    message: "Quantity cannot be negative",
                  },
                })}
                className="input w-full h-[44px] rounded-md border border-gray6 px-6 text-base focus:border-blue-500"
                placeholder="0"
                disabled={isSubmitting || productSizes.length > 0}
                readOnly={productSizes.length > 0}
              />
              {productSizes.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Total stock from selected sizes
                </p>
              )}
              {errors.quantity && (
                <p className="text-red mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <ProductCategory
              register={register}
              setValue={setValue}
              default_value={categoryDefaultValue}
              parentErr={errors.parent?.message}
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

          {/* Product Gallery */}
          <div className="border border-gray2 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Product Gallery <span className="text-red">*</span>
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="tp-btn px-5 py-2"
                disabled={isSubmitting}
              >
                <span className="text-lg">+</span>
                Add image
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
                        Colour
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Default
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
                            alt="Gallery"
                            className="w-12 h-12 object-cover rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          {variant.color ? (
                            <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <span
                                className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                style={{ background: variant.colorCode || "#ccc" }}
                              />
                              {variant.color}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
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

          {/* Product Sizes */}
          <div className="border border-gray2 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Sizes</h3>
            <p className="text-sm text-gray-500 mb-3">
              Select available sizes for this product (shown on product page).
            </p>
            <div className="flex flex-wrap gap-3">
              {SIZE_OPTIONS.map((size) => (
                <label
                  key={size}
                  className={`cursor-pointer px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    productSizes.includes(size)
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray6 text-gray-700 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={productSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                    disabled={isSubmitting}
                  />
                  {size}
                </label>
              ))}
            </div>
            {productSizes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {productSizes.map((size) => (
                  <label
                    key={`qty-${size}`}
                    className="inline-flex items-center gap-2 border border-gray6 rounded-md px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-800 min-w-[28px]">{size}</span>
                    <input
                      type="number"
                      min={0}
                      value={sizeStock[size] ?? 0}
                      onChange={(e) => setSizeQuantity(size, e.target.value)}
                      className="input w-16 h-9 rounded-md border border-gray6 px-2 text-center text-sm"
                      disabled={isSubmitting}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Size Guide */}
          <div className="border border-gray2 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Size Guide</h3>
            <p className="text-sm text-gray-500 mb-3">
              Attach a reusable size chart (create charts under Size Guides in the sidebar).
            </p>
            <select
              value={selectedSizeGuide}
              onChange={(e) => setSelectedSizeGuide(e.target.value)}
              className="input w-full h-[44px] rounded-md border border-gray6 px-4 text-base"
              disabled={isSubmitting}
            >
              <option value="">No size guide</option>
              {sizeGuides.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.title}
                </option>
              ))}
            </select>
            {sizeGuides.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">
                No size guides yet — add one from the Size Guides menu first.
              </p>
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

          {/* Product Highlights — accordion on product page */}
          <div className="mb-4">
            <label className="block font-medium mb-1.5">Product Highlights</label>
            <p className="text-xs text-gray-400 mb-2">
              Shows under buttons → Product Highlights accordion on the product page.
            </p>
            <textarea
              {...register("productHighlights")}
              rows={4}
              className="input h-[100px] resize-none w-full py-3 text-base"
              placeholder={"Soft premium fabric\nBreathable all-day comfort\nEasy everyday styling"}
              disabled={isSubmitting}
            />
          </div>

          {/* Fabric & Care — accordion on product page */}
          <div className="mb-4">
            <label className="block font-medium mb-1.5">Fabric & Care</label>
            <p className="text-xs text-gray-400 mb-2">
              Shows under buttons → Fabric & Care accordion on the product page.
            </p>
            <textarea
              {...register("fabricCare")}
              rows={4}
              className="input h-[100px] resize-none w-full py-3 text-base"
              placeholder={"Machine wash cold\nDo not bleach\nTumble dry low\nWarm iron if needed"}
              disabled={isSubmitting}
            />
          </div>

          {/* Style Highlights (gallery overlay on 2nd image) */}
          <div className="border border-gray2 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Style Highlights</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Overlay on the 2nd gallery image (e.g. Composition, GSM, Color, Fit).
                </p>
              </div>
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
                      placeholder="Key (e.g., Composition)"
                      className="flex-1 px-4 py-2.5 border border-gray2 rounded-lg focus:outline-none focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      value={info.value}
                      onChange={(e) => handleAdditionalInfoChange(index, "value", e.target.value)}
                      placeholder="Value (e.g., 100% Cotton)"
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

          {/* Visible on Home */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Visible on Home
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newArrival"
                  {...register("newArrival")}
                  className="w-4 h-4 text-blue-600 border-gray3 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="newArrival" className="text-sm text-gray-700">
                  New Arrival
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bestSeller"
                  {...register("bestSeller")}
                  className="w-4 h-4 text-blue-600 border-gray3 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor="bestSeller" className="text-sm text-gray-700">
                  Best Seller
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              You can select both. When orders start coming, Best Sellers will switch to automatic ranking.
            </p>
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