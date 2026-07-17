/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";

interface ImageUploadProps {
  label?: string;
  required?: boolean;
  images?: (File | string)[] | null;
  setImages: (files: File[] | null) => void;
  multiple?: boolean;
  showTitle?: boolean;
  setColor?: (color: string) => void;
  defaultColor?: string;
  showPrevimg?: boolean;
  col?: string;
}

export default function ImageUpload({
  label,
  required,
  images = null,
  setImages,
  multiple = false,
  showTitle = false,
  setColor,
  error,
  errorMessage,
  defaultColor,
  showPrevimg = true,
  col = "grid-cols-1",
}: ImageUploadProps & { error?: boolean; errorMessage?: string }) {
  // const [previews, setPreviews] = useState<string[]>(
  //   images
  //     ? images.map((file) =>
  //         typeof file === "string" ? file : URL.createObjectURL(file)
  //       )
  //     : []
  // );
  const [previews, setPreviews] = useState<string[]>(() => {
    if (!images) return [];
    return images.map((file) => {
      if (typeof file === "string") return file;
      if (file instanceof File) return URL.createObjectURL(file);
      return "";
    });
  });
  const [color, setColorState] = useState<string>(defaultColor || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultColor) {
      setColorState(defaultColor);
    }
  }, [defaultColor]);

  useEffect(() => {
    const fileInput = fileInputRef.current;
    const colorInput = colorRef.current;
    return () => {
      if (fileInput) fileInput.value = "";
      if (colorInput) colorInput.value = "";
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];

    if (multiple) {
      setImages(files);
      // Revoke previous URLs before setting new ones
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    } else {
      const file = files.length > 0 ? files[0] : null;
      console.log(file,'file');

      // Revoke previous preview URL if any
      if (previews.length > 0) {
        URL.revokeObjectURL(previews[0]);
      }
      setImages(file ? [file] : null);
      setPreviews(file ? [URL.createObjectURL(file)] : []);
    }
  };
  return (
    <div>
      <div className={`grid gap-5 ${col}`}>
        <div>
          <label className="block font-normal mb-1.5">
            {label ?? "Image Upload"}{" "}
            {required && <span className="text-red">*</span>}
          </label>

          <div
            className={`relative flex items-center w-full rounded-lg h-11 border ${
              error ? "border-red" : "border-gray6"
            }  overflow-hidden h-[46px]`}
          >
            <span className="flex items-center justify-center h-full px-4 font-medium bg-blue/10 text-blue whitespace-nowrap">
              Choose File
            </span>
            <span className="flex-1 px-4 truncate text-dark-5">
              {fileInputRef.current?.files?.length
                ? Array.from(fileInputRef.current.files)
                    .map((f) => f.name)
                    .join(", ")
                : "No file chosen"}
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />

            {error && <p className=" text-red mt-1.5">{errorMessage}</p>}
          </div>

          {/* Previews */}
          {showPrevimg && previews.length > 0 && (
            <div
              className={`grid gap-3 my-3 ${
                multiple ? "grid-cols-3" : "grid-cols-1"
              }`}
            >
              {previews.map((src, index) => {
                const isCloudinaryImage = src.startsWith(
                  "https://res.cloudinary.com"
                );

                return (
                  <div key={index} className="relative">
                    <div className="w-16 h-16">
                      <img
                        src={src}
                        alt={`Preview ${index}`}
                        className="border rounded-full size-16"
                      />
                    </div>
                    {!isCloudinaryImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviews((prevPreviews) => {
                            if (!isCloudinaryImage) {
                              URL.revokeObjectURL(prevPreviews[index]);
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                            return prevPreviews.filter((_, i) => i !== index);
                          });
                          setImages(null);
                        }}
                        className="absolute top-0 right-0 inline-flex items-center justify-center duration-200 ease-out border rounded-lg size-8 bg-gray border-gray3 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red p-1"
                      >
                        <span className="sr-only">Remove image</span>
                        &#10005;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {showTitle && setColor && (
          <div>
            <label className="block font-normal text-gray-600 mb-1.5">
              Color
            </label>
            <input
              ref={colorRef}
              value={color}
              type="text"
              onChange={(e) => {
                setColorState(e.target.value);
                setColor(e.target.value);
              }}
              placeholder="Enter color name"
              className="rounded-lg border border-gray-3  placeholder:text-dark-5 w-full py-2.5 px-4 h-11 focus:ring-0 duration-200 focus:border-blue focus:outline-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}
