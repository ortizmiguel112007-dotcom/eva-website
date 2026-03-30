import { useState } from "react";
import { useAuth } from "@/core/context/AuthConten";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { MdEmail, IoMdLock } from "@/infrastructure/icons/index.js";

import "@/infrastructure/css/Login.css";
import background from "@/infrastructure/imgs/Fondo2.png";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      console.log("Respuesta del servidor:", res.data);
      login(res.data.token);

      const decoded = jwtDecode(res.data.token);

      if (decoded.pendiente) {
        // redirige al inicio con mensaje
        navigate("/", { state: { mensaje: res.data.mensaje } });
      } else {
        const decoded = jwtDecode(res.data.token);
        if (decoded.rol === "emprendedora") navigate("/dashboard");
        else if (decoded.rol === "admin") navigate("/admin");
        else navigate("/");
      }
    } catch (error) {
      setMensaje(error.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="container-login">
      <div className="container-img-login">
        <div className="container-formulario-login">
          <h2>Iniciar sesión</h2>

          <form onSubmit={handleLogin} className="container-form-login">
            <div className="container-paddin-login">
              <div className="container-input-login">
                <MdEmail />
                <label htmlFor="email">Correo</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Ej: juan@gmail.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="container-input-login">
                <IoMdLock />
                <label htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {mensaje && <p className="mensaje-login">{mensaje}</p>}

            <div className="container-button-login">
              <button type="submit" disabled={cargando}>
                {cargando ? "Cargando..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>

        {/* Gato decorativo */}
        <div className="container-cat-login">
          <img src={background} alt="Decoración" />
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
