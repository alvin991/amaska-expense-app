import { useEffect, useState, useMemo } from 'react';
import useNumericInput from './useNumericInput';
import type { RecurringFrequency } from '../types/expenses';
import type {
  RecurringFormData,
  RecurringSchedule,
  RecurringErrors,
  RecurringTemplate,
} from '../types/recurringTemplates';

export default function useRecurringTemplateForm(
  template: RecurringTemplate,
  onDirtyChange?: (isDirty: boolean) => void,
) {
  // console.log('useRecurringTemplateForm called with template:', template);
  
  // Combined state for all form data
  const [formState, setFormState] = useState<{
    formData: RecurringFormData;
    schedule: RecurringSchedule;
    enabled: boolean;
  }>({
    formData: {
      name: '',
      amount: '',
      merchant: '',
      paymentMethod: '',
      category: '',
      start_date: '',
      end_date: '',
      notes: '',
    },
    schedule: {
      frequency: 'monthly',
      interval: 1,
    },
    enabled: true,
  });

  const [errors, setErrors] = useState<RecurringErrors>({});
  
  // Store the original values to compare against for isDirty
  const [originalData, setOriginalData] = useState<{
    formData: RecurringFormData;
    schedule: RecurringSchedule;
    enabled: boolean;
  } | null>(null);

  // Initialize/refresh form when template changes
  useEffect(() => {
    // console.log('Template changed, updating form data:', template);
    const amountNumber =
      typeof template.projected_amount === 'number'
        ? template.projected_amount
        : Number(template.projected_amount);

    const initialFormData: RecurringFormData = {
      name: template.name || '',
      amount:
        !Number.isNaN(amountNumber) && amountNumber != null
          ? amountNumber.toFixed(2)
          : '',
      merchant: template.merchant ?? '',
      paymentMethod:
        template.projected_payment_method_id != null
          ? String(template.projected_payment_method_id)
          : '',
      category:
        template.projected_category_id != null
          ? String(template.projected_category_id)
          : '',
      start_date:
        template.start_date || new Date().toISOString().split('T')[0],
      end_date: template.end_date || '',
      notes: template.notes ?? '',
    };

    const initialSchedule: RecurringSchedule = {
      frequency: (template.frequency as RecurringFrequency) || 'monthly',
      interval: template.interval || 1,
    };

    const initialEnabled =
      template.enabled !== undefined ? Boolean(template.enabled) : true;

    setFormState({
      formData: initialFormData,
      schedule: initialSchedule,
      enabled: initialEnabled,
    });
    setErrors({});
    
    // Store the original values for isDirty comparison
    setOriginalData({
      formData: initialFormData,
      schedule: initialSchedule,
      enabled: initialEnabled,
    });
  }, [template.id]);

  // Compute isDirty by comparing current state with original state
  const isDirty = useMemo(() => {
    if (!originalData) return false; // Not yet initialized
    
    // console.log('Computing isDirty state...', formState, originalData);
    const currentAmount = Number(formState.formData.amount) || 0;
    const originalAmount = Number(originalData.formData.amount) || 0;

    return (
      formState.formData.name !== originalData.formData.name ||
      currentAmount !== originalAmount ||
      formState.formData.merchant !== originalData.formData.merchant ||
      formState.formData.paymentMethod !== originalData.formData.paymentMethod ||
      formState.formData.category !== originalData.formData.category ||
      formState.formData.start_date !== originalData.formData.start_date ||
      formState.formData.end_date !== originalData.formData.end_date ||
      formState.formData.notes !== originalData.formData.notes ||
      formState.schedule.frequency !== originalData.schedule.frequency ||
      formState.schedule.interval !== originalData.schedule.interval ||
      formState.enabled !== originalData.enabled
    );
  }, [formState, originalData]);

  // Notify parent when isDirty changes
  useEffect(() => {
    // console.log('isDirty changed:', isDirty, formState);
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleBasicChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
    }));
  };

  const {
    inputRef: amountInputRef,
    inputProps: amountInputProps,
  } = useNumericInput({
    value: formState.formData.amount,
    setValue: (v: string) =>
      setFormState((prev) => ({
        ...prev,
        formData: { ...prev.formData, amount: v },
      })),
    format: { precision: 2 },
    error: {
      setError: setErrors,
      key: 'amount',
      message: 'Amount must be numeric.',
    },
  });

  const handleScheduleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'frequency') {
      setFormState((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, frequency: value as RecurringFrequency },
      }));
    } else if (name === 'interval') {
      setFormState((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, interval: Number(value) || 1 },
      }));
    }
  };

  return {
    formData: formState.formData,
    setFormData: (update: RecurringFormData | ((prev: RecurringFormData) => RecurringFormData)) => {
      // console.log('useRecurringTemplateForm - setFormData wrapper called, update type:', typeof update);
      setFormState((prev) => {
        // console.log('useRecurringTemplateForm - setFormState updater executing, prev.formData:', prev.formData);
        const newFormData = typeof update === 'function' ? update(prev.formData) : update;
        // console.log('useRecurringTemplateForm - newFormData:', newFormData);
        return {
          ...prev,
          formData: newFormData,
        };
      });
    },
    schedule: formState.schedule,
    enabled: formState.enabled,
    setEnabled: (value: boolean) => {
      setFormState((prev) => ({ ...prev, enabled: value }));
    },
    errors,
    setErrors,
    amountInputRef,
    amountInputProps,
    handleBasicChange,
    handleScheduleChange,
    isDirty,
  };
}
