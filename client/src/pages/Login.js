import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    teamName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.teamName.trim() || !form.password) {
      return window.toast && window.toast.error('Please fill all fields.');
    }
    setLoading(true);
    try {
      await login(form.teamName.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      // error handled by toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Team Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Team Name</label>
          <input
            type="text"
            name="teamName"
            value={form.teamName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Password</label>
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
          className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" text="Logging in..." /> : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Don't have a team?{' '}
        <a href="/register" className="text-primary font-semibold hover:underline">Register here</a>
      </p>
    </div>
  );
}