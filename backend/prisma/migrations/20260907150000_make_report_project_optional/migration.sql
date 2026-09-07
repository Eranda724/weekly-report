-- Reports may attach either a project or a category.
ALTER TABLE "reports" ALTER COLUMN "projectId" DROP NOT NULL;