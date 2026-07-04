'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  IconPlus,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { ToolForm } from './ToolForm';
import { deleteTool } from '@/app/admin/actions';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string;
  icon: string;
  color: string;
  released_at: string;
  is_active: boolean;
}

interface ToolsListClientProps {
  initialTools: Tool[];
}

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

export function ToolsListClient({ initialTools }: ToolsListClientProps) {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [showForm, setShowForm] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const handleEdit = (tool: Tool) => {
    setActiveTool(tool);
    setShowForm(true);
  };

  const handleCreate = () => {
    setActiveTool(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from the directory?`)) {
      return;
    }
    try {
      const res = await deleteTool(id);
      if (res.success) {
        setTools(prev => prev.filter(t => t.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete tool');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting tool');
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setActiveTool(null);
    router.refresh();
    // In Next.js client component, router.refresh() updates server-side props.
    // To update immediate client state, we trigger a page reload or let Server Actions revalidate the cache.
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Create New Trigger */}
      {!showForm && (
        <div className="flex justify-end">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 text-label font-bold bg-off-white hover:bg-off-white/90 text-near-black rounded-lg transition-colors cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Add Tool Manually</span>
          </button>
        </div>
      )}

      {/* Form Overlay/Inline block */}
      {showForm && (
        <div className="p-6 border border-border rounded-xl bg-surface">
          <ToolForm
            tool={activeTool}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false);
              setActiveTool(null);
            }}
          />
        </div>
      )}

      {/* Tools Table */}
      <div className="border border-border rounded-xl bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          {tools.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-label text-muted bg-[#0d0d14]/40">
                  <th className="p-4 font-bold">Icon</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Release Date</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">URL</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => {
                  const Icon = iconMap[tool.icon] || IconCode;
                  const releaseDate = new Date(tool.released_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={tool.id} className="border-b border-border/40 hover:bg-surface/20 transition-colors">
                      <td className="p-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center border border-border/40 bg-near-black/50"
                          style={{ color: tool.color }}
                        >
                          <Icon size={20} />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-off-white/95">
                        <div className="flex flex-col">
                          <span>{tool.name}</span>
                          <span className="text-[11px] font-normal text-muted line-clamp-1 max-w-sm mt-0.5">{tool.description}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-near-black"
                          style={{ backgroundColor: tool.color }}
                        >
                          {tool.category}
                        </span>
                      </td>
                      <td className="p-4 text-body-m text-muted font-mono">
                        {releaseDate}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          tool.is_active 
                            ? 'text-grant-green border-grant-green/20 bg-grant-green/5' 
                            : 'text-muted border-border/50 bg-[#0d0d14]/40'
                        }`}>
                          {tool.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-dev-blue hover:underline text-body-m inline-flex items-center gap-1 font-mono"
                        >
                          <span>{tool.slug}</span>
                          <IconExternalLink size={12} />
                        </a>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(tool)}
                            className="p-1 text-muted hover:text-off-white hover:bg-surface border border-border rounded transition-all cursor-pointer"
                            title="Edit"
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id, tool.name)}
                            className="p-1 text-rift-red/80 hover:text-rift-red hover:bg-rift-red/5 border border-rift-red/20 rounded transition-all cursor-pointer"
                            title="Delete"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-body-l text-muted">
              No tools or models currently registered in the database. Add one manually!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
