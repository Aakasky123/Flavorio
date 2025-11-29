import { useParams } from 'react-router-dom';

export default function TrackOrder() {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Track Order</h2>
      <div className="rounded bg-white p-4 shadow">
        <p className="text-sm text-gray-600">Real-time updates via Socket.io and Google Maps overlays.</p>
        <p className="mt-2 font-semibold">Order ID: {id}</p>
        <div className="mt-4 h-64 rounded bg-gray-100" aria-label="map placeholder">
          <p className="p-4 text-gray-500">Map view coming soon</p>
        </div>
      </div>
    </div>
  );
}
