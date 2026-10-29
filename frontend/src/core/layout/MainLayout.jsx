import { Outlet } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";
import { useNavigate, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCarrito } from "@/core/context/CarritoContext";
import CarritoDrawer from "@/core/context/CarritoDrawer";
import {
  FiPackage,
  FiStar,
  FiFileText,
  FiCreditCard,
  FiDollarSign,
  FiTag,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import axios from "axios";
import { MdOutlineReceiptLong } from "react-icons/md";
import { FaBell, FaHeart } from "react-icons/fa";
import "@/infrastructure/css/Sidebar.css";
import Logo from "@/infrastructure/imgs/Logo.png";

import {
  FaRegUserCircle,
  FaHome,
  FaShoppingBag,
  FaStore,
  FaUser,
  FaShoppingCart,
  MdKeyboardArrowLeft,
  MdLogout,
  MdLocalOffer,
  BsSearch,
} from "@/infrastructure/icons/index.js";

import { FiMessageSquare, FiUsers } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { RiCoupon3Line } from "react-icons/ri";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
/* ─────────────────────────────────────────────
   HOOK – detecta si es móvil (≤768px)
───────────────────────────────────────────── */
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= breakpoint,
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
};

/* ─────────────────────────────────────────────
   PORTAL TOOLTIP
───────────────────────────────────────────── */
const TooltipPortal = ({ anchorRef, children, visible }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!visible || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.top, left: rect.right });
  }, [visible]);
  if (!visible) return null;
  return createPortal(
    <div className="portal-tooltip" style={{ top: pos.top, left: pos.left }}>
      {children}
    </div>,
    document.body,
  );
};

/* ─────────────────────────────────────────────
   ITEM SIMPLE
───────────────────────────────────────────── */
const ItemSimple = ({ to, icon: Icon, label, sidebarClosed }) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  return (
    <li
      className="aside-li"
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink
        to={to}
        className={({ isActive }) =>
          `item-component${isActive ? " active" : ""}`
        }
      >
        <Icon className="aside-icon normal" />
        <div className="Text-content">
          <p className="aside-text">{label}</p>
        </div>
      </NavLink>
      {sidebarClosed && (
        <TooltipPortal anchorRef={ref} visible={hovered}>
          <div className="portal-tooltip-simple">
            <p className="aside-text">{label}</p>
          </div>
        </TooltipPortal>
      )}
    </li>
  );
};

/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */
const SectionLabel = ({ label, sidebarOpen }) => {
  if (!sidebarOpen) return null;
  return (
    <li className="aside-section-label">
      <span>{label}</span>
    </li>
  );
};

/* ─────────────────────────────────────────────
   AUTH BUTTONS
───────────────────────────────────────────── */
const AuthButtons = ({ className = "" }) => {
  const { user } = useAuth();
  if (user) return null;
  return (
    <div className={`auth-buttons${className ? " " + className : ""}`}>
      <NavLink end to="/login" className="content-login">
        <p>Ingresar</p>
      </NavLink>
      <NavLink to="/registro" className="content-register">
        <p>Registrarse</p>
      </NavLink>
    </div>
  );
};

