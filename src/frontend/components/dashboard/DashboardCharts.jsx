////javascript
// filepath: c:\alvin\code\react\amaska-expense-app\src\frontend\components\dashboard\DashboardCharts.jsx
// ...existing code...
import PieChartWithCustomizedLabel from '../PieChart1';
import PieChartHasTextInside from '../PieChart2';

function DashboardCharts({
  leftToSpendData,
  leftToSpend,
  chartDataByCategory,
  chartDataByPaymentMethod,
}) {
  return (
    <div
      id="middle-panel"
      className="row d-flex justify-content-center"
      style={{ width: '100%' }}
    >
      <div className="col-md-4">
        <PieChartHasTextInside
          chartData={leftToSpendData}
          heading="LEFT TO SPEND"
          centerLabel={`$${leftToSpend}`}
        />
      </div>
      <div className="col-md-4">
        <PieChartWithCustomizedLabel
          chartData={chartDataByCategory}
          heading="CATEGORY"
        />
      </div>
      <div className="col-md-4">
        <PieChartWithCustomizedLabel
          chartData={chartDataByPaymentMethod}
          heading="PAY BY"
        />
      </div>
    </div>
  );
}

export default DashboardCharts;
// ...existing code...