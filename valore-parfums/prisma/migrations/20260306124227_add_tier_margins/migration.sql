-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "profitMargin" REAL NOT NULL DEFAULT 20,
    "packagingCost" REAL NOT NULL DEFAULT 20,
    "platformFees" REAL NOT NULL DEFAULT 0,
    "tierMargins" TEXT NOT NULL DEFAULT '{"Budget":{"3":37,"5":37,"6":37,"10":27,"15":22,"30":17},"Premium":{"3":32,"5":32,"6":32,"10":22,"15":17,"30":12},"Luxury":{"3":45,"5":45,"6":45,"10":35,"15":27,"30":27}}',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "lowStockAlertMl" REAL NOT NULL DEFAULT 20,
    "owner1Name" TEXT NOT NULL DEFAULT 'Tayeb',
    "owner2Name" TEXT NOT NULL DEFAULT 'Enid',
    "owner1Share" REAL NOT NULL DEFAULT 60,
    "owner2Share" REAL NOT NULL DEFAULT 40
);
INSERT INTO "new_Settings" ("currency", "id", "lowStockAlertMl", "owner1Name", "owner1Share", "owner2Name", "owner2Share", "packagingCost", "platformFees", "profitMargin") SELECT "currency", "id", "lowStockAlertMl", "owner1Name", "owner1Share", "owner2Name", "owner2Share", "packagingCost", "platformFees", "profitMargin" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
