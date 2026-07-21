import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'alisha' && password === 'helloalisha') {
      localStorage.setItem('admin_auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-beige-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-beige-900/5"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-beige-300 rounded-full flex items-center justify-center mb-4 text-white">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-serif text-beige-900">Admin Access</h2>
          <p className="text-sm text-beige-900/50 mt-1">Please enter your credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/60 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-beige-300 transition-all"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-beige-900/60 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-beige-50 border border-beige-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-beige-300 transition-all"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-1">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full bg-beige-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-beige-900/90 transition-colors shadow-lg"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
