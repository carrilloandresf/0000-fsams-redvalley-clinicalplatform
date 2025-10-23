import { useParams, Link } from 'react-router-dom';
import { usePatientHistoryQuery } from './historyApi';
import { usePatientsQuery } from './api';

export default function PatientDetail() {
  const { id = '' } = useParams();
  const { data: list } = usePatientsQuery(); // ya trae provider/status actuales
  const patient = list?.find(p => p.id === id);
  const { data, isLoading, isError } = usePatientHistoryQuery(id);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Detalle paciente</h2>
        <Link to="/" className="text-sm underline">← Volver</Link>
      </div>

      {patient ? (
        <div className="rounded-xl border bg-white p-4 mb-6">
          <div className="font-medium">{patient.full_name}</div>
          <div className="text-sm text-slate-600">{patient.email} · {patient.phone}</div>
          <div className="text-sm mt-1">
            <span className="mr-3">Proveedor: <b>{patient.provider?.full_name ?? '—'}</b></span>
            <span>Estado actual: <b>{patient.status?.name ?? '—'}</b></span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-500 mb-6">Cargando paciente…</div>
      )}

      <h3 className="text-lg font-semibold mb-3">Historial de estado</h3>
      {isLoading && <div>Cargando historial…</div>}
      {isError && <div className="text-red-600">No se pudo cargar el historial</div>}

      <ul className="space-y-3">
        {data?.length ? data.map(h => (
          <li key={h.id} className="rounded-lg border bg-white p-3">
            <div className="text-sm"><b>{h.status?.name ?? 'Estado'}</b></div>
            <div className="text-xs text-slate-600">
              {new Date(h.changed_at).toLocaleString()}
            </div>
          </li>
        )) : !isLoading && <div className="text-sm text-slate-500">Sin eventos todavía.</div>}
      </ul>
    </div>
  );
}