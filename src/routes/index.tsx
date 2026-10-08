import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout/DashboardLayout";
import IncomePage from "../pages/Income/income";
import HomePage from "../pages/Dashboard/Home-page";
import ExpensesPage from "../pages/Expenses/Expenses";
import EmployeesPage from "../pages/Employees/Register";
import ContractPage from "../pages/Employees/contract";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* The DashboardLayout wraps all these child routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="income" element={<IncomePage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="contracts" element={<ContractPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
