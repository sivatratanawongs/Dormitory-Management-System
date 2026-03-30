-- CreateTable
CREATE TABLE "PaymentSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "qrCodeUrl" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
