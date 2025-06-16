import { useState } from 'react';
import { useAuth } from '../hooks/useAuthContext';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tokyo-night-bg p-4">
      <div className="w-full max-w-md">
        <div className="bg-tokyo-night-bg2 rounded-lg shadow-xl p-8 border border-tokyo-night-comment/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-tokyo-night-blue to-tokyo-night-magenta bg-clip-text text-transparent">
              Hazy English
            </h1>
            <p className="mt-2 text-tokyo-night-comment">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-tokyo-night-red/20 text-tokyo-night-red rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-tokyo-night-fg mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-tokyo-night-bg3 border border-tokyo-night-comment/30 text-tokyo-night-fg focus:outline-none focus:ring-2 focus:ring-tokyo-night-blue focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-tokyo-night-fg mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-tokyo-night-bg3 border border-tokyo-night-comment/30 text-tokyo-night-fg focus:outline-none focus:ring-2 focus:ring-tokyo-night-blue focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tokyo-night-blue hover:bg-tokyo-night-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tokyo-night-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
