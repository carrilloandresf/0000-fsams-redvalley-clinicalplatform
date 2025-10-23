import { Link, Route, Routes } from 'react-router-dom';
import PatientsList from '../features/patients/patientsList';
import NewPatientForm from '../features/patients/newPatientForm';
import PatientDetail from '../features/patients/patientDetail';
import NewProviderForm from '../features/providers/newProviderForm';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-slate-900">Clinical Platform</Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Pacientes
            </Link>
            <Link
              to="/new"
              className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white transition hover:bg-slate-800"
            >
              Nuevo paciente
            </Link>
            <Link
              to="/providers/new"
              className="inline-flex items-center rounded-lg border border-slate-900 px-3 py-1.5 font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white"
            >
              Nuevo proveedor
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<PatientsList />} />
          <Route path="/new" element={
            <div className="max-w-md">
              <h2 className="text-xl font-semibold mb-4">Crear paciente</h2>
              <NewPatientForm />
            </div>
          } />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route
            path="/providers/new"
            element={
              <section className="mx-auto max-w-4xl">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Proveedores</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Registrar nuevo proveedor</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Ingresa la información del especialista para que pueda ser asignado a los pacientes.
                    </p>
                  </div>
                  <div className="px-6 py-6">
                    <NewProviderForm />
                  </div>
                </div>
              </section>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;