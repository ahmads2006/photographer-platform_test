'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      router.push('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-card">
      <h1>Create account</h1>
      <p>Build your portfolio and collaborate with other photographers.</p>

      <form onSubmit={submit} className="stack-form">
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          minLength={6}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </section>
  );
}
