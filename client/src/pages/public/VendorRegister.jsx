import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import { AuthAPI } from '../../services/api.js';

const initial = {
  ownerName: '', businessName: '', email: '', phone: '', campusLocation: '', description: '', password: '', confirmPassword: ''
};

export default function VendorRegister() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { data } = await AuthAPI.registerVendor(form);
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <section className="section container" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: '2rem' }}>Register your food business</h1>
        <p>Your account will be reviewed by an administrator before you can start selling.</p>
        <div className="form-card mt-24">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          {!success && (
            <form onSubmit={onSubmit}>
              <div className="field-row">
                <div className="field">
                  <label>Owner Name</label>
                  <input name="ownerName" required value={form.ownerName} onChange={onChange} />
                </div>
                <div className="field">
                  <label>Business Name</label>
                  <input name="businessName" required value={form.businessName} onChange={onChange} placeholder="Campus Bites" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Email Address</label>
                  <input type="email" name="email" required value={form.email} onChange={onChange} />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input name="phone" required value={form.phone} onChange={onChange} />
                </div>
              </div>
              <div className="field">
                <label>Campus Location</label>
                <input name="campusLocation" required value={form.campusLocation} onChange={onChange} placeholder="Student Union Building, TPI" />
              </div>
              <div className="field">
                <label>Business Description</label>
                <textarea name="description" rows={3} value={form.description} onChange={onChange} placeholder="Tell customers what you serve…" />
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
              <button className="btn btn-secondary btn-block" disabled={loading}>{loading ? 'Submitting…' : 'Submit Application'}</button>
            </form>
          )}
          {!success && (
            <p className="mt-16 text-center">
              Already registered? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
            </p>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
