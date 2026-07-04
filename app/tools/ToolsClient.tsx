'use client';

import React, { useState } from 'react';
import {
  IconCode,
  IconCpu,
  IconTerminal2,
  IconBrain,
  IconSearch,
  IconShieldLock,
  IconListCheck,
  IconCreditCard,
  IconPalette,
  IconVolume,
  IconSourceCode,
  IconBinary,
  IconExternalLink,
  IconCopy,
  IconCheck,
  IconStar,
  IconBrandGithub,
  IconDatabase,
  IconPrompt
} from '@tabler/icons-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  icon: string;
  color: string;
  released_at: string;
  pricing?: string;
  type?: string;
  developer?: string;
  prompt_text?: string;
  stars?: number;
  metadata?: any;
}

interface ToolsClientProps {
  initialTools: Tool[];
}

const types = [
  { value: "all", label: "All Resources" },
  { value: "software_tool", label: "Software Tools" },
  { value: "ai_model", label: "AI Models" },
  { value: "github_repo", label: "GitHub Repos" },
  { value: "prompt", label: "Trending Prompts" }
];

const categories = [
  "All",
  "AI Coding",
  "Prompt Engineering",
  "Developer APIs",
  "Model Context Protocol (MCP)",
  "AI Models & ML",
  "Developer Tools",
  "DevOps & Cloud",
  "Cybersecurity",
  "Startup Stack",
  "Design & UI/UX",
  "Growth & Marketing"
];

const pricingFilters = [
  { value: "all", label: "All Pricing" },
  { value: "free_os", label: "Free & Open Source" },
  { value: "paid_freemium", label: "Paid / Freemium" }
];

const iconMap: { [key: string]: React.ComponentType<any> } = {
  IconCode,
  IconCpu,
  IconTerminal2,
  IconBrain,
  IconSearch,
  IconShieldLock,
  IconListCheck,
  IconCreditCard,
  IconPalette,
  IconVolume,
  IconSourceCode,
  IconBinary
};

