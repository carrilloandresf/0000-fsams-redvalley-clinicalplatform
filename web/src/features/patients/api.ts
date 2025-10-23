import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Patient, NewPatientInput } from '../../types';

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