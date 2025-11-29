import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from 'react-bootstrap';
import { iconRegistry, iconsFromDb } from "../iconRegistry";
import IconElement from "./IconElement";
import IconSelect from './IconSelect';
import ColorSelect from "./ColorSelect";

export const DEFAULT_CATEGORY = {
  id: null,
  name: '',
  description: '',
  color: '',
  icon: ''
};

const CategoryDetailsPage = ({ propCategory = {}, onNavigate, refreshCategories }) => {
  const category =
    propCategory && Object.keys(propCategory).length > 0
      ? propCategory
      : DEFAULT_CATEGORY;

  const [formData, setFormData] = useState({
    name: category.name || '',
    notes: category.description || '',
    // keep initial color from category, but everything after this uses formData.color
    color: category.color || '#2196f3',
    icon: category.icon || ''
  });

  const [deleting, setDeleting] = useState(false);

  // control pickers visibility
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const iconKey = formData.icon || category.icon;
  const IconComponent = iconKey ? iconRegistry[iconKey] : null;
  const iconInfo =
    iconsFromDb.find(ic => ic.id === (formData.icon || category.icon)) ||
    { label: 'Select an icon', color: '#000' };
  const iconSize = 24;

  // always drive UI from formData.color
  const selectedColor = formData.color || '#2196f3';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconSelect = (iconId) => {
    setFormData(prev => ({
      ...prev,
      icon: iconId
    }));
    setShowIconPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.notes,
        color: formData.color,
        icon: formData.icon
      };

      if (category?.id) {
        await axios.put(`/api/categories/${category.id}`, payload);
      } else {
        await axios.post('/api/categories', payload);
      }

      await refreshCategories();
      onNavigate('categoryList');
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (!category?.id) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/categories/${category.id}`);
      await refreshCategories();
      onNavigate('categoryList');
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container>
      <h2>Category Details Page</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label
            style={{
              fontWeight: 600,
            }}
          >
            Name
          </Form.Label>
          <Form.Control
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter category name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label
            style={{
              fontWeight: 600,
            }}
          >
            Notes
          </Form.Label>
          <Form.Control
            name="notes"
            as="textarea"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter notes"
          />
        </Form.Group>

        {/* COLOR display + click to open color picker */}
        <Form.Group
          className="mb-3"
          style={{
            cursor: 'pointer',
            padding: showColorPicker ? '8px 12px' : 0,
            border: showColorPicker ? '1px solid #ddd' : '1px solid transparent',
            borderRadius: showColorPicker ? 8 : 0,
            backgroundColor: showColorPicker ? '#fafafa' : 'transparent',
          }}
          onClick={() => {
            if (!showColorPicker) setShowColorPicker(true);
          }}
        >
          <Form.Label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: 600,
            }}
          >
            Color
          </Form.Label>

          {!showColorPicker && (
            <div
              style={{
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: selectedColor,
                  border: '3px solid #000',     // thicker border
                  boxShadow: '0 0 0 3px rgba(0,0,0,0.08)', // subtle outer glow
                }}
              />
            </div>
          )}

          {showColorPicker && (
            <ColorSelect
              label={null}
              value={selectedColor}
              onChange={(newColor) => {
                setFormData(prev => ({ ...prev, color: newColor }));
                setShowColorPicker(false);
              }}
            />
          )}
        </Form.Group>

        {/* ICON display + click to open icon picker */}
        <Form.Group
          className="mb-3"
          style={{
            cursor: 'pointer',
            padding: showIconPicker ? '8px 12px' : 0,
            border: showIconPicker ? '1px solid #ddd' : '1px solid transparent',
            borderRadius: showIconPicker ? 8 : 0,
            backgroundColor: showIconPicker ? '#fafafa' : 'transparent',
          }}
          onClick={() => {
            if (!showIconPicker) setShowIconPicker(true);
          }}
        >
          <Form.Label
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontWeight: 600,
            }}
          >
            Icon
          </Form.Label>

          {!showIconPicker && (
            <div
              style={{
                marginTop: '0.25rem',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {IconComponent ? (
                <IconElement
                  key={iconKey}
                  iconKey={iconKey}
                  label={iconInfo.label}
                  size={iconSize}
                  color={selectedColor}
                />
              ) : (
                <div
                  style={{
                    padding: '0.5rem 0',
                    color: '#666',
                  }}
                >
                  Click to select an icon
                </div>
              )}
            </div>
          )}

          {showIconPicker && (
            <IconSelect
              onIconSelect={handleIconSelect}
              selectedIconKey={iconKey}
            />
          )}
        </Form.Group>

        <div className="d-flex gap-2 mb-2">
          <Button variant="primary" type="submit">
            Save
          </Button>
          <Button
            variant="secondary"
            onClick={() => onNavigate('categoryList')}
          >
            Cancel
          </Button>
        </div>

        {category?.id && (
          <Button
            variant="danger"
            className="w-100"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Category'}
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default CategoryDetailsPage;