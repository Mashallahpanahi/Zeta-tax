import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import IncomePage from "../pages/Income/income";
import HomePage from "../pages/Dashboard/Home-page";
import EmployeesPage from "../pages/Employees/Register";
import ContractPage from "../pages/Employees/contract";
import EmployeeRegisterHistory from "../pages/Employees/Employee-register-history";
import EmployeeContractHistory from "../pages/Employees/EmployeeContractHistory";
import ExpenseCategoryPage from "../pages/Expenses/ExpenseCategory";
import OtherExpensesPage from "../pages/Expenses/OtherExpenses";
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* The DashboardLayout wraps all these child routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="contracts" element={<ContractPage />} />
        <Route path="employee-register-history" element={<EmployeeRegisterHistory />} />
        <Route path="contract-history" element={<EmployeeContractHistory />} />
        <Route path="expense-categories" element={<ExpenseCategoryPage />} />
        <Route path="other-expenses" element={<OtherExpensesPage />} />

      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
