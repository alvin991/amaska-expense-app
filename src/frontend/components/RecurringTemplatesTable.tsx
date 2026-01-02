import { Table } from 'react-bootstrap';

interface RecurringTemplate {
  id: number;
  name: string;
  merchant?: string;
  interval?: number;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  next_run_date?: string;
}

interface RecurringTemplatesTableProps {
  data: RecurringTemplate[];
  onRowDoubleClick?: (id: number) => void;
}

function RecurringTemplatesTable({ data, onRowDoubleClick }: RecurringTemplatesTableProps) {
  if (!data || data.length === 0) {
    return <p>No recurring expenses to display.</p>;
  }

  const formatIntervalFrequency = (interval: number | undefined, frequency: string) => {
    if (!frequency) return '';
    const freq = String(frequency).toLowerCase();
    const n = interval || 1;
    const unit = n === 1 ? freq : `${freq}s`;
    return `${n} ${unit}`;
  };

  return (
    <div
      className="g-0"
      style={{
        width: '100%',
        backgroundColor: 'lightblue',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        paddingLeft: '1rem',
        overflow: 'hidden',
      }}
    >
      <Table
        bordered
        hover
        responsive={false}
        style={{
          width: '100%',
          tableLayout: 'fixed',
          marginBottom: 0,
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '220px' }}>Name</th>
            <th style={{ width: '220px' }}>Merchant</th>
            <th style={{ width: '160px' }}>Interval</th>
            <th style={{ width: '140px' }}>Start Date</th>
            <th style={{ width: '140px' }}>End Date</th>
            <th style={{ width: '140px' }}>Next Run</th>
          </tr>
        </thead>
        <tbody>
          {data.map((re) => (
            <tr
              key={re.id}
              onDoubleClick={() => {
                if (onRowDoubleClick) {
                  onRowDoubleClick(re.id);
                }
              }}
            >
              <td>{re.name}</td>
              <td>{re.merchant}</td>
              <td>{formatIntervalFrequency(re.interval, re.frequency)}</td>
              <td>{re.start_date || ''}</td>
              <td>{re.end_date || ''}</td>
              <td>{re.next_run_date || ''}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default RecurringTemplatesTable;