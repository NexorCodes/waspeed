-- CreateTable
CREATE TABLE "modelos_crm" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "arquivo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_crm_pkey" PRIMARY KEY ("id")
);
