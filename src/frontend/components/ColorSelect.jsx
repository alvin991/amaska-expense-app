import { Form } from "react-bootstrap";
import { DEFAULT_COLORS } from '../constants/defaults';   // <-- shared import

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
        Click for custom color:&nbsp;
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