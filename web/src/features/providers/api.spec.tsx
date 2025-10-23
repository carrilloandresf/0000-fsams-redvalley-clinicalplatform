import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useCreateProviderMutation, useProvidersQuery } from './api';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
}

describe('providers api hooks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches providers list', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: '1', full_name: 'Dr. A', specialty: 'Cardio' }],
    });
    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useProvidersQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: '1', full_name: 'Dr. A', specialty: 'Cardio' }]);

    queryClient.clear();
  });

  it('creates provider and invalidates query', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { id: '2', full_name: 'Dr. B', specialty: 'Onco' },
    });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateProviderMutation(), { wrapper });

    await result.current.mutateAsync({ full_name: 'Dr. B', specialty: 'Onco' });

    expect(mockedApi.post).toHaveBeenCalledWith('/providers', { full_name: 'Dr. B', specialty: 'Onco' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['providers'] });

    queryClient.clear();
  });
});
