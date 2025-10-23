import { useStatusesQuery } from '../features/statuses/api';

/**
 * A dropdown select component for selecting a status.
 *
 * The component renders a select element with an option for each status
 * returned from the `useStatusesQuery` hook. The selected value is stored in
 * the `value` prop, and the `onChange` prop is called when the user selects
 * a new option. If the `disabled` prop is set to true, the select element
 * will be disabled and the user will not be able to select a new option.
 *
 * @param {string | null} value - The currently selected status ID.
 * @param {(id: string | null) => void} onChange - A callback function that will be
 *   called when the user selects a new option.
 * @param {boolean} disabled - Whether or not the select element should be
 *   disabled.
 * @returns {JSX.Element} A dropdown select component for selecting a status.
 */
export default function StatusSelect({
  value,
  onChange,
  disabled,
}: { value?: string | null; onChange: (id: string | null) => void; disabled?: boolean }) {
  const { data, isLoading } = useStatusesQuery();

  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={value ?? ''}
      disabled={disabled || isLoading}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">(Sin estado)</option>
      {data?.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}
