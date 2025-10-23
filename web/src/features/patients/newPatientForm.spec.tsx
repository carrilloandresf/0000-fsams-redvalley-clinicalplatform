import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';

import NewPatientForm from './newPatientForm';
import { useCreatePatientMutation } from './api';
import { useProvidersQuery } from '../providers/api';
import { useStatusesQuery } from '../statuses/api';

vi.mock('./api', () => ({
  useCreatePatientMutation: vi.fn(),
}));

vi.mock('../providers/api', () => ({
  useProvidersQuery: vi.fn(),
}));

vi.mock('../statuses/api', () => ({
  useStatusesQuery: vi.fn(),
}));

const useCreatePatientMutationMock = useCreatePatientMutation as unknown as Mock;
const useProvidersQueryMock = useProvidersQuery as unknown as Mock;
const useStatusesQueryMock = useStatusesQuery as unknown as Mock;

describe('NewPatientForm', () => {
  beforeEach(() => {
    useProvidersQueryMock.mockReturnValue({
      data: [{ id: 'prov-1', full_name: 'Dr. Who', specialty: 'Time' }],
      isLoading: false,
    });
    useStatusesQueryMock.mockReturnValue({
      data: [{ id: 'status-1', name: 'Nuevo' }],
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('submits form successfully and resets state', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    useCreatePatientMutationMock.mockReturnValue({ mutateAsync, isPending: false });

    render(<NewPatientForm />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: '  John Doe  ' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' JOHN@Example.com ' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: ' 123456 ' } });
    fireEvent.change(screen.getByLabelText('Proveedor (opcional)'), { target: { value: 'prov-1' } });
    fireEvent.change(screen.getByLabelText('Estado (opcional)'), { target: { value: 'status-1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear paciente' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        full_name: 'John Doe',
        email: 'JOHN@Example.com',
        phone: '123456',
        provider_id: 'prov-1',
        status_id: 'status-1',
      });
    });

    expect(await screen.findByText('Paciente creado ✅')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Teléfono')).toHaveValue('');
    expect(screen.getByLabelText('Proveedor (opcional)')).toHaveValue('');
    expect(screen.getByLabelText('Estado (opcional)')).toHaveValue('');
  });

  it('shows error message when mutation fails', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({ response: { data: { error: 'Backend error' } } });
    useCreatePatientMutationMock.mockReturnValue({ mutateAsync, isPending: false });

    render(<NewPatientForm />);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: 'Crear paciente' }));

    expect(await screen.findByText('Backend error')).toBeInTheDocument();
    expect(mutateAsync).toHaveBeenCalled();
  });
});
