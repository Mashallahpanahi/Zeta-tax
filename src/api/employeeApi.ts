import { useFetch } from "../hooks/useFetch";
import { useDelete } from "../hooks/useDelete";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = "http://localhost:3001";

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
  tin: string;
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
  tin: string;
  bank_account: string;
}

// Type for updating — everything optional
export type UpdateEmployeeType = Partial<CreateEmployeeType>;

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
