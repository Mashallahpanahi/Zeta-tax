import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

// ---------- Configuration ----------
const BASE_URL = "http://localhost:3001";

// ---------- Types ----------
export interface Employee {
    registration_id?: number | string;
    employee_id?: number | string;
    id?: number | string;
    first_name?: string;
    last_name?: string;
    status?: string;
}

export interface EmployeeContract {
    id?: number;
    contract_id?: number;
    employee_id: number;
    hire_date: string;
    termination_date: string | null;
    status: string;
    position_type: string;
    base_salary: number;
    currency: string;
    employee_type: string;
}

export type CreateEmployeeContractType = Omit<
    EmployeeContract,
    "id" | "contract_id"
>;

export type UpdateEmployeeContractType =
    Partial<CreateEmployeeContractType>;

// ---------- API Hooks ----------
export const getAllContracts = () =>
    useFetch<EmployeeContract[]>(`${BASE_URL}/employee-contract`);

export const getActiveEmployees = () =>
    useFetch<Employee[]>(`${BASE_URL}/employee-register/active`);

export const getAllRegisteredEmployees = () =>
    useFetch<Employee[]>(`${BASE_URL}/employee-register`);

export const createContract = () =>
    useCreate<EmployeeContract>(`${BASE_URL}/employee-contract`);

export const updateContract = () =>
    useUpdate<EmployeeContract>(`${BASE_URL}/employee-contract`);