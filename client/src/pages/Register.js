import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AVATARS = [
  '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐵', '🐧', '🐨', '🦄', '🐲', '🐙', '🦉', '🦋', '🐝', '🐞', '🦕', '🦖'
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    teamName: '',
    password: '',
    confirmPassword: '',
    member1: '',
    member2: '',
    avatar: AVATARS[0]
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.teamName.trim() || !form.password || !form.confirmPassword || !form.member1.trim()) {
      return window.toast && window.toast.error('Please fill all required fields.');
    }
    if (form.password.length < 6) {
      return window.toast && window.toast.error('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirmPassword) {
      return window.toast && window.toast.error('Passwords do not match.');
    }
    setLoading(true);
    try {
      await register(
        form.teamName.trim(),
        form.password,
        [
          { name: form.member1.trim(), avatar: form.avatar },
          ...(form.member2.trim() ? [{ name: form.member2.trim(), avatar: form.avatar }] : [])
        ]
      );
      navigate('/dashboard');
    } catch (err) {
      // error handled by toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-center gradient-text">Team Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Team Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="teamName"
            value={form.teamName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={32}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Confirm Password <span className="text-red-500">*</span></label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Member 1 Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="member1"
            value={form.member1}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={32}
            required
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Member 2 Name <span className="text-gray-400">(optional)</span></label>
          <input
            type="text"
            name="member2"
            value={form.member2}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={32}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Avatar</label>
          <select
            name="avatar"
            value={form.avatar}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {AVATARS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" text="Registering..." /> : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        Already have a team?{' '}
        <a href="/login" className="text-primary font-semibold hover:underline">Login here</a>
      </p>
    </div>
  );
}