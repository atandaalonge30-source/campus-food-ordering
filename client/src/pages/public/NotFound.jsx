import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';

export default function NotFound() {
  return (
    <PublicLayout>
      <section className="section container text-center">
        <h1>404</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </section>
    </PublicLayout>
  );
}
