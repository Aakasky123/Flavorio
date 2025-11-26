export default function App() {
  const stats = [
    { label: 'Active Orders', value: 12 },
    { label: 'Revenue (today)', value: '$1,240' },
    { label: 'Menu Items', value: 48 },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Vendor Dashboard</p>
          <h1 className="text-2xl font-semibold">Flavorio</h1>
        </div>
        <button className="rounded bg-rose-500 px-4 py-2 text-sm text-white">Live Orders</button>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Menu Management</h2>
          <p className="text-sm text-gray-600">Create, edit, and toggle availability with Prisma-backed APIs.</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Order Analytics</h2>
          <p className="text-sm text-gray-600">Monitor throughput and fulfillment times with real-time updates.</p>
        </div>
      </div>
    </div>
  );
}
