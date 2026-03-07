-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "perfumeId" TEXT NOT NULL,
    "perfumeName" TEXT NOT NULL,
    "ml" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "ownerName" TEXT NOT NULL DEFAULT 'Store',
    "ownerProfit" REAL NOT NULL DEFAULT 0,
    "platformProfit" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_perfumeId_fkey" FOREIGN KEY ("perfumeId") REFERENCES "Perfume" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("costPrice", "id", "ml", "orderId", "perfumeId", "perfumeName", "quantity", "totalPrice", "unitPrice") SELECT "costPrice", "id", "ml", "orderId", "perfumeId", "perfumeName", "quantity", "totalPrice", "unitPrice" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE TABLE "new_Perfume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "inspiredBy" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Unisex',
    "season" TEXT NOT NULL DEFAULT '',
    "images" TEXT NOT NULL DEFAULT '[]',
    "marketPricePerMl" REAL NOT NULL DEFAULT 0,
    "purchasePricePerMl" REAL NOT NULL DEFAULT 0,
    "totalStockMl" REAL NOT NULL DEFAULT 0,
    "lowStockThreshold" REAL NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "owner" TEXT NOT NULL DEFAULT 'Store',
    "isPersonalCollection" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Perfume" ("brand", "category", "createdAt", "description", "id", "images", "inspiredBy", "isActive", "isBestSeller", "lowStockThreshold", "marketPricePerMl", "name", "purchasePricePerMl", "season", "totalStockMl", "updatedAt") SELECT "brand", "category", "createdAt", "description", "id", "images", "inspiredBy", "isActive", "isBestSeller", "lowStockThreshold", "marketPricePerMl", "name", "purchasePricePerMl", "season", "totalStockMl", "updatedAt" FROM "Perfume";
DROP TABLE "Perfume";
ALTER TABLE "new_Perfume" RENAME TO "Perfume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
