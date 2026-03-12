-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" SERIAL NOT NULL,
    "id_usuario_accion" INTEGER NOT NULL,
    "id_registro" INTEGER NOT NULL,
    "tabla_afectada" VARCHAR(50) NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "detalles" VARCHAR(500),

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_id_usuario_accion_fkey" FOREIGN KEY ("id_usuario_accion") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
