CREATE TABLE "shujia_book_categories" (
	"book_id" uuid,
	"category_id" uuid,
	CONSTRAINT "shujia_book_categories_pkey" PRIMARY KEY("book_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "shujia_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "categories_slug_unique" UNIQUE
);
--> statement-breakpoint
ALTER TABLE "shujia_books" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shujia_books" DROP COLUMN "categories";--> statement-breakpoint
CREATE INDEX "book_categories_category_id_idx" ON "shujia_book_categories" ("category_id");--> statement-breakpoint
ALTER TABLE "shujia_book_categories" ADD CONSTRAINT "shujia_book_categories_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_book_categories" ADD CONSTRAINT "shujia_book_categories_category_id_shujia_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "shujia_categories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_books" ADD CONSTRAINT "shujia_books_created_by_shujia_user_id_fkey" FOREIGN KEY ("created_by") REFERENCES "shujia_user"("id") ON DELETE RESTRICT;
