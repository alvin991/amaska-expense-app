import axios from 'axios';
import type { RecurringTemplateInput } from '../types/expenses';

export async function listRecurringTemplates(): Promise<RecurringTemplateInput[]> {
  const res = await axios.get<RecurringTemplateInput[]>('/api/recurring_templates');
  return res.data;
}

export async function saveRecurringTemplate(input: RecurringTemplateInput): Promise<void> {
  const payload = {
    ...input,
    projected_amount: Number(input.projected_amount),
    interval: input.interval ?? 1,
  };

  if (input.id) {
    await axios.put(`/api/recurring_templates/${input.id}`, payload);
  } else {
    await axios.post('/api/recurring_templates', payload);
  }
}

// export async function deleteRecurringTemplate(id: number): Promise<void> {
//   await axios.delete(`/api/recurring_templates/${id}`);
// }

export async function applyRecurringTemplates(upToDate?: string): Promise<void> {
  await axios.post('/api/recurring_templates/apply', upToDate ? { upToDate } : {});
}
