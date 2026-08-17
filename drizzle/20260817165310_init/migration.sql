CREATE TYPE "shujia_book_format" AS ENUM('physical', 'ebook', 'audiobook');--> statement-breakpoint
CREATE TYPE "shujia_book_status" AS ENUM('want_to_read', 'reading', 'finished', 'dnf');--> statement-breakpoint
CREATE TYPE "shujia_visibility" AS ENUM('private', 'public', 'unlisted');--> statement-breakpoint
CREATE TABLE "shujia_account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shujia_session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shujia_user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shujia_verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shujia_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"slug" text NOT NULL UNIQUE,
	"book_format" "shujia_book_format" DEFAULT 'ebook'::"shujia_book_format",
	"title" text NOT NULL,
	"author" text,
	"cover_url" text,
	"total_pages" integer,
	"description" text,
	"categories" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shujia_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"user_book_id" uuid NOT NULL,
	"page" integer,
	"content" text NOT NULL,
	"visibility" "shujia_visibility" DEFAULT 'private'::"shujia_visibility" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shujia_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_user_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "shujia_user_book_tags" (
	"user_book_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "shujia_user_book_tags_pkey" PRIMARY KEY("user_book_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "shujia_user_books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"status" "shujia_book_status" DEFAULT 'want_to_read'::"shujia_book_status" NOT NULL,
	"visibility" "shujia_visibility" DEFAULT 'private'::"shujia_visibility" NOT NULL,
	"current_page" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_books_user_book_unique" UNIQUE("user_id","book_id")
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "shujia_account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "shujia_session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "shujia_verification" ("identifier");--> statement-breakpoint
CREATE INDEX "books_title_idx" ON "shujia_books" ("title");--> statement-breakpoint
CREATE INDEX "notes_user_id_idx" ON "shujia_notes" ("user_id");--> statement-breakpoint
CREATE INDEX "notes_user_book_id_idx" ON "shujia_notes" ("user_book_id");--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "shujia_tags" ("user_id");--> statement-breakpoint
CREATE INDEX "user_books_user_id_idx" ON "shujia_user_books" ("user_id");--> statement-breakpoint
CREATE INDEX "user_books_book_id_idx" ON "shujia_user_books" ("book_id");--> statement-breakpoint
ALTER TABLE "shujia_account" ADD CONSTRAINT "shujia_account_user_id_shujia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "shujia_user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_session" ADD CONSTRAINT "shujia_session_user_id_shujia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "shujia_user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_notes" ADD CONSTRAINT "shujia_notes_user_id_shujia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "shujia_user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_notes" ADD CONSTRAINT "shujia_notes_user_book_id_shujia_user_books_id_fkey" FOREIGN KEY ("user_book_id") REFERENCES "shujia_user_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_tags" ADD CONSTRAINT "shujia_tags_user_id_shujia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "shujia_user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_user_book_tags" ADD CONSTRAINT "shujia_user_book_tags_user_book_id_shujia_user_books_id_fkey" FOREIGN KEY ("user_book_id") REFERENCES "shujia_user_books"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_user_book_tags" ADD CONSTRAINT "shujia_user_book_tags_tag_id_shujia_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "shujia_tags"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_user_books" ADD CONSTRAINT "shujia_user_books_user_id_shujia_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "shujia_user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "shujia_user_books" ADD CONSTRAINT "shujia_user_books_book_id_shujia_books_id_fkey" FOREIGN KEY ("book_id") REFERENCES "shujia_books"("id") ON DELETE CASCADE;