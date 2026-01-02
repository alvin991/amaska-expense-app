import DataTableHeader from './DataTableHeader.js';
import RecurringTemplatesTable from './RecurringTemplatesTable.js';

interface RecurringTemplatesProps {
    title: string;
    onSearchChange?: (value: string) => void;
    placeholder?: string;
    onNewClick?: () => void;
    newLabel?: string;
    filteredTransactions: any[];
    handleRowDoubleClick: (rowData: any) => void;
}

function RecurringTemplatesTab({title, onSearchChange, placeholder, onNewClick, newLabel, filteredTransactions, handleRowDoubleClick}: RecurringTemplatesProps) {
    return (
        <>
            <DataTableHeader
                title={title}
                onSearchChange={onSearchChange}
                placeholder={placeholder}
                onNewClick={onNewClick}
                newLabel={newLabel}
            />
            <RecurringTemplatesTable
                data={filteredTransactions}
                onRowDoubleClick={handleRowDoubleClick}
            />
        </>
    );
}

export default RecurringTemplatesTab;