/* ─────────────────────────────────────────────
   AVATAR con iniciales
───────────────────────────────────────────── */
const UserAvatar = ({ nombre }) => {
  const initials = nombre
    ? nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="aside-avatar">
      <span>{initials}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   LAYOUT PRINCIPAL
───────────────────────────────────────────── */
function MainLayout() {
  const isMobile = useIsMobile(768);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const { totalItems, setCarritoAbierto } = useCarrito();

  const { user, logout, idEmprendedora, token } = useAuth();
  const navigate = useNavigate();

  const isEmprendedora = user?.rol === "emprendedora";
  const isAdmin = user?.rol === "admin";
  const isUsuario = user?.rol === "usuario";

  const { limpiarCarrito } = useCarrito();

  const [noLeidas, setNoLeidas] = useState(0);

  useEffect(() => {
    if (!token || (!isUsuario && !isEmprendedora && !isAdmin)) return;
    axios
      .get(`${API_URL}/api/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNoLeidas(res.data.filter((n) => !n.leida).length);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (isMobile) setDrawerOpen(false);
    else {
      setDrawerOpen(false);
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleDesktop = () => {
    const opening = !sidebarOpen;
    setSidebarOpen(opening);
    if (opening) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);
    }
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);
  const closeDrawer = () => setDrawerOpen(false);
  const effectiveOpen = isMobile ? drawerOpen : sidebarOpen;

  const asideClass = [
    "aside",
    isMobile
      ? drawerOpen
        ? "mobile-open"
        : "mobile-closed"
      : !sidebarOpen
        ? "close"
        : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleLogout = () => {
    limpiarCarrito(); // 🆕
    logout();
    navigate("/login");
  };
  return (
    <>
      {isMobile && drawerOpen && (
        <div className="sidebar-overlay" onClick={closeDrawer} />
      )}

      {/* ══ SIDEBAR ══ */}
      <aside className={asideClass}>
        {/* Logo */}
        <div className="aside-logo">
          <img src={Logo} alt="Logo" />
          <span>EVA</span>
          {!isMobile && (
            <MdKeyboardArrowLeft
              className="aside-arrow"
              onClick={toggleDesktop}
            />
          )}
          {isMobile && (
            <button
              className="aside-close-btn"
              onClick={closeDrawer}
              aria-label="Cerrar menú"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="2" y1="2" x2="14" y2="14" />
                <line x1="14" y1="2" x2="2" y2="14" />
              </svg>
            </button>
          )}
        </div>

        {/* Scroll area */}
        <div className={`aside-items-scroll${animating ? " no-click" : ""}`}>
          <div className="aside-items">
            <ul className="items">
              {/* ── ADMIN ── */}
              {isAdmin ? (
                <>
                  {/* DASHBOARD */}

                                    {/* INICIO */}

                  <SectionLabel label="INICIO" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/"
                    icon={FaHome}
                    label="Inicio"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin"
                    icon={FiBarChart2}
                    label="Panel de control"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* USUARIOS */}

                  <SectionLabel label="USUARIOS" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/Admincrud"
                    icon={FaUser}
                    label="Gestionar usuarios"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/users"
                    icon={FiUsers}
                    label="Solicitudes Emprendedoras"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/roles"
                    icon={FaRegUserCircle}
                    label="Roles"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* CATÁLOGO */}

                  <SectionLabel label="CATÁLOGO" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/admin/productos"
                    icon={FaStore}
                    label="Gestionar productos"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/inventario"
                    icon={MdOutlineInventory2}
                    label="Auditoría de Inventario"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* PEDIDOS Y PAGOS */}

                  <SectionLabel
                    label="PEDIDOS Y PAGOS"
                    sidebarOpen={effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/pedidos"
                    icon={FaShoppingBag}
                    label="Ver todos los pedidos"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/pagos"
                    icon={FiDollarSign}
                    label="Gestión de pagos"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/metodos-pago"
                    icon={FiCreditCard}
                    label="Métodos de pago"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/liquidaciones"
                    icon={FiDollarSign}
                    label="Liquidaciones"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/facturas"
                    icon={FiFileText}
                    label="Facturas"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* RESEÑAS */}

                  <SectionLabel label="RESEÑAS" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/admin/resenas"
                    icon={FiStar}
                    label="Moderar comentarios"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* PROMOCIONES */}

                  <SectionLabel
                    label="PROMOCIONES"
                    sidebarOpen={effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/destacados"
                    icon={MdLocalOffer}
                    label="Destacados"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/admin/cupones"
                    icon={RiCoupon3Line}
                    label="Cupones"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* ALIANZAS */}

                  <SectionLabel label="ALIANZAS" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/admin/alianzas"
                    icon={FiUsers}
                    label="Promociones colaborativas"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* SISTEMA */}

                  <SectionLabel label="SISTEMA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/admin/logs"
                    icon={FiFileText}
                    label="Auditoría"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* MI CUENTA */}

                  <SectionLabel label="MI CUENTA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/admin/perfil"
                    icon={FaRegUserCircle}
                    label="Mi perfil"
                    sidebarClosed={!effectiveOpen}
                  />
                </>
              ) : /* ── EMPRENDEDORA ── */
              isEmprendedora ? (
                <>
                  {/* DASHBOARD */}

                  <SectionLabel label="INICIO" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/"
                    icon={FaHome}
                    label="Inicio"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/dashboard"
                    icon={FaStore}
                    label="Mis Productos"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* VENTAS */}

                  <SectionLabel label="VENTAS" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/pedidos"
                    icon={FaShoppingBag}
                    label="Pedidos"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/pagos"
                    icon={FiDollarSign}
                    label="Comprobantes de Pago"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/liquidaciones"
                    icon={FiDollarSign}
                    label="Mis liquidaciones"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/facturas"
                    icon={FiFileText}
                    label="Facturas"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* INVENTARIO */}

                  <SectionLabel
                    label="INVENTARIO"
                    sidebarOpen={effectiveOpen}
                  />

                  <ItemSimple
                    to="/inventario"
                    icon={MdOutlineInventory2}
                    label="Stock e Inventario"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* TIENDA */}

                  <SectionLabel label="MI TIENDA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/metodos-pago-config"
                    icon={FiCreditCard}
                    label="Métodos de pago"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to={`/tienda/${idEmprendedora}`}
                    icon={FaStore}
                    label="Ver mi tienda"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* MARKETING */}

                  <SectionLabel label="MARKETING" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/destacados"
                    icon={MdLocalOffer}
                    label="Destacados"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/cupones"
                    icon={RiCoupon3Line}
                    label="Cupones"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/reglas-descuento"
                    icon={FiTag}
                    label="Reglas de descuento"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/alianzas"
                    icon={FiUsers}
                    label="Alianzas"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* CLIENTES */}

                  <SectionLabel label="CLIENTES" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/comentarios"
                    icon={FiMessageSquare}
                    label="Comentarios"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* AGENDA */}
                  <SectionLabel label="AGENDA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/gestion-citas"
                    icon={FiMessageSquare}
                    label="Gestión de citas"
                    sidebarClosed={!effectiveOpen}
                  />
                  <ItemSimple
                    to="/disponibilidad"
                    icon={FiClock}
                    label="Mi disponibilidad"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* MI CUENTA */}

                  <SectionLabel label="MI CUENTA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/mi-perfil"
                    icon={FaRegUserCircle}
                    label="Mi perfil"
                    sidebarClosed={!effectiveOpen}
                  />
                </>
              ) : /* ── USUARIO CLIENTE ── */
              isUsuario ? (
                <>
                  {/* INICIO */}

                  <SectionLabel label="INICIO" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/"
                    icon={FaHome}
                    label="Inicio"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/productos"
                    icon={BsSearch}
                    label="Explorar"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* COMPRAS */}

                  <SectionLabel label="COMPRAS" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/carrito"
                    icon={FaShoppingCart}
                    label="Carrito"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/mis-pedidos"
                    icon={FaShoppingBag}
                    label="Mis pedidos"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/seguimiento"
                    icon={FiPackage}
                    label="Seguimiento de pedidos"
                    sidebarClosed={!effectiveOpen}
                  />
                  {/* AGENDA */}
                  <SectionLabel label="AGENDA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/mis-citas"
                    icon={FiMessageSquare}
                    label="Mis citas"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* PAGOS */}

                  <SectionLabel label="PAGOS" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/metodos-pago"
                    icon={FiCreditCard}
                    label="Métodos de pago"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/historial-pagos"
                    icon={MdOutlineReceiptLong}
                    label="Historial de pagos"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* INTERACCIÓN */}

                  <SectionLabel
                    label="INTERACCIÓN"
                    sidebarOpen={effectiveOpen}
                  />

                  <ItemSimple
                    to="/mis-resenas"
                    icon={FiStar}
                    label="Mis reseñas y calificaciones"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* PROMOCIONES */}

                  <SectionLabel
                    label="PROMOCIONES"
                    sidebarOpen={effectiveOpen}
                  />

                  <ItemSimple
                    to="/mis-cupones"
                    icon={RiCoupon3Line}
                    label="Cupones"
                    sidebarClosed={!effectiveOpen}
                  />

                  <ItemSimple
                    to="/destacados-pub"
                    icon={MdLocalOffer}
                    label="Ofertas / Destacados"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* DOCUMENTOS */}

                  <SectionLabel
                    label="DOCUMENTOS"
                    sidebarOpen={effectiveOpen}
                  />

                  <ItemSimple
                    to="/mis-facturas"
                    icon={FiFileText}
                    label="Facturas"
                    sidebarClosed={!effectiveOpen}
                  />

                  {/* MI CUENTA */}

                  <SectionLabel label="MI CUENTA" sidebarOpen={effectiveOpen} />

                  <ItemSimple
                    to="/perfil"
                    icon={FaRegUserCircle}
                    label="Mi perfil"
                    sidebarClosed={!effectiveOpen}
                  />
                </>
              ) : (
                /* ── PÚBLICO ── */
                <>
                  <ItemSimple
                    to="/"
                    icon={FaHome}
                    label="Inicio"
                    sidebarClosed={!effectiveOpen}
                  />
                  {/* <ItemSimple
                    to="/productos"
                    icon={FaShoppingBag}
                    label="Catálogo"
                    sidebarClosed={!effectiveOpen}
                  />
                  <ItemSimple
                    to="/tiendas"
                    icon={FaStore}
                    label="Tiendas"
                    sidebarClosed={!effectiveOpen}
                  /> */}
                  {/* CATÁLOGO MOBILE */}

                  {isMobile && (
                    <li className="aside-li aside-li--divider">
                      <ul className="catalog-links-mobile">
                        {/* TIENDAS */}
                        <li>
                          <NavLink
                            end
                            to="/tiendas"
                            className={({ isActive }) =>
                              `item-component${isActive ? " active" : ""}`
                            }
                          >
                            <FaStore className="aside-icon normal" />

                            <div className="Text-content">
                              <p className="aside-text">Tiendas</p>
                            </div>
                          </NavLink>
                        </li>

                        {/* PRODUCTOS */}
                        <li>
                          <NavLink
                            end
                            to="/productos"
                            className={({ isActive }) =>
                              `item-component${isActive ? " active" : ""}`
                            }
                          >
                            <FaShoppingBag className="aside-icon normal" />

                            <div className="Text-content">
                              <p className="aside-text">Productos</p>
                            </div>
                          </NavLink>
                        </li>
                      </ul>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Botones auth */}
        <AuthButtons className="sidebar-auth" />

        {/* roles */}
        <div
          className="aside-user"
          onClick={() => {
            if (isEmprendedora) navigate("/mi-perfil");
            if (isUsuario) navigate("/perfil");
            if (isAdmin) navigate("/admin/perfil");
          }}
          style={{
            cursor:
              isEmprendedora || isUsuario || isAdmin ? "pointer" : "default",
          }}
        >
          {user ? (
            <>
              <UserAvatar nombre={user.nombre} />
              <div className="aside-user-info">
                <span className="aside-user-name">{user.nombre}</span>
                <span className="aside-user-role">
                  {user.rol === "emprendedora"
                    ? "Emprendedora"
                    : user.rol === "usuario"
                      ? "Cliente"
                      : user.rol}
                </span>
              </div>
              <MdLogout
                className="aside-user-icon congif"
                onClick={handleLogout}
                title="Cerrar sesión"
              />
            </>
          ) : (
            <>
              <FaRegUserCircle className="aside-user-icon" />
              <span>Sin registrarse</span>
            </>
          )}
        </div>
      </aside>

      {/* ══ HEADER ══ */}
      <header
        className={`header-container${sidebarOpen && !isMobile ? "" : isMobile ? " header-mobile" : " header-collapsed"}`}
      >
        {isMobile && (
          <button
            className="hamburger-btn"
            onClick={toggleDrawer}
            aria-label="Abrir menú"
            aria-expanded={drawerOpen}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {drawerOpen ? (
                <>
                  <line x1="4" y1="4" x2="18" y2="18" />
                  <line x1="18" y1="4" x2="4" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="19" y2="6" />
                  <line x1="3" y1="11" x2="19" y2="11" />
                  <line x1="3" y1="16" x2="19" y2="16" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* Nav catálogo — solo para no emprendedoras y no admin */}
        {!isMobile && !isEmprendedora && !isAdmin && (
          <nav className="header-content-catalogo">
            <NavLink end to={isUsuario ? "/productos" : "/catalogo"}>
              <p>Catálogo</p>
            </NavLink>
            <NavLink end to="/tiendas">
              <p>Tiendas</p>
            </NavLink>
          </nav>
        )}

        {/* Iconos de acción — solo para usuario cliente y público */}
        {!isEmprendedora && !isAdmin && (
          <div className="header-actions">
            <button
              className="carrito-btn"
              onClick={() => setCarritoAbierto(true)}
            >
              <FaShoppingCart />
              {totalItems > 0 && (
                <span className="carrito-badge">{totalItems}</span>
              )}
            </button>
            <button
              className="notif-btn"
              onClick={() => navigate("/notificaciones")}
              style={{ position: "relative" }}
            >
              <FaBell />
              {noLeidas > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    border: "2px solid #0f172a",
                  }}
                >
                  {noLeidas}
                </span>
              )}
            </button>
            <button className="fav-btn" onClick={() => navigate("/favoritos")}>
              <FaHeart />
            </button>
          </div>
        )}
        {isEmprendedora && (
          <div className="header-actions">
            <button
              className="notif-btn"
              onClick={() => navigate("/notificaciones-emp")}
              style={{ position: "relative" }}
            >
              <FaBell />
              {noLeidas > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "999px",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    minWidth: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 3px",
                    border: "2px solid #0f172a",
                  }}
                >
                  {noLeidas}
                </span>
              )}
            </button>
            <button
              className="fav-btn"
              onClick={() => navigate("/favoritos-tienda")}
            >
              <FaHeart />
            </button>
          </div>
        )}
        {isAdmin && (
          <div className="header-actions">
            {isAdmin && (
              <div className="header-actions">
                <button
                  className="notif-btn"
                  onClick={() => navigate("/tiendas")}
                  title="Ver tiendas"
                >
                  <FaStore />
                </button>
                <button
                  className="notif-btn"
                  onClick={() => navigate("/notificaciones-admin")}
                  style={{ position: "relative" }}
                >
                  <FaBell />
                  {noLeidas > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "999px",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                        border: "2px solid #0f172a",
                      }}
                    >
                      {noLeidas}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ══ CONTENIDO ══ */}
      <div
        className={`page-content${sidebarOpen && !isMobile ? "" : isMobile ? " page-content--mobile" : " page-content--collapsed"}`}
      >
        <Outlet />
      </div>

      <CarritoDrawer />
    </>
  );
}

export default MainLayout;
