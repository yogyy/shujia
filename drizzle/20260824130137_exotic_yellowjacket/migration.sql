CREATE TYPE "shujia_suggestion_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "shujia_book_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"book_id" uuid NOT NULL,
	"suggested_by" text,
	"title" text,
	"author" text,
	"cover_url" text,
	"total_pages" integer,
	"description" text,
	"note" text NOT NULL,
	"status" "shujia_suggestion_status" DEFAULT 'pending'::"shujia_suggestion_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "book_suggestions_book_id_idx" ON "shujia_book_suggestions" ("book_id");--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD CONSTRAINT "shujia_book_suggestions_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD CONSTRAINT "shujia_book_suggestions_suggested_by_shujia_user_id_fkey" FOREIGN KEY ("suggested_by") REFERENCES "shujia_user"("id") ON DELETE SET NULL;