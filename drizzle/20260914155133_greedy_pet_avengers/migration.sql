CREATE TYPE "shujia_suggestion_type" AS ENUM('book_edit', 'book_genres', 'new_genre');--> statement-breakpoint
CREATE TABLE "shujia_genre_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"book_id" uuid,
	"suggested_by" text,
	"note" text,
	"status" "shujia_suggestion_status" DEFAULT 'pending'::"shujia_suggestion_status" NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD COLUMN "type" "shujia_suggestion_type" DEFAULT 'book_edit'::"shujia_suggestion_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "book_suggestions_status_idx" ON "shujia_book_suggestions" ("status");--> statement-breakpoint
CREATE INDEX "book_suggestions_suggested_by_idx" ON "shujia_book_suggestions" ("suggested_by");--> statement-breakpoint
CREATE INDEX "genre_suggestions_status_idx" ON "shujia_genre_suggestions" ("status");--> statement-breakpoint
CREATE INDEX "genre_suggestions_slug_idx" ON "shujia_genre_suggestions" ("slug");--> statement-breakpoint
CREATE INDEX "genre_suggestions_book_id_idx" ON "shujia_genre_suggestions" ("book_id");--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ADD CONSTRAINT "shujia_book_suggestions_reviewed_by_shujia_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "shujia_user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shujia_genre_suggestions" ADD CONSTRAINT "shujia_genre_suggestions_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shujia_genre_suggestions" ADD CONSTRAINT "shujia_genre_suggestions_suggested_by_shujia_user_id_fkey" FOREIGN KEY ("suggested_by") REFERENCES "shujia_user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shujia_genre_suggestions" ADD CONSTRAINT "shujia_genre_suggestions_reviewed_by_shujia_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "shujia_user"("id") ON DELETE SET NULL;