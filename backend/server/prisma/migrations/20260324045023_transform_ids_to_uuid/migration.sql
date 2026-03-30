/*
  Warnings:

  - The primary key for the `Billing` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PaymentSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `floor` on the `Room` table. All the data in the column will be lost.
  - The primary key for the `SystemSetting` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tenant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `basePrice` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomTypeId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

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
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" DATETIME,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "Billing_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Billing" ("elecUnitCurr", "elecUnitPrev", "id", "month", "paidAt", "roomId", "status", "totalAmount", "waterUnitCurr", "waterUnitPrev") SELECT "elecUnitCurr", "elecUnitPrev", "id", "month", "paidAt", "roomId", "status", "totalAmount", "waterUnitCurr", "waterUnitPrev" FROM "Billing";
DROP TABLE "Billing";
ALTER TABLE "new_Billing" RENAME TO "Billing";
CREATE TABLE "new_PaymentSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountName" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "qrCodeUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PaymentSetting" ("accountName", "accountNumber", "bankName", "id", "qrCodeUrl", "updatedAt") SELECT "accountName", "accountNumber", "bankName", "id", "qrCodeUrl", "updatedAt" FROM "PaymentSetting";
DROP TABLE "PaymentSetting";
ALTER TABLE "new_PaymentSetting" RENAME TO "PaymentSetting";
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomNumber" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ว่าง',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("createdAt", "id", "roomNumber", "status", "updatedAt") SELECT "createdAt", "id", "roomNumber", "status", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "Room"("roomNumber");
CREATE TABLE "new_SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "elecRate" REAL NOT NULL DEFAULT 7.0,
    "waterRate" REAL NOT NULL DEFAULT 18.0,
    "waterMinUnit" REAL NOT NULL DEFAULT 5.0,
    "commonFee" REAL NOT NULL DEFAULT 0.0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SystemSetting" ("commonFee", "elecRate", "id", "updatedAt", "waterMinUnit", "waterRate") SELECT "commonFee", "elecRate", "id", "updatedAt", "waterMinUnit", "waterRate" FROM "SystemSetting";
DROP TABLE "SystemSetting";
ALTER TABLE "new_SystemSetting" RENAME TO "SystemSetting";
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "idCard" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deposit" REAL NOT NULL DEFAULT 0,
    "insurance" REAL NOT NULL DEFAULT 0,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "Tenant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tenant" ("deposit", "email", "id", "idCard", "insurance", "name", "phone", "roomId", "startDate") SELECT "deposit", "email", "id", "idCard", "insurance", "name", "phone", "roomId", "startDate" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_name_key" ON "RoomType"("name");
