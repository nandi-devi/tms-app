import api from './api';
import type { LorryReceipt } from '../types';


export const getLorryReceipts = async (): Promise<LorryReceipt[]> => {
    const response = await api.get('/lorryreceipts');
    return response.data;
};

export const createLorryReceipt = async (lorryReceipt: Omit<LorryReceipt, 'id' | '_id'>): Promise<LorryReceipt> => {
    const response = await api.post('/lorryreceipts', lorryReceipt);
    return response.data;
};

export const updateLorryReceipt = async (id: string, lorryReceipt: Partial<LorryReceipt>): Promise<LorryReceipt> => {
    const response = await api.put(`/lorryreceipts/${id}`, lorryReceipt);
    return response.data;
};

export const deleteLorryReceipt = async (id: string): Promise<void> => {
    await api.delete(`/lorryreceipts/${id}`);
};

export const uploadPod = async (id: string, data: { receiverName: string; receiverPhone?: string; remarks?: string; photos?: File[]; latitude?: number; longitude?: number; recordedBy?: string; }): Promise<LorryReceipt> => {
    const form = new FormData();
    form.append('receiverName', data.receiverName || '');
    if (data.receiverPhone) form.append('receiverPhone', data.receiverPhone);
    if (data.remarks) form.append('remarks', data.remarks);
    if (typeof data.latitude === 'number') form.append('latitude', String(data.latitude));
    if (typeof data.longitude === 'number') form.append('longitude', String(data.longitude));
    if (data.recordedBy) form.append('recordedBy', data.recordedBy);
    (data.photos || []).forEach(f => form.append('photos', f));

    const response = await api.post(`/lorryreceipts/${id}/delivery`, form, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
