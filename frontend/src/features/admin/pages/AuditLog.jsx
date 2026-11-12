
import { useEffect, useMemo, useState } from "react";
import { adminService } from "@/features/admin/services/admin.service";
import "@/infrastructure/css/admin/auditoria/Auditoria.css";

const MODULOS = {
  producto: "Productos",
  productos: "Productos",
  inventario: "Inventario",
  pedidos: "Pedidos",
  pedido: "Pedidos",
  pagos: "Pagos",
  pago: "Pagos",
  usuario: "Usuarios",
  usuarios: "Usuarios",
  cupon: "Cupones",
  cupones: "Cupones",
  alianza: "Alianzas",
  alianzas: "Alianzas",
  resena: "Reseñas",
  resenas: "Reseñas",
  destacado: "Destacados",
  promocion: "Promociones",
  cita: "Citas",
  citas: "Citas",
};

const ACCIONES = {
  CREAR: "Creación",
  ACTUALIZAR: "Actualización",
  AJUSTE: "Ajuste de inventario",
  ENTRADA: "Entrada de inventario",
  SALIDA: "Salida de inventario",
  ACTUALIZAR_LIMITES: "Actualización de límites",
  PUBLICAR: "Publicación",
  OCULTAR: "Ocultamiento",
  APROBAR: "Aprobación",
  RECHAZAR: "Rechazo",
  DESHABILITAR: "Deshabilitación",
  ACTIVAR: "Activación",
  DESACTIVAR: "Desactivación",
  CAMBIO_ROL: "Cambio de rol",
  CANCELAR: "Cancelación",
  ACTUALIZAR_ESTADO: "Cambio de estado",
  COMPROBANTE_SUBIDO: "Comprobante subido",
  REENVIAR_COMPROBANTE: "Reenvío de comprobante",
};

const obtenerModulo = (tabla) => {
  if (!tabla) return "General";
  return MODULOS[tabla.toLowerCase()] ||
    tabla.charAt(0).toUpperCase() + tabla.slice(1);
};

const obtenerAccion = (accion) => {
  if (!accion) return "Actividad";
  return ACCIONES[accion.toUpperCase()] || accion.replaceAll("_", " ");
};

