import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import HomePage from "../pages/Dashboard/Home-page";
import EmployeesPage from "../pages/Employees/Register";
import ContractPage from "../pages/Employees/contract";
import IncomeTransactionPage from "../pages/Income/Income-transaction";
import EmployeeRegisterHistory from "../pages/Employees/Employee-register-history";
import EmployeeContractHistory from "../pages/Employees/EmployeeContractHistory";
import ExpenseCategoryPage from "../pages/Expenses/ExpenseCategory";
import OtherExpensesPage from "../pages/Expenses/OtherExpenses";
import ExchangeToAFNPage from "../pages/Income/Exchange-to-AfN";
import TaxPage from "../pages/Settings/tax/tax-Page";
import TaxReportsPage from "../pages/TaxReports/TaxReports";
import Payroll from "../pages/Employees/PayRoll";
import PayRollHistory from "../pages/Employees/PayRollHistory";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="Income-transaction" element={<IncomeTransactionPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="contracts" element={<ContractPage />} />
        <Route
          path="employee-register-history"
          element={<EmployeeRegisterHistory />}
        />
        <Route path="EM-payroll" element={<Payroll />} />
        <Route path="contract-history" element={<EmployeeContractHistory />} />
        <Route path="expense-categories" element={<ExpenseCategoryPage />} />
        <Route path="other-expenses" element={<OtherExpensesPage />} />
        <Route path="exchange-to-afn" element={< ExchangeToAFNPage />} />
        <Route path="settings-tax" element={<TaxPage />} />
        <Route path="tax-reports" element={<TaxReportsPage />} />
        <Route path="payroll-history" element={<PayRollHistory />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
