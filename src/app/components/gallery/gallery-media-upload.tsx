"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useUploadMediaMutation } from "@/redux/cloudinary/cloudinaryApi";
import Loading from "../common/loading";
import upload_default from "@assets/img/icons/upload.png";
import { GalleryMediaType } from "@/hooks/useGallerySubmit";
import { notifyError, notifySuccess } from "@/utils/toast";
import {
  compressGalleryFile,
  formatBytes,
} from "@/utils/compress-media";

type Props = {
  mediaType: GalleryMediaType;
  mediaUrl: string;
  setMediaUrl: React.Dispatch<React.SetStateAction<string>>;
  isSubmitted: boolean;
  setIsSubmitted?: React.Dispatch<React.SetStateAction<boolean>>;
  inputId?: string;
};

const GalleryMediaUpload = ({
  mediaType,
  mediaUrl,
  setMediaUrl,
  isSubmitted,
  setIsSubmitted,
  inputId = "galleryMedia",
}: Props) => {
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [isCompressing, setIsCompressing] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [sizeHint, setSizeHint] = useState<string>("");

  const busy = isCompressing || isUploading;

  useEffect(() => {
    if (busy && setIsSubmitted) setIsSubmitted(false);
  }, [busy, setIsSubmitted]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === "image" && !file.type.startsWith("image/")) {
      return notifyError("Please select an image file (png, jpg, jpeg, webp)");
    }
    if (mediaType === "video" && !file.type.startsWith("video/")) {
      return notifyError("Please select a video file (mp4, webm, mov)");
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setMediaUrl("");
    setSizeHint("");

    try {
      setIsCompressing(true);
      const result = await compressGalleryFile(file, mediaType);
      setIsCompressing(false);

      if (!result.skipped) {
        setSizeHint(
          `Compressed ${formatBytes(result.originalSize)} → ${formatBytes(
            result.compressedSize
          )}`
        );
        URL.revokeObjectURL(preview);
        setLocalPreview(URL.createObjectURL(result.file));
      } else {
        setSizeHint(`Size ${formatBytes(result.originalSize)}`);
      }

      const formData = new FormData();
      formData.append("file", result.file);

      const res = await uploadMedia(formData).unwrap();
      const url = res?.data?.url;
      if (!url) {
        setLocalPreview("");
        return notifyError("Upload failed — no URL returned");
      }
      setMediaUrl(url);
      notifySuccess(
        mediaType === "video" ? "Video uploaded" : "Image uploaded"
      );
    } catch (err: any) {
      setLocalPreview("");
      setMediaUrl("");
      setSizeHint("");
      const msg =
        err?.data?.message || err?.error || "Upload failed. Please try again.";
      notifyError(msg);
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const previewUrl = mediaUrl || localPreview;

  return (
    <div className="mb-6">
      <p className="mb-2 text-base text-black">
        {mediaType === "video" ? "Upload Video" : "Upload Image"}
      </p>
      <div className="text-center mb-3">
        {busy ? (
          <Loading loading={busy} spinner="scale" />
        ) : isSubmitted && !previewUrl ? (
          <Image src={upload_default} alt="upload" width={100} height={91} />
        ) : previewUrl && mediaType === "video" ? (
          <video
            src={previewUrl}
            className="mx-auto rounded-md max-h-40 bg-black"
            muted
            playsInline
            controls
          />
        ) : previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="preview"
            className="mx-auto rounded-md max-h-40 object-cover"
          />
        ) : (
          <Image src={upload_default} alt="upload" width={100} height={91} />
        )}
      </div>
      {isCompressing && (
        <p className="text-tiny text-center text-gray-500 mb-2">
          Compressing {mediaType === "video" ? "video" : "image"}… please wait
        </p>
      )}
      {isUploading && (
        <p className="text-tiny text-center text-gray-500 mb-2">
          Uploading… wait until it finishes before saving.
        </p>
      )}
      {sizeHint && !busy && (
        <p className="text-tiny text-center text-gray-500 mb-2">{sizeHint}</p>
      )}
      {mediaUrl && !busy && (
        <p className="text-tiny text-center text-green-600 mb-2">
          Ready to save
        </p>
      )}
      <span className="text-tiny text-center w-full inline-block mb-3">
        {mediaType === "video"
          ? "(mp4 / webm / mov — auto-compressed before upload)"
          : "(png / jpg / jpeg / webp — auto-compressed before upload)"}
      </span>
      <div>
        <input
          onChange={handleUpload}
          type="file"
          id={inputId}
          className="hidden"
          accept={mediaType === "video" ? "video/*" : "image/*"}
          disabled={busy}
        />
        <label
          htmlFor={inputId}
          className={`text-tiny w-full inline-block py-1 px-4 rounded-md border border-gray6 text-center hover:cursor-pointer hover:bg-theme hover:text-white hover:border-theme transition ${
            busy ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {mediaType === "video" ? "Choose Video" : "Choose Image"}
        </label>
      </div>
    </div>
  );
};

export default GalleryMediaUpload;
