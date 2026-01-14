// Utility to advance a YYYY-MM-DD date string by a given frequency/interval
function addPeriod(dateStr, frequency, interval) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);

    switch (frequency) {
        case 'daily':
            d.setDate(d.getDate() + interval);
            break;
        case 'weekly':
            d.setDate(d.getDate() + 7 * interval);
            break;
        case 'biweekly':
            d.setDate(d.getDate() + 14 * interval);
            break;
        case 'monthly':
            d.setMonth(d.getMonth() + interval);
            break;
        case 'yearly':
            d.setFullYear(d.getFullYear() + interval);
            break;
        default:
            d.setDate(d.getDate() + interval);
            break;
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

module.exports = { addPeriod };
