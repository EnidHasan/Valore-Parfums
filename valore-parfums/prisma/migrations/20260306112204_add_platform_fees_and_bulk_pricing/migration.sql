-- CreateTable
CREATE TABLE "BulkPricingRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minQuantity" INTEGER NOT NULL DEFAULT 2,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "profitMargin" REAL NOT NULL DEFAULT 20,
    "packagingCost" REAL NOT NULL DEFAULT 20,
    "platformFees" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "lowStockAlertMl" REAL NOT NULL DEFAULT 20,
    "owner1Name" TEXT NOT NULL DEFAULT 'Tayeb',
    "owner2Name" TEXT NOT NULL DEFAULT 'Enid',
    "owner1Share" REAL NOT NULL DEFAULT 60,
    "owner2Share" REAL NOT NULL DEFAULT 40
);
INSERT INTO "new_Settings" ("currency", "id", "lowStockAlertMl", "owner1Name", "owner1Share", "owner2Name", "owner2Share", "packagingCost", "profitMargin") SELECT "currency", "id", "lowStockAlertMl", "owner1Name", "owner1Share", "owner2Name", "owner2Share", "packagingCost", "profitMargin" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
