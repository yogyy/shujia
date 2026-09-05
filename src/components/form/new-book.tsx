import { PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useUploadImage } from "#/hooks/useUploadImage.ts";
import { authClient } from "#/lib/auth-client.ts";
import { slugify } from "#/lib/utils.ts";
import { addNewBook } from "#/utils/books.functions.ts";
import { FormatSelector } from "../book/format-selection";
import { GenreSelector } from "../book/genre-selection";
import { ImageUpload, uploadToR2 } from "../image-upload";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { BookFormSchema } from "./schema";
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

export function NewBookForm() {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const { image, imagePreview, handleImageChange, handleFileDrop, clearImage } = useUploadImage();
  const queryClient = useQueryClient();

  const { mutateAsync: mutateBook, isPending: isBookPending } = useMutation({
    mutationFn: addNewBook,
    onSuccess: () => {
      clearImage();
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book added successfully!", { position: "top-left" });
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutateAsync: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: uploadToR2,
    mutationKey: ["image-upload", "new-book"],
    onSuccess: () => toast.success("Image uploaded."),
    onError: (error) => toast.error(error.message),
  });

  async function submitHandler(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = BookFormSchema.safeParse({
      title: formData.get("title")?.toString().trim(),
      author: formData.get("author")?.toString().trim(),
      bookFormat: formData.get("bookFormat")?.toString(),
      description: formData.get("description")?.toString().trim(),
      totalPages: Number(formData.get("totalPages")),
      genres: formData.getAll("genres").map(Number),
    });

    if (!result.success) {
      console.log(result.error);
      toast.error(result.error.issues[0].message);
      return;
    }

    let coverUrl: string | undefined;
    if (image instanceof File) {
      try {
        coverUrl = await uploadImage(image);
      } catch {
        return;
      }
    }

    mutateBook({
      data: {
        ...result.data,
        coverUrl,
        createdBy: session?.user?.id as string,
        slug: slugify(result.data.title),
      },
    });
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="left">
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            className="group border-primary text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-2 border p-2 pr-3 text-sm"
          />
        }
      >
        <PlusIcon className="transition-transform group-hover:rotate-12" size={18} /> Add Book
      </DrawerTrigger>
      <DrawerOverlay className="bg-muted/35" />
      <DrawerContent className="bg-background grid h-svh w-fit place-content-center">
        <ScrollArea className="h-full w-svw max-w-xl p-5 shadow-2xl sm:min-w-xl">
          <DrawerHeader>
            <DrawerTitle className="text-accent text-xs tracking-[0.25em] uppercase">
              New addition
            </DrawerTitle>
            <DrawerDescription className="text-primary mt-3 font-serif text-[clamp(24px,6vw,2.25rem)] text-balance">
              Add a book to the shelf
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={submitHandler} className="mt-7 space-y-4" id="new-book-form">
            <div className="relative flex flex-col gap-2 min-[550px]:flex-row">
              <div className="flex h-full flex-3/4 grow-0 flex-col gap-4">
                <label className="text-primary block text-sm">
                  Title
                  <Input
                    name="title"
                    required
                    className="border-border focus:border-accent mt-2 w-full border-b bg-transparent py-2 outline-none"
                  />
                </label>
                <label className="text-primary block text-sm">
                  Author
                  <Input
                    type="text"
                    name="author"
                    required
                    className="border-border focus:border-accent mt-2 w-full border-b bg-transparent py-2 outline-none"
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
                <span>Cover Image</span>
                <ImageUpload
                  imagePrev={imagePreview}
                  onImageChange={handleImageChange}
                  onRemove={clearImage}
                  isUploading={isUploading}
                  handleFileDrop={handleFileDrop}
                />
              </label>
            </div>

            <label className="text-primary block h-full text-sm">
              Description
              <Textarea
                name="description"
                required
                rows={6}
                placeholder="Enter a description for the book"
                className="border-border focus-visible:border-accent mt-2 field-sizing-fixed w-full resize-none scrollbar-none rounded-xs bg-transparent py-2 outline-none"
              />
            </label>

            <label className="text-primary block text-sm">
              Genre
              <GenreSelector />
            </label>

            <label className="text-primary block text-sm">
              Total Pages
              <Input
                type="number"
                name="totalPages"
                className="border-border focus:border-accent appearance mt-2 w-full border-b bg-transparent py-2 outline-none"
              />
            </label>
          </form>
          <DrawerFooter className="mt-3 p-0">
            <Button
              form="new-book-form"
              type="submit"
              disabled={!session || isBookPending || isUploading}
            >
              Add Book
            </Button>

            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
