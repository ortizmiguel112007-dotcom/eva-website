import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    try {
      const t = localStorage.getItem("token");
      return t ? jwtDecode(t) : null;
    } catch (error) {
      return null;
    }
  });

  const [idSeccion, setIdSeccion] = useState(() => {
    const saved = localStorage.getItem("id_seccion");
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    const seccion = localStorage.getItem("id_seccion");
    const decoded = t ? jwtDecode(t) : null;
    if (t && !seccion && decoded?.rol === "emprendedora") {
      cargarSeccion(t);
    }
  }, []);

  const cargarSeccion = async (t) => {
    try {
      const decoded = jwtDecode(t);
      if (decoded.rol !== "emprendedora") return;
      const res = await axios.get(
        "http://localhost:3000/api/emprendedora/mi-seccion",
        {
          headers: { Authorization: `Bearer ${t}` },
        },
      );
      const { id_seccion } = res.data;
      localStorage.setItem("id_seccion", id_seccion);
      setIdSeccion(id_seccion);
    } catch (error) {
      console.error("No se pudo cargar la sección:", error);
    }
  };

  const login = async (t) => {
    localStorage.setItem("token", t);
    setToken(t);
    setUser(jwtDecode(t));
    await cargarSeccion(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id_seccion");
    setUser(null);
    setToken(null);
    setIdSeccion(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, idSeccion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
