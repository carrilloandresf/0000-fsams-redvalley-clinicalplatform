import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export type StatusHistoryItem = {
  id: string;
  patient_id: string;
  status_id: string;
  changed_at: string;
  status?: { id: string; name: string };
};

export function usePatientHistoryQuery(patientId: string) {
  return useQuery({
    queryKey: ['patient-history', patientId],
    queryFn: async () => (await api.get<StatusHistoryItem[]>(`/patients/${patientId}/history`)).data,
    enabled: !!patientId,
  });
}