/*
  Warnings:

  - Added the required column `roomPrice` to the `Billing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Billing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "month" TEXT NOT NULL,
    "elecUnitPrev" REAL NOT NULL,
    "elecUnitCurr" REAL NOT NULL,
    "waterUnitPrev" REAL NOT NULL,
    "waterUnitCurr" REAL NOT NULL,
    "elecRate" REAL NOT NULL DEFAULT 7.0,
    "waterRate" REAL NOT NULL DEFAULT 18.0,
    "waterMinUnit" REAL NOT NULL DEFAULT 5.0,
    "commonFee" REAL NOT NULL DEFAULT 0.0,
    "roomPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" DATETIME,
    "roomId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Billing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("elecUnitCurr", "elecUnitPrev", "id", "month", "paidAt", "roomId", "status", "totalAmount", "waterUnitCurr", "waterUnitPrev") SELECT "elecUnitCurr", "elecUnitPrev", "id", "month", "paidAt", "roomId", "status", "totalAmount", "waterUnitCurr", "waterUnitPrev" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "idCard" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "deposit" REAL NOT NULL DEFAULT 0,
    "insurance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "roomId" TEXT NOT NULL,
    CONSTRAINT "Tenant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("deposit", "email", "id", "idCard", "insurance", "name", "phone", "roomId", "startDate") SELECT "deposit", "email", "id", "idCard", "insurance", "name", "phone", "roomId", "startDate" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
