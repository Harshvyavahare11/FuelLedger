// src/components/ui/Badge.jsx
const VARIANTS = {
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  red: 'bg-red-100 text-red-800 ring-red-200',
  blue: 'bg-blue-100 text-blue-800 ring-blue-200',
  violet: 'bg-violet-100 text-violet-800 ring-violet-200',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  demo: 'bg-amber-400 text-white ring-amber-400',
};

export default function Badge({ children, variant = 'slate', size = 'sm', dot = false }) {
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ring-1 ${VARIANTS[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'emerald' ? 'bg-emerald-500' : variant === 'amber' ? 'bg-amber-500' : variant === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />}
      {children}
    </span>
  );
}
