import { api } from './utils';

export const checkSetup = async (): Promise<{ isSetup: boolean }> => {
    const response = await api.get('/auth/check-setup');
    return response.data;
};

export const setup = async (password: string): Promise<void> => {
    await api.post('/auth/setup', { password });
};

export const login = async (password: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/login', { password });
    return response.data;
};