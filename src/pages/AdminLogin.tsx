import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Map username to email for Firebase Auth
    const email = username.includes('@') ? username : `${username}@brightnbliss.com`;

    // Priority bypass for the admin account to handle cases where Firebase Auth providers are disabled
    if (username === 'alisha' && password === 'helloalisha') {
      localStorage.setItem('admin_bypass', 'true');
      navigate('/admin/dashboard');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('admin_bypass'); // Clear bypass if real auth works
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error("Login error code:", err.code);
      
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is currently disabled in your Firebase Console. Please use the default credentials to bypass.');
      } else {
        setError('Invalid username or password. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full bg-beige-900 text-white py-3 rounded-lg text-sm font-medium transition-colors shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beige-900/90'}`}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
