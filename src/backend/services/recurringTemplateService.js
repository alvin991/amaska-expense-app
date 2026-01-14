const { db, getSystemUserId } = require('../config/database');
const { addPeriod } = require('../utils/dateUtils');

// Generate Recurring Templates transactions up to (and including) a given date
function applyRecurringTemplates(upToDate, callback) {
    const targetDate = upToDate;
    const systemUserId = getSystemUserId();

    // Check if systemUserId is available
    if (!systemUserId) {
        console.error('SYSTEM user not initialized yet');
        return callback(new Error('SYSTEM user not initialized'));
    }

    db.all('SELECT * FROM recurring_templates', [], (err, rows) => {
        if (err) {
            console.error('Error reading recurring_templates:', err.message);
            return callback(err);
        }

        const processNext = (index) => {
            if (index >= rows.length) {
                return callback(null);
            }

            const rec = rows[index];
            let { next_run_date: nextRunDate } = rec;

            const shouldContinue = () => {
                if (!nextRunDate) return false;
                if (nextRunDate > targetDate) return false;
                if (rec.end_date && nextRunDate > rec.end_date) return false;
                return true;
            };

            const insertOne = () => {
                if (!shouldContinue()) {
                    // update next_run_date in DB and move to next template
                    const updateSql = 'UPDATE recurring_templates SET next_run_date = ? WHERE id = ?';
                    db.run(updateSql, [nextRunDate, rec.id], (updateErr) => {
                        if (updateErr) {
                            console.error('Error updating next_run_date:', updateErr.message);
                        }
                        processNext(index + 1);
                    });
                    return;
                }

                const insertSql = `
                    INSERT INTO expense_transactions
                    (projected_amount, amount, notes, transaction_date, merchant, projected_category_id, category_id, projected_payment_method_id, payment_method_id, recurring_template_id, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const insertValues = [
                    rec.projected_amount,
                    rec.projected_amount,
                    rec.notes,
                    nextRunDate,
                    rec.merchant,
                    rec.projected_category_id,
                    rec.projected_category_id,
                    rec.projected_payment_method_id,
                    rec.projected_payment_method_id,
                    rec.id,
                    systemUserId,
                ];

                db.run(insertSql, insertValues, function(insertErr) {
                    if (insertErr) {
                        console.error('Error inserting Recurring Template transaction:', insertErr.message);
                        console.error('Failed template data:', {
                            template_id: rec.id,
                            template_name: rec.name,
                            projected_category_id: rec.projected_category_id,
                            projected_payment_method_id: rec.projected_payment_method_id,
                            nextRunDate: nextRunDate
                        });
                        // Skip further inserts for this template
                        processNext(index + 1);
                        return;
                    }

                    // Log successful insertion
                    console.log(`✓ Inserted transaction for template "${rec.name}" (ID: ${rec.id}) on ${nextRunDate}, transaction ID: ${this.lastID}`);

                    // advance nextRunDate and loop
                    nextRunDate = addPeriod(nextRunDate, rec.frequency, rec.interval || 1);
                    insertOne();
                });
            };

            insertOne();
        };

        processNext(0);
    });
}

module.exports = { applyRecurringTemplates };
