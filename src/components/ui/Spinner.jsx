// src/components/ui/Spinner.jsx
export default function Spinner({ size = 'md', color = 'emerald' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  const colors = { emerald: 'border-emerald-500', blue: 'border-blue-500', white: 'border-white' };
  return (
    <div className={`${sizes[size]} border-2 border-t-transparent ${colors[color]} rounded-full animate-spin-slow`} />
  );
}
