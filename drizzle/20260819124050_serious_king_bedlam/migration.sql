ALTER TABLE "shujia_account" ADD COLUMN "issuer" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "shujia_account" ("issuer","account_id");