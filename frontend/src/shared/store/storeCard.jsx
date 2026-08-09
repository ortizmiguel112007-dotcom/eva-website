import {
    FiShoppingBag,
    FiPackage,
    FiArrowRight
} from "@/infrastructure/icons/index.js";

import { UiButton } from "@/shared/ui/UiButton";

import "@/infrastructure/css/shared/store/storeCard.css"

// ══ Data ═════════════
import { Avatar_colors } from "@/data/avatarColors"

// ══ Utils ════════════
import {
    getAvatarColor,
    getInitials
} from "@/features/tienda/utils/utils"

export function StoreCard({
    productos = [],
    nombre = "",
    onClick,
    ...props
}) {

    return (
        <div
            {...props}
            onClick={onClick}
        >

            {/* Banner */}
            <div 
                className="ip-tienda-banner" 
                style={{
                    gridTemplateColumns: `repeat(${Math.min(productos.length || 1, 3)}, 1fr)`
                }}
            >
                {productos.slice(0, 3).map((p, i) => (

                    <div
                        key={i}
                        className="ip-tienda-banner-img"
                    >

                        {p.imagen ? (

                            <img
                                src={p.imagen}
                                alt={p.nombre_producto}
                            />

                        ) : (

                            <div className="ip-tienda-banner-placeholder">

                                <FiPackage
                                    size={20}
                                    color="#94a3b8"
                                />

                            </div>
                        )}

                    </div>
                ))}

                {productos.length === 0 && (

                    <div className="ip-tienda-banner-empty">

                        <FiShoppingBag
                            size={32}
                            color="#94a3b8"
                        />

                    </div>
                )}

            </div>

            {/* Body */}
            <div className="ip-tienda-body">

                <div className="ip-tienda-avatar-row">

                    <div
                        className="ip-tienda-avatar"
                        style={{
                            background:
                                `linear-gradient(
                                    135deg,
                                    ${getAvatarColor(nombre, Avatar_colors)},
                                    ${getAvatarColor(nombre, Avatar_colors)}bb
                                )`,
                        }}
                    >

                        {getInitials(nombre)}

                    </div>

                    <div>

                        <p className="ip-tienda-nombre">

                            {nombre}

                        </p>

                        <span className="ip-tienda-count">

                            <FiPackage size={11} />

                            {productos.length} productos

                        </span>

                    </div>

                </div>

                <UiButton
                    className="ip-btn Fifth"
                    onClick={onClick}
                    iconPosition="r"
                    icon={FiArrowRight}
                >

                    Visitar tienda

                </UiButton>

            </div>

        </div>
    )
}