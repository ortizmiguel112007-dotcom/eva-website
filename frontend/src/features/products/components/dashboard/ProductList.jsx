import ProductCard from "@/features/products/components/dashboard/ProductCard";

export default function ProductList({ items, onDelete, onToggleVisibility }) {
  return (
    <div className="product-grid" data-tour="emprendedora-listado">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
}
