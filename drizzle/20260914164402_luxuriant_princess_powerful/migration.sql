CREATE TABLE "shujia_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "comments_book_id_idx" ON "shujia_comments" ("book_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "shujia_comments" ("user_id");--> statement-breakpoint
CREATE INDEX "comments_parent_id_idx" ON "shujia_comments" ("parent_id");--> statement-breakpoint
ALTER TABLE "shujia_comments" ADD CONSTRAINT "shujia_comments_user_id_shujia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "shujia_user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_comments" ADD CONSTRAINT "shujia_comments_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_comments" ADD CONSTRAINT "shujia_comments_parent_id_shujia_comments_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "shujia_comments"("id") ON DELETE CASCADE;