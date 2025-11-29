import { iconsFromDb } from "../iconRegistry";
import IconElement from "./IconElement";

function IconSelect({ icons, selectedIconKey, onIconSelect }) {
  const iconSize = 36;

  const iconsToRender =
    Array.isArray(icons) && icons.length > 0 ? icons : iconsFromDb;

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      {iconsToRender.map((item) => (
        <div
          key={item.id}
          onClick={() => onIconSelect?.(item.id)}
          style={{ cursor: "pointer" }}
        >
          <IconElement
            iconKey={item.id}
            label={item.label}
            size={iconSize}
            color={item.color}
            isSelected={item.id === selectedIconKey}
          />
        </div>
      ))}
    </div>
  );
}

export default IconSelect;