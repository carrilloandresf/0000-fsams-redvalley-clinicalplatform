import { useState } from 'react';
import { useCreatePatientMutation } from './api';
import type { NewPatientInput } from '../../types';

export default function NewPatientForm() {
  const [form, setForm] = useState<NewPatientInput>({
    full_name: '',
    email: '',
    phone: '',
  });
  const { mutateAsync, isPending } = useCreatePatientMutation();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      await mutateAsync(form);
      setMsg('Paciente creado ✅');
      setForm({ full_name: '', email: '', phone: '' });
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
