'use client';

import React, { useState } from 'react';
import { IconBell, IconLoaderQuarter, IconCircleCheck } from '@tabler/icons-react';

export function GrantAlertForm() {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('weekly');
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['ai']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['uk', 'global']);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const sectorsList = [
    { id: 'ai', label: 'AI & ML' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'fintech', label: 'FinTech' },
    { id: 'healthtech', label: 'HealthTech' },
    { id: 'agritech', label: 'AgriTech' },
    { id: 'edtech', label: 'EdTech' },
  ];

  const regionsList = [
    { id: 'uk', label: 'United Kingdom' },
    { id: 'us', label: 'United States' },
    { id: 'eu', label: 'Europe' },
    { id: 'global', label: 'Global' },
    { id: 'africa', label: 'Africa' },
  ];

  const handleSectorChange = (sectorId: string) => {
    setSelectedSectors(prev => 
      prev.includes(sectorId) 
        ? prev.filter(id => id !== sectorId) 
        : [...prev, sectorId]
    );
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegions(prev => 
      prev.includes(regionId) 
        ? prev.filter(id => id !== regionId) 
        : [...prev, regionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/v1/grant-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          sectors: selectedSectors,
          geo_regions: selectedRegions,
          entity_types: ['startup', 'sme'], // Default standard entity types
          alert_frequency: frequency,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Alerts set up successfully!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please check your inputs.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Failed to connect. Please check your network.');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-surface to-surface/90 border border-border/80 rounded-2xl flex flex-col gap-4 shadow-xl">
      <div className="flex items-center gap-2">
        <IconBell className="text-rift-red" size={20} />
        <h3 className="text-display-m text-off-white font-bold tracking-tight">
          Grant Alerts
        </h3>
      </div>
      <p className="text-body-m text-muted leading-relaxed">
        Get instant, daily, or weekly notifications matching your sector and geographic scope.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-3 bg-grant-green/10 border border-grant-green/30 p-4 rounded-xl text-grant-green text-body-m animate-fade-in">
          <IconCircleCheck size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label text-muted font-bold">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={status === 'loading'}
              className="w-full bg-near-black border border-border/80 rounded-xl px-3 py-2.5 text-body-m text-off-white placeholder:text-muted focus:outline-none focus:border-rift-red transition-colors disabled:opacity-50"
            />
          </div>

          {/* Sector preferences */}
          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Sectors</label>
            <div className="grid grid-cols-2 gap-2">
              {sectorsList.map((sec) => (
                <label key={sec.id} className="flex items-center gap-2 text-body-m text-off-white/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedSectors.includes(sec.id)}
                    onChange={() => handleSectorChange(sec.id)}
                    disabled={status === 'loading'}
                    className="w-4 h-4 rounded border-border bg-near-black text-rift-red focus:ring-0 accent-rift-red"
                  />
                  <span>{sec.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Region preferences */}
          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Geography</label>
            <div className="grid grid-cols-2 gap-2">
              {regionsList.map((reg) => (
                <label key={reg.id} className="flex items-center gap-2 text-body-m text-off-white/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(reg.id)}
                    onChange={() => handleRegionChange(reg.id)}
                    disabled={status === 'loading'}
                    className="w-4 h-4 rounded border-border bg-near-black text-rift-red focus:ring-0 accent-rift-red"
                  />
                  <span>{reg.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Frequency preferences */}
          <div className="flex flex-col gap-2">
            <label className="text-label text-muted font-bold">Frequency</label>
            <div className="flex gap-4">
              {['instant', 'daily', 'weekly'].map((freq) => (
                <label key={freq} className="flex items-center gap-2 text-body-m text-off-white/80 cursor-pointer select-none capitalize">
                  <input
                    type="radio"
                    name="alert_frequency"
                    value={freq}
                    checked={frequency === freq}
                    onChange={() => setFrequency(freq as any)}
                    disabled={status === 'loading'}
                    className="w-4 h-4 border-border bg-near-black text-rift-red focus:ring-0 accent-rift-red"
                  />
                  <span>{freq}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading' || !email || selectedSectors.length === 0 || selectedRegions.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-off-white text-near-black hover:bg-off-white/90 disabled:bg-muted/30 disabled:text-muted rounded-xl text-label font-bold tracking-wider uppercase transition-all duration-300 hover:-translate-y-0.5"
          >
            {status === 'loading' ? (
              <IconLoaderQuarter className="animate-spin" size={16} />
            ) : (
              <span>Create Alert</span>
            )}
          </button>

          {status === 'error' && (
            <p className="text-label text-rift-red font-bold mt-1">
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default GrantAlertForm;
