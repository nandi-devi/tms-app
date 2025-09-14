import api from './api';
import type { Vehicle } from '../types';


export const getVehicles = async (): Promise<Vehicle[]> => {
    const response = await api.get('/vehicles');
    return response.data;
};

export const createVehicle = async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const response = await api.post('/vehicles', vehicle);
    return response.data;
};

export const updateVehicle = async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await api.put(`/vehicles/${id}`, vehicle);
    return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
};
