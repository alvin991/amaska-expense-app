import type { RecurringFrequency } from '../types/expenses';
import { RECURRING_FREQUENCIES } from '../types/expenses';

// Type guard function
function isValidFrequency(freq: string): freq is RecurringFrequency {
    return RECURRING_FREQUENCIES.includes(freq as RecurringFrequency);
}

export function formatRecurrence(interval: number | null | undefined, frequency: string | null | undefined): string {
    // Handle null or undefined values
    if (!interval || !frequency) {
        return 'Not set';
    }

    const normalizedFrequency = frequency.toLowerCase() as RecurringFrequency;

    // Validate the frequency
    if (!isValidFrequency(normalizedFrequency)) {
        return `Every ${interval} ${frequency}`;
    }

    // Special case for interval = 1 (singular form)
    if (interval === 1) {
        const frequencyMap = {
        'daily': 'Every day',
        'weekly': 'Every week',
        'biweekly': 'Every 2 weeks',
        'monthly': 'Every month',
        'yearly': 'Every year'
        };
        return frequencyMap[normalizedFrequency] || `Every ${frequency}`;
    }

    // Plural cases (interval > 1)
    const pluralMap = {
        'daily': `Every ${interval} days`,
        'weekly': `Every ${interval} weeks`,
        'biweekly': `Every ${interval * 2} weeks`,
        'monthly': `Every ${interval} months`,
        'yearly': `Every ${interval} years`
    };

    return pluralMap[normalizedFrequency] || `Every ${interval} ${frequency}`;
}