import { useState } from "react";
import { toast } from "sonner";

const MAX_SIZE = 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function useUploadImage() {
  const [image, setImage] = useState<File | string>("");
  const [ImagePrev, setImagePrev] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error("Unsupported format. Use JPEG, PNG, WebP, GIF or AVIF.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      toast.error(`Image is ${(file.size / 1024 / 1024).toFixed(2)}MB — max is 1MB.`);
      e.target.value = "";
      return;
    }

    setImage(file);
    setImagePrev(URL.createObjectURL(file));
  };

  return { image, ImagePrev, setImagePrev, handleImageChange };
}

export { MAX_SIZE, ALLOWED_TYPES, useUploadImage };
