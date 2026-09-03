import React from 'react';
import { assetUrl } from '../services/api.js';
import { formatNaira } from '../utils/format.js';

export default function FoodCard({ food, onAdd }) {
  const unavailable = food.availability === 'unavailable';
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      <div style={{
        height: 150, background: 'var(--color-surface-sunken)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', position: 'relative'
      }}>
        {food.image ? (
          <img src={assetUrl(food.image)} alt={food.food_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-ink-soft)' }}>
            {food.food_name?.charAt(0)}
          </span>
        )}
        {unavailable && (
          <span style={{
            position: 'absolute', top: 10, right: 10, background: 'var(--color-ink)', color: '#fff',
            fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 999
          }}>
            Currently Unavailable
          </span>
        )}
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div className="flex-between">
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{food.food_name}</h3>
        </div>
        {food.business_name && <p style={{ fontSize: '0.82rem', margin: 0 }}>{food.business_name}{food.category_name ? ` · ${food.category_name}` : ''}</p>}
        {food.description && <p style={{ fontSize: '0.85rem', margin: '4px 0' }}>{food.description}</p>}
        <div className="flex-between mt-8">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>{formatNaira(food.price)}</strong>
          <button className="btn btn-primary btn-sm" disabled={unavailable} onClick={() => onAdd(food)}>
            {unavailable ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
