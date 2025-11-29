import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

export default function Auth() {
  const navigate = useNavigate();
  const { user, login, register, loading, error, resetError } = useUserStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    resetError();
    setLocalError(null);
  }, [mode, resetError]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setLocalError(err?.message || 'Something went wrong.');
    }
  };

  const showError = localError || error;

  return (
    <div className="mx-auto mt-10 max-w-lg space-y-6 rounded-lg bg-white p-8 shadow-lg">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setMode('login')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === 'login' ? 'bg-rose-600 text-white shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => setMode('register')}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            mode === 'register' ? 'bg-rose-600 text-white shadow' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Register
        </button>
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          {mode === 'login' ? 'Welcome back' : 'Create your Flavorio account'}
        </h2>
        <p className="text-sm text-gray-500">Role defaults to customer for signup.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-rose-500 focus:outline-none"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-rose-500 focus:outline-none"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-rose-500 focus:outline-none"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {showError && <p className="text-sm text-rose-600">{showError}</p>}

        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : mode === 'login' ? (
            'Login'
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
