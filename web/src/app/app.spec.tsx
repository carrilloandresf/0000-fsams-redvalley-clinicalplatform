import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './app';

vi.mock('../features/patients/patientsList', () => ({
  default: () => <div>Listado de pacientes</div>,
}));

vi.mock('../features/patients/newPatientForm', () => ({
  default: () => <div>Formulario nuevo paciente</div>,
}));

vi.mock('../features/providers/newProviderForm', () => ({
  default: () => <div>Formulario proveedor</div>,
}));

vi.mock('../features/patients/patientDetail', () => ({
  default: () => <div>Detalle paciente</div>,
}));

describe('App', () => {
  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Clinical Platform')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pacientes' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nuevo paciente' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nuevo proveedor' })).toBeInTheDocument();
  });

  it('navigates to provider form route', () => {
    render(
      <MemoryRouter initialEntries={['/providers/new']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Formulario proveedor')).toBeInTheDocument();
  });
});
