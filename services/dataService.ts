import api from './api';

export const resetApplicationData = async (): Promise<any> => {
    const response = await api.post('/data/reset');
    return response.data;
};

export const backupData = async (): Promise<any> => {
    const response = await api.get('/data/backup');
    return response.data;
};

export const restoreData = async (data: any): Promise<any> => {
    const response = await api.post('/data/restore', data);
    return response.data;
};

export interface NumberingConfigDto {
    key: 'invoiceId' | 'lorryReceiptId';
    start: number;
    end: number;
    allowOutsideRange?: boolean;
}

export const getNumberingConfigs = async (): Promise<Array<{ _id: string; start: number; end: number; next: number; allowOutsideRange?: boolean }>> => {
    const response = await api.get('/data/numbering');
    return response.data;
};

export const saveNumberingConfig = async (config: NumberingConfigDto) => {
    const response = await api.post('/data/numbering', { key: config.key, start: config.start, end: config.end, allowOutsideRange: !!config.allowOutsideRange });
    return response.data;
};
