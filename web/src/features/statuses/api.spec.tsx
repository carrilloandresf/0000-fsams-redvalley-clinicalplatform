import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useStatusesQuery } from './api';
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

describe('statuses api hook', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches statuses', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 's1', name: 'Activo', parent_id: null, order: 1 }],
    });

    const { wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useStatusesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 's1', name: 'Activo', parent_id: null, order: 1 }]);

    queryClient.clear();
  });
});
