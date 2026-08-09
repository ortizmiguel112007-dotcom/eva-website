import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi"
import { useState } from "react"

export function CamposBase({ form, errores, onChange }) {
  const [verPass, setVerPass] = useState(false)
  const [verConf, setVerConf] = useState(false)

  return (
    <>
      <div className="container-input">
        <FiUser />
        <label htmlFor="nombre">Nombre completo</label>
        <input id="nombre" type="text" placeholder="Ej: María García"
          value={form.nombre}
          onChange={e => onChange("nombre", e.target.value)}
          className={errores.nombre ? "input-error" : ""}
          required />
      </div>
      {errores.nombre && <p className="re-campo-error">{errores.nombre}</p>}

      <div className="container-input">
        <FiMail />
        <label htmlFor="email">Correo</label>
        <input id="email" type="email" placeholder="Ej: maria@gmail.com"
          value={form.email}
          onChange={e => onChange("email", e.target.value)}
          className={errores.email ? "input-error" : ""}
          required />
      </div>
      {errores.email && <p className="re-campo-error">{errores.email}</p>}

      <div className="container-input">
        <FiPhone />
        <label htmlFor="telefono">Teléfono</label>
        <input id="telefono" type="tel" placeholder="Ej: 3001234567"
          value={form.telefono}
          onChange={e => onChange("telefono", e.target.value)}
          className={errores.telefono ? "input-error" : ""}
          required />
      </div>
      {errores.telefono && <p className="re-campo-error">{errores.telefono}</p>}

      <div className="container-input">
        <FiLock />
        <label htmlFor="password">Contraseña</label>
        <div className="re-pass-wrapper">
          <input id="password" type={verPass ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={e => onChange("password", e.target.value)}
            className={`re-pass-input ${errores.password ? "input-error" : ""}`}
            required />
          <button type="button" className="re-pass-toggle" onClick={() => setVerPass(p => !p)}>
            {verPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>
      </div>
      {errores.password && <p className="re-campo-error">{errores.password}</p>}

      <div className="container-input">
        <FiLock />
        <label htmlFor="confirmar">Confirmar</label>
        <div className="re-pass-wrapper">
          <input id="confirmar" type={verConf ? "text" : "password"}
            placeholder="Repite tu contraseña"
            value={form.confirmar}
            onChange={e => onChange("confirmar", e.target.value)}
            className={`re-pass-input ${errores.confirmar ? "input-error" : ""}`}
            required />
          <button type="button" className="re-pass-toggle" onClick={() => setVerConf(p => !p)}>
            {verConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>
      </div>
      {errores.confirmar && <p className="re-campo-error">{errores.confirmar}</p>}
    </>
  )
}