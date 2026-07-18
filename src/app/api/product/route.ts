import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "../../../utils/cloudinaryUpload"; // Adjust path

/**
 * POST /api/products
 * Create a new product with image uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();

    // Extract basic fields
    const title = formData.get("title") as string;
    const sku = formData.get("sku") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const discount = formData.get("discount") as string;
    const quantity = formData.get("quantity") as string;
    const parent = formData.get("parent") as string;
    const children = formData.get("children") as string;
    const status = formData.get("status") as string;
    const productType = formData.get("productType") as string;
    const description = formData.get("description") as string;
    const videoId = formData.get("videoId") as string;
    const featured = formData.get("featured") === "true";
    const newArrival = formData.get("newArrival") === "true";

    // Extract nested objects (sent as JSON strings)
    const brand = JSON.parse(formData.get("brand") as string);
    const category = JSON.parse(formData.get("category") as string);
    const offerDate = JSON.parse(formData.get("offerDate") as string || "{}");
    const tags = JSON.parse(formData.get("tags") as string || "[]");
    const additionalInformation = JSON.parse(
      formData.get("additionalInformation") as string || "[]"
    );

    // Validate required fields
    if (!title || !unit || !price || !quantity || !parent || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }


    if (!category?.name || !category?.id) {
      return NextResponse.json(
        { success: false, message: "Category name and ID are required" },
        { status: 400 }
      );
    }

    // Process variants with image uploads
    const variantsData = JSON.parse(formData.get("variants") as string || "[]");
    
    if (!variantsData || variantsData.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one product variant is required" },
        { status: 400 }
      );
    }

    // Upload variant images to Cloudinary
    const imageURLs = await Promise.all(
      variantsData.map(async (variant: any, index: number) => {
        const imageFile = formData.get(`variant_image_${index}`) as File | null;
        
        let imageUrl = variant.img; // Use existing URL if no new file

        // If there's a new image file, upload it
        if (imageFile && imageFile instanceof File) {
          try {
            imageUrl = await uploadImageToCloudinary(imageFile, "shofy-products");
          } catch (uploadError) {
            console.error(`Error uploading image for variant ${index}:`, uploadError);
            throw new Error(`Failed to upload image for variant ${index}`);
          }
        }

        return {
          img: imageUrl,
          isDefault: variant.isDefault || false,
        };
      })
    );

    // Check if at least one default variant exists
    const hasDefault = imageURLs.some((img) => img.isDefault === true);
    if (!hasDefault && imageURLs.length > 0) {
      imageURLs[0].isDefault = true;
    }

    const sizes = JSON.parse(formData.get("sizes") as string || "[]");

    // Prepare product payload for external server
    const productPayload = {
      sku: sku || "",
      title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      unit,
      imageURLs,
      parent,
      children: children || "",
      price: Number(price),
      discount: Number(discount) || 0,
      quantity: Number(quantity),
      brand: {
        name: brand?.name || "",
        id: brand?.id || null,
      },
      category: {
        name: category.name,
        id: category.id,
      },
      status: status || "in-stock",
      productType: (productType || "general").toLowerCase(),
      description,
      videoId: videoId || "",
      additionalInformation,
      tags,
      sizes,
      offerDate: {
        startDate: offerDate?.startDate || null,
        endDate: offerDate?.endDate || null,
      },
      featured,
      newArrival,
    };

    // console.log(productPayload,'productPayload');

    // Send to external server
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to create product",
          errors: result.errors,
        },
        { status: response.status }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}