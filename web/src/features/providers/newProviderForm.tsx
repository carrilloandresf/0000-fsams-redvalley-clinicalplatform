import { useState } from 'react';
import { useCreateProviderMutation } from './api';
import type { NewProviderInput } from '../../types';

export default function NewProviderForm() {
  const [form, setForm] = useState<NewProviderInput>({
    full_name: '',
    specialty: '',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { mutateAsync, isPending } = useCreateProviderMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload: NewProviderInput = {
      full_name: form.full_name.trim(),
      specialty: form.specialty.trim(),
    };

    try {
      await mutateAsync(payload);
      setSuccessMsg('Proveedor registrado correctamente ✅');
      setForm({ full_name: '', specialty: '' });
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.error ?? 'No se pudo registrar el proveedor');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="provider-name">
            Nombre completo
          </label>
          <input
            id="provider-name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            value={form.full_name}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            required
            minLength={2}
            placeholder="Ej. Dra. María López"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700" htmlFor="provider-specialty">
            Especialidad
          </label>
          <input
            id="provider-specialty"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/40"
            value={form.specialty}
            onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
            required
            minLength={3}
            placeholder="Ej. Cardiología"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Revisa que la información coincida con la base de profesionales antes de guardar.
        </p>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? 'Guardando…' : 'Registrar proveedor'}
        </button>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMsg}
        </div>
      )}
    </form>
  );
}
