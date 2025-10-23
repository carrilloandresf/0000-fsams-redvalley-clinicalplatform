import { useProvidersQuery } from '../features/providers/api';

export default function ProviderSelect({
  value,
  onChange,
  disabled,
}: { value?: string | null; onChange: (id: string | null) => void; disabled?: boolean }) {
  const { data, isLoading } = useProvidersQuery();

  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={value ?? ''}
      disabled={disabled || isLoading}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">(Sin asignar)</option>
      {data?.map((p) => (
        <option key={p.id} value={p.id}>{p.full_name} — {p.specialty}</option>
      ))}
    </select>
  );
}
