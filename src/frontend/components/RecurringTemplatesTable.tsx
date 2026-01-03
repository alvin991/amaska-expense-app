import { Table } from 'react-bootstrap';
import { formatRecurrence } from '../utils/recurring_helper';
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
        paddingRight: '1rem',
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
            <th style={{ width: '200px' }}>Merchant</th>
            <th style={{ width: '120px' }}>Interval</th>
            <th style={{ width: '100px' }}>Start Date</th>
            <th style={{ width: '100px' }}>End Date</th>
            <th style={{ width: '100px' }}>Next Run</th>
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
              <td>{formatRecurrence(re.interval, re.frequency)}</td>
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