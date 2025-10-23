import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Patient, NewPatientInput, Provider } from '../../types';

/**
 * usePatientsQuery hook for fetching a list of patients.
 *
 * This hook is responsible for fetching a list of patients from the API.
 *
 * @returns A query hook with the following properties:
 *   - data: A list of Patient objects.
 *   - error: An error object if the query fails.
 *   - isLoading: A boolean indicating whether the query is in progress.
 *   - refetch: A function that can be used to refetch the query.
 */

export function usePatientsQuery() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await api.get<Patient[]>('/patients');
      return data;
    },
  });
}


/**
 * useCreatePatientMutation hook for creating a new patient.
 *
 * This hook is responsible for invalidating the cache of the 'patients' query
 * when the mutation is successful.
 *
 * @returns A mutation hook with the following properties:
 *   - mutationFn: A function that takes a NewPatientInput object as an argument
 *     and returns a Promise that resolves to a Patient object.
 *   - onSuccess: A function that will be called when the mutation is successful.
 *     It takes no arguments and invalidates the cache of the 'patients' query.
 */
export function useCreatePatientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewPatientInput) => {
      const { data } = await api.post('/patients', payload);
      return data as Patient;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * useAssignProviderMutation hook for assigning a provider to a patient.
 *
 * This hook is responsible for invalidating the cache of the 'patients' query
 * when the mutation is successful.
 *
 * @param patientId The ID of the patient to assign the provider to.
 *
 * @returns A mutation hook with the following properties:
 *   - mutationFn: A function that takes a provider ID as an argument
 *     and returns a Promise that resolves when the mutation is successful.
 *   - onSuccess: A function that will be called when the mutation is successful.
 *     It takes no arguments and invalidates the cache of the 'patients' query.
 */
export function useAssignProviderMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provider_id: string) => {
      await api.post(`/patients/${patientId}/assign-provider`, { provider_id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * useChangeStatusMutation hook for changing the status of a patient.
 *
 * This hook is responsible for invalidating the cache of the 'patients' query
 * when the mutation is successful.
 *
 * @param patientId The ID of the patient to change the status of.
 *
 * @returns A mutation hook with the following properties:
 *   - mutationFn: A function that takes a status ID as an argument and
 *     returns a Promise that resolves when the mutation is successful.
 *   - onSuccess: A function that will be called when the mutation is successful.
 *     It takes no arguments and invalidates the cache of the 'patients' query.
 */
export function useChangeStatusMutation(patientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status_id: string) => {
      await api.post(`/patients/${patientId}/change-status`, { status_id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}