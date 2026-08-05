import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DEFAULT_TAXONOMY_NODES } from '@financesarthi/utils';
import { Search, ChevronDown, Check, Star } from 'lucide-react';
import { TaxonomyType } from '@financesarthi/types';

interface TaxonomySelectorProps {
  type: TaxonomyType;
  selectedSlug: string;
  selectedSubcategory?: string;
  onSelect: (categorySlug: string, subcategory?: string) => void;
  label?: string;
}

export const TaxonomySelector: React.FC<TaxonomySelectorProps> = ({
  type,
  selectedSlug,
  selectedSubcategory,
  onSelect,
  label = 'Category & Subcategory',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter default system nodes of selected type
  const domainNodes = useMemo(() => {
    return DEFAULT_TAXONOMY_NODES.filter(n => n.type === type);
  }, [type]);

  const currentCategory = useMemo(() => {
    return domainNodes.find(n => n.id === selectedSlug || n.slug === selectedSlug);
  }, [domainNodes, selectedSlug]);

  const filteredNodes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return domainNodes;

    return domainNodes.filter(
      n => 
        n.name.toLowerCase().includes(query) ||
        n.subcategories.some(s => s.toLowerCase().includes(query))
    );
  }, [domainNodes, searchQuery]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">{label}</label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full h-11 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-xs text-slate-900 dark:text-white focus:outline-none font-semibold flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {currentCategory ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentCategory.color }} />
              <span className="font-bold">{currentCategory.name}</span>
              {selectedSubcategory && (
                <span className="text-slate-400 font-semibold">• {selectedSubcategory}</span>
              )}
            </>
          ) : (
            <span className="text-slate-400 font-semibold">Select Classification...</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#0B1426] border border-slate-200 dark:border-slate-900 rounded-[20px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[350px]">
          {/* Search Box */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-900 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search taxonomy categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none text-slate-900 dark:text-white font-semibold"
            />
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block">Taxonomy Nodes ({type})</span>
              {filteredNodes.map(n => (
                <div key={n.id} className="space-y-0.5">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <button
                      type="button"
                      onClick={() => onSelect(n.slug, n.subcategories[0])}
                      className="flex-1 flex items-center gap-2.5 text-left text-xs font-extrabold cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }} />
                      <span>{n.name}</span>
                    </button>
                  </div>

                  {/* Subcategories tags */}
                  <div className="pl-6 flex flex-wrap gap-1 pb-1.5">
                    {n.subcategories.map(sub => {
                      const isSelected = selectedSlug === n.slug && selectedSubcategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => onSelect(n.slug, sub)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TaxonomySelector;
