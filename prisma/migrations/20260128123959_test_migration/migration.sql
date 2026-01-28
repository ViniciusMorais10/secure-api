-- CreateTable
CREATE TABLE "Migration" (
    "id" SERIAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Migration_id_key" ON "Migration"("id");
