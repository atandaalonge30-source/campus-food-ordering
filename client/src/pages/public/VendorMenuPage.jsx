import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import FoodCard from '../../components/FoodCard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { VendorAPI, CategoryAPI, assetUrl } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';

export default function VendorMenuPage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { addItem, conflictMessage } = useCart();

  useEffect(() => {
    setLoading(true);
    VendorAPI.getPublic(id)
      .then(({ data }) => { setVendor(data.vendor); setFoods(data.foods); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    CategoryAPI.listByVendorPublic(id).then(({ data }) => setCategories(data.categories)).catch(() => {});
  }, [id]);

  const visibleFoods = categoryId ? foods.filter((f) => String(f.category_id) === String(categoryId)) : foods;

  if (loading) return <PublicLayout><Loader /></PublicLayout>;
  if (notFound || !vendor) return <PublicLayout><EmptyState title="Vendor not found" message="This vendor may no longer be listed." /></PublicLayout>;

  return (
    <PublicLayout>
      <section className="section container">
        <div className="flex gap-16" style={{ alignItems: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: 18, background: 'var(--color-primary-tint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
          }}>
            {vendor.logo ? (
              <img src={assetUrl(vendor.logo)} alt={vendor.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                {vendor.business_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>{vendor.business_name}</h1>
            <p style={{ margin: 0 }}>{vendor.campus_location}</p>
          </div>
        </div>
        {vendor.description && <p className="mt-16">{vendor.description}</p>}
        {conflictMessage && <div className="alert alert-error mt-16">{conflictMessage}</div>}

        {categories.length > 0 && (
          <div className="flex gap-8 flex-wrap mt-24">
            <button className={`btn btn-sm ${categoryId === '' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategoryId('')}>All</button>
            {categories.map((c) => (
              <button key={c.id} className={`btn btn-sm ${String(categoryId) === String(c.id) ? 'btn-primary' : 'btn-outline'}`} onClick={() => setCategoryId(c.id)}>
                {c.category_name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-24" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 16 }}>
          {visibleFoods.map((f) => <FoodCard key={f.id} food={{ ...f, business_name: vendor.business_name }} onAdd={(food) => addItem(food)} />)}
          {visibleFoods.length === 0 && <EmptyState title="No food items here yet" message="This vendor hasn't added menu items in this category." />}
        </div>
      </section>
    </PublicLayout>
  );
}
