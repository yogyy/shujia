import { PlusIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSession } from "#/lib/auth-client.ts";
import { slugify } from "#/lib/utils.ts";
import { addNewBook } from "#/utils/books.functions.ts";
import { useUploadImage } from "#/utils/use-upload-image.ts";
import { FormatSelector, type BookFormat } from "../book/format-selection";
import { GenreSelector } from "../book/genre-selection";
import { ImageUpload, uploadToR2 } from "../image-upload";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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
  const { data } = useSession();
  const { image, ImagePrev, setImagePrev, handleImageChange } = useUploadImage();
  const queryClient = useQueryClient();

  const { mutate: mutateBook } = useMutation({
    mutationFn: addNewBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Book added successfully!");
      URL.revokeObjectURL(ImagePrev);
      setImagePrev("");
    },
  });

  const { mutateAsync: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: uploadToR2,
    mutationKey: ["image-upload"],
    onSuccess: () => {
      toast.success("Image uploaded.");
    },
    onError: (error) => {
      setImagePrev(ImagePrev ?? null);
      toast.error(error.message);
    },
  });

  let coverUrl: string | undefined;
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (image instanceof File) {
      try {
        coverUrl = await uploadImage(image);
      } catch {
        return;
      }
    }
    mutateBook({
      data: {
        title: formData.get("title")?.toString().trim() ?? "",
        bookFormat: formData.get("format")?.toString().trim() as BookFormat,
        author: formData.get("author")?.toString().trim() ?? "",
        coverUrl,
        description: formData.get("description")?.toString().trim() ?? "",
        totalPages: Number(formData.get("totalPages")),
        createdBy: data?.user?.id as string,
        slug: slugify(formData.get("title")?.toString() ?? ""),
        genres: formData.getAll("genres").map(Number),
      },
    });
  }

  return (
    <Drawer swipeDirection="left">
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
      <DrawerContent className="bg-background h-svh w-full max-w-svw items-center p-5 shadow-2xl sm:max-w-xl sm:p-10">
        <DrawerHeader>
          <DrawerTitle className="text-accent text-xs tracking-[0.25em] uppercase">
            New addition
          </DrawerTitle>
          <DrawerDescription className="text-primary mt-3 font-serif text-[clamp(24px,6vw,2.25rem)] text-balance">
            Add a book to the shelf
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={submit} className="mt-7 space-y-4" id="new-book-form">
          <label className="text-primary block text-sm">
            Title
            <Input
              name="title"
              required
              defaultValue="Shadow Slave"
              className="border-border focus:border-accent mt-2 w-full border-b bg-transparent py-2 outline-none"
            />
          </label>
          <div className="flex gap-2">
            <label className="text-primary block flex-1 text-sm">
              Author
              <Input
                type="text"
                name="author"
                className="border-border focus:border-accent mt-2 w-full border-b bg-transparent py-2 outline-none"
              />
            </label>
            <label className="text-primary flex flex-1 flex-col items-end justify-end text-sm">
              Book Format
              <FormatSelector />
            </label>
          </div>
          <label className="text-primary block text-sm">
            Description
            <Textarea
              name="description"
              required
              rows={4}
              placeholder="Enter a description for the book"
              className="border-border focus:border-accent mt-2 field-sizing-fixed w-full rounded-xs bg-transparent py-2 outline-none"
            />
          </label>
          <label className="text-primary block text-sm">
            <ImageUpload
              imagePrev={ImagePrev}
              onImageChange={handleImageChange}
              onRemove={() => {
                URL.revokeObjectURL(ImagePrev);
                setImagePrev("");
              }}
              isUploading={isUploading}
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
          <Button form="new-book-form" type="submit">
            Add Book
          </Button>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
