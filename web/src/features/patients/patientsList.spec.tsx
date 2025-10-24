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

  it('renders empty state message', () => {
    usePatientsQueryMock.mockReturnValue({ isLoading: false, isError: false, data: [] } as any);
    useAssignProviderMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useChangeStatusMutationMock.mockReturnValue({ mutate: vi.fn(), isPending: false });

    render(<PatientsList />);
    expect(screen.getByText('No hay pacientes aún')).toBeInTheDocument();
  });
});
