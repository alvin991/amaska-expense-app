import { iconRegistry } from "../iconRegistry";

function IconElement({ iconKey, label, size, color, isSelected = false, showLabel = true }) {
    const IconComponent = iconRegistry[iconKey];
    if (!IconComponent) return null;

    const circleSize = size + 16;

    return (
        <div
            style={{
                display: "flex",              // was: "inline-flex"
                flexDirection: "column",
                alignItems: "center",
                padding: 8,
                border: isSelected ? "3px solid #1976d2" : "3px solid transparent",
                borderRadius: 12,
                boxSizing: "border-box",
                width: 90,                    // fixed tile width (tweak as you like)
            }}
        >
            <div
                style={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: "50%",
                    backgroundColor: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                }}
            >
                <IconComponent size={size} color="white" />
            </div>
            {showLabel && (
                <p style={{ marginTop: 8, marginBottom: 0, textAlign: "center" }}>
                    {label}
                </p>
            )}
        </div>
    );
}

export default IconElement;