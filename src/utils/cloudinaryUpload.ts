import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export async function uploadImageToCloudinary(file: File, folder: string = "shofy-uploads"): Promise<string> {
  const bytes = await file.arrayBuffer(); // Convert File to ArrayBuffer
  const buffer = Buffer.from(bytes); // Convert ArrayBuffer to Buffer

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result?.secure_url as string);
        }
      }
    );

    uploadStream.end(buffer); // Upload the buffer
  });
}


export async function deleteImageFromCloudinary(imageUrl: string) {
  // Extract the public ID
  const regex = /\/upload\/(?:v\d+\/)?([^/.]+(?:\/[^/.]+)*)/;
  const matches = imageUrl.match(regex);

  if (matches && matches[1]) {
    const publicId = matches[1];
    return cloudinary.uploader.destroy(publicId);
  } else {
    throw new Error("Invalid Cloudinary URL");
  }
}



