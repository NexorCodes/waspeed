-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "wl_id" TEXT NOT NULL,
    "data" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "viewer" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "btnName" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_wl_id_fkey" FOREIGN KEY ("wl_id") REFERENCES "white_labels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
