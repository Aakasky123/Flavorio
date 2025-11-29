const cards = [
  { title: 'Manage Users', description: 'Ban, reinstate, or verify accounts.' },
  { title: 'Manage Restaurants', description: 'Approve vendors and audit menus.' },
  { title: 'Manage Orders', description: 'Monitor disputes and fulfillment.' },
  { title: 'Revenue Dashboard', description: 'Track payouts and Stripe settlements.' },
];

export default function App() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Admin Portal</p>
          <h1 className="text-2xl font-semibold">Flavorio Control Center</h1>
        </div>
        <button className="rounded bg-rose-500 px-4 py-2 text-sm text-white">Payout Sync</button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
