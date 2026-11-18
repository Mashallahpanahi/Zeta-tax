import { useFetch } from "../hooks/useFetch";
import { useDelete } from "../hooks/useDelete";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BASE_URL = "http://localhost:3001";

// ---------- Types ----------
export interface GetAllEmployeeType {
  registration_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  status: string;
  phone: string;
  email: string;
  address: string;
  national_id: string;
  tin: number | string;
  bank_account: string;
  created_at: string;
  updated_at: string;
}

// Type for creating an employee (no id / timestamps)
export interface CreateEmployeeType {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  status: string;
  phone: string;
  email: string;
  address: string;
  national_id: string;
  tin: number | string;
  bank_account: string;
}

// ---------- Birthday Types ----------

export interface EmployeeBirthdayType {
  registration_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  birthday_day: number;
  status: string;
}

export interface EmployeeBirthdaysData {
  month: number;
  year: number;
  count: number;
  employees: EmployeeBirthdayType[];
}


// Type for updating — everything optional
export type UpdateEmployeeType = Partial<CreateEmployeeType>;

// ✅ History page — ALL employees (active + inactive)
export const getAllEmployeesHistory = () =>
  useFetch<GetAllEmployeeType[]>(`${BASE_URL}/employee-register/inactive`);

// ---------- GET ----------
export const getAllEmployees = () =>
  useFetch<GetAllEmployeeType[]>(`${BASE_URL}/employee-register/active`);

// ---------- CREATE ----------
export const createEmployee = () =>
  useCreate<GetAllEmployeeType>(`${BASE_URL}/employee-register`);

// ---------- UPDATE ----------
export const updateEmployee = () =>
  useUpdate<GetAllEmployeeType>(`${BASE_URL}/employee-register`);

// ---------- DELETE ----------
export const deleteEmployee = () => useDelete(`${BASE_URL}/employee-register`);

// ---------- BIRTHDAY NOTIFICATIONS ----------

export const useEmployeeBirthdays = (
  month: number,
  year: number,
  enabled = true,
) =>
  useFetch<EmployeeBirthdaysData>(
    `${BASE_URL}/employee-register/birthdays?month=${month}&year=${year}`,
    enabled,
  );