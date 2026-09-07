-- Add a separate category value to reports.
ALTER TABLE "reports" ADD COLUMN "category" TEXT NOT NULL DEFAULT '';