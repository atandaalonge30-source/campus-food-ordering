import React from 'react';
import { titleCase } from '../utils/format.js';

export default function StatusBadge({ status }) {
  if (!status) return null;
  return <span className={`badge badge-${status}`}>{titleCase(status)}</span>;
}
