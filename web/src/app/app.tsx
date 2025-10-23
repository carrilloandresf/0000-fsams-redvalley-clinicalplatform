import { Link, Route, Routes } from 'react-router-dom';
import PatientsList from '../features/patients/patientsList';
import NewPatientForm from '../features/patients/newPatientForm';
import PatientDetail from '../features/patients/patientDetail';

export function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Clinical Platform</Link>
          <nav className="text-sm">
            <Link to="/" className="mr-4">Pacientes</Link>
            <Link to="/new" className="px-3 py-1 rounded bg-slate-900 text-white">Nuevo</Link>
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
        </Routes>
      </main>
    </div>
  );
}

export default App;