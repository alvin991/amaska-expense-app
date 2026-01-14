import { Form, InputGroup } from 'react-bootstrap';
import IconElement from './IconElement';
import { iconRegistry, iconsFromDb } from '../iconRegistry';

function CategoryPickerField({ categories, selectedCategoryId, error, onClick }) {
  const list = categories || [];

  const getSelectedCategory = () =>
    list.find((c) => c.id === selectedCategoryId) || null;

  return (
    <Form.Group className="mb-3">
      <Form.Label>Category</Form.Label>
      <InputGroup>
        {/* left icon inside the input group */}
        {(() => {
          const selected = getSelectedCategory();
          const iconKey = selected?.icon;
          const iconInfo =
            iconsFromDb?.find((ic) => ic.id === iconKey) ||
            (selected ? { label: selected.name } : null);
          const IconComponent = iconKey ? iconRegistry?.[iconKey] : null;

          return IconComponent ? (
            <InputGroup.Text
              className="category-input-icon category-clickable"
              onClick={onClick}
            >
              <IconElement
                iconKey={iconKey}
                label={iconInfo.label}
                size={16}
                color={selected?.color || '#2196f3'}
                showLabel={false}
              />
            </InputGroup.Text>
          ) : (
            <InputGroup.Text className="category-input-icon" />
          );
        })()}

        <Form.Control
          type="text"
          readOnly
          className="category-input-control category-clickable"
          value={getSelectedCategory()?.name || ''}
          placeholder="Select Category"
          onClick={onClick}
          isInvalid={!!error}
        />

        {/* right caret, also clickable */}
        <InputGroup.Text
          className="category-input-caret category-clickable"
          onClick={onClick}
        >
          ▾
        </InputGroup.Text>
      </InputGroup>

      {error && (
        <div style={{ color: '#dc3545', marginTop: 4, fontSize: '.875em' }}>
          {error}
        </div>
      )}
    </Form.Group>
  );
}

export default CategoryPickerField;
