const availableOrders = [
  { id: 'ord21', pickup: 'Sushi Place', dropoff: '123 Main St', payout: '$8.50' },
  { id: 'ord22', pickup: 'Burger Joint', dropoff: '45 Elm St', payout: '$6.20' },
];

export default function App() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Driver Console</h1>
        <p className="text-sm text-gray-600">Accept deliveries, navigate routes, and share live status.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Available Orders</h2>
          <div className="mt-3 space-y-3">
            {availableOrders.map((order) => (
              <div key={order.id} className="rounded border p-3">
                <p className="text-sm text-gray-600">Pickup: {order.pickup}</p>
                <p className="text-sm text-gray-600">Dropoff: {order.dropoff}</p>
                <p className="font-semibold">Payout: {order.payout}</p>
                <button className="mt-2 rounded bg-rose-500 px-3 py-1 text-sm text-white">Accept</button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Live Tracking</h2>
          <div className="mt-3 h-64 rounded bg-gray-100 p-4 text-gray-500">Google Maps container</div>
        </div>
      </div>
    </div>
  );
}
