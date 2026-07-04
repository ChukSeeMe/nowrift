import React from 'react';

interface GrantStatusBadgeProps {
  status: string;
  deadline?: Date | string | null;
  className?: string;
}

export function GrantStatusBadge({ status, deadline, className = '' }: GrantStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let colorClass = 'text-muted border-border bg-border/20';
  let label = status.replace('_', ' ');

  if (normalizedStatus === 'open' || normalizedStatus === 'closing_soon') {
    if (deadline) {
      const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 14) {
        colorClass = 'text-near-black border-rift-red bg-rift-red';
        label = 'Closing Soon';
      } else if (daysLeft > 0 && daysLeft <= 30) {
        colorClass = 'text-near-black border-sec-amber bg-sec-amber';
        label = 'Closing Soon';
      } else if (daysLeft <= 0) {
        colorClass = 'text-muted border-border/80 bg-near-black/20';
        label = 'Closed';
      } else {
        colorClass = 'text-near-black border-grant-green bg-grant-green';
        label = 'Open';
      }
    } else {
      colorClass = 'text-near-black border-grant-green bg-grant-green';
      label = 'Open';
    }
  } else if (normalizedStatus === 'closed') {
    colorClass = 'text-muted border-border bg-near-black/40';
    label = 'Closed';
  } else if (normalizedStatus === 'awarded') {
    colorClass = 'text-near-black border-dev-blue bg-dev-blue';
    label = 'Awarded';
  } else if (normalizedStatus === 'cancelled') {
    colorClass = 'text-muted/60 border-border/50 bg-near-black/60 line-through';
    label = 'Cancelled';
  } else if (normalizedStatus === 'draft') {
    colorClass = 'text-muted border-dashed border-muted/40 bg-near-black/10';
    label = 'Draft';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-label font-mono font-bold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}

export default GrantStatusBadge;
