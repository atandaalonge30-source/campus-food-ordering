import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { CategoryAPI } from '../../services/api.js';

export default function VendorCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ categoryName: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    CategoryAPI.listMine().then(({ data }) => setCategories(data.categories)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm({ categoryName: '', description: '' }); setEditingId(null); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await CategoryAPI.update(editingId, form);
      } else {
        await CategoryAPI.create(form);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const onEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ categoryName: cat.category_name, description: cat.description || '' });
  };

  const onDelete = async () => {
    try {
      await CategoryAPI.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardLayout title="Food Categories" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <div className="form-card" style={{ height: 'fit-content' }}>
          <h3>{editingId ? 'Edit Category' : 'New Category'}</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label>Category Name</label>
              <input required value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} placeholder="Rice Dishes" />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-12">
              <button className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Category'}</button>
              {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </div>

        <div>
          {loading ? <Loader /> : categories.length === 0 ? (
            <EmptyState title="No categories yet" message="Add your first category to start organizing your menu." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Category</th><th>Description</th><th></th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>{c.category_name}</td>
                      <td>{c.description || '—'}</td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-outline btn-sm" onClick={() => onEdit(c)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(c)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete category?"
        message={`Are you sure you want to delete "${deleteTarget?.category_name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDelete}
      />
    </DashboardLayout>
  );
}
