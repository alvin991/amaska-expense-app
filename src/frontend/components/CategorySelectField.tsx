import { Form } from 'react-bootstrap';

interface CategoryOption {
  id: number;
  name: string;
}

interface CategorySelectFieldProps {
  label?: string;
  name?: string;
  categories: CategoryOption[];
  value: string | number | '';
  onChange: (value: string) => void;
  error?: string;
}

function CategorySelectField({
  label = 'Category',
  name = 'category',
  categories,
  value,
  onChange,
  error,
}: CategorySelectFieldProps) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        isInvalid={!!error}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Form.Select>
      {error && (
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
}

export default CategorySelectField;
