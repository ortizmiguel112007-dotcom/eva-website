import { useNavigate, NavLink } from "react-router-dom"
import { FiShoppingBag, FiTrendingUp } from "react-icons/fi"
import background from "@/infrastructure/imgs/Fondo2.png"
import "@/infrastructure/css/Registre.css"

export default function RegistroSelector() {
  const navigate = useNavigate()

  return (
    <section className="container-register">
      <div className="container-img">

        <div className="container-formulario" style={{ maxWidth: '44rem' }}>
          <h2>Únete a EVA</h2>

          <div className="container-paddin">
            <p className="mensaje-info" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              ¿Cómo quieres usar la plataforma?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>

              {/* Cliente */}
              <div
                onClick={() => navigate("/registro/cliente")}
                style={{
                  border: '2px solid rgba(242,242,242,0.2)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.05)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#29b1ff'; e.currentTarget.style.background = 'rgba(41,177,255,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(242,242,242,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                <div style={{
                  width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                  background: 'rgba(41,177,255,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <FiShoppingBag style={{ color: '#29b1ff', fontSize: '1.6rem' }} />
                </div>
                <h3 style={{ color: '#857f7f', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                  Soy cliente
                </h3>
                <p style={{ color: 'rgba(59, 59, 59, 0.65)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                  Explora productos y servicios de emprendedoras, realiza compras y deja reseñas.
                </p>
                <button
                  style={{
                    marginTop: '0.25rem', padding: '0.5rem 1.25rem',
                    borderRadius: '0.35rem', border: 'none',
                    background: '#29b1ff', color: '#fff',
                    fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  Registrarme como cliente
                </button>
              </div>

              {/* Emprendedora */}
              <div
                onClick={() => navigate("/registro/emprendedora")}
                style={{
                  border: '2px solid rgba(242,242,242,0.2)',
                  borderRadius: '0.75rem',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.05)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(245,158,11,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(242,242,242,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                <div style={{
                  width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                  background: 'rgba(245,158,11,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <FiTrendingUp style={{ color: '#f59e0b', fontSize: '1.6rem' }} />
                </div>
                <h3 style={{ color: '#857f7f', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                  Soy emprendedora
                </h3>
                <p style={{ color: 'rgba(59, 59, 59, 0.65)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5 }}>
                  Crea tu tienda, publica productos y servicios, y llega a más clientes.
                </p>
                <button
                  style={{
                    marginTop: '0.25rem', padding: '0.5rem 1.25rem',
                    borderRadius: '0.35rem', border: 'none',
                    background: '#f59e0b', color: '#fff',
                    fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
                  }}
                >
                  Quiero vender en EVA
                </button>
              </div>

            </div>
          </div>

          <div className="container-button" style={{ justifyContent: 'center', background: 'var(--gray-light)' }}>
            <p style={{ fontSize: '0.85rem', color: '#555', margin: 0 }}>
              ¿Ya tienes cuenta?{" "}
              <NavLink to="/login" style={{ color: '#0F172B', fontWeight: 700 }}>
                Inicia sesión aquí
              </NavLink>
            </p>
          </div>
        </div>

        <div className="container-cat">
          <img src={background} alt="Decoración" />
        </div>

      </div>
    </section>
  )
}