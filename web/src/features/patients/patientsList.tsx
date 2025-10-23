import { usePatientsQuery, useAssignProviderMutation, useChangeStatusMutation } from './api';
import ProviderSelect from '../../components/providerSelect';
import StatusSelect from '../../components/statusSelect';

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
            {data?.map((p) => {
              const assignProvider = useAssignProviderMutation(p.id);
              const changeStatus = useChangeStatusMutation(p.id);

              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.full_name}</td>
                  <td className="p-3">{p.email}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">
                    <ProviderSelect
                      value={p.provider?.id ?? null}
                      disabled={assignProvider.isPending}
                      onChange={(id) => id ? assignProvider.mutate(id) : assignProvider.mutateAsync('')}
                    />
                  </td>
                  <td className="p-3">
                    <StatusSelect
                      value={p.status?.id ?? null}
                      disabled={changeStatus.isPending}
                      onChange={(id) => id ? changeStatus.mutate(id) : changeStatus.mutateAsync('')}
                    />
                  </td>
                </tr>
              );
            })}
            {data?.length === 0 && (
              <tr><td className="p-3 text-slate-500" colSpan={5}>No hay pacientes aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
