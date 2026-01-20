-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "size" TEXT NOT NULL DEFAULT 'medium',
    "startDate" TEXT,
    "dueDate" TEXT,
    "statusNote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Goal" ("createdAt", "description", "dueDate", "id", "order", "owner", "progress", "size", "startDate", "statusNote", "title", "updatedAt") SELECT "createdAt", "description", "dueDate", "id", "order", "owner", "progress", "size", "startDate", "statusNote", "title", "updatedAt" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE INDEX "Goal_owner_idx" ON "Goal"("owner");
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "goalId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("content", "createdAt", "goalId", "id", "isPinned", "updatedAt") SELECT "content", "createdAt", "goalId", "id", "isPinned", "updatedAt" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
CREATE INDEX "Note_goalId_idx" ON "Note"("goalId");
CREATE TABLE "new_SubGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startDate" TEXT,
    "dueDate" TEXT,
    "statusNote" TEXT,
    "goalId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SubGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubGoal" ("createdAt", "description", "dueDate", "goalId", "id", "owner", "progress", "startDate", "statusNote", "title", "updatedAt") SELECT "createdAt", "description", "dueDate", "goalId", "id", "owner", "progress", "startDate", "statusNote", "title", "updatedAt" FROM "SubGoal";
DROP TABLE "SubGoal";
ALTER TABLE "new_SubGoal" RENAME TO "SubGoal";
CREATE INDEX "SubGoal_goalId_idx" ON "SubGoal"("goalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
