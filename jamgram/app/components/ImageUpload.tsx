"use client";
import { useState, DragEvent, ChangeEvent } from "react";

export default function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const revokePreviewUrl = () => {
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const updatePreviewUrl = (blob: Blob) => {
    const nextUrl = URL.createObjectURL(blob);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return nextUrl;
    });
  };

  const isHeicFile = (file: File) => {
    return /image\/hei(c|f)/i.test(file.type) || /\.hei(c|f)$/i.test(file.name);
  };

  const convertHeicToJpeg = async (file: File) => {
    if (typeof window === "undefined" || typeof window.createImageBitmap !== "function") {
      throw new Error("HEIC conversion is not supported in this browser.");
    }

    const imageBitmap = await window
      .createImageBitmap(file)
      .catch(() => null as ImageBitmap | null);

    if (!imageBitmap) {
      throw new Error("HEIC conversion is not supported in this browser.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const context = canvas.getContext("2d");

    if (!context) {
      imageBitmap.close?.();
      throw new Error("Unable to prepare HEIC preview context.");
    }

    context.drawImage(imageBitmap, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to create preview from HEIC image."));
        }
      }, "image/jpeg");
    });

    imageBitmap.close?.();

    return blob;
  };

  const handleFileUpload = async (file: File) => {
    setSelectedImage(file);
    setErrorMessage(null);

    if (isHeicFile(file)) {
      setIsConverting(true);
      try {
        const previewBlob = await convertHeicToJpeg(file);
        updatePreviewUrl(previewBlob);
      } catch (conversionError) {
        console.error("Failed to convert HEIC image", conversionError);
        setSelectedImage(null);
        revokePreviewUrl();
        setErrorMessage("We couldn't convert your HEIC image. Please try another file.");
      } finally {
        setIsConverting(false);
      }
      return;
    }

    updatePreviewUrl(file);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFileUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileUpload(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    revokePreviewUrl();
    setErrorMessage(null);
    setIsConverting(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-white/10 bg-[#cda8ff]/20 p-8 text-white shadow-[0_0_25px_#a855f7]/30 backdrop-blur-md">
      <h2 className="text-2xl font-semibold text-white/90">Upload Your Image</h2>
      <p className="text-sm text-purple-100 text-center">
        Drag & drop an image here, or click to select one 📸
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex h-64 w-full flex-col items-center justify-center rounded-3xl border border-dashed transition ${
          isDragging
            ? "border-purple-400 bg-purple-600/30"
            : "border-purple-300/40 bg-purple-500/20 hover:bg-purple-500/25"
        }`}
      >
        {isConverting ? (
          <p className="text-sm text-purple-100">Converting HEIC image…</p>
        ) : !previewUrl ? (
          <>
            <label
              htmlFor="image-upload"
              className="cursor-pointer rounded-3xl border border-purple-300/40 bg-purple-700/30 px-4 py-2 text-sm font-medium text-purple-100 shadow-[0_0_10px_#a855f7] transition hover:bg-purple-600/40 hover:shadow-[0_0_15px_#c084fc]"
            >
              Select Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="mt-3 text-xs text-purple-200">PNG, JPG, JPEG, HEIC</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 rounded-3xl shadow-lg border border-purple-400/30 object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="rounded-3xl border border-purple-300/40 bg-purple-700/30 px-4 py-2 text-sm font-medium text-purple-100 transition hover:bg-purple-600/40 hover:shadow-[0_0_10px_#c084fc]"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>
      {errorMessage && (
        <p className="text-sm text-red-200" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
