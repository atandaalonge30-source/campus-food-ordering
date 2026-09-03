import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import { Loader } from '../../components/Loader.jsx';
import { VendorAPI, assetUrl } from '../../services/api.js';

export default function VendorProfile() {
  const [vendor, setVendor] = useState(null);
  const [form, setForm] = useState({ businessName: '', campusLocation: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    VendorAPI.myProfile().then(({ data }) => {
      setVendor(data.vendor);
      setForm({ businessName: data.vendor.business_name, campusLocation: data.vendor.campus_location, description: data.vendor.description || '' });
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setSaving(true);
    try {
      await VendorAPI.updateMyProfile(form);
      setMsg({ type: 'success', text: 'Business profile updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    const fd = new FormData();
    fd.append('logo', logoFile);
    try {
      const { data } = await VendorAPI.uploadLogo(fd);
      setVendor((v) => ({ ...v, logo: data.logo }));
      setMsg({ type: 'success', text: 'Logo updated.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) return <DashboardLayout title="Business Profile" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications"><Loader /></DashboardLayout>;

  return (
    <DashboardLayout title="Business Profile" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 24 }}>
        <div className="form-card">
          <h3>Business Details</h3>
          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
          <form onSubmit={saveProfile}>
            <div className="field">
              <label>Business Name</label>
              <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div className="field">
              <label>Campus Location</label>
              <input required value={form.campusLocation} onChange={(e) => setForm({ ...form, campusLocation: e.target.value })} />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </form>
        </div>

        <div className="form-card">
          <h3>Business Logo</h3>
          <div style={{ width: 100, height: 100, borderRadius: 16, background: 'var(--color-surface-sunken)', overflow: 'hidden', marginBottom: 16 }}>
            {vendor?.logo && <img src={assetUrl(vendor.logo)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setLogoFile(e.target.files[0])} />
          <button className="btn btn-outline mt-16" onClick={uploadLogo}>Upload Logo</button>
          <p className="mt-16">Approval status: <strong>{vendor?.approval_status}</strong></p>
        </div>
      </div>
    </DashboardLayout>
  );
}
