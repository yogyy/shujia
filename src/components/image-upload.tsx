import { UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { cn } from "cnfast";
import { useRef, useState } from "react";
import { ALLOWED_TYPES, MAX_SIZE } from "#/utils/image.utils.ts";

export async function uploadToR2(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported format. Use JPEG, PNG, WebP, GIF or AVIF.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`Image is ${(file.size / 1024 / 1024).toFixed(2)}MB — max is 1MB.`);
  }

  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch("/api/books/cover", { method: "POST", body: formData });

  if (!response.ok) {
    const { error } = (await response.json()) as { error?: string };
    throw new Error(error ?? `Upload failed (${response.status})`);
  }

  const { url } = (await response.json()) as { url: string };
  return url;
}

interface ImageUploadProps {
  imagePrev: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isUploading?: boolean;
  handleFileDrop?: (file: File) => void;
}

export function ImageUpload({
  imagePrev,
  onImageChange,
  onRemove,
  isUploading = false,
  handleFileDrop,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleRemove() {
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <input
        ref={inputRef}
        id="image-upload"
        type="file"
        accept={[...ALLOWED_TYPES].join(",")}
        hidden
        onChange={onImageChange}
      />
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);

          const file = e.dataTransfer.files[0];
          if (file) handleFileDrop?.(file);
        }}
        className={cn(
          "group mt-1 aspect-2/3 max-h-32 rounded-xs border border-dashed min-[550px]:max-h-none",
          isDragging ? "border-destructive" : "",
        )}
      >
        <div className="relative flex h-full items-center justify-center">
          {imagePrev ? (
            <>
              <img
                src={imagePrev}
                alt="Upload preview"
                className={cn(
                  "max-h-32 object-fill min-[550px]:max-h-none",
                  isDragging ? "opacity-60" : "",
                )}
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="text-destructive hover:text-destructive absolute top-1 right-1 disabled:opacity-50"
              >
                <span className="sr-only">delete image preview</span>
                <XIcon size={20} weight="bold" />
              </button>
            </>
          ) : (
            <div className="text-muted-foreground group-hover:text-accent flex w-full flex-col items-center justify-center gap-2 text-xs transition-colors">
              <UploadSimpleIcon size={20} />
              <p className="text-center text-balance">Drop or click to upload cover</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
