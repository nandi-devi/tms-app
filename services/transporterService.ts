import { API_BASE_URL } from '../constants';
import { Transporter } from '../types';

export const getAllTransporters = async (): Promise<Transporter[]> => {
  const response = await fetch(`${API_BASE_URL}/transporters`);
  if (!response.ok) {
    throw new Error('Failed to fetch transporters');
  }
  return response.json();
};

export const getTransporterById = async (id: string): Promise<Transporter> => {
  const response = await fetch(`${API_BASE_URL}/transporters/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch transporter');
  }
  return response.json();
};

export const createTransporter = async (transporter: Omit<Transporter, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transporter> => {
  const response = await fetch(`${API_BASE_URL}/transporters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transporter),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create transporter');
  }
  
  return response.json();
};

export const updateTransporter = async (id: string, transporter: Partial<Transporter>): Promise<Transporter> => {
  const response = await fetch(`${API_BASE_URL}/transporters/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transporter),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update transporter');
  }
  
  return response.json();
};

export const deleteTransporter = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/transporters/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete transporter');
  }
};
