-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "accountName" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "qrCodeUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PaymentSetting" ("accountName", "accountNumber", "bankName", "id", "qrCodeUrl", "updatedAt") SELECT "accountName", "accountNumber", "bankName", "id", "qrCodeUrl", "updatedAt" FROM "PaymentSetting";
DROP TABLE "PaymentSetting";
ALTER TABLE "new_PaymentSetting" RENAME TO "PaymentSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
