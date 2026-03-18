import { Outlet } from "react-router-dom";
import { useAuth } from "@/core/context/AuthConten";
import { useNavigate, NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
 
import '@/infrastructure/css/Sidebar.css'
import Logo from '@/infrastructure/imgs/Logo.png';
 
import {
    FaRegUserCircle,
    FaHome,
    FaShoppingBag,
    FaStore,
    MdKeyboardArrowLeft,
    BsSearch,
    MdLogout,
    MdLocalOffer,
} from '@/infrastructure/icons/index.js';
 
import { FiMessageSquare, FiUsers } from 'react-icons/fi';
import { MdOutlineInventory2 } from 'react-icons/md';
import { RiCoupon3Line } from 'react-icons/ri';
 
/* ─────────────────────────────────────────────
   HOOK – detecta si es móvil (≤768px)
───────────────────────────────────────────── */
const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== 'undefined' && window.innerWidth <= breakpoint
    )
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth <= breakpoint)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [breakpoint])
    return isMobile
}
 
/* ─────────────────────────────────────────────
   PORTAL TOOLTIP
───────────────────────────────────────────── */
const TooltipPortal = ({ anchorRef, children, visible }) => {
    const [pos, setPos] = useState({ top: 0, left: 0 })
    useEffect(() => {
        if (!visible || !anchorRef.current) return
        const rect = anchorRef.current.getBoundingClientRect()
        setPos({ top: rect.top, left: rect.right })
    }, [visible])
    if (!visible) return null
    return createPortal(
        <div className="portal-tooltip" style={{ top: pos.top, left: pos.left }}>
            {children}
        </div>,
        document.body
    )
}
 
/* ─────────────────────────────────────────────
   ITEM SIMPLE
───────────────────────────────────────────── */
const ItemSimple = ({ to, icon: Icon, label, sidebarClosed }) => {
    const [hovered, setHovered] = useState(false)
    const ref = useRef(null)
    return (
        <li
            className="aside-li"
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <NavLink to={to} className={({ isActive }) => `item-component${isActive ? ' active' : ''}`}>
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
    )
}
 
/* ─────────────────────────────────────────────
   SECTION LABEL
───────────────────────────────────────────── */
const SectionLabel = ({ label, sidebarOpen }) => {
    if (!sidebarOpen) return null
    return (
        <li className="aside-section-label">
            <span>{label}</span>
        </li>
    )
}
 
/* ─────────────────────────────────────────────
   AUTH BUTTONS
───────────────────────────────────────────── */
const AuthButtons = ({ className = '' }) => {
    const { user } = useAuth()
    if (user) return null
    return (
        <div className={`auth-buttons${className ? ' ' + className : ''}`}>
            <NavLink end to="/login" className="content-login"><p>Ingresar</p></NavLink>
            <NavLink end to="/registro" className="content-register"><p>Registrarse</p></NavLink>
        </div>
    )
}
 
/* ─────────────────────────────────────────────
   AVATAR con iniciales
───────────────────────────────────────────── */
const UserAvatar = ({ nombre }) => {
    const initials = nombre
        ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : '?'
    return (
        <div className="aside-avatar">
            <span>{initials}</span>
        </div>
    )
}
 
