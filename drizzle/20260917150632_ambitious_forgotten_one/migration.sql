CREATE TABLE "shujia_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"book_id" uuid,
	"suggested_by" text,
	"type" "shujia_suggestion_type" NOT NULL,
	"changes" jsonb NOT NULL,
	"note" text,
	"status" "shujia_suggestion_status" DEFAULT 'pending'::"shujia_suggestion_status" NOT NULL,
	"review_note" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "shujia_book_suggestions";--> statement-breakpoint
DROP TABLE "shujia_genre_suggestions";--> statement-breakpoint
CREATE INDEX "suggestions_book_id_idx" ON "shujia_suggestions" ("book_id");--> statement-breakpoint
CREATE INDEX "suggestions_status_idx" ON "shujia_suggestions" ("status");--> statement-breakpoint
CREATE INDEX "suggestions_type_idx" ON "shujia_suggestions" ("type");--> statement-breakpoint
CREATE INDEX "suggestions_suggested_by_idx" ON "shujia_suggestions" ("suggested_by");--> statement-breakpoint
ALTER TABLE "shujia_suggestions" ADD CONSTRAINT "shujia_suggestions_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_suggestions" ADD CONSTRAINT "shujia_suggestions_suggested_by_shujia_user_id_fkey" FOREIGN KEY ("suggested_by") REFERENCES "shujia_user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "shujia_suggestions" ADD CONSTRAINT "shujia_suggestions_reviewed_by_shujia_user_id_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "shujia_user"("id") ON DELETE SET NULL;