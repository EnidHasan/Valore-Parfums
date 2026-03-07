-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "profitMargin" REAL NOT NULL DEFAULT 20,
    "packagingCost" REAL NOT NULL DEFAULT 20,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "lowStockAlertMl" REAL NOT NULL DEFAULT 20,
    "owner1Name" TEXT NOT NULL DEFAULT 'Tayeb',
    "owner2Name" TEXT NOT NULL DEFAULT 'Enid',
    "owner1Share" REAL NOT NULL DEFAULT 60,
    "owner2Share" REAL NOT NULL DEFAULT 40
);
INSERT INTO "new_Settings" ("currency", "id", "lowStockAlertMl", "packagingCost", "profitMargin") SELECT "currency", "id", "lowStockAlertMl", "packagingCost", "profitMargin" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
