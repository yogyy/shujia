ALTER TABLE "shujia_book_suggestions" ADD COLUMN "changes" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" DROP COLUMN "author";--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" DROP COLUMN "cover_url";--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" DROP COLUMN "total_pages";--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "shujia_book_suggestions" ALTER COLUMN "note" DROP NOT NULL;