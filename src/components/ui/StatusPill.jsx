// src/components/ui/StatusPill.jsx
import { STATUS_STYLES } from '../../utils/formatters';

export default function StatusPill({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES['Pending'];
  const sizes = { xs: 'px-1.5 py-0.5 text-[10px]', sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs' };
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${style.bg} ${style.text} ${sizes[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}
