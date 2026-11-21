CREATE TYPE "shujia_book_publish_status" AS ENUM('pending', 'published', 'rejected');--> statement-breakpoint
ALTER TABLE "shujia_books" ADD COLUMN "status" "shujia_book_publish_status" DEFAULT 'pending'::"shujia_book_publish_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "shujia_suggestions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "shujia_suggestion_type";--> statement-breakpoint
CREATE TYPE "shujia_suggestion_type" AS ENUM('book_edit', 'book_genres');--> statement-breakpoint
ALTER TABLE "shujia_suggestions" ALTER COLUMN "type" SET DATA TYPE "shujia_suggestion_type" USING "type"::"shujia_suggestion_type";--> statement-breakpoint
CREATE INDEX "books_status_created_at_idx" ON "shujia_books" ("status","created_at" DESC NULLS LAST);
