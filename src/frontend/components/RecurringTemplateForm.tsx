import { Form, Container, Button, Row, Col, InputGroup } from 'react-bootstrap';
import React from 'react';
import type { RecurringFrequency } from '../types/expenses';
import { RECURRING_FREQUENCIES } from '../types/expenses';
import type {
  PaymentMethod,
  Category,
} from '../types/recurringTemplates';
import CategoryPickerField from './CategoryPickerField';
import './RecurringTemplateForm.css';
import useCategoryListPicker from '../hooks/useCategoryListPicker';
import useRecurringTemplateForm from '../hooks/useRecurringTemplateForm';
import useRecurringTemplateFormSubmit from '../hooks/useRecurringTemplateFormSubmit';

interface RecurringTemplateFormProps {
  template?: any;
  paymentMethods?: PaymentMethod[];
  categories?: Category[];
  navigation: any;  currentParams?: any;  onHide?: () => void;
  refreshRecurringTemplates?: () => Promise<void>;
  relatedCount: number;
  onViewRelated?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

function RecurringTemplateForm({
  template = {},
  paymentMethods = [],
  categories = [],
  navigation,
  currentParams,
  onHide,
  refreshRecurringTemplates,
  relatedCount,
  onViewRelated,
  onDirtyChange,
}: RecurringTemplateFormProps) {
  // console.log('Rendering RecurringTemplateForm with template:', template);
  const {
    formData,
    setFormData,
    schedule,
    enabled,
    setEnabled,
    errors,
    setErrors,
    amountInputRef,
    amountInputProps,
    handleBasicChange,
    handleScheduleChange,
    isDirty,
  } = useRecurringTemplateForm(template, onDirtyChange);

  const { openCategoryList } = useCategoryListPicker(navigation);

  // Watch for selectedCategoryId from navigation params (when coming back from CategoryListPage)
  React.useEffect(() => {
    const selectedCategoryId = currentParams?.selectedCategoryId;
    if (selectedCategoryId) {
      // console.log('RecurringTemplateForm - Received selectedCategoryId from navigation:', selectedCategoryId);
      setFormData((prev) => {
        const updated = { ...prev, category: String(selectedCategoryId) };
        // console.log('RecurringTemplateForm - Updated formData with category:', updated);
        return updated;
      });
    }
  }, [currentParams?.selectedCategoryId]);

  const { handleSubmit } = useRecurringTemplateFormSubmit({
    template,
    formData,
    schedule,
    enabled,
    setErrors,
    refreshRecurringTemplates,
    onHide,
  });

  return (
    <Container className="mt-3">
      <Form onSubmit={handleSubmit}>
        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleBasicChange}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Amount */}
        <Form.Group className="mb-3">
          <Form.Label>Planned Amount</Form.Label>
          <InputGroup>
            <InputGroup.Text>$</InputGroup.Text>
            <Form.Control
              ref={amountInputRef}
              type="text"
              name="amount"
              value={formData.amount}
              {...amountInputProps}
              onMouseDown={(e) => {
                if (e.button !== 0) return; // only left-click
                e.preventDefault();
                const el = e.currentTarget;
                el.focus();
                el.setSelectionRange(0, el.value.length);
              }}
              placeholder="0.00"
              isInvalid={!!errors.amount}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>

        {/* Merchant */}
        <Form.Group className="mb-3">
          <Form.Label>Merchant</Form.Label>
          <Form.Control
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleBasicChange}
            isInvalid={!!errors.merchant}
          />
          <Form.Control.Feedback type="invalid">
            {errors.merchant}
          </Form.Control.Feedback>
        </Form.Group>

        {/* <CategorySelectField
          categories={categories}
          value={formData.category}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
          error={errors.category}
        /> */}

        {/* Category (fake dropdown textbox with icon) */}
        <CategoryPickerField
          categories={categories}
          selectedCategoryId={Number(formData.category)}
          error={errors.category}
          onClick={openCategoryList}
        />

        {/* Payment method */}
        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleBasicChange}
            isInvalid={!!errors.paymentMethod}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.paymentMethod}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Schedule */}
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Frequency</Form.Label>
              <Form.Select
                name="frequency"
                value={schedule?.frequency || 'monthly'}
                onChange={handleScheduleChange}
              >
                {RECURRING_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Interval</Form.Label>
              <Form.Control
                type="number"
                name="interval"
                min="1"
                value={schedule?.interval || 1}
                onChange={handleScheduleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleBasicChange}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Start date */}
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleBasicChange}
            isInvalid={!!errors.start_date}
          />
          <Form.Control.Feedback type="invalid">
            {errors.start_date}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Notes */}
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            name="notes"
            value={formData.notes}
            onChange={handleBasicChange}
            rows={3}
          />
        </Form.Group>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <Form.Check
            type="switch"
            id="recurring-enabled-switch"
            label="Enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="recurring-enabled-switch"
          />

          {template.id && (
            <Button
              variant="outline-primary"

              disabled={relatedCount === 0}
              onClick={onViewRelated}
            >
              View all related transactions
              {typeof relatedCount === 'number' ? ` (${relatedCount})` : ''}
            </Button>
          )}
        </div>

        <div className="d-grid gap-2 mb-3">
          <Button variant="primary" type="submit" disabled={!isDirty}>
            {template.id ? 'Update Recurring Template' : 'Create Recurring Template'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default RecurringTemplateForm;
