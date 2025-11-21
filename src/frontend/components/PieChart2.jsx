import { Pie, PieChart, Label } from 'recharts';

// const data = [
//   { name: 'Group A', value: 400, fill: '#0088FE' },
//   { name: 'Group B', value: 300, fill: '#00C49F' },
//   { name: 'Group C', value: 300, fill: '#FFBB28' },
//   { name: 'Group D', value: 200, fill: '#FF8042' },
// ];

// #endregion
function PieChartHasTextInside({ isAnimationActive = true, chartData = [], heading = '', centerLabel = '' }) {
  if (!chartData || chartData.length === 0) {
    return <p>No data to display</p>;
  }
  return (
    <div style={{ border: '2px solid #ccc', display: 'flex', justifyContent: 'center' }}>
        <span>{ heading }</span>
        <PieChart style={{ width: '69%', maxWidth: '450px', maxHeight: '30vh', aspectRatio: 1 }} responsive>
            <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius="80%" 
                innerRadius="60%" 
                isAnimationActive={isAnimationActive} 
            />
            <Label position="center" fill="#666">
                {centerLabel}
            </Label>
        </PieChart>
    </div>
  );
}

export default PieChartHasTextInside