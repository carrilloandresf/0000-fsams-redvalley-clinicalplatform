import { fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';

import PatientsList from './patientsList';
import {
  useAssignProviderMutation,
  useChangeStatusMutation,
  usePatientsQuery,
} from './api';

vi.mock('./api', () => ({
  usePatientsQuery: vi.fn(),
  useAssignProviderMutation: vi.fn(),
  useChangeStatusMutation: vi.fn(),
}));

vi.mock('../../components/providerSelect', () => ({
  __esModule: true,
  default: ({ onChange, disabled }: { onChange: (id: string | null) => void; disabled?: boolean }) => (
    <button disabled={disabled} onClick={() => onChange('provider-2')}>
      Cambiar proveedor
    </button>
  ),
}));

vi.mock('../../components/statusSelect', () => ({
  __esModule: true,
  default: ({ onChange, disabled }: { onChange: (id: string | null) => void; disabled?: boolean }) => (
    <button disabled={disabled} onClick={() => onChange('status-2')}>
      Cambiar estado
    </button>
  ),
}));

const usePatientsQueryMock = usePatientsQuery as unknown as Mock;
const useAssignProviderMutationMock = useAssignProviderMutation as unknown as Mock;
const useChangeStatusMutationMock = useChangeStatusMutation as unknown as Mock;

describe('PatientsList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    usePatientsQueryMock.mockReturnValue({ isLoading: true } as any);

    render(<PatientsList />);
    expect(screen.getByText('Cargando pacientes…')).toBeInTheDocument();
  });

  it('renders error state', () => {
    usePatientsQueryMock.mockReturnValue({ isLoading: false, isError: true, error: new Error('fail') } as any);

    render(<PatientsList />);
    expect(screen.getByText(/Error:/)).toHaveTextContent('fail');
  });

  it('renders patients and triggers mutations', () => {
    usePatientsQueryMock.mockReturnValue({
      isLoading: false,
      isError: false,
      data: [
        {
          id: 'p1',
          full_name: 'John Doe',
          email: 'john@test.com',
          phone: '12345',
          provider: { id: 'provider-1', full_name: 'Dr. A', specialty: 'Cardio' },
          status: { id: 'status-1', name: 'Nuevo' },
        },
      ],
    } as any);

    const assignMutate = vi.fn();
    const statusMutate = vi.fn();
    useAssignProviderMutationMock.mockReturnValue({ mutate: assignMutate, isPending: false });
    useChangeStatusMutationMock.mockReturnValue({ mutate: statusMutate, isPending: false });

    render(<PatientsList />);

    fireEvent.click(screen.getByText('Cambiar proveedor'));
    fireEvent.click(screen.getByText('Cambiar estado'));

    expect(assignMutate).toHaveBeenCalledWith('provider-2');
    expect(statusMutate).toHaveBeenCalledWith('status-2');
    expect(screen.getByText('Pacientes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'John Doe' })).toHaveAttribute('href', '/patients/p1');
  });

  it('renders empty state message', () => {
    usePatientsQueryMock.mockReturnValue({ isLoading: false, isError: false, data: [] } as any);
    useAssignProviderMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useChangeStatusMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<PatientsList />);
    expect(screen.getByText('No hay pacientes aún')).toBeInTheDocument();
  });
});
