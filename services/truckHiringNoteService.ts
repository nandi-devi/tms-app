import { API_BASE_URL } from '../constants';
import type { TruckHiringNote } from '../types';

export const getTruckHiringNotes = async (filters?: {
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filter?: 'thisWeek' | 'thisMonth' | 'outstanding';
}): Promise<TruckHiringNote[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.filter) params.append('filter', filters.filter);
    
    const url = `${API_BASE_URL}/truckhiringnotes${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch Truck Hiring Notes');
    }
    return response.json();
};

export const createTruckHiringNote = async (note: Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable' | 'totalCharges'>): Promise<TruckHiringNote> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Truck Hiring Note');
    }
    return response.json();
};

export const updateTruckHiringNote = async (id: string, note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balancePayable' | 'totalCharges'>>): Promise<TruckHiringNote> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update Truck Hiring Note');
    }
    return response.json();
};

export const getLastTHNForTransporter = async (transporterId: string): Promise<TruckHiringNote | null> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes/transporter/${transporterId}/last`);
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error('Failed to fetch last THN for transporter');
    }
    return response.json();
};

export const sendReminder = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/truckhiringnotes/${id}/reminder`, {
        method: 'POST',
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reminder');
    }
};
