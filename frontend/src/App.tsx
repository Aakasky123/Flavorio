import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import RestaurantPage from './pages/RestaurantPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import TrackOrder from './pages/TrackOrder';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { useUserStore } from './stores/userStore';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken, logout, fetchCurrentUser } = useUserStore();

  useEffect(() => {
    if (accessToken && !user) {
      fetchCurrentUser();
    }
  }, [accessToken, user, fetchCurrentUser]);

  const handleLogout = () => {
    logout();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold text-rose-600">
            Flavorio
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link to="/orders" className="hover:text-rose-600">
              Orders
            </Link>
            <Link to="/cart" className="hover:text-rose-600">
              Cart
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hover:text-rose-600">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <TrackOrder />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
