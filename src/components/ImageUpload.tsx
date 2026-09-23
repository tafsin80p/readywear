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

const convertToWebP = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Maintain original dimensions, just convert to webp for better compression
        let width = img.width;
        let height = img.height;
        
        // Optional: limit max dimensions to prevent huge memory usage on canvas
        const MAX_DIMENSION = 2500;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          return reject(new Error("Canvas context is not supported"));
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP with 0.85 quality (maintains high quality while reducing size)
        const webpDataUrl = canvas.toDataURL("image/webp", 0.85);
        resolve(webpDataUrl);
      };
      img.onerror = (err) => reject(new Error("Failed to load image for conversion"));
    };
    reader.onerror = (err) => reject(new Error("Failed to read file"));
  });
};

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

      // Convert image to WebP client-side to reduce payload size
      // This solves the 413 JSON Payload Too Large error for 4-5MB images
      const base64File = await convertToWebP(file);
      
      // Send to our backend API with optional folder
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64File, folder: folder || "readywear" }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      onUpload(data.url);
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
