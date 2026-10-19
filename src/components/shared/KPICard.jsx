// src/components/shared/KPICard.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { fmtPercent } from '../../utils/formatters';

export default function KPICard({ title, value, change, isEstimate = false, icon: Icon, iconBg = 'bg-emerald-50', iconColor = 'text-emerald-600', suffix = '', prefix = '', sparkline }) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            {title}
            {isEstimate && (
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 rounded tracking-wide">EST</span>
            )}
          </p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="font-tabular">
        <span className="text-2xl font-bold text-slate-800">
          {prefix}{value}
        </span>
        {suffix && <span className="text-sm text-slate-500 ml-1">{suffix}</span>}
      </div>

      {/* Change indicator */}
      <div className={`flex items-center gap-1 mt-2 text-xs font-semibold
        ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-400'}`}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> :
         isNegative ? <TrendingDown className="w-3.5 h-3.5" /> :
         <Minus className="w-3.5 h-3.5" />}
        <span>{fmtPercent(change)} vs prev period</span>
      </div>

      {/* Mini sparkline */}
      {sparkline && (
        <div className="mt-3 h-8">
          {sparkline}
        </div>
      )}
    </div>
  );
}
