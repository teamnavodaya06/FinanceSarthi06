import React from 'react';
import { useSuggestedPrompts } from '../../hooks/useSuggestedPrompts';
import { 
  TrendingUp, 
  Target, 
  Sliders, 
  DollarSign, 
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

interface SuggestedPromptsViewProps {
  onPromptSelect: (text: string) => void;
}

export const SuggestedPromptsView: React.FC<SuggestedPromptsViewProps> = ({ onPromptSelect }) => {
  const { prompts, todayFocus, loading } = useSuggestedPrompts();

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto py-8">
        <div className="h-6 w-48 bg-slate-900 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-slate-900 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-900 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Get icon by category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Budget': return <Sliders className="h-4.5 w-4.5 text-blue-500" />;
      case 'Expenses': return <DollarSign className="h-4.5 w-4.5 text-sky-500" />;
      case 'Investments': return <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />;
      case 'Goals': return <Target className="h-4.5 w-4.5 text-indigo-500" />;
      default: return <HelpCircle className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-8 select-none">
      
      {/* 1. Greeting Section */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>🌅 Good Morning, Rahul</span>
          <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
        </h2>
        <p className="text-xs font-bold text-slate-500">
          Your personal Sarthi AI has prepared today's financial focal points.
        </p>
      </div>

      {/* 2. Today's Financial Focus Alerts Section */}
      {todayFocus.length > 0 && (
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Today's Financial Focus
          </span>
          <div className="space-y-2.5">
            {todayFocus.map(item => (
              <div
                key={item.id}
                onClick={() => onPromptSelect(item.promptText)}
                className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all hover:bg-slate-900/40 ${
                  item.type === 'WARNING' 
                    ? 'bg-amber-500/5 border-amber-500/25 text-amber-550' 
                    : item.type === 'SUCCESS'
                    ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-550'
                    : 'bg-blue-500/5 border-blue-500/25 text-blue-550'
                }`}
              >
                {item.type === 'WARNING' && <AlertTriangle className="h-4.5 w-4.5 text-amber-500 mt-0.5 shrink-0" />}
                {item.type === 'SUCCESS' && <CheckCircle className="h-4.5 w-4.5 text-emerald-500 mt-0.5 shrink-0" />}
                {item.type === 'INFO' && <Info className="h-4.5 w-4.5 text-blue-500 mt-0.5 shrink-0" />}
                
                <div className="flex-1 space-y-1">
                  <p className="text-[11px] font-black text-white">{item.message}</p>
                  <span className="text-[10px] font-bold text-blue-500 hover:underline block">{item.ctaText} ➔</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Suggested Prompt Cards Grid */}
      <div className="space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
          Personalized Prompt Cards
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {prompts.map(p => (
            <div
              key={p.id}
              onClick={() => onPromptSelect(p.title)}
              className="p-4 rounded-2xl bg-slate-900/30 border border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/60 cursor-pointer transition-all group relative flex flex-col justify-between h-28"
            >
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 text-[8px] font-black text-slate-450 border border-slate-800/80 uppercase">
                    {p.category}
                  </span>
                  {getCategoryIcon(p.category)}
                </div>
                <h4 className="text-[11px] font-black text-white group-hover:text-blue-400 transition-colors pt-1.5 line-clamp-1">
                  {p.title}
                </h4>
                <p className="text-[9px] text-slate-500 font-bold leading-normal line-clamp-2">
                  {p.description}
                </p>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{p.estimatedTime}</span>
                </span>
                {p.priority === 'CRITICAL' && (
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[8px] font-black uppercase">
                    Urgent
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default SuggestedPromptsView;
