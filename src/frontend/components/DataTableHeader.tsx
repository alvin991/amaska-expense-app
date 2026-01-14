import MySearchBox from './MySearchBox';

interface DataTableHeaderProps {
    title: string;
    onSearchChange?: (value: string) => void;
    placeholder?: string;
    onNewClick?: () => void;
    newLabel?: string;
}

function DataTableHeader({
    title,
    onSearchChange,
    placeholder,
    onNewClick,
    newLabel = 'New',
}: DataTableHeaderProps) {
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
            }}
        >
            <h4 style={{ margin: 0 }}>{title}</h4>

            {onSearchChange && (
                <MySearchBox onQueryChange={onSearchChange} placeholder={placeholder} />
            )}

            {onNewClick && (
                <div
                    style={{
                        paddingLeft: '1.7rem',
                        paddingRight: '1.7rem',
                        marginBottom: '0.5rem',
                    }}
                >
                    <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={onNewClick}
                    >
                        {newLabel}
                    </button>
                </div>
            )}
        </div>
    );
}

export default DataTableHeader;