const obtenerClaseAccion = (accion) => {
  const valor = (accion || "").toUpperCase();

  if (["APROBAR", "ACTIVAR", "ENTRADA", "PUBLICAR"].includes(valor)) {
    return "accion-exito";
  }

  if (["RECHAZAR", "CANCELAR", "DESACTIVAR", "SALIDA"].includes(valor)) {
    return "accion-peligro";
  }

  if (["AJUSTE", "ACTUALIZAR_LIMITES"].includes(valor)) {
    return "accion-advertencia";
  }

  if (["CREAR", "COMPROBANTE_SUBIDO"].includes(valor)) {
    return "accion-creacion";
  }

  return "accion-info";
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Fecha no disponible";

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return "Fecha no disponible";
  }

  return fechaValida.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AuditLog() {
  const [registros, setRegistros] = useState([]);
  const [usuariosActivos, setUsuariosActivos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(8);

  useEffect(() => {
    Promise.all([
      adminService.listarAuditoria(),
      adminService.listarUsuarios(),
    ])
      .then(([auditoria, usuarios]) => {
        setRegistros(Array.isArray(auditoria) ? auditoria : []);
        setUsuariosActivos(
          Array.isArray(usuarios)
            ? usuarios.filter((usuario) => usuario.activo).length
            : 0
        );
      })
      .catch((error) => {
        console.error("Error al cargar la auditoría:", error);
      })
      .finally(() => setCargando(false));
  }, []);

  const accionesHoy = useMemo(() => {
    const hoy = new Date().toLocaleDateString("es-CO");

    return registros.filter((registro) => {
      if (!registro.fecha) return false;

      return new Date(registro.fecha).toLocaleDateString("es-CO") === hoy;
    }).length;
  }, [registros]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(registros.length / registrosPorPagina)
  );

  const registrosPagina = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return registros.slice(inicio, inicio + registrosPorPagina);
  }, [registros, paginaActual, registrosPorPagina]);

  const cambiarCantidad = (event) => {
    setRegistrosPorPagina(Number(event.target.value));
    setPaginaActual(1);
  };

  const cambiarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const primerRegistro =
    registros.length === 0
      ? 0
      : (paginaActual - 1) * registrosPorPagina + 1;

  const ultimoRegistro = Math.min(
    paginaActual * registrosPorPagina,
    registros.length
  );

  if (cargando) {
    return (
      <div className="auditoria-cargando">
        <div className="auditoria-spinner"></div>
        <p>Cargando registro de auditoría...</p>
      </div>
    );
  }

  return (
    <div className="auditoria-container">
      <div className="bienvenida-card">
        <div className="bienvenida-icono">
        </div>

        <div>
          <h2>Registro de Auditoría</h2>
          <p>
            Supervisa las actividades y los cambios realizados en el sistema.
          </p>
        </div>
      </div>

      <div className="metricas">
        <div className="metrica-card metrica-total">
          <div>
            <h3>{registros.length}</h3>
            <span>Acciones totales</span>
          </div>
        </div>

        <div className="metrica-card metrica-usuarios">
          <div>
            <h3>{usuariosActivos}</h3>
            <span>Usuarios activos</span>
          </div>
        </div>

        <div className="metrica-card metrica-hoy">
          <div>
            <h3>{accionesHoy}</h3>
            <span>Acciones hoy</span>
          </div>
        </div>
      </div>

      <section className="lista-auditoria">
        <div className="auditoria-lista-header">
          <div>
            <h3>Actividad reciente</h3>
            <p>Historial de acciones realizadas en EVA</p>
          </div>

          <span className="auditoria-contador">
            {registros.length} registros
          </span>
        </div>

        {registros.length === 0 ? (
          <div className="auditoria-empty">
            <h4>No hay registros todavía</h4>
            <p>Cuando se realicen acciones en el sistema, aparecerán aquí.</p>
          </div>
        ) : (
          <>
            <div className="registros-lista">
              {registrosPagina.map((registro) => (
                <article className="registro" key={registro.id_auditoria}>
                  <div className="registro-indicador"></div>

                  <div className="registro-contenido">
                    <div className="registro-cabecera">
                      <span
                        className={`registro-accion ${obtenerClaseAccion(
                          registro.accion
                        )}`}
                      >
                        {obtenerAccion(registro.accion)}
                      </span>

                      <span className="registro-modulo">
                        {obtenerModulo(registro.tabla_afectada)}
                      </span>
                    </div>

                    <p className="registro-detalles">
                      {registro.detalles || "Sin descripción disponible."}
                    </p>

                    <div className="registro-pie">
                      <span className="registro-usuario">
                        {registro.usuario?.nombre || "Sistema"}
                      </span>

                      <span className="registro-fecha">
                       
                        {formatearFecha(registro.fecha)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="auditoria-paginacion">
              <div className="paginacion-info">
                Mostrando <strong>{primerRegistro}-{ultimoRegistro}</strong> de{" "}
                <strong>{registros.length}</strong> registros
              </div>

              <div className="paginacion-controles">
                <label htmlFor="registrosPorPagina">
                  Mostrar:
                </label>

                <select
                  id="registrosPorPagina"
                  value={registrosPorPagina}
                  onChange={cambiarCantidad}
                >
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>

                <button
                  type="button"
                  className="pagina-flecha"
                  onClick={() => cambiarPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  aria-label="Página anterior"
                >
                  ‹
                </button>

                {Array.from({ length: totalPaginas }, (_, index) => index + 1).map(
                  (pagina) => (
                    <button
                      type="button"
                      key={pagina}
                      className={`pagina-numero ${
                        paginaActual === pagina ? "pagina-activa" : ""
                      }`}
                      onClick={() => cambiarPagina(pagina)}
                    >
                      {pagina}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagina-flecha"
                  onClick={() => cambiarPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  aria-label="Página siguiente"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
