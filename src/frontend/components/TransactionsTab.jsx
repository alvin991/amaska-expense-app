import DashboardHeader from './dashboard/DashboardHeader';
import DashboardCharts from './dashboard/DashboardCharts';
import DataTableHeader from './DataTableHeader.js';
import DateGroupedTable from './DateGroupedTable.jsx';

function TransactionsTab({dashboardHeader, charts, dataTableHeader, dataTable}) {
    return (
        <>
            <DashboardHeader
                monthName={dashboardHeader.monthName}
                budgetByMonth={dashboardHeader.budgetByMonth}
                periodTotalAmount={dashboardHeader.periodTotalAmount}
                currentYear={dashboardHeader.currentYear}
                currentMonth={dashboardHeader.currentMonth}
                onChangeMonth={dashboardHeader.onChangeMonth}
            />
            <div className="row line-break" style={{ height: '2vh', width: '100%' }} />
            <DashboardCharts
                leftToSpendData={charts.leftToSpendData}
                leftToSpend={charts.leftToSpend}
                chartDataByCategory={charts.chartDataByCategory}
                chartDataByPaymentMethod={charts.chartDataByPaymentMethod}
            />
            <div className="row line-break" style={{ height: '2vh', width: '100%' }} />
            <DataTableHeader
                title={dataTableHeader.title}
                onSearchChange={dataTableHeader.onSearchChange}
                placeholder={dataTableHeader.placeholder}
                onNewClick={dataTableHeader.onNewClick}
                newLabel={dataTableHeader.newButtonLabel}
            />
            <DateGroupedTable
                data={dataTable.data}
                onRowDoubleClick={dataTable.onRowDoubleClick}
                categories={dataTable.categories}
            />
        </>
    );
}

export default TransactionsTab;