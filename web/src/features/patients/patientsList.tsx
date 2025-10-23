import { usePatientsQuery, useAssignProviderMutation, useChangeStatusMutation } from './api';
import ProviderSelect from '../../components/providerSelect';
import StatusSelect from '../../components/statusSelect';
import type { Patient } from '../../types';
import { Link } from 'react-router-dom';

export default function PatientsList() {
  const { data, isLoading, isError, error } = usePatientsQuery();

  if (isLoading) return <div className="p-6">Cargando pacientes…</div>;
  if (isError) return <div className="p-6 text-red-600">Error: {(error as any)?.message ?? 'No se pudo cargar'}</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pacientes</h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Teléfono</th>
              <th className="text-left p-3">Proveedor</th>
              <th className="text-left p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((patient) => (
              <PatientRow key={patient.id} patient={patient} />
            ))}
            {data?.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={5}>No hay pacientes aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PatientRowProps = {
  patient: Patient;
};

function PatientRow({ patient }: PatientRowProps) {
  const assignProvider = useAssignProviderMutation(patient.id);
  const changeStatus = useChangeStatusMutation(patient.id);

  const handleProviderChange = (id: string | null) => {
    if (!id) return;
    assignProvider.mutate(id);
  };

  const handleStatusChange = (id: string | null) => {
    if (!id) return;
    changeStatus.mutate(id);
  };

  return (
    <tr className="border-t">
      <td className="p-3">
        <Link className="underline" to={`/patients/${patient.id}`}>{patient.full_name}</Link>
      </td>
      <td className="p-3">{patient.email}</td>
      <td className="p-3">{patient.phone}</td>
      <td className="p-3">
        <ProviderSelect
          value={patient.provider?.id ?? null}
          disabled={assignProvider.isPending}
          onChange={handleProviderChange}
        />
      </td>
      <td className="p-3">
        <StatusSelect
          value={patient.status?.id ?? null}
          disabled={changeStatus.isPending}
          onChange={handleStatusChange}
        />
      </td> 
    </tr>
  );
}
