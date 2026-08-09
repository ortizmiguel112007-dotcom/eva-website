import { useState } from "react"
import { useItems } from "../hooks/useItems"

import TopBar         from "../components/dashboard/TopBar"
import CategoryFilter from "../components/dashboard/CategoryFilter"
import ProductList    from "../components/dashboard/ProductList"
import { PaginacionSimple } from "@/features/usuario/components/historial/PaginacionSimple"

import "@/infrastructure/css/products-emprend/dashboard/Dashboard.css"

const POR_PAGINA = 10

export default function ProductsDashboard() {
  const { items, cargando, error, idSeccion, handleDelete, toggleVisibility } = useItems()

  const [selectedType,     setSelectedType]     = useState("Todos")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [search,           setSearch]           = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("Todos")
  const [pagina,           setPagina]           = useState(1)  // 🆕

  const categories = ["Todos", ...new Set(items.map(i => i.category))]

  const filteredItems = items.filter(item => {
    const matchType       = selectedType === "Todos"     || item.type === selectedType
    const matchCategory   = selectedCategory === "Todos" || item.category === selectedCategory
    const matchVisibility = visibilityFilter === "Todos"
      || (visibilityFilter === "Activos" && item.visible)
      || (visibilityFilter === "Ocultos" && !item.visible)
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchType && matchCategory && matchVisibility && matchSearch
  })

  // 🆕 Reset pagina al cambiar filtros
  const handleSetType = v => { setSelectedType(v); setPagina(1) }
  const handleSetCategory = v => { setSelectedCategory(v); setPagina(1) }
  const handleSetVisibility = v => { setVisibilityFilter(v); setPagina(1) }
  const handleSetSearch = v => { setSearch(v); setPagina(1) }

  // 🆕 Paginar
  const totalPaginas  = Math.max(1, Math.ceil(filteredItems.length / POR_PAGINA))
  const itemsPagina   = filteredItems.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  if (!idSeccion) return <div className="layout"><main className="main-content"><p>Cargando sesión...</p></main></div>
  if (cargando)   return <div className="layout"><main className="main-content"><p>Cargando...</p></main></div>
  if (error)      return <div className="layout"><main className="main-content"><p>{error}</p></main></div>

  return (
    <div className="layout">
      <main className="main-content">
        <TopBar search={search} setSearch={handleSetSearch} />

        <CategoryFilter
          selectedType={selectedType}         setSelectedType={handleSetType}
          selectedCategory={selectedCategory} setSelectedCategory={handleSetCategory}
          visibilityFilter={visibilityFilter} setVisibilityFilter={handleSetVisibility}
          categories={categories}
        />

        <ProductList
          items={itemsPagina}
          onDelete={handleDelete}
          onToggleVisibility={toggleVisibility}
        />

        <PaginacionSimple
          pagina={pagina}
          totalPaginas={totalPaginas}
          setPagina={setPagina}
          total={filteredItems.length}
          labelSingular="producto"
          labelPlural="productos"
        />
      </main>
    </div>
  )
}
