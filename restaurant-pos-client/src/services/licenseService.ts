import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LicenseStatus {
    isActivated: boolean;
    systemId: string;
}

const licenseService = {
    getStatus: async (): Promise<LicenseStatus> => {
        const response = await axios.get(`${API_URL}/license/status`);
        return response.data;
    },

    activate: async (key: string): Promise<void> => {
        await axios.post(`${API_URL}/license/activate`, { key });
    }
};

export default licenseService;
