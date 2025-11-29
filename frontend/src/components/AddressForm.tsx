export interface AddressFormValues {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface AddressFormProps {
  values: AddressFormValues;
  onChange: (field: keyof AddressFormValues, value: string) => void;
  disabled?: boolean;
}

export default function AddressForm({ values, onChange, disabled }: AddressFormProps) {
  return (
    <div className="space-y-3 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">Required</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm text-gray-700">
          <span>Name</span>
          <input
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
            placeholder="John Doe"
            disabled={disabled}
          />
        </label>
        <label className="space-y-1 text-sm text-gray-700">
          <span>Phone</span>
          <input
            value={values.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
            placeholder="(555) 123-4567"
            disabled={disabled}
          />
        </label>
      </div>
      <label className="space-y-1 text-sm text-gray-700">
        <span>Street</span>
        <input
          value={values.street}
          onChange={(e) => onChange('street', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
          placeholder="123 Main St"
          disabled={disabled}
        />
      </label>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-sm text-gray-700">
          <span>City</span>
          <input
            value={values.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
            placeholder="San Francisco"
            disabled={disabled}
          />
        </label>
        <label className="space-y-1 text-sm text-gray-700">
          <span>State</span>
          <input
            value={values.state}
            onChange={(e) => onChange('state', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
            placeholder="CA"
            disabled={disabled}
          />
        </label>
        <label className="space-y-1 text-sm text-gray-700">
          <span>Zip code</span>
          <input
            value={values.zip}
            onChange={(e) => onChange('zip', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none"
            placeholder="94103"
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
}
