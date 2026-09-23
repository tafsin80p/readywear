"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  folder?: string;
}

// Removed canvas and Base64 conversion functions since we will upload directly

export function ImageUpload({ onUpload, disabled, className, children, folder }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Get signature from our backend
      const uploadFolder = folder || "readywear";
      const sigRes = await fetch(`/api/upload/signature?folder=${uploadFolder}`);
      const sigData = await sigRes.json();

      if (!sigRes.ok) {
        throw new Error(sigData.error || "Failed to get upload signature");
      }

      // 2. Upload directly to Cloudinary from the browser!
      // This bypasses Vercel's 4.5MB limit completely and avoids any Canvas/Base64 quality loss
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.api_key);
      formData.append("timestamp", sigData.timestamp.toString());
      formData.append("signature", sigData.signature);
      formData.append("folder", uploadFolder);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await cloudinaryRes.json();
      
      if (!cloudinaryRes.ok) {
        throw new Error(data.error?.message || "Failed to upload directly to Cloudinary");
      }

      onUpload(data.secure_url);
      toast("success", "Image uploaded successfully!");

    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast("error", error.message || "Failed to upload image. Please try again.");
    } finally {
      // Reset the input so the same file can be selected again if needed
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsUploading(false);
    }
  };

  const isBusy = disabled || isUploading;

  return (
    <>
      <input 
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {children ? (
        <div 
          onClick={handleClick} 
          className={`w-full h-full relative ${isBusy ? "cursor-not-allowed" : "cursor-pointer"}`}
        >
          {children}
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 rounded-[inherit]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <button 
          type="button" 
          disabled={isBusy}
          onClick={handleClick}
          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl transition-all w-full h-full ${
            isBusy
              ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed"
              : "border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer"
          } ${className || ""}`}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <ImagePlus className="w-8 h-8" />
          )}
          <div className="text-sm font-medium">
            Click to upload media
          </div>
        </button>
      )}
    </>
  );
}
