import api from './api';
import type { Customer } from '../types';


export const getCustomers = async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await api.post('/customers', customer);
    return response.data;
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
};

export const deleteCustomer = async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
};
