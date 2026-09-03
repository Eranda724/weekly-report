-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEAM_MEMBER', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NEEDS_CORRECTION', 'APPROVED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "HighlightType" AS ENUM ('BLOCKER', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('APPROVED', 'NEEDS_CORRECTION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEAM_MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "tasksNextWeek" TEXT,
    "notesLinks" TEXT,
    "currentVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_tasks" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "plannedPct" INTEGER NOT NULL,
    "actualPct" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timePlannedHrs" DECIMAL(65,30) NOT NULL,
    "timeSpentHrs" DECIMAL(65,30) NOT NULL,
    "deliverable" TEXT,

    CONSTRAINT "report_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_highlights" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "itemType" "HighlightType" NOT NULL,
    "description" TEXT NOT NULL,
    "isKeyItem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "report_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hours_breakdown" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "taskCategory" TEXT NOT NULL,
    "hoursSpent" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "hours_breakdown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_versions" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "contentSnapshot" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_comments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "commentText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_userId_weekStartDate_key" ON "reports"("userId", "weekStartDate");

-- CreateIndex
CREATE UNIQUE INDEX "report_versions_reportId_versionNumber_key" ON "report_versions"("reportId", "versionNumber");

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_tasks" ADD CONSTRAINT "report_tasks_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_highlights" ADD CONSTRAINT "report_highlights_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hours_breakdown" ADD CONSTRAINT "hours_breakdown_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "report_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
