import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MAX_SIZE, ALLOWED_TYPES } from "#/utils/image.utils";

export function useUploadImage() {
  const [image, setImage] = useState<File | string>("");
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const processFile = (file: File) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error("Unsupported format. Use JPEG, PNG, WebP, GIF or AVIF.");
      return false;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`Image is ${(file.size / 1024 / 1024).toFixed(2)}MB — max is 1MB.`);
      return false;
    }

    setImage(file);
    setImagePreview((prev) => {
      URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ok = processFile(file);
    if (!ok) e.target.value = "";
  };

  const handleFileDrop = (file: File) => {
    processFile(file);
  };

  const clearImage = () => {
    setImage("");
    setImagePreview("");
    URL.revokeObjectURL(imagePreview);
  };

  return { image, imagePreview, handleImageChange, handleFileDrop, clearImage };
}
