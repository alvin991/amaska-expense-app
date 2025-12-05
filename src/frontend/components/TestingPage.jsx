import IconElement from "./IconElement";
import { iconRegistry } from "../iconRegistry";

// Example: this would actually come from your API
const iconsFromDb = [
  { id: "pets", label: "Pets", color: "orange" },
  { id: "dining", label: "Dining", color: "teal" },
  { id: "personal", label: "Personal", color: "pink" },
  { id: "gift", label: "Gift", color: "red" },
  { id: "household", label: "Household", color: "brown" },
  { id: "grocery", label: "Grocery", color: "green" },
  { id: "car", label: "Car", color: "grey" },
  { id: "business", label: "Business", color: "blue" },
  { id: "bebe", label: "Bebe", color: "purple" },
  { id: "church", label: "Church", color: "#e5e51c" },
  { id: "miscellaneous", label: "miscellaneous", color: "white" },
];

function TestingPage() {
  const iconSize = 36;

  return (
    <div style={{ backgroundColor: "lightgreen", height: "100vh" }}>
      {/* {iconsFromDb.map((item) => {
        const IconComponent = iconRegistry[item.id];
        if (!IconComponent) return null; // or a fallback icon

        return (
          <IconElement
            key={item.id}
            icon={IconComponent}
            label={item.label}
            size={iconSize}
            color={item.color}
          />          
        )
      })} */}
      {/* <IconSelect icons={iconsFromDb} /> */}
    </div>
  );
}

export default TestingPage;