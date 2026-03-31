import api from './api'
import type { ILastReading, ICreateBilling, IBulkResponse, ITenantBillingHistory, IUpdateMeterRequest, IUpdateMeterResponse } from '../type/billing';

const API_PATH = "/api/billings";

export const BillingFrontendService = {
  getLastReadings: async (): Promise<ILastReading[]> => {
    const response = await api.get<ILastReading[]>(`${API_PATH}/last-readings`);
    return response.data;
  },

  createBulk: async (billings: ICreateBilling[]): Promise<IBulkResponse> => {
    const response = await api.post<IBulkResponse>(`${API_PATH}/bulk`, { billings });
    return response.data;
  },

  getHistoryByTenant: async (tenantId: string): Promise<ITenantBillingHistory[]> => {
    const response = await api.get<ITenantBillingHistory[]>(`${API_PATH}/tenant/${tenantId}`);
    return response.data;
  },
  getHistoryByRoom: async (roomId: string): Promise<ITenantBillingHistory[]> => {
    const response = await api.get<ITenantBillingHistory[]>(`${API_PATH}/room/${roomId}`);
    return response.data;
  },
  updateMeterReading: async (data: IUpdateMeterRequest): Promise<IUpdateMeterResponse> => {
    const response = await api.post<IUpdateMeterResponse>(`${API_PATH}/update-meter`, data);
    return response.data;
  },
};