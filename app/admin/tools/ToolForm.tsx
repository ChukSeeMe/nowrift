'use client';

import React, { useState } from 'react';
import { createTool, updateTool } from '@/app/admin/actions';

interface ToolFormProps {
  tool?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    url: string;
    icon: string;
    color: string;
    released_at: Date | string;
    is_active: boolean;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = ["AI Models", "AI Agents", "AI Coding", "Cybersecurity", "Startup Stack", "Creative AI", "Free APIs"];

const ICONS = [
  { label: 'Brain / Model', value: 'IconBrain' },
  { label: 'Code / Development', value: 'IconCode' },
  { label: 'CPU / Tech', value: 'IconCpu' },
  { label: 'Terminal / CLI', value: 'IconTerminal2' },
  { label: 'Search / Device', value: 'IconSearch' },
  { label: 'Shield / Security', value: 'IconShieldLock' },
  { label: 'Checkbox / Stack', value: 'IconListCheck' },
  { label: 'Credit Card', value: 'IconCreditCard' },
  { label: 'Palette / Image', value: 'IconPalette' },
  { label: 'Volume / Audio', value: 'IconVolume' },
  { label: 'Source File', value: 'IconSourceCode' },
  { label: 'Binary', value: 'IconBinary' }
];

export function ToolForm({ tool, onSuccess, onCancel }: ToolFormProps) {
  const [name, setName] = useState(tool?.name || '');
  const [slug, setSlug] = useState(tool?.slug || '');
  const [description, setDescription] = useState(tool?.description || '');
  const [category, setCategory] = useState(tool?.category || 'AI Models');
  const [url, setUrl] = useState(tool?.url || '');
  const [icon, setIcon] = useState(tool?.icon || 'IconBrain');
  const [color, setColor] = useState(tool?.color || '#FF3D3D');
  const [isActive, setIsActive] = useState(tool?.is_active !== undefined ? tool?.is_active : true);
  
  // Format Date for date input (YYYY-MM-DD)
  const formatInputDate = (dateVal: any) => {
    if (!dateVal) return '';
    const dateObj = new Date(dateVal);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  };
  const [releasedAt, setReleasedAt] = useState(formatInputDate(tool?.released_at) || new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!tool) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim() || !slug.trim() || !description.trim() || !url.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        slug,
        description,
        category,
        url,
        icon,
        color,
        is_active: isActive,
        released_at: new Date(releasedAt),
      };

      let res;
      if (tool) {
        res = await updateTool(tool.id, payload);
      } else {
        res = await createTool(payload);
      }

      if (res.success) {
        onSuccess();
      } else {
        setError('Operation failed. Please verify fields and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-display-m font-bold text-off-white">
        {tool ? 'Edit Tool / Model' : 'Add New Tool / Model / Agent'}
      </h3>
      
      {error && (
        <div className="p-3 rounded bg-rift-red/10 border border-rift-red/30 text-rift-red text-body-m font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Tool Name *</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white"
            placeholder="e.g. Claude 3.7 Sonnet"
            required
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Slug (URL friendly) *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white font-mono"
            placeholder="e.g. claude-3-7-sonnet"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-label text-muted font-bold">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white resize-none"
          placeholder="Brief description of the tool capabilities and importance..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Website URL *</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white"
            placeholder="https://example.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Icon */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Display Icon</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white"
          >
            {ICONS.map(i => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </div>

        {/* Color Accent */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Color Theme</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-11 w-14 bg-transparent border-0 cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white font-mono"
            />
          </div>
        </div>

        {/* Released At */}
        <div className="flex flex-col gap-1.5">
          <label className="text-label text-muted font-bold">Release Date</label>
          <input
            type="date"
            value={releasedAt}
            onChange={(e) => setReleasedAt(e.target.value)}
            className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg p-2.5 text-body-m text-off-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 rounded border-border bg-[#0d0d14] text-rift-red focus:ring-rift-red"
        />
        <label htmlFor="isActive" className="text-body-m text-off-white select-none cursor-pointer font-bold">
          Active (visible in directory)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-border text-muted hover:text-off-white hover:border-off-white/20 rounded-lg transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-off-white hover:bg-off-white/90 text-near-black rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Saving...' : tool ? 'Save Changes' : 'Create Tool'}
        </button>
      </div>
    </form>
  );
}
