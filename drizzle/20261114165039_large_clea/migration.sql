ALTER TABLE "shujia_books" ALTER COLUMN "book_format" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "books_created_at_idx" ON "shujia_books" ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "books_created_by_idx" ON "shujia_books" ("created_by");