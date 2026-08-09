import "@/infrastructure/css/shared/product/CategoryFilterList.css"

export function CategoryFilterList({
    categories = [],
    selected = [],
    onToggle,
    contador,
    name="",
    variant="",
    ...proms
}) {
    return (
        <div className={`cf-list-title ${variant}`} {...proms}>
            <h4 className={`cf-list ${variant}`}>
                {name}
            </h4>

            <div className={`cf-list-items ${variant}`}>
                {categories.map(({ value, icon: Icon, label }) => {
                    const active = selected.includes(value);

                    return (
                        <label
                            key={value}
                            className={`cf-list-label ${variant} ${
                                active ? "active" : ""
                            }`}
                        >
                            <input 
                                type="checkbox"
                                checked={active}
                                onChange={() => onToggle(value)}
                            />

                            <Icon/>

                            <span className={`cf-list-text ${variant}`}>
                                {label}
                            </span>

                            <span className={`cf-list-count ${variant}`}>
                                {contador(value)}
                            </span>
                        </label>
                    )
                })}
            </div>
        </div>
    )
}