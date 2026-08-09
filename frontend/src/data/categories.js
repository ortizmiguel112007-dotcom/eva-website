// Íconos reutilizables de la app (centralizados en infrastructure/icons)
import {
  FiStar,
  FiShoppingBag,
  FiCpu,
  FiMonitor,
  FiBook,
  FiTrendingUp,
  FiHome,
  FiScissors,
  FiFeather,
  FiPackage,
  FiTag
} from "@/infrastructure/icons/index.js";

export const Categories = [
  { label: "Artesanías", value: "artesanias", icon: FiFeather },
  { label: "Belleza", value: "belleza", icon: FiScissors },
  { label: "Alimentos", value: "alimentacion", icon: FiStar },
  { label: "Hogar", value: "hogar", icon: FiHome },
  { label: "Moda", value: "moda", icon: FiShoppingBag },
  { label: "Consultoría", value: "consultoria", icon: FiTrendingUp },
  { label: "Educación", value: "educacion", icon: FiBook },
  { label: "Marketing", value: "marketing", icon: FiMonitor },
  { label: "Tecnología", value: "tecnologia", icon: FiCpu }
];

export const Tipo = [
  { label: "Servicios", value: "servicio", icon: FiPackage },
  { label: "Productos", value: "producto", icon: FiTag }
]