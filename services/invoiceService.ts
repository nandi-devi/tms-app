import api from './api';
import type { Invoice } from '../types';


export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await api.get('/invoices');
    return response.data;
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | '_id'>): Promise<Invoice> => {
    const response = await api.post('/invoices', invoice);
    return response.data;
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, invoice);
    return response.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
};
