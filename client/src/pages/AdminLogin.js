import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      return window.toast && window.toast.error('Please fill all fields.');
    }
    setLoading(true);
    try {
      await adminLogin(form.username.trim(), form.password);
      navigate('/admin');
    } catch (err) {
      // error handled by toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👑</div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Login</h1>
        <p className="text-gray-600">Access admin panel to manage the CTF event</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
            autoComplete="off"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded shadow hover:from-red-600 hover:to-red-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" text="Logging in..." /> : 'Login as Admin'}
        </button>
      </form>
      

      
      <p className="mt-4 text-center text-gray-600">
        <a href="/" className="text-primary font-semibold hover:underline">← Back to Home</a>
      </p>
    </div>
  );
}