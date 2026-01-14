const cron = require('node-cron');
const { applyRecurringTemplates } = require('./recurringTemplateService');

const recurringCron = process.env.RECURRING_CRON || '0 2 * * *';

function initializeCronJobs() {
    console.log('='.repeat(60));
    console.log(`[CRON SETUP] Scheduling recurring templates cron with pattern: "${recurringCron}"`);
    console.log(`[CRON SETUP] System time: ${new Date().toString()}`);

    // Validate cron pattern
    if (!cron.validate(recurringCron)) {
        console.error(`[CRON SETUP ERROR] Invalid cron pattern: "${recurringCron}"`);
        console.error('[CRON SETUP ERROR] Cron job will NOT run. Please fix the pattern.');
        return;
    }

    console.log('[CRON SETUP] ✓ Cron pattern is valid');

    try {
        const cronJob = cron.schedule(recurringCron, () => {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const target = `${yyyy}-${mm}-${dd}`;

            console.log('='.repeat(50));
            console.log('[cron] TRIGGERED at', new Date().toLocaleString());
            console.log('[cron] Applying Recurring Templates up to', target);
            console.log('='.repeat(50));

            applyRecurringTemplates(target, (err) => {
                if (err) {
                    console.error('[cron] Failed:', err.message);
                } else {
                    console.log('[cron] Done successfully');
                }
            });
        }, {
            scheduled: true
        });

        console.log(`[CRON SETUP] ✓ Cron job scheduled successfully`);
        console.log(`[CRON SETUP] If pattern is "* * * * *", expect trigger every minute`);
        console.log(`[CRON SETUP] Watch for "TRIGGERED at" messages...`);
        console.log('='.repeat(60));
    } catch (error) {
        console.error('[CRON SETUP ERROR] Failed to schedule cron job:', error.message);
        console.error(error.stack);
    }
}

module.exports = { initializeCronJobs, recurringCron };
