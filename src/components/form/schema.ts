import * as z from "zod";

const BookEnum = z.enum(["physical", "ebook", "audiobook"]);
const BookFormSchema = z.object({
  title: z.string().check(z.minLength(1, "Title is required")),
  author: z.string().check(z.minLength(1, "Author is required")),
  bookFormat: BookEnum,
  description: z.string(),
  totalPages: z.coerce
    .number()
    .check(
      z.int("Total pages must be an integer"),
      z.positive("Total pages must be greater than 0"),
    ),
  genres: z.array(z.coerce.number()).min(1, "At least one genre is required"),
});

const LoginFormSchema = z.object({
  email: z.string().check(z.email("Invalid email")),
  password: z.string().check(z.minLength(8, "Password is too short")),
});

const RegisterFormSchema = LoginFormSchema.extend({
  name: z.string().check(z.minLength(4, "Name is too short")),
});

type BookFormat = z.infer<typeof BookEnum>;

export { BookFormSchema, BookEnum, type BookFormat, LoginFormSchema, RegisterFormSchema };
