import { Form } from "react-bootstrap";

const DEFAULT_COLORS = [
  "#2196f3", // blue
  "#4caf50", // green
  "#ff9800", // orange
  "#f44336", // red
  "#9c27b0", // purple
  "#795548", // brown
  "#607d8b", // blue-grey
  "#00bcd4", // cyan
  "#e91e63", // pink
  "#8bc34a", // light green
  "#ffc107", // amber
  "#3f51b5", // indigo
  "#9e9e9e", // grey
  "#ff5722", // deep orange
  "#673ab7", // deep purple
];

function ColorSelect({ label = "Color", value, onChange, colors = DEFAULT_COLORS }) {
  const handleColorClick = (hex) => {
    onChange?.(hex);
  };

  const handleCustomChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <Form.Group>
      {label && <Form.Label>{label}</Form.Label>}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {colors.map((c) => {
          const isSelected = c.toLowerCase() === (value || "").toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => handleColorClick(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                border: isSelected ? "2px solid #000" : "2px solid transparent",
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(0,0,0,0.08)"
                  : "none",
                padding: 0,
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  backgroundColor: c,
                  display: "block",
                }}
              />
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Form.Control
          type="color"
          value={value}
          onChange={handleCustomChange}
          style={{ width: 50, padding: 0 }}
          title="Choose custom color"
        />
        <span style={{ fontSize: 12, color: "#555" }}>{value}</span>
      </div>
    </Form.Group>
  );
}

export default ColorSelect;