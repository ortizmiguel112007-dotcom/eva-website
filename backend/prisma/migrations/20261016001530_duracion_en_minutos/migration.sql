/*
  Warnings:

  - The `duracion` column on the `producto` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable

ALTER TABLE "producto"
ALTER COLUMN "duracion" TYPE INTEGER
USING (
  CASE
    WHEN "duracion" IS NULL THEN NULL
    WHEN lower(trim("duracion"::TEXT)) = '1 hora' THEN 60
    WHEN trim("duracion"::TEXT) ~ '^[0-9]+$'
      THEN trim("duracion"::TEXT)::INTEGER
    ELSE NULL
  END
);
