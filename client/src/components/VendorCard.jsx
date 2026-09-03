import React from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../services/api.js';

export default function VendorCard({ vendor }) {
  return (
    <Link to={`/vendors/${vendor.id}`} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
      <div style={{
        width: 58, height: 58, borderRadius: 14, background: 'var(--color-primary-tint)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden'
      }}>
        {vendor.logo ? (
          <img src={assetUrl(vendor.logo)} alt={vendor.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.3rem' }}>
            {vendor.business_name?.charAt(0)}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{vendor.business_name}</h3>
        <p style={{ margin: '2px 0 4px', fontSize: '0.85rem' }}>{vendor.campus_location}</p>
        {vendor.description && <p style={{ margin: 0, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendor.description}</p>}
      </div>
      <span className="btn btn-outline btn-sm">View Menu</span>
    </Link>
  );
}
