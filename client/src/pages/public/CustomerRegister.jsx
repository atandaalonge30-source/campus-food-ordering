import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import { AuthAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const initial = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function CustomerRegister() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { data } = await AuthAPI.registerCustomer(form);
      login(data.token, data.user, null);
      navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="section container" style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: '2rem' }}>Create your customer account</h1>
        <p>Register to browse menus and order food from any approved campus vendor.</p>
        <div className="form-card mt-24">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Full Name</label>
              <input name="fullName" required value={form.fullName} onChange={onChange} placeholder="Tobi Adebayo" />
            </div>
            <div className="field">
              <label>Email Address</label>
              <input type="email" name="email" required value={form.email} onChange={onChange} placeholder="you@tpi.edu.ng" />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input name="phone" required value={form.phone} onChange={onChange} placeholder="0801 234 5678" />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Password</label>
                <input type="password" name="password" required value={form.password} onChange={onChange} minLength={6} />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={onChange} minLength={6} />
              </div>
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account…' : 'Register'}</button>
          </form>
          <p className="mt-16 text-center">
            Already registered? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
