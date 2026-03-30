import axios from 'axios';
import type { ILastReading, ICreateBilling, IBulkResponse, ITenantBillingHistory, IUpdateMeterRequest, IUpdateMeterResponse } from '../type/billing';

const API_URL = "http://localhost:5001/api/billings";

export const BillingFrontendService = {
  getLastReadings: async (): Promise<ILastReading[]> => {
    const response = await axios.get<ILastReading[]>(`${API_URL}/last-readings`);
    return response.data;
  },

  createBulk: async (billings: ICreateBilling[]): Promise<IBulkResponse> => {
    const response = await axios.post<IBulkResponse>(`${API_URL}/bulk`, { billings });
    return response.data;
  },

  getHistoryByTenant: async (tenantId: string): Promise<ITenantBillingHistory[]> => {
    const response = await axios.get<ITenantBillingHistory[]>(`${API_URL}/tenant/${tenantId}`);
    return response.data;
  },
  getHistoryByRoom: async (roomId: string): Promise<ITenantBillingHistory[]> => {
    const response = await axios.get<ITenantBillingHistory[]>(`${API_URL}/room/${roomId}`);
    return response.data;
  },
  updateMeterReading: async (data: IUpdateMeterRequest): Promise<IUpdateMeterResponse> => {
    const response = await axios.post<IUpdateMeterResponse>(`${API_URL}/update-meter`, data);
    return response.data;
  },
};