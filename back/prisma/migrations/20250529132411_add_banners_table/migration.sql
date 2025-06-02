-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('visible', 'hidden');

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'visible',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_index" INTEGER,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
