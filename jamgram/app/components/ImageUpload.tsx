"use client";
import { useState, DragEvent, ChangeEvent } from "react";

export default function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(file);
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
    if (file) handleFileUpload(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
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
        {!previewUrl ? (
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
            <p className="mt-3 text-xs text-purple-200">PNG, JPG, JPEG</p>
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
    </div>
  );
}