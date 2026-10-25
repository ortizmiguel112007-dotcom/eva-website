// Filtro de Prisma para consultas de productos que ve el público (catálogo,
// destacados, tienda, detalle, favoritos, carrito y pedidos).
// Excluye los productos de una emprendedora cuya cuenta está inhabilitada
// (o cuyo creador, si es otro integrante de una alianza, está inhabilitado).
export const soloEmprendedoraActiva = {
  AND: [
    { seccion: { emprendedora: { usuario: { activo: true } } } },
    { OR: [{ id_creador: null }, { creador: { activo: true } }] },
  ],
};