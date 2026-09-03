import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import { AuthAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await AuthAPI.login(form);
      login(data.token, data.user, data.vendor);
      const redirectTo = location.state?.from
        || (data.user.role === 'admin' ? '/admin/dashboard' : data.user.role === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="section container" style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: '2rem' }}>Welcome back</h1>
        <p>Log in to order food, manage your vendor stall, or administer the platform.</p>
        <div className="form-card mt-24">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input type="email" name="email" required value={form.email} onChange={onChange} placeholder="you@tpi.edu.ng" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" required value={form.password} onChange={onChange} placeholder="••••••••" />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Logging in…' : 'Log In'}</button>
          </form>
          <p className="mt-16" style={{ textAlign: 'center' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
