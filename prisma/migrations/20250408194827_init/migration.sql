-- CreateTable
CREATE TABLE "white_labels" (
    "id" TEXT NOT NULL,
    "checkout" TEXT NOT NULL,
    "tutorial" TEXT NOT NULL,
    "webhook" TEXT NOT NULL,
    "cor_primaria" INTEGER NOT NULL DEFAULT 0,
    "banner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "install" TEXT NOT NULL,
    "uninstall" TEXT NOT NULL,
    "rewards" TEXT NOT NULL,

    CONSTRAINT "white_labels_pkey" PRIMARY KEY ("id")
);
