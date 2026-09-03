import React, { useEffect, useState } from 'react';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import VendorCard from '../../components/VendorCard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { VendorAPI } from '../../services/api.js';

export default function BrowseVendors() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    VendorAPI.listPublic().then(({ data }) => setVendors(data.vendors)).finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter((v) =>
    v.business_name.toLowerCase().includes(search.toLowerCase()) ||
    v.campus_location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      <section className="section container">
        <h1 style={{ fontSize: '2rem' }}>Campus vendors</h1>
        <p>All vendors listed here have been reviewed and approved by the administrator.</p>
        <div className="field" style={{ maxWidth: 360 }}>
          <input placeholder="Search vendors by name or location…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? <Loader /> : filtered.length === 0 ? (
          <EmptyState title="No vendors found" message="Try a different search term." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
            {filtered.map((v) => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
