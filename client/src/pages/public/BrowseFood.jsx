import React, { useEffect, useState } from 'react';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import FoodCard from '../../components/FoodCard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { FoodAPI, VendorAPI } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';

export default function BrowseFood() {
  const [foods, setFoods] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', vendorId: '', onlyAvailable: false });
  const { addItem, conflictMessage } = useCart();

  useEffect(() => {
    VendorAPI.listPublic().then(({ data }) => setVendors(data.vendors)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    FoodAPI.listPublic({
      search: filters.search || undefined,
      vendorId: filters.vendorId || undefined,
      onlyAvailable: filters.onlyAvailable ? 'true' : undefined
    }).then(({ data }) => setFoods(data.foods)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters]);

  const resetFilters = () => setFilters({ search: '', vendorId: '', onlyAvailable: false });

  return (
    <PublicLayout>
      <section className="section container">
        <h1 style={{ fontSize: '2rem' }}>Browse food</h1>
        <p>Search across every approved vendor's menu, or filter by vendor and availability.</p>
        {conflictMessage && <div className="alert alert-error">{conflictMessage}</div>}

        <div className="card mb-0" style={{ marginBottom: 24 }}>
          <div className="flex gap-16 flex-wrap" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 2, minWidth: 200, marginBottom: 0 }}>
              <label>Search</label>
              <input placeholder="Search food by name…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
              <label>Vendor</label>
              <select value={filters.vendorId} onChange={(e) => setFilters({ ...filters, vendorId: e.target.value })}>
                <option value="">All vendors</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.business_name}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label style={{ visibility: 'hidden' }}>Available</label>
              <label className="flex gap-8" style={{ alignItems: 'center', fontWeight: 500 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={filters.onlyAvailable} onChange={(e) => setFilters({ ...filters, onlyAvailable: e.target.checked })} />
                Available only
              </label>
            </div>
            <button className="btn btn-outline" onClick={resetFilters}>Reset Filters</button>
          </div>
        </div>

        {loading ? <Loader /> : foods.length === 0 ? (
          <EmptyState title="No food items match your search" message="Try clearing your filters." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 16 }}>
            {foods.map((f) => <FoodCard key={f.id} food={f} onAdd={(food) => addItem(food)} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
