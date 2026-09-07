-- Detach reports when their project is permanently deleted.
ALTER TABLE "reports" DROP CONSTRAINT "reports_projectId_fkey";

ALTER TABLE "reports" ADD CONSTRAINT "reports_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;