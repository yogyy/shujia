CREATE TABLE "shujia_book_genres" (
	"book_id" uuid,
	"genre_id" integer,
	CONSTRAINT "shujia_book_genres_pkey" PRIMARY KEY("book_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "shujia_genres" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shujia_genres_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL CONSTRAINT "genres_slug_unique" UNIQUE
);
--> statement-breakpoint
ALTER TABLE "shujia_book_categories" DROP CONSTRAINT "shujia_book_categories_category_id_shujia_categories_id_fkey";--> statement-breakpoint
DROP TABLE "shujia_book_categories";--> statement-breakpoint
DROP TABLE "shujia_categories";--> statement-breakpoint
CREATE INDEX "book_genres_genre_id_idx" ON "shujia_book_genres" ("genre_id");--> statement-breakpoint
ALTER TABLE "shujia_book_genres" ADD CONSTRAINT "shujia_book_genres_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_book_genres" ADD CONSTRAINT "shujia_book_genres_genre_id_shujia_genres_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "shujia_genres"("id") ON DELETE CASCADE;