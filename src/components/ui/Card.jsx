// src/components/ui/Card.jsx
export default function Card({ children, className = '', hover = false, padding = true }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${padding ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 bg-slate-50 rounded-lg">
            <Icon className="w-4 h-4 text-slate-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
