import type { FormEvent } from 'react';
import { saveRecurringTemplate } from '../services/recurringTemplatesService';
import type {
  RecurringFormData,
  RecurringSchedule,
  RecurringErrors,
} from '../types/recurringTemplates';

interface UseRecurringTemplateFormSubmitParams {
  template: any;
  formData: RecurringFormData;
  schedule: RecurringSchedule;
  enabled: boolean;
  setErrors: React.Dispatch<React.SetStateAction<RecurringErrors>>;
  refreshRecurringTemplates?: () => Promise<void>;
  onHide?: () => void;
}

export default function UseRecurringTemplateFormSubmit({
  template,
  formData,
  schedule,
  enabled,
  setErrors,
  refreshRecurringTemplates,
  onHide,
}: UseRecurringTemplateFormSubmitParams) {
  const validate = () => {
    const nextErrors: RecurringErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required.';
    if (!formData.amount) nextErrors.amount = 'Amount is required.';
    if (!formData.merchant.trim()) nextErrors.merchant = 'Merchant is required.';
    if (!formData.category) nextErrors.category = 'Category is required.';
    if (!formData.paymentMethod) nextErrors.paymentMethod = 'Payment method is required.';
    if (!formData.start_date) nextErrors.start_date = 'Start date is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      id: template.id,
      name: formData.name,
      projected_amount: Number(formData.amount),
      notes: formData.notes,
      merchant: formData.merchant,
      projected_category_id: Number(formData.category),
      projected_payment_method_id: Number(formData.paymentMethod),
      frequency: schedule.frequency,
      interval: Number(schedule.interval) || 1,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      enabled: enabled,
    };

    try {
      await saveRecurringTemplate(payload);
      await refreshRecurringTemplates?.();
      onHide?.();
    } catch (err) {
      console.error('Error saving Recurring Template:', err);
    }
  };

  return { handleSubmit };
}
