import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';

import ProviderSelect from './providerSelect';
import { useProvidersQuery } from '../features/providers/api';

vi.mock('../features/providers/api', () => ({
  useProvidersQuery: vi.fn(),
}));

const useProvidersQueryMock = useProvidersQuery as unknown as Mock;

describe('ProviderSelect', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders options and notifies selection', () => {
    useProvidersQueryMock.mockReturnValue({
      data: [
        { id: 'p1', full_name: 'Dr. A', specialty: 'Cardio' },
        { id: 'p2', full_name: 'Dr. B', specialty: 'Neuro' },
      ],
      isLoading: false,
    } as any);

    const handleChange = vi.fn();

    render(<ProviderSelect value={null} onChange={handleChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'p2' } });
    expect(handleChange).toHaveBeenCalledWith('p2');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('disables select while loading', () => {
    useProvidersQueryMock.mockReturnValue({ data: undefined, isLoading: true } as any);

    render(<ProviderSelect value={null} onChange={() => undefined} disabled />);

    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
