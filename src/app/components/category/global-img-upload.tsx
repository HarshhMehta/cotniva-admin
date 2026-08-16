import React, { useEffect, useState } from "react";
import Image from "next/image";
import useUploadImage from "@/hooks/useUploadImg";
import upload_default from "@assets/img/icons/upload.png";
import Loading from "../common/loading";
import UploadImage from "../products/add-product/upload-image";
import { notifyError } from "@/utils/toast";

// prop type
type IPropType = {
  setImage: React.Dispatch<React.SetStateAction<string>>;
  isSubmitted: boolean;
  default_img?: string;
  image?: string;
  setIsSubmitted?: React.Dispatch<React.SetStateAction<boolean>>;
  label?: string;
  inputId?: string;
  /** Reject uploads smaller than this (mobile slider sharpness) */
  minWidth?: number;
  minHeight?: number;
  hint?: string;
};

const readImageSize = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });

const GlobalImgUpload = ({
  setImage,
  isSubmitted,
  default_img,
  image,
  setIsSubmitted,
  label = "Upload Image",
  inputId = "categoryImage",
  minWidth,
  minHeight,
  hint,
}: IPropType) => {
  const { handleImageUpload, uploadData, isError, isLoading } = useUploadImage();
  const [sizeNote, setSizeNote] = useState<string>("");
  const showDefaultImage = !uploadData && !isLoading && !isError && default_img;

  const upload_img = isLoading ? (
    <Loading loading={isLoading} spinner="scale" />
  ) : uploadData?.data.url ? (
    <UploadImage
      file={{
        url: uploadData.data.url,
        id: uploadData.data.id,
      }}
      isCenter={true}
      setImgUrl={setImage}
    />
  ) : showDefaultImage ? (
    <Image src={default_img} alt="upload-img" width={100} height={91} />
  ) : (
    <Image src={upload_default} alt="upload-img" width={100} height={91} />
  );

  // set upload image
  useEffect(() => {
    if (isLoading && setIsSubmitted) {
      setIsSubmitted(false);
    }
  }, [isLoading, setIsSubmitted]);

  useEffect(() => {
    if (uploadData && !isError && !isLoading) {
      setImage(uploadData.data.url);
    } else if (default_img) {
      setImage(default_img);
    }
  }, [default_img, uploadData, isError, isLoading, setImage]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (minWidth || minHeight) {
      try {
        const { width, height } = await readImageSize(file);
        setSizeNote(`${width}×${height}px`);
        if (
          (minWidth && width < minWidth) ||
          (minHeight && height < minHeight)
        ) {
          notifyError(
            `Image is ${width}×${height}px — too small. Use at least ${minWidth || 0}×${minHeight || 0}px or phones will look blurry.`
          );
          e.target.value = "";
          return;
        }
      } catch {
        // If size can't be read, still allow upload
      }
    }

    handleImageUpload(e);
  };

  return (
    <div className="mb-6">
      <p className="mb-2 text-base text-black">{label}</p>
      <div className="text-center">
        {isSubmitted ? (
          <Image
            src={upload_default}
            alt="upload-img"
            width={100}
            height={91}
          />
        ) : (
          upload_img
        )}
      </div>
      <span className="text-tiny text-center w-full inline-block mb-3">
        (Only png* jpg* jpeg* webp/ will be accepted)
      </span>
      {hint ? (
        <p className="text-xs text-amber-700 text-center mb-2">{hint}</p>
      ) : null}
      {sizeNote ? (
        <p className="text-xs text-gray-500 text-center mb-2">
          Last selected: {sizeNote}
        </p>
      ) : null}
      <div className="">
        <input
          onChange={onFileChange}
          type="file"
          name="image"
          id={inputId}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
        />
        <label
          htmlFor={inputId}
          className="text-tiny w-full inline-block py-1 px-4 rounded-md border border-gray6 text-center hover:cursor-pointer hover:bg-theme hover:text-white hover:border-theme transition"
        >
          Upload Image
        </label>
      </div>
    </div>
  );
};

export default GlobalImgUpload;
