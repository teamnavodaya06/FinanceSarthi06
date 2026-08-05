import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DEFAULT_PARENT_CATEGORIES } from '@financesarthi/utils';
import { Search, ChevronDown, Check, Star } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: string;
  selectedSubcategory?: string;
  onSelect: (categorySlug: string, subcategory?: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  selectedSubcategory,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['cat-food', 'cat-transport', 'cat-shopping']);
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

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Find currently selected category name
  const currentCategory = useMemo(() => {
    return DEFAULT_PARENT_CATEGORIES.find(c => c.id === selectedCategory || c.slug === selectedCategory);
  }, [selectedCategory]);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return DEFAULT_PARENT_CATEGORIES;

    return DEFAULT_PARENT_CATEGORIES.filter(
      c => 
        c.name.toLowerCase().includes(query) ||
        c.subcategories.some(s => s.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Category & Subcategory</label>
      
      {/* Selector Button Trigger */}
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
            <span className="text-slate-400 font-semibold">Select Category...</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
              placeholder="Search category or subcategory..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none text-slate-900 dark:text-white font-semibold"
            />
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {/* Favorites Group (Only when search is empty) */}
            {!searchQuery && (
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block">Favorites</span>
                <div className="grid grid-cols-2 gap-1 px-1">
                  {DEFAULT_PARENT_CATEGORIES.filter(c => favorites.includes(c.id)).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onSelect(c.id, c.subcategories[0])}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-[11px] font-bold transition-all ${
                        selectedCategory === c.id ? 'bg-blue-600/10 text-sky-400 border border-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Categories Group */}
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block">All Categories</span>
              {filteredCategories.map(c => (
                <div key={c.id} className="space-y-0.5">
                  {/* Category Header Row */}
                  <div className="group/item flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <button
                      type="button"
                      onClick={() => onSelect(c.id, c.subcategories[0])}
                      className="flex-1 flex items-center gap-2.5 text-left text-xs font-extrabold cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span>{c.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={e => toggleFavorite(c.id, e)}
                      className="p-1 rounded opacity-0 group-hover/item:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <Star className={`h-3.5 w-3.5 ${favorites.includes(c.id) ? 'fill-yellow-500 text-yellow-500' : 'text-slate-400'}`} />
                    </button>
                  </div>

                  {/* Subcategory List Row */}
                  <div className="pl-6 flex flex-wrap gap-1 pb-1.5">
                    {c.subcategories.map(sub => {
                      const isSelected = selectedCategory === c.id && selectedSubcategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => onSelect(c.id, sub)}
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
export default CategorySelector;
