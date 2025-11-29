import { Link } from 'react-router-dom';

const mockOrders = [
  { id: 'ord1', status: 'PREPARING', total: 28.5 },
  { id: 'ord2', status: 'ON_THE_WAY', total: 16.0 },
];

export default function Orders() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Orders</h2>
      <div className="space-y-3">
        {mockOrders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between rounded border bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold">Order {order.id}</p>
              <p className="text-sm text-gray-600">Status: {order.status}</p>
            </div>
            <p className="font-semibold">${order.total.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
