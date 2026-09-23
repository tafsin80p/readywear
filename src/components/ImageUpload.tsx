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

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (err) => reject(new Error("Failed to read file"));
  });
};

const convertToWebP = (file: File, quality: number = 0.98): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Maintain exact original dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          return reject(new Error("Canvas context is not supported"));
        }
        
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Convert to WebP with very high quality (0.98)
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
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

      // If file is smaller than 2.5MB, keep it exactly original.
      // If it's larger (e.g. 4-5MB), convert it to WebP with 98% quality to avoid Vercel 4.5MB payload limit.
      let base64File = "";
      if (file.size > 2.5 * 1024 * 1024) {
        base64File = await convertToWebP(file, 0.98);
      } else {
        base64File = await convertToBase64(file);
      }
      
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
