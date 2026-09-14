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

      // Wrap in promise to properly wait
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = async () => {
          try {
            const base64File = reader.result;
            
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
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
      });

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
              <Loader2 className="w-8 h-8 animate-spin text-[#F5426A]" />
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
              : "border-[#F5426A]/30 bg-[#F5426A]/5 hover:bg-[#F5426A]/10 text-[#F5426A] cursor-pointer"
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
