import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ---------- Types ----------
export interface ContractEmployee {
  registration_id: string;
  first_name: string;
  last_name: string;
}

export interface EmployeeContract {
  contract_id: string | number;
  employee_id: string | number;
  base_salary: string | number;
  currency: string;
  employee?: ContractEmployee;
}

export interface PayrollType {
  payroll_id: string;
  contract_id: string;
  contract: EmployeeContract;
  base_salary: string;
  salary_usd: string;
  salary_afn: string;
  ex_rate: string;
  overtime_bonus: string;
  date: string;
  tax: string;
  final_salary: string;
  pay_status: boolean;
}

export type CreatePayrollType = {
  contract_id: string | number;
  base_salary: number;
  salary_usd: number;
  salary_afn: number;
  ex_rate: number;
  overtime_bonus: number;
  date: string;
  tax: number;
  final_salary: number;
  pay_status: boolean;
};

// ---------- Hooks ----------
export const getActiveContracts = () =>
  useFetch<EmployeeContract[]>(`${BASE_URL}/employee-contract/active`);

export const getMonthlyPayrolls = (month: number, year: number) =>
  useFetch<PayrollType[]>(
    `${BASE_URL}/employee-payroll/monthly?month=${month}&year=${year}`
  );

export const createPayroll = () =>
  useCreate<PayrollType>(`${BASE_URL}/employee-payroll`);