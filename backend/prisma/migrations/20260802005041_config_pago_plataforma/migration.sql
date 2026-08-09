-- CreateTable
CREATE TABLE "configuracion_pago" (
    "id" SERIAL NOT NULL,
    "nequi_numero" TEXT,
    "bancolombia_numero" TEXT,
    "bancolombia_tipo" TEXT,
    "titular_cuenta" TEXT,
    "acepta_contraentrega" BOOLEAN NOT NULL DEFAULT true,
    "actualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_pago_pkey" PRIMARY KEY ("id")
);
