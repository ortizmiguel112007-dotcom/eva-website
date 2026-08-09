import { useNavigate } from "react-router-dom";
import "@/infrastructure/css/usuario/dashboard/loading/DashboardFooter.css"

const LINKS = [
  {
    titulo: "Compras",
    items: [
      { label: "Explorar catálogo", ruta: "/productos" },
      { label: "Ver tiendas",       ruta: "/tiendas" },
      { label: "Mi carrito",        ruta: "/carrito" },
      { label: "Mis pedidos",       ruta: "/mis-pedidos" },
    ],
  },
  {
    titulo: "Mi cuenta",
    items: [
      { label: "Mi perfil",     ruta: "/perfil" },
      { label: "Historial",     ruta: "/mis-pedidos" },
      { label: "Seguimiento",   ruta: "/seguimiento" },
      { label: "Mis reseñas",   ruta: "/mis-resenas" },
    ],
  },
  {
    titulo: "Ayuda",
    items: [
      { label: "Preguntas frecuentes" },
      { label: "Políticas de envío" },
      { label: "Devoluciones" },
      { label: "Contacto" },
    ],
  },
];

export function DashboardFooter() {
  const navigate = useNavigate();
  return (
    <footer>
      <div className="ud-footer">
        <div className="ud-footer-brand">
          <h3>EVA</h3>
          <p>Marketplace de emprendedoras. Conectamos talento con personas que valoran lo hecho a mano.</p>
        </div>
        {LINKS.map((col) => (
          <div key={col.titulo} className="ud-footer-col">
            <h4>{col.titulo}</h4>
            <ul>
              {col.items.map((item) => (
                <li key={item.label} onClick={() => item.ruta && navigate(item.ruta)}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="ud-footer-bottom">
        <p>© {new Date().getFullYear()} EVA Marketplace. Todos los derechos reservados.</p>
        <p>Hecho con amor por emprendedoras</p>
      </div>
    </footer>
  );
}