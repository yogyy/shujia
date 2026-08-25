import { SpinnerIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { ALLOWED_TYPES, MAX_SIZE } from "#/utils/use-upload-image.ts";

export async function uploadToR2(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported format. Use JPEG, PNG, WebP, GIF or AVIF.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`Image is ${(file.size / 1024 / 1024).toFixed(2)}MB — max is 1MB.`);
  }

  const formData = new FormData();
  formData.set("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });

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
}

export function ImageUpload({
  imagePrev,
  onImageChange,
  onRemove,
  isUploading = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleRemove() {
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="text-primary block text-sm">
      Cover image
      <input
        ref={inputRef}
        type="file"
        accept={[...ALLOWED_TYPES].join(",")}
        hidden
        onChange={onImageChange}
      />
      {imagePrev ? (
        <div className="border-border mt-2 flex items-center gap-3 border p-2">
          <div className="relative">
            <img src={imagePrev} alt="Upload preview" className="bg-muted max-w-32 object-cover" />
          </div>

          {isUploading ? (
            <div className="bg-background/60 absolute inset-0 flex items-center justify-center">
              <SpinnerIcon size={18} className="animate-spin" />
            </div>
          ) : (
            <div className="flex w-full flex-col gap-5 text-xs">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="hover:text-accent cursor-pointer tracking-wide uppercase disabled:opacity-50"
              >
                Replace
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading}
                className="text-muted-foreground hover:text-destructive cursor-pointer tracking-wide uppercase disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="border-border hover:border-accent text-muted-foreground mt-2 flex w-full cursor-pointer flex-col items-center gap-2 border border-dashed px-4 py-6 text-xs transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <SpinnerIcon size={20} className="animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <UploadSimpleIcon size={20} />
              Click to upload — max 1MB
            </>
          )}
        </button>
      )}
    </div>
  );
}
