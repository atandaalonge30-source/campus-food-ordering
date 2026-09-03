import React, { useState } from 'react';
import { AuthAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfileBody() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.full_name || '', phone: user?.phone || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSavingProfile(true);
    try {
      const { data } = await AuthAPI.updateProfile(form);
      updateUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setSavingPw(true);
    try {
      await AuthAPI.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 24 }}>
      <div className="form-card">
        <h3>Profile Information</h3>
        {profileMsg.text && <div className={`alert alert-${profileMsg.type}`}>{profileMsg.text}</div>}
        <form onSubmit={saveProfile}>
          <div className="field">
            <label>Full Name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <button className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="form-card">
        <h3>Change Password</h3>
        {pwMsg.text && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}
        <form onSubmit={savePassword}>
          <div className="field">
            <label>Current Password</label>
            <input type="password" value={pwForm.oldPassword} onChange={(e) => setPwForm({ ...pwForm, oldPassword: e.target.value })} required />
          </div>
          <div className="field">
            <label>New Password</label>
            <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} minLength={6} required />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <input type="password" value={pwForm.confirmNewPassword} onChange={(e) => setPwForm({ ...pwForm, confirmNewPassword: e.target.value })} minLength={6} required />
          </div>
          <button className="btn btn-secondary" disabled={savingPw}>{savingPw ? 'Updating…' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  );
}
