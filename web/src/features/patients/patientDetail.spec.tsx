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
