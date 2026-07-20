/** Client-side gallery media compression before Cloudinary upload */

const IMAGE_MAX_WIDTH = 1600;
const IMAGE_QUALITY = 0.72;
const VIDEO_MAX_WIDTH = 720;
const VIDEO_BITRATE = 1_600_000; // ~1.6 Mbps
const SKIP_COMPRESS_UNDER_BYTES = 800 * 1024; // already small enough

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

export type CompressResult = {
  file: File;
  originalSize: number;
  compressedSize: number;
  skipped: boolean;
};

export async function compressImage(file: File): Promise<CompressResult> {
  const originalSize = file.size;
  if (originalSize <= SKIP_COMPRESS_UNDER_BYTES) {
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_MAX_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY)
  );

  if (!blob || blob.size >= originalSize) {
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  }

  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  const compressed = new File([blob], name, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  return {
    file: compressed,
    originalSize,
    compressedSize: compressed.size,
    skipped: false,
  };
}

const pickRecorderMime = () => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "";
};

export async function compressVideo(file: File): Promise<CompressResult> {
  const originalSize = file.size;

  // Tiny files / no MediaRecorder → skip
  if (
    originalSize <= 2 * 1024 * 1024 ||
    typeof MediaRecorder === "undefined" ||
    typeof document === "undefined"
  ) {
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  }

  const mimeType = pickRecorderMime();
  if (!mimeType) {
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not read video"));
    });

    const scale = Math.min(1, VIDEO_MAX_WIDTH / (video.videoWidth || VIDEO_MAX_WIDTH));
    const outW = Math.max(2, Math.round((video.videoWidth || 640) * scale) & ~1);
    const outH = Math.max(2, Math.round((video.videoHeight || 360) * scale) & ~1);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { file, originalSize, compressedSize: originalSize, skipped: true };
    }

    // Prefer drawing frames ourselves so we can downscale reliably
    const fps = 24;
    const canvasStream = canvas.captureStream(fps);

    // Try to keep audio from original
    try {
      const media = (video as HTMLVideoElement & {
        captureStream?: () => MediaStream;
        mozCaptureStream?: () => MediaStream;
      }).captureStream?.() ||
        (video as HTMLVideoElement & { mozCaptureStream?: () => MediaStream })
          .mozCaptureStream?.();
      media?.getAudioTracks().forEach((t) => canvasStream.addTrack(t));
    } catch {
      /* no audio track — fine for gallery loops */
    }

    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: VIDEO_BITRATE,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };

    const done = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () =>
        resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
      recorder.onerror = () => reject(new Error("Video compress failed"));
    });

    video.currentTime = 0;
    await video.play();
    recorder.start(200);

    await new Promise<void>((resolve) => {
      const draw = () => {
        if (video.paused || video.ended) {
          resolve();
          return;
        }
        ctx.drawImage(video, 0, 0, outW, outH);
        requestAnimationFrame(draw);
      };
      video.onended = () => resolve();
      draw();
    });

    if (recorder.state !== "inactive") recorder.stop();
    canvasStream.getTracks().forEach((t) => t.stop());
    video.pause();

    const blob = await done;
    if (!blob.size || blob.size >= originalSize * 0.95) {
      return { file, originalSize, compressedSize: originalSize, skipped: true };
    }

    const ext = mimeType.includes("mp4") ? "mp4" : "webm";
    const compressed = new File(
      [blob],
      file.name.replace(/\.\w+$/, "") + `-compressed.${ext}`,
      { type: blob.type, lastModified: Date.now() }
    );

    return {
      file: compressed,
      originalSize,
      compressedSize: compressed.size,
      skipped: false,
    };
  } catch {
    return { file, originalSize, compressedSize: originalSize, skipped: true };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function compressGalleryFile(
  file: File,
  mediaType: "image" | "video"
): Promise<CompressResult> {
  if (mediaType === "video" || file.type.startsWith("video/")) {
    return compressVideo(file);
  }
  return compressImage(file);
}

export { formatBytes };