export default function ToolsClient({ initialTools }: ToolsClientProps) {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPricing, setSelectedPricing] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredTools = initialTools.filter((t) => {
    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    
    let matchesPricing = true;
    if (selectedPricing === "free_os") {
      matchesPricing = t.pricing === "free" || t.pricing === "open_source";
    } else if (selectedPricing === "paid_freemium") {
      matchesPricing = t.pricing === "paid" || t.pricing === "freemium";
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      (t.developer && t.developer.toLowerCase().includes(query));

    return matchesType && matchesCategory && matchesPricing && matchesSearch;
  });

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'open_source':
        return { text: 'Open Source', class: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'free':
        return { text: 'Free', class: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' };
      case 'freemium':
        return { text: 'Freemium', class: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      case 'paid':
        return { text: 'Paid', class: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      default:
        return { text: pricing, class: 'bg-muted/10 text-muted border border-muted/20' };
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Filtering Controls Row */}
      <div className="flex flex-col gap-6 pb-6 border-b border-border/40">
        
        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const isActive = selectedType === type.value;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2.5 rounded-lg text-body-m font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-off-white text-near-black shadow-md font-extrabold'
                    : 'bg-surface text-muted hover:text-off-white hover:bg-surface/80 border border-border/40'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Categories & Pricing Controls Row */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-body-s font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-muted/20 text-off-white border border-muted/40'
                      : 'bg-transparent text-muted hover:text-off-white hover:bg-surface/50 border border-transparent'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Pricing Selector & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto shrink-0">
            
            {/* Pricing Tabs */}
            <div className="flex bg-[#0d0d14] border border-border/60 rounded-lg p-1">
              {pricingFilters.map((filter) => {
                const isActive = selectedPricing === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedPricing(filter.value)}
                    className={`px-3 py-1.5 rounded-md text-body-s font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-surface text-off-white shadow-sm'
                        : 'text-muted hover:text-off-white'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search resources, models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d0d14] border border-border/80 focus:border-muted rounded-lg pl-10 pr-4 py-2 text-body-m text-off-white outline-none"
              />
              <div className="absolute left-3.5 top-3 text-muted">
                <IconSearch size={16} />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 2. Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-20 bg-surface/30 rounded-2xl border border-border/30">
          <p className="text-body-l text-muted">No resources match your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.type === "github_repo" ? IconBrandGithub : tool.type === "prompt" ? IconPrompt : (iconMap[tool.icon || ""] || IconCode);
            const badge = getPricingBadge(tool.pricing || 'free');
            const releaseDate = new Date(tool.released_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={tool.id}
                className="bg-surface border border-border/80 hover:border-muted/50 rounded-xl p-6 flex flex-col justify-between gap-6 hover:shadow-xl hover:-translate-y-0.5 transition-all group duration-300"
              >
                <div className="flex flex-col gap-4">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div 
                      className="w-12 h-12 rounded-xl bg-near-black/50 border border-border flex items-center justify-center group-hover:scale-105 transition-transform"
                      style={{ color: tool.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Pricing Badge */}
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${badge.class}`}>
                        {badge.text}
                      </span>
                      <span className="text-[10px] font-mono text-muted">Updated: {releaseDate}</span>
                    </div>
                  </div>

                  {/* Title & Creator */}
                  <div className="flex flex-col gap-1">
                    <h3 className="text-display-m font-bold text-off-white group-hover:text-off-white/90">
                      {tool.name}
                    </h3>
                    {tool.developer && (
                      <span className="text-body-s font-semibold text-muted">
                        by {tool.developer}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-body-m text-muted leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Type Specific Sections */}
                  {/* GitHub Repo Details */}
                  {tool.type === "github_repo" && (
                    <div className="flex items-center gap-4 text-body-s font-mono text-muted border-t border-border/40 pt-4 mt-2">
                      {tool.stars !== undefined && tool.stars !== null && (
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <IconStar size={14} fill="currentColor" />
                          {tool.stars >= 1000 ? `${(tool.stars / 1000).toFixed(1)}k` : tool.stars}
                        </span>
                      )}
                      {tool.metadata?.language && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" style={{ backgroundColor: tool.color }}></span>
                          {tool.metadata.language}
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI Model Details */}
                  {tool.type === "ai_model" && tool.metadata?.parameters && (
                    <div className="flex items-center gap-4 text-body-s font-mono text-muted border-t border-border/40 pt-4 mt-2">
                      <span className="flex items-center gap-1.5">
                        <IconDatabase size={14} />
                        Parameters: {tool.metadata.parameters}
                      </span>
                      {tool.metadata?.license && (
                        <span>License: {tool.metadata.license}</span>
                      )}
                    </div>
                  )}

                  {/* Prompts Layout */}
                  {tool.type === "prompt" && tool.prompt_text && (
                    <div className="flex flex-col gap-2 border-t border-border/40 pt-4 mt-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">Prompt Template:</span>
                      <div className="bg-near-black/50 border border-border/60 rounded-lg p-3 text-body-s font-mono text-muted break-words line-clamp-3 select-all">
                        {tool.prompt_text}
                      </div>
                    </div>
                  )}

                </div>

                {/* Bottom CTA / Action */}
                {tool.type === "prompt" && tool.prompt_text ? (
                  <button
                    onClick={() => handleCopyPrompt(tool.id, tool.prompt_text || "")}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-body-m font-bold border transition-all cursor-pointer ${
                      copiedId === tool.id
                        ? 'bg-emerald-500 border-emerald-500 text-near-black shadow-md shadow-emerald-500/20'
                        : 'bg-near-black border-border/80 hover:border-off-white/20 text-off-white hover:bg-near-black/70'
                    }`}
                  >
                    {copiedId === tool.id ? (
                      <>
                        <span>Copied Prompt!</span>
                        <IconCheck size={16} />
                      </>
                    ) : (
                      <>
                        <span>Copy Prompt Template</span>
                        <IconCopy size={16} />
                      </>
                    )}
                  </button>
                ) : (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-near-black border border-border/80 hover:border-off-white/20 hover:bg-near-black/70 rounded-lg text-body-m font-bold text-off-white group-hover:bg-rift-red group-hover:text-near-black group-hover:border-rift-red transition-all cursor-pointer"
                  >
                    <span>{tool.type === "github_repo" ? "View Repository" : "Visit Website"}</span>
                    <IconExternalLink size={16} />
                  </a>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
