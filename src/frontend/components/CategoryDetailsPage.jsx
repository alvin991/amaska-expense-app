import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const CategoryDetailsPage = ({ onNavigate, propCategory = {} }) => {
  const [formData, setFormData] = useState({
    name: propCategory.name || '',
    notes: propCategory.description || '',
    color: propCategory.color || '#2196f3',
    icon: propCategory.icon || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle save logic here
    console.log('Category saved:', formData);
    onNavigate('categoryList');
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
          <Col>
            <Form.Group>
              <Form.Label>Icon</Form.Label>
              <Form.Control
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                placeholder="e.g. fa-coffee"
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex gap-2">
          <Button variant="primary" type="submit">
            Save
          </Button>
          <Button variant="secondary" onClick={() => onNavigate('categoryList')}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CategoryDetailsPage;