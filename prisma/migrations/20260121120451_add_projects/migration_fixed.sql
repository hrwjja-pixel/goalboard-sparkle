-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dashboardTitle" TEXT NOT NULL DEFAULT '목표 대시보드',
    "dashboardSubtitle" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- Insert default project
INSERT INTO "Project" ("id", "name", "description", "dashboardTitle", "dashboardSubtitle", "createdAt", "updatedAt")
VALUES ('default-project-id', 'WEHAGO H 개발센터', 'EMR개발본부 > WEHAGO H 개발센터', 'WEHAGO H 목표 대시보드', 'EMR개발본부 > WEHAGO H 개발센터', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- Migrate Category
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("color", "createdAt", "id", "name", "updatedAt", "projectId")
SELECT "color", "createdAt", "id", "name", "updatedAt", 'default-project-id' FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_projectId_idx" ON "Category"("projectId");
CREATE UNIQUE INDEX "Category_name_projectId_key" ON "Category"("name", "projectId");

-- Migrate Goal
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT NOT NULL DEFAULT 'medium',
    "startDate" TEXT,
    "dueDate" TEXT,
    "statusNote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Goal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("completed", "createdAt", "description", "dueDate", "id", "order", "owner", "progress", "size", "startDate", "statusNote", "title", "updatedAt", "version", "projectId")
SELECT "completed", "createdAt", "description", "dueDate", "id", "order", "owner", "progress", "size", "startDate", "statusNote", "title", "updatedAt", "version", 'default-project-id' FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE INDEX "Goal_owner_idx" ON "Goal"("owner");
CREATE INDEX "Goal_projectId_idx" ON "Goal"("projectId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
