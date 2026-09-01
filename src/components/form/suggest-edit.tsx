import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast, type ExternalToast } from "sonner";
import { useUploadImage } from "#/hooks/useUploadImage.ts";
import { authClient } from "#/lib/auth-client.ts";
import { cn, filterEmptyValues } from "#/lib/utils.ts";
import { suggestBookEdit, updateBook } from "#/utils/books.functions.ts";
import { FormatSelector } from "../book/format-selection";
import { GenreSelector } from "../book/genre-selection";
import { ImageUpload, uploadToR2 } from "../image-upload";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";

interface SuggestEditFormProps {
  bookId: string;
  bookTitle: string;
}

const toastOptions: ExternalToast = {
  position: "top-left",
};

export function SuggestEditForm({ bookId, bookTitle }: SuggestEditFormProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { image, imagePreview, handleImageChange, handleFileDrop, clearImage } = useUploadImage();
  const queryClient = useQueryClient();

  const regularUser = session?.user.role === "user";

  const suggestionMutation = useMutation({
    mutationFn: suggestBookEdit,
    onSuccess: () =>
      toast.success("Thanks! Your suggestion was submitted for review.", toastOptions),
    onError: () => toast.error("Something went wrong. Please try again.", toastOptions),
  });

  const updateBookMutation = useMutation({
    mutationFn: updateBook,
    onSuccess: () => toast.success("Book updated successfully.", toastOptions),
    onError: (err) => {
      console.error(err);
      toast.error("Something went wrong. Please try again.", toastOptions);
    },
  });

  const { mutateAsync: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: uploadToR2,
    mutationKey: ["image-upload"],
    onSuccess: () => toast.success("Image uploaded."),
    onError: (error) => toast.error(error.message),
  });
  let coverUrl: string | undefined;

  const extractFormData = (formData: FormData) => {
    const {
      note,
      genres: _genreField,
      totalPages: _totalPages,
      ...singleFields
    } = Object.fromEntries(formData.entries());

    return {
      note: note as string,
      genres: formData.getAll("genres").map(Number),
      totalPages: Number(formData.get("totalPages")),
      singleFields,
    };
  };
  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const { note, genres, totalPages, singleFields } = extractFormData(formData);

    if (image instanceof File) {
      try {
        coverUrl = await uploadImage(image);
      } catch {
        return;
      }
    }

    const cleanData = filterEmptyValues(
      { ...singleFields, genres, totalPages, coverUrl },
      { removeZero: true },
    );

    if (Object.keys(cleanData).length === 0) {
      toast.message("No Data to Update.", toastOptions);
      return;
    }

    if (regularUser) {
      suggestionMutation.mutate({
        data: { note: note as string, changes: cleanData, suggestedBy: session?.user.id, bookId },
      });
    } else {
      updateBookMutation.mutate({ data: { ...cleanData, id: bookId } });
    }

    form.reset();
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="left">
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="border-border text-muted-foreground hover:text-accent hover:border-accent hover:bg-background flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-xs tracking-[0.18em] uppercase transition-colors"
          />
        }
      >
        <PencilSimpleLineIcon size={14} weight="fill" />
        &nbsp;
        {regularUser ? "Suggest an edit" : "Edit"}
      </DrawerTrigger>
      <DrawerOverlay className="bg-muted/35" />
      <DrawerContent className="bg-background h-svh w-full max-w-svw items-center p-5 shadow-2xl sm:max-w-xl sm:p-10">
        <DrawerHeader>
          <DrawerTitle className="text-accent text-xs tracking-[0.25em] uppercase">
            Reader contribution
          </DrawerTitle>
          <DrawerDescription className="text-primary mt-3 font-serif text-[clamp(24px,6vw,2.25rem)] text-pretty">
            Suggest an edit for &ldquo;{bookTitle}&rdquo;
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4" id="suggest-edit-form">
          <div
            className={cn(
              "relative flex flex-col gap-2",
              regularUser ? "" : "min-[550px]:flex-row",
            )}
          >
            <div className="flex h-full flex-3/4 grow-0 flex-col gap-4">
              <label className="text-primary block text-sm">
                Title
                <Input
                  name="title"
                  className="border-border focus:border-accent w-full border-b bg-transparent py-2 outline-none"
                />
              </label>
              <label className="text-primary block text-sm">
                Author
                <Input
                  type="text"
                  name="author"
                  className="border-border focus:border-accent w-full border-b bg-transparent py-2 outline-none"
                />
              </label>
              <label className="text-primary relative flex flex-col text-sm">
                Book Format
                <div>
                  <FormatSelector />
                </div>
              </label>
            </div>
            <label className="text-primary relative flex grow flex-col gap-1.5 text-sm min-[550px]:flex-1/4">
              Cover Image
              {regularUser ? (
                <Input
                  name="coverUrl"
                  placeholder="put image link or upload image"
                  className="border-border focus:border-accent w-full border-b bg-transparent py-2 outline-none"
                />
              ) : (
                <ImageUpload
                  imagePrev={imagePreview}
                  onImageChange={handleImageChange}
                  onRemove={clearImage}
                  // isUploading={isUploading}
                  handleFileDrop={handleFileDrop}
                />
              )}
            </label>
          </div>
          <label className="text-primary block text-sm">
            Genre
            <GenreSelector />
          </label>
          <label className="text-primary block text-sm">
            Total Pages
            <Input
              type="number"
              name="totalPages"
              min={1}
              className="border-border focus:border-accent mt-2 w-full border-b bg-transparent py-2 outline-none"
            />
          </label>
          <label className="text-primary block text-sm">
            Description
            <Textarea
              name="description"
              rows={4}
              placeholder="...what is this book about?"
              className="border-border focus:border-accent mt-2 w-full rounded-xs bg-transparent py-2 outline-none"
            />
          </label>
          {regularUser && (
            <label className="text-primary block text-sm">
              What should change? <span className="text-accent">*</span>
              <Textarea
                name="note"
                required
                rows={2}
                placeholder="e.g. The page count is wrong…"
                className="border-border focus:border-accent mt-2 w-full rounded-xs bg-transparent py-2 outline-none"
              />
            </label>
          )}
        </form>
        <DrawerFooter className="mt-3 p-0">
          <Button
            form="suggest-edit-form"
            type="submit"
            disabled={suggestionMutation.isPending || !session?.user?.id}
          >
            Submit suggestion
          </Button>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
