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

const CategoryDetailsPage = ({
  propCategory,
  refreshCategories,
  navigation, // provided by ModalBase container
}) => {
  const category =
    propCategory && Object.keys(propCategory).length > 0
      ? propCategory
      : DEFAULT_CATEGORY;

  const [formData, setFormData] = useState({
    name: category.name || '',
    notes: category.description || '',
    color: category.color || '#2196f3',
    icon: category.icon || ''
  });

  const [deleting, setDeleting] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const iconKey = formData.icon || category.icon;
  const IconComponent = iconKey ? iconRegistry[iconKey] : null;
  const iconInfo =
    iconsFromDb.find(ic => ic.id === (formData.icon || category.icon)) ||
    { label: 'Select an icon', color: '#000' };
  const iconSize = 24;
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
      navigation.back();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async () => {
    if (!category?.id) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/categories/${category.id}`);
      await refreshCategories();
      navigation.back();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setDeleting(false);
    }
  };

  const openColorPicker = () => {
    navigation.navigate('colorSelect', {
      value: formData.color,
      onColorChosen: (newColor) => {
        setFormData(prev => ({ ...prev, color: newColor }));
      },
    });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600 }}>
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

        {/* Notes */}
        <Form.Group className="mb-3">
          <Form.Label style={{ fontWeight: 600 }}>
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

        {/* Color picker */}
        <Form.Group
          className="mb-3"
          style={{
            cursor: 'pointer',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 8,
            backgroundColor: '#fafafa',
          }}
          onClick={openColorPicker}
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
                border: '3px solid #000',
                boxShadow: '0 0 0 3px rgba(0,0,0,0.08)',
              }}
            />
          </div>
        </Form.Group>

        {/* Icon picker */}
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

        <Button 
          variant="primary" 
          type="submit"
          className="w-100 mb-3"
        >
          Save
        </Button>

        {category?.id && (
          <Button
            variant="danger"
            className="w-100"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default CategoryDetailsPage;