/* ─────────────────────────────────────────────
   LAYOUT PRINCIPAL
───────────────────────────────────────────── */
function MainLayout() {
    const isMobile = useIsMobile(768)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [animating, setAnimating] = useState(false)
 
    const { user, logout } = useAuth()
    const navigate = useNavigate()
 
    const isEmprendedora = user?.rol === 'emprendedora'
 
    useEffect(() => {
        if (isMobile) setDrawerOpen(false)
        else { setDrawerOpen(false); setSidebarOpen(true) }
    }, [isMobile])
 
    const toggleDesktop = () => {
        const opening = !sidebarOpen
        setSidebarOpen(opening)
        if (opening) {
            setAnimating(true)
            setTimeout(() => setAnimating(false), 700)
        }
    }
 
    const toggleDrawer = () => setDrawerOpen(prev => !prev)
    const closeDrawer = () => setDrawerOpen(false)
    const effectiveOpen = isMobile ? drawerOpen : sidebarOpen
 
    const asideClass = [
        'aside',
        isMobile
            ? (drawerOpen ? 'mobile-open' : 'mobile-closed')
            : (!sidebarOpen ? 'close' : ''),
    ].filter(Boolean).join(' ')
 
    const handleLogout = () => { logout(); navigate('/login') }
 
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
                        <MdKeyboardArrowLeft className="aside-arrow" onClick={toggleDesktop} />
                    )}
                    {isMobile && (
                        <button className="aside-close-btn" onClick={closeDrawer} aria-label="Cerrar menú">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="2" y1="2" x2="14" y2="14" />
                                <line x1="14" y1="2" x2="2" y2="14" />
                            </svg>
                        </button>
                    )}
                </div>
 
                {/* Buscador */}
                <div className="search-container">
                    <input type="search" className="search-input" placeholder="Buscar..." />
                    <BsSearch className="search-icon" />
                </div>
 
                {/* Scroll area */}
                <div className={`aside-items-scroll${animating ? ' no-click' : ''}`}>
                    <div className="aside-items">
                        <ul className="items">
 
                            {isEmprendedora ? (
                                <>
                                    {/* GENERAL */}
                                    <SectionLabel label="GENERAL" sidebarOpen={effectiveOpen} />
                                    <ItemSimple to="/dashboard"  icon={FaStore}            label="Mis Productos"      sidebarClosed={!effectiveOpen} />
                                    <ItemSimple to="/pedidos"    icon={FaShoppingBag}       label="Pedidos"            sidebarClosed={!effectiveOpen} />
                                    <ItemSimple to="/inventario" icon={MdOutlineInventory2} label="Stock e Inventario" sidebarClosed={!effectiveOpen} />
 
                                    {/* MARKETING */}
                                    <SectionLabel label="MARKETING" sidebarOpen={effectiveOpen} />
                                    <ItemSimple to="/destacados" icon={MdLocalOffer}    label="Destacados" sidebarClosed={!effectiveOpen} />
                                    <ItemSimple to="/cupones"    icon={RiCoupon3Line}   label="Cupones"    sidebarClosed={!effectiveOpen} />
                                    <ItemSimple to="/alianzas"   icon={FiUsers}         label="Alianzas"   sidebarClosed={!effectiveOpen} />
 
                                    {/* CLIENTES */}
                                    <SectionLabel label="CLIENTES" sidebarOpen={effectiveOpen} />
                                    <ItemSimple to="/comentarios" icon={FiMessageSquare} label="Comentarios" sidebarClosed={!effectiveOpen} />
                                </>
                            ) : (
                                <>
                                    <ItemSimple to="/" icon={FaHome} label="Inicio" sidebarClosed={!effectiveOpen} />
                                    {isMobile && (
                                        <li className="aside-li aside-li--divider">
                                            <ul className="catalog-links-mobile">
                                                <li>
                                                    <NavLink end to="/tiendas" className={({ isActive }) => `item-component${isActive ? ' active' : ''}`}>
                                                        <span className="aside-icon normal">🏪</span>
                                                        <div className="Text-content"><p className="aside-text">Tiendas</p></div>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink end to="/productos" className={({ isActive }) => `item-component${isActive ? ' active' : ''}`}>
                                                        <span className="aside-icon normal">📦</span>
                                                        <div className="Text-content"><p className="aside-text">Productos</p></div>
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink end to="/servicios" className={({ isActive }) => `item-component${isActive ? ' active' : ''}`}>
                                                        <span className="aside-icon normal">🛠</span>
                                                        <div className="Text-content"><p className="aside-text">Servicios</p></div>
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
 
                {/* Usuario */}
                <div className="aside-user" onClick={() => isEmprendedora ? navigate('/perfil') : null} style={{ cursor: isEmprendedora ? 'pointer' : 'default' }}>
                    {user ? (
                        <>
                            <UserAvatar nombre={user.nombre} />
                            <div className="aside-user-info">
                                <span className="aside-user-name">{user.nombre}</span>
                                <span className="aside-user-role">
                                    {user.rol === 'emprendedora' ? 'Emprendedora' : user.rol}
                                </span>
                            </div>
                            <MdLogout className='aside-user-icon congif' onClick={handleLogout} title="Cerrar sesión" />
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
            <header className={`header-container${sidebarOpen && !isMobile ? '' : isMobile ? ' header-mobile' : ' header-collapsed'}`}>
                {isMobile && (
                    <button className="hamburger-btn" onClick={toggleDrawer} aria-label="Abrir menú" aria-expanded={drawerOpen}>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {drawerOpen ? (
                                <><line x1="4" y1="4" x2="18" y2="18" /><line x1="18" y1="4" x2="4" y2="18" /></>
                            ) : (
                                <><line x1="3" y1="6" x2="19" y2="6" /><line x1="3" y1="11" x2="19" y2="11" /><line x1="3" y1="16" x2="19" y2="16" /></>
                            )}
                        </svg>
                    </button>
                )}
                {!isMobile && !isEmprendedora && (
                    <nav className="header-content-catalogo">
                        <NavLink end to="/tiendas"><p>Tiendas</p></NavLink>
                        <NavLink end to="/productos"><p>Productos</p></NavLink>
                        <NavLink end to="/servicios"><p>Servicios</p></NavLink>
                    </nav>
                )}
            </header>
 
            {/* ══ CONTENIDO ══ */}
            <div className={`page-content${sidebarOpen && !isMobile ? '' : isMobile ? ' page-content--mobile' : ' page-content--collapsed'}`}>
                <Outlet />
            </div>
        </>
    )
}
 
export default MainLayout