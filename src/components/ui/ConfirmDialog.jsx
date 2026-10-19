// src/components/ui/ConfirmDialog.jsx
import Modal from './Modal';
import { DangerButton, SecondaryButton } from './Buttons';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          {danger
            ? <DangerButton onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</DangerButton>
            : <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">{confirmLabel}</button>
          }
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
