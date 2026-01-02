import DataTableHeader from './DataTableHeader.jsx';
import RecurringExpensesTable from './RecurringExpensesTable';

interface RecurringExpensesProps {
    title: string;
    onSearchChange?: (value: string) => void;
    placeholder?: string;
    onNewClick?: () => void;
    newLabel?: string;
    filteredTransactions: any[];
    handleRowDoubleClick: (rowData: any) => void;
}

function RecurringExpensesTab({title, onSearchChange, placeholder, onNewClick, newLabel, filteredTransactions, handleRowDoubleClick}: RecurringExpensesProps) {
    return (
        <>
            <DataTableHeader
                title={title}
                onSearchChange={onSearchChange}
                placeholder={placeholder}
                onNewClick={onNewClick}
                newLabel={newLabel}
            />
            <RecurringExpensesTable
                data={filteredTransactions}
                onRowDoubleClick={handleRowDoubleClick}
            />
        </>
    );
}

export default RecurringExpensesTab;