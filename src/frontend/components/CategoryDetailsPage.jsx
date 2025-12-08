import { useState, useMemo, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { iconRegistry, iconsFromDb } from "../iconRegistry";
import IconElement from "./IconElement";
import IconSelect from './IconSelect';
import ColorSelect from "./ColorSelect";
import { DEFAULT_CATEGORY } from '../constants/defaults';
import { saveCategory } from '../services/categoryService';
import { validateCategoryForm } from '../utils/formValidation';

const CategoryDetailsPage = ({
  propCategory,
  refreshCategories,
  navigation,
  onDirtyChange,
  onDelete,
}) => {
  const category =
    propCategory && Object.keys(propCategory).length > 0
      ? propCategory
      : DEFAULT_CATEGORY;

  const originalForm = useMemo(
    () => ({
      name: category.name || '',
      notes: category.description || '',
      color: category.color || '',
      icon: category.icon || ''
    }),
    [category]
  );

  const [formData, setFormData] = useState(originalForm);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');   // NEW

  const isDirty =
    formData.name !== originalForm.name ||
    formData.notes !== originalForm.notes ||
    formData.color !== originalForm.color ||
    formData.icon !== originalForm.icon;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // whenever originalForm changes, clear errors
  useEffect(() => {
    setFormData(originalForm);
    setErrors({});
    setSubmitError('');
  }, [originalForm]);

  const iconKey = formData.icon || category.icon;
  const IconComponent = iconKey ? iconRegistry[iconKey] : null;
  const iconInfo =
    iconsFromDb.find(ic => ic.id === iconKey) ||
    { label: 'Select an icon', color: '#000' };
  const iconSize = 24;
  const selectedColor = formData.color || '';

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

  const handleColorChange = (newColor) => {
    setFormData(prev => ({
      ...prev,
      color: newColor,
    }));
    setShowColorPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateCategoryForm(formData);
    setErrors(newErrors);
    setSubmitError('');
    if (Object.keys(newErrors).length > 0) return;

    try {
      const cat = {
        id: category.id,
        name: formData.name,
        description: formData.notes,
        color: formData.color,
        icon: formData.icon,
      };
      await saveCategory(cat);
      await refreshCategories();
      onDirtyChange?.(false);
      navigation.back();
    } catch (error) {
      console.error('Error saving category:', error);

      // Try to detect UNIQUE name violation from backend response
      const msg = error?.response?.data?.error || error?.message || '';

      if (msg.includes('UNIQUE constraint failed: expense_categories.name')
          || msg.toLowerCase().includes('unique')
      ) {
        // attach error to name field and global submitError
        setErrors(prev => ({
          ...prev,
          name: 'A category with this name already exists.',
        }));
        setSubmitError('Category name must be unique.');
      } else {
        setSubmitError('Failed to save category. Please try again.');
      }
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit} noValidate>
        {submitError && (
          <Alert variant="danger" className="mb-3">
            {submitError}
          </Alert>
        )}

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
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
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
            isInvalid={!!errors.notes}
          />
          <Form.Control.Feedback type="invalid">
            {errors.notes}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Color picker */}
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
              {selectedColor ? (
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
              ) : (
                <div
                  style={{
                    padding: '0.5rem 0',
                    color: '#666',
                  }}
                >
                  Click to select a color
                </div>
              )}
            </div>
          )}

          {showColorPicker && (
            <ColorSelect
              label={null}
              value={selectedColor}
              onChange={handleColorChange}
            />
          )}

          {errors.color && (
            <div style={{ color: '#dc3545', marginTop: 4, fontSize: '.875em', textAlign: 'center' }}>
              {errors.color}
            </div>
          )}
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
                  showLabel={false}
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

          {errors.icon && (
            <div style={{ color: '#dc3545', marginTop: 4, fontSize: '.875em', textAlign: 'center' }}>
              {errors.icon}
            </div>
          )}
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100 mb-3"
          disabled={!isDirty}
        >
          {category?.id ? 'Update' : 'Create'}
        </Button>

        {category?.id && (
          <Button
            variant="danger"
            className="w-100"
            type="button"
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </Form>
    </Container>
  );
};

export default CategoryDetailsPage;