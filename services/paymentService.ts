import api from './api';
import type { Payment } from '../types';


export const getPayments = async (): Promise<Payment[]> => {
    const response = await api.get('/payments');
    return response.data;
};

export const createPayment = async (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>): Promise<Payment> => {
    const response = await api.post('/payments', payment);
    return response.data;
};

export const updatePayment = async (id: string, payment: Partial<Payment>): Promise<Payment> => {
    const response = await api.put(`/payments/${id}`, payment);
    return response.data;
};

export const deletePayment = async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
};
