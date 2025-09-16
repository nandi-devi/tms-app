import api from './api';
import type { TruckHiringNote } from '../types';

export const getTruckHiringNotes = async (filters?: {
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filter?: 'thisWeek' | 'thisMonth' | 'outstanding';
}): Promise<TruckHiringNote[]> => {
    const response = await api.get('/truckhiringnotes', { params: filters });
    return response.data;
};

export const createTruckHiringNote = async (note: Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable' | 'totalCharges'>): Promise<TruckHiringNote> => {
    const response = await api.post('/truckhiringnotes', note);
    return response.data;
};

export const updateTruckHiringNote = async (id: string, note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable' | 'totalCharges'>>): Promise<TruckHiringNote> => {
    const response = await api.put(`/truckhiringnotes/${id}`, note);
    return response.data;
};

export const getLastTHNForTransporter = async (transporterId: string): Promise<TruckHiringNote | null> => {
    try {
        const response = await api.get(`/truckhiringnotes/transporter/${transporterId}/last`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

export const sendReminder = async (id: string): Promise<void> => {
    await api.post(`/truckhiringnotes/${id}/reminder`);
};
