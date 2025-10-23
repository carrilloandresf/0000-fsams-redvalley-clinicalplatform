import { useState } from 'react';
import { useCreatePatientMutation } from './api';
import type { NewPatientInput } from '../../types';
import { useProvidersQuery } from '../providers/api';
import { useStatusesQuery } from '../statuses/api';

export default function NewPatientForm() {
  const [form, setForm] = useState<NewPatientInput>({
    full_name: '',
    email: '',
    phone: '',
    provider_id: null,
    status_id: null,
  });

  const { data: providers, isLoading: loadingProviders } = useProvidersQuery();
  const { data: statuses,  isLoading: loadingStatuses  } = useStatusesQuery();

  const { mutateAsync, isPending } = useCreatePatientMutation();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);

    // Limpieza: enviar undefined si está vacío, para que el backend lo trate como null
    const payload: NewPatientInput = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      provider_id: form.provider_id || undefined,
      status_id: form.status_id || undefined,
    };

    try {
      await mutateAsync(payload);
      setMsg('Paciente creado ✅');
      setForm({ full_name: '', email: '', phone: '', provider_id: null, status_id: null });
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? 'No se pudo crear');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Nombre completo</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
          minLength={2}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full border rounded-lg px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Teléfono</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
          minLength={5}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Proveedor (opcional)</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={form.provider_id ?? ''}
          onChange={(e) => setForm({ ...form, provider_id: e.target.value || null })}
          disabled={loadingProviders || isPending}
        >
          <option value="">(Sin asignar)</option>
          {providers?.map(p => (
            <option key={p.id} value={p.id}>{p.full_name} — {p.specialty}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Estado (opcional)</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={form.status_id ?? ''}
          onChange={(e) => setForm({ ...form, status_id: e.target.value || null })}
          disabled={loadingStatuses || isPending}
        >
          <option value="">(Sin estado)</option>
          {statuses?.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-slate-900 text-white disabled:opacity-50"
      >
        {isPending ? 'Creando…' : 'Crear paciente'}
      </button>

      {msg && <div className="text-green-700 text-sm">{msg}</div>}
      {err && <div className="text-red-700 text-sm">{err}</div>}
    </form>
  );
}