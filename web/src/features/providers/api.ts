import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Provider, NewProviderInput } from '../../types';

/**
 * useProvidersQuery hook for fetching a list of providers.
 *
 * This hook is responsible for fetching a list of providers from the API.
 *
 * @returns A query hook with the following properties:
 *   - data: A list of Provider objects.
 *   - error: An error object if the query fails.
 *   - isLoading: A boolean indicating whether the query is in progress.
 *   - refetch: A function that can be used to refetch the query.
 *
 * The query is cached for 5 minutes (300000 ms) by default.
 */
export function useProvidersQuery() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => (await api.get<Provider[]>('/providers')).data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProviderMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: NewProviderInput) => {
      const { data } = await api.post<Provider>('/providers', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['providers'] });
    },
  });
}

