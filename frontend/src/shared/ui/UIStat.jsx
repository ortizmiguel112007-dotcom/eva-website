import "@/infrastructure/css/shared/ui/UIBase.css";

export function UIBase({
    as: Component = "div",
    icon: Icon,
    children,
    className = "",
    ...props
}) {
    return (
        <Component className={`ui-base ${className}`} {...props}>
            {Icon && <Icon className="ui-icon"/>}
            <div className="ui-content">{children}</div>
        </Component>
    );
}