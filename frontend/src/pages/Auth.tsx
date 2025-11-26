import { useState } from 'react';
import { useUserStore } from '../stores/userStore';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useUserStore();

  const handleLogin = () => {
    setToken('demo-token');
  };

  return (
    <div className="mx-auto max-w-md space-y-4 rounded bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Login or Register</h2>
      <div className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full rounded bg-rose-500 px-4 py-2 text-white hover:bg-rose-600" onClick={handleLogin}>
          Continue
        </button>
      </div>
    </div>
  );
}
