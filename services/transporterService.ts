import api from './api';
import { Transporter } from '../types';

export const getAllTransporters = async (): Promise<Transporter[]> => {
  const response = await api.get('/transporters');
  return response.data;
};

export const getTransporterById = async (id: string): Promise<Transporter> => {
  const response = await api.get(`/transporters/${id}`);
  return response.data;
};

export const createTransporter = async (transporter: Omit<Transporter, '_id' | 'createdAt' | 'updatedAt'>): Promise<Transporter> => {
  const response = await api.post('/transporters', transporter);
  return response.data;
};

export const updateTransporter = async (id: string, transporter: Partial<Transporter>): Promise<Transporter> => {
  const response = await api.put(`/transporters/${id}`, transporter);
  return response.data;
};

export const deleteTransporter = async (id: string): Promise<void> => {
  await api.delete(`/transporters/${id}`);
};
