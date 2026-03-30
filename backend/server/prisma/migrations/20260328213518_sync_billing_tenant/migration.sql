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
    "tenantId" TEXT,
    "roomId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Billing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Billing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("commonFee", "createdAt", "elecRate", "elecUnitCurr", "elecUnitPrev", "id", "month", "paidAt", "roomId", "roomPrice", "status", "totalAmount", "waterMinUnit", "waterRate", "waterUnitCurr", "waterUnitPrev") SELECT "commonFee", "createdAt", "elecRate", "elecUnitCurr", "elecUnitPrev", "id", "month", "paidAt", "roomId", "roomPrice", "status", "totalAmount", "waterMinUnit", "waterRate", "waterUnitCurr", "waterUnitPrev" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
