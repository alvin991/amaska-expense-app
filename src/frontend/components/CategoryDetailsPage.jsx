import { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { iconRegistry, iconsFromDb } from "../iconRegistry";
import IconElement from "./IconElement";
import IconSelect from './IconSelect';

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
    color: category.color || '#2196f3',
    icon: category.icon || ''
  });

  const [deleting, setDeleting] = useState(false);

  // NEW: control IconSelect visibility
  const [showIconPicker, setShowIconPicker] = useState(false);

  const iconKey = formData.icon || category.icon;
  const IconComponent = iconKey ? iconRegistry[iconKey] : null;
  console.log('category.icon =', category.icon);
  console.log('iconRegistry keys =', Object.keys(iconRegistry));
  console.log('IconComponent =', IconComponent);
  const iconInfo =
    iconsFromDb.find(ic => ic.id === (formData.icon || category.icon)) ||
    { label: 'Select an icon', color: '#000' };
  const iconSize = 24;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // When an icon is chosen in IconSelect
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
          <Form.Label>Name</Form.Label>
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
          <Form.Label>Notes</Form.Label>
          <Form.Control
            name="notes"
            as="textarea"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter notes"
          />
        </Form.Group>
        <Row className="mb-3">
          <Col>
            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                name="color"
                type="color"
                value={formData.color}
                onChange={handleChange}
                title="Choose category color"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* ICON display + click to open picker */}
        <Form.Group
          className="mb-3"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            if (!showIconPicker) setShowIconPicker(true);
          }}
        >
          <Form.Label
            style={{
              display: 'block',          // force label on its own line
              marginBottom: '0.25rem',
            }}
          >
            Icon
          </Form.Label>

          {!showIconPicker && (
            <div
              style={{
                marginTop: '0.25rem',   // space under label
                display: 'flex',
                justifyContent: 'center',      // center horizontally
              }}
            >
              {IconComponent ? (
                <IconElement
                  key={iconKey}
                  iconKey={iconKey}
                  label={iconInfo.label}
                  size={iconSize}
                  color={iconInfo.color}
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
          <Button variant="secondary" onClick={() => onNavigate('categoryList')}>
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