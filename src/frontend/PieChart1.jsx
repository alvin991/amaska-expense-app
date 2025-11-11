import { Cell, Pie, PieChart } from 'recharts';

// #region Sample data
// const data = [
//   { name: 'Group A', value: 400 },
//   { name: 'Group B', value: 300 },
//   { name: 'Group C', value: 300 },
//   { name: 'Group D', value: 200 },
// ];

// #endregion
const RADIAN = Math.PI / 180;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    // <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
    //   {`${((percent ?? 1) * 100).toFixed(0)}%`}
    // </text>
    <text x={x} y={y} fill="black" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
      {payload?.name} {/* Show the name */}
      {` (${((percent ?? 1) * 100).toFixed(0)}%)`}
    </text>
  );
};

function PieChartWithCustomizedLabel({ isAnimationActive = true, heading = '', chartData = []  }) {
  return (
    <div style={{ border: '2px solid #ccc', display: 'flex', justifyContent: 'center' }}>
        <span>{ heading }</span>
        <PieChart style={{ width: '69%', maxWidth: '450px', maxHeight: '30vh', aspectRatio: 1 }} responsive>
        {/* <PieChart style={{ width: '33%', maxWidth: '300px', maxHeight: '30vh', aspectRatio: 1 }} responsive> */}
            <Pie
                data={chartData}
                labelLine={false}
                label={renderCustomizedLabel}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={isAnimationActive}
            >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
        </PieChart>
    </div>
  );
}

export default PieChartWithCustomizedLabel