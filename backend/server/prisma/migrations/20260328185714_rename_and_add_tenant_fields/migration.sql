/*
  Warnings:

  - You are about to drop the column `endDate` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Tenant` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "phone" TEXT NOT NULL,
    "lineId" TEXT,
    "idCard" TEXT,
    "address" TEXT,
    "contractDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moveInDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractEndDate" DATETIME,
    "emergencyName" TEXT,
    "emergencyPhone" TEXT,
    "contractTerm" INTEGER NOT NULL DEFAULT 6,
    "deposit" REAL NOT NULL DEFAULT 0,
    "otherNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "roomId" TEXT NOT NULL,
    "idCardUrl" TEXT,
    "contractFileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tenant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("contractFileUrl", "contractTerm", "createdAt", "deposit", "emergencyName", "emergencyPhone", "id", "idCard", "idCardUrl", "lineId", "name", "nickname", "otherNotes", "phone", "roomId", "status", "updatedAt") SELECT "contractFileUrl", "contractTerm", "createdAt", "deposit", "emergencyName", "emergencyPhone", "id", "idCard", "idCardUrl", "lineId", "name", "nickname", "otherNotes", "phone", "roomId", "status", "updatedAt" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
