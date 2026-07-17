import axios from "axios";
import { notifyError } from "./toast";

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axios.post("/add-img", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // axios sets the boundary for you
    },
  });

  console.log("Response:", res.data);
  return res.data?.url; // depends on your backend response
}

export const handleUpload = async (file: File) => {
  try {
    const url = await uploadImage(file); // call function above
    console.log("Uploaded image URL:", url);
    return url;
  } catch (err) {
    console.error(err);
    notifyError("Image upload failed");
  }
};

export const getDefaultVariant = (variants: any[]) => {
  return variants.find((variant) => variant.isDefault) || variants[0];
}

// Helper function to format date to YYYY-MM-DD
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch {
    return "";
  }
};