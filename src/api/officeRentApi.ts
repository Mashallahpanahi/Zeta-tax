
import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface OfficeRent {
    rent_id: string;
    amount_af: number | string;
    date: string;
    tax_amount_af: number | string;
    final_pay_af: number | string;
    paid: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface OfficeRentPayload {
    amount_af: number;
    date: string;
    tax_amount_af: number;
    final_pay_af: number;
    paid: boolean;
}

export const getAllOfficeRents = (enabled = true) =>
    useFetch<OfficeRent[]>(`${BASE_URL}/office-rent`, enabled);

export const getOfficeRentById = (id: number | string) =>
    useFetch<OfficeRent>(`${BASE_URL}/office-rent/${id}`);

export const createOfficeRent = () =>
    useCreate<OfficeRent>(`${BASE_URL}/office-rent`);

export const updateOfficeRent = () =>
    useUpdate<OfficeRent>(`${BASE_URL}/office-rent`);
