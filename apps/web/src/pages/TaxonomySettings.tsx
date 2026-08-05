import React, { useState, useMemo } from 'react';
import { DEFAULT_TAXONOMY_NODES } from '@financesarthi/utils';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  TrendingUp,
  ShieldAlert,
  Sliders,
  FolderOpen
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { TaxonomyType } from '@financesarthi/types';

export const TaxonomySettings: React.FC = () => {
  const [nodes, setNodes] = useState(DEFAULT_TAXONOMY_NODES);
  const [selectedDomain, setSelectedDomain] = useState<TaxonomyType>('EXPENSE');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Node form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#6366F1');
  const [newIcon, setNewIcon] = useState('Sparkles');
  const [newSubcategories, setNewSubcategories] = useState('');
  const [newBudgetCategory, setNewBudgetCategory] = useState('Wants');

  // Filter list
  const filteredNodes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const domainList = nodes.filter(n => n.type === selectedDomain);
    if (!query) return domainList;
    return domainList.filter(
      n => 
        n.name.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query)
    );
  }, [nodes, selectedDomain, searchQuery]);

  const handleCreateCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const subList = newSubcategories
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newId = `tax-custom-${Date.now()}`;
    const newNode = {
      id: newId,
      name: newName.trim(),
      slug: newName.trim().toLowerCase().replace(/\s+/g, '-'),
      type: selectedDomain,
      description: newDesc.trim() || `Custom user ${selectedDomain.toLowerCase()} category`,
      icon: newIcon,
      color: newColor,
      displayOrder: nodes.length + 1,
      subcategories: subList.length > 0 ? subList : ['Miscellaneous'],
      budgetCategory: selectedDomain === 'EXPENSE' ? newBudgetCategory : undefined,
      isDefault: false,
      isActive: true,
    };

    setNodes(prev => [...prev, newNode]);
    setIsAddOpen(false);

    // Reset Form
    setNewName('');
    setNewDesc('');
    setNewColor('#6366F1');
    setNewIcon('Sparkles');
    setNewSubcategories('');
  };

  const handleDeleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const getDynamicIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.HelpCircle;
  };

  const domains: { id: TaxonomyType; label: string }[] = [
    { id: 'EXPENSE', label: 'Expenses' },
    { id: 'INCOME', label: 'Income' },
    { id: 'INVESTMENT', label: 'Investments' },
    { id: 'GOAL', label: 'Goals' },
    { id: 'ASSET', label: 'Assets' },
    { id: 'LIABILITY', label: 'Liabilities' },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Financial Taxonomy Settings</h2>
          <p className="text-[11px] text-slate-500 font-bold block mt-1">Configure hierarchical classification taxonomy and AI/Analytics rules across all financial domains.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/10 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Custom Category</span>
        </button>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {domains.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDomain(d.id)}
            className={`h-9 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedDomain === d.id
                ? 'bg-blue-600/10 text-sky-400 border border-blue-500/10 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 flex items-center gap-2 max-w-md">
        <Search className="h-4.5 w-4.5 text-slate-400" />
        <input
          type="text"
          placeholder={`Filter ${selectedDomain.toLowerCase()} categories...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none text-xs outline-none font-semibold text-slate-900 dark:text-white"
        />
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNodes.map(n => {
          const Icon = getDynamicIcon(n.icon);
          return (
            <div 
              key={n.id} 
              className="p-5 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-350"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: `${n.color}20`, border: `1px solid ${n.color}30` }}>
                    <Icon className="h-5 w-5" style={{ color: n.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{n.name}</h4>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5 block">{n.subcategories.length} subcategories</span>
                  </div>
                </div>
                {!n.isDefault && (
                  <button
                    onClick={() => handleDeleteNode(n.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-2 h-7">{n.description || 'System standard taxonomy node'}</p>

              {/* Subcategories tags */}
              <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                {n.subcategories.slice(0, 4).map(sub => (
                  <span key={sub} className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-[9px] font-extrabold text-slate-500 dark:text-slate-400">
                    {sub}
                  </span>
                ))}
                {n.subcategories.length > 4 && (
                  <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-[9px] font-extrabold text-slate-400">
                    +{n.subcategories.length - 4} more
                  </span>
                )}
              </div>

              {/* Budget Category Info */}
              {n.budgetCategory && (
                <div className="pt-3 border-t border-slate-105 dark:border-slate-850 flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="uppercase tracking-wide">Budget Class</span>
                  <span className="text-sky-400 uppercase">{n.budgetCategory}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Taxonomy Node Dialog Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-[#020617]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-900 rounded-[28px] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-500" />
              <span>Create Custom Category ({selectedDomain})</span>
            </h3>

            <form onSubmit={handleCreateCustomNode} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Health Perks, Side Gig"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Description</label>
                <input
                  type="text"
                  placeholder="Details and specifications..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Lucide Icon</label>
                  <select
                    value={newIcon}
                    onChange={e => setNewIcon(e.target.value)}
                    className="w-full h-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 outline-none font-bold animate-none"
                  >
                    <option value="Sparkles">Sparkles</option>
                    <option value="Gift">Gift</option>
                    <option value="HeartPulse">HeartPulse</option>
                    <option value="Activity">Activity</option>
                    <option value="Tv">TV / Screen</option>
                    <option value="Car">Car</option>
                    <option value="GraduationCap">Academy Cap</option>
                    <option value="TrendingUp">Trending Up</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Theme Color</label>
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none p-1 cursor-pointer"
                  />
                </div>
              </div>

              {selectedDomain === 'EXPENSE' && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase">Budget Category</label>
                  <select
                    value={newBudgetCategory}
                    onChange={e => setNewBudgetCategory(e.target.value)}
                    className="w-full h-10 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-2 outline-none font-bold"
                  >
                    <option value="Needs">Needs</option>
                    <option value="Wants">Wants</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase">Subcategories (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Perks, Swag, Allowance"
                  value={newSubcategories}
                  onChange={e => setNewSubcategories(e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-900">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TaxonomySettings;
