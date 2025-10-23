import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';

import StatusSelect from './statusSelect';
import { useStatusesQuery } from '../features/statuses/api';

vi.mock('../features/statuses/api', () => ({
  useStatusesQuery: vi.fn(),
}));

const useStatusesQueryMock = useStatusesQuery as unknown as Mock;

describe('StatusSelect', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders statuses and reports changes', () => {
    useStatusesQueryMock.mockReturnValue({
      data: [
        { id: 's1', name: 'Nuevo' },
        { id: 's2', name: 'Activo' },
      ],
      isLoading: false,
    } as any);

    const handleChange = vi.fn();
    render(<StatusSelect value={null} onChange={handleChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 's2' } });
    expect(handleChange).toHaveBeenCalledWith('s2');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('disables when loading', () => {
    useStatusesQueryMock.mockReturnValue({ data: [], isLoading: true } as any);
    render(<StatusSelect value={null} onChange={() => undefined} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
