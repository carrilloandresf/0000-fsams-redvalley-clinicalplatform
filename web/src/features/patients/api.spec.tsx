import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import {
  useAssignProviderMutation,
  useChangeStatusMutation,
  useCreatePatientMutation,
  usePatientsQuery,
} from './api';
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

describe('patients api hooks', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches patients list', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 'p1', full_name: 'John Doe', email: 'john@test.com', phone: '12345' }],
    });

    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => usePatientsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].full_name).toBe('John Doe');

    queryClient.clear();
  });

  it('creates patient and invalidates query cache', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { id: 'p2', full_name: 'Jane Doe' },
    });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePatientMutation(), { wrapper });
    const payload = {
      full_name: 'Jane Doe',
      email: 'jane@test.com',
      phone: '99999',
      provider_id: 'prov',
      status_id: 'status',
    };

    await result.current.mutateAsync(payload);

    expect(mockedApi.post).toHaveBeenCalledWith('/patients', payload);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patients'] });

    queryClient.clear();
  });

  it('assigns provider to patient', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAssignProviderMutation('patient-1'), { wrapper });
    await result.current.mutateAsync('provider-1');

    expect(mockedApi.post).toHaveBeenCalledWith('/patients/patient-1/assign-provider', {
      provider_id: 'provider-1',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patients'] });

    queryClient.clear();
  });

  it('changes patient status', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} });
    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useChangeStatusMutation('patient-1'), { wrapper });
    await result.current.mutateAsync('status-1');

    expect(mockedApi.post).toHaveBeenCalledWith('/patients/patient-1/change-status', {
      status_id: 'status-1',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patients'] });

    queryClient.clear();
  });
});
