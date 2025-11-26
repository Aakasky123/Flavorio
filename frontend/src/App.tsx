import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import RestaurantPage from './pages/RestaurantPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import Auth from './pages/Auth';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="text-xl font-bold text-rose-600">Flavorio</h1>
          <nav className="flex gap-4 text-sm text-gray-600">
            <a href="/orders" className="hover:text-rose-600">Orders</a>
            <a href="/cart" className="hover:text-rose-600">Cart</a>
            <a href="/auth" className="hover:text-rose-600">Login</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<TrackOrder />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
