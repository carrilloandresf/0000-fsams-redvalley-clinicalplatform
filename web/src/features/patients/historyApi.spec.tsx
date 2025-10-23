import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { usePatientHistoryQuery } from './historyApi';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
}

describe('patient history hook', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches history when patient id is provided', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 'h1', patient_id: 'p1', status_id: 's1', changed_at: '2023-01-01T00:00:00Z' }],
    });
    const { wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => usePatientHistoryQuery('p1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(1);

    queryClient.clear();
  });

  it('does not run when patient id is empty', async () => {
    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => usePatientHistoryQuery(''), { wrapper });

    expect(result.current.isFetched).toBe(false);
    expect(mockedApi.get).not.toHaveBeenCalled();

    queryClient.clear();
  });
});
