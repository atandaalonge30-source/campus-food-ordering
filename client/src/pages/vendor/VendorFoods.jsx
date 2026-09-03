import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { FoodAPI, CategoryAPI, assetUrl } from '../../services/api.js';
import { formatNaira } from '../../utils/format.js';

const emptyForm = { foodName: '', description: '', price: '', categoryId: '', availability: 'available' };

export default function VendorFoods() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([FoodAPI.listMine(), CategoryAPI.listMine()])
      .then(([f, c]) => { setFoods(f.data.foods); setCategories(c.data.categories); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setImageFile(null); setShowForm(true); };
  const openEdit = (food) => {
    setForm({
      foodName: food.food_name, description: food.description || '', price: food.price,
      categoryId: food.category_id || '', availability: food.availability
    });
    setEditingId(food.id);
    setImageFile(null);
    setShowForm(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('foodName', form.foodName);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('categoryId', form.categoryId);
      fd.append('availability', form.availability);
      if (imageFile) fd.append('image', imageFile);

      if (editingId) await FoodAPI.update(editingId, fd);
      else await FoodAPI.create(fd);

      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (food) => {
    await FoodAPI.setAvailability(food.id, food.availability === 'available' ? 'unavailable' : 'available');
    load();
  };

  const onDelete = async () => {
    try {
      await FoodAPI.remove(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardLayout title="Food Menu" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <div className="flex-between">
        <p className="mb-0">Manage the food items customers see on your menu.</p>
        <button className="btn btn-primary" onClick={openNew}>+ Add Food</button>
      </div>

      {error && !showForm && <div className="alert alert-error mt-16">{error}</div>}

      {loading ? <Loader /> : foods.length === 0 ? (
        <EmptyState title="No food items yet" message="Add your first menu item to start selling." />
      ) : (
        <div className="table-wrap mt-16">
          <table>
            <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Availability</th><th></th></tr></thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div style={{ width: 42, height: 42, borderRadius: 8, overflow: 'hidden', background: 'var(--color-surface-sunken)' }}>
                      {f.image && <img src={assetUrl(f.image)} alt={f.food_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                  </td>
                  <td>{f.food_name}</td>
                  <td>{f.category_name || 'N/A'}</td>
                  <td>{formatNaira(f.price)}</td>
                  <td><StatusBadge status={f.availability} /></td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleAvailability(f)}>
                        {f.availability === 'available' ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(f)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,28,21,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', background: 'var(--color-surface)' }}>
            <h3>{editingId ? 'Edit Food Item' : 'Add Food Item'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={onSubmit}>
              <div className="field">
                <label>Food Name</label>
                <input required value={form.foodName} onChange={(e) => setForm({ ...form, foodName: e.target.value })} />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Price (₦)</label>
                  <input type="number" min="1" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="field">
                  <label>Category</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">No category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Food Image (JPG, PNG, WEBP)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files[0])} />
              </div>
              {editingId && (
                <div className="field">
                  <label>Availability</label>
                  <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              )}
              <div className="flex gap-12 mt-16" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Food'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete food item?"
        message={`Are you sure you want to delete "${deleteTarget?.food_name}"?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onDelete}
      />
    </DashboardLayout>
  );
}
