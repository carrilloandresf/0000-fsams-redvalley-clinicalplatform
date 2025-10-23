import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Mock } from 'vitest';

import PatientDetail from './patientDetail';
import { usePatientsQuery } from './api';
import { usePatientHistoryQuery } from './historyApi';

vi.mock('./api', () => ({
  usePatientsQuery: vi.fn(),
}));

vi.mock('./historyApi', () => ({
  usePatientHistoryQuery: vi.fn(),
}));

const usePatientsQueryMock = usePatientsQuery as unknown as Mock;
const usePatientHistoryQueryMock = usePatientHistoryQuery as unknown as Mock;

describe('PatientDetail', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  function renderWithRoute(path = '/patients/p1') {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/patients/:id" element={<PatientDetail />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders patient information and history list', () => {
    usePatientsQueryMock.mockReturnValue({
      data: [
        {
          id: 'p1',
          full_name: 'John Doe',
          email: 'john@test.com',
          phone: '12345',
          provider: { full_name: 'Dr. A' },
          status: { name: 'Activo' },
        },
      ],
    } as any);
    usePatientHistoryQueryMock.mockReturnValue({
      data: [
        { id: 'h1', changed_at: '2023-01-01T00:00:00Z', status: { name: 'Activo' } },
      ],
      isLoading: false,
      isError: false,
    } as any);

    renderWithRoute();

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Detalle paciente')).toBeInTheDocument();
    expect(screen.getByText('Historial de estado')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('shows loading and error states for history', () => {
    usePatientsQueryMock.mockReturnValue({ data: [] } as any);
    usePatientHistoryQueryMock.mockReturnValue({ data: [], isLoading: true, isError: false } as any);

    renderWithRoute();
    expect(screen.getByText('Cargando historial…')).toBeInTheDocument();

    usePatientHistoryQueryMock.mockReturnValue({ data: [], isLoading: false, isError: true } as any);
    renderWithRoute();
    expect(screen.getByText('No se pudo cargar el historial')).toBeInTheDocument();
  });

  it('shows empty state when there is no history', () => {
    usePatientsQueryMock.mockReturnValue({ data: [{ id: 'p1', full_name: 'John', email: '', phone: '', provider: null, status: null }] } as any);
    usePatientHistoryQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false } as any);

    renderWithRoute();
    expect(screen.getByText('Sin eventos todavía.')).toBeInTheDocument();
  });
});
