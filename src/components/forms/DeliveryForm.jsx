// src/components/forms/DeliveryForm.jsx
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { fmtCurrency, DEMO_TODAY } from '../../utils/formatters';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const FUEL_TYPES = ['petrol', 'diesel', 'cng'];
const TANK_IDS = { petrol: 'TANK-P1', diesel: 'TANK-D1', cng: 'TANK-C1' };

const INITIAL = {
  date: DEMO_TODAY,
  fuelType: 'petrol',
  quantityOrdered: '',
  quantityReceived: '',
  supplierName: 'BPCL Depot Nagpur',
  invoiceNumber: '',
  unitCost: '',
  driverName: '',
  truckNumber: '',
  notes: '',
};

export default function DeliveryForm({ onSuccess, onCancel }) {
  const { addDelivery } = useApp();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalCost = form.quantityReceived && form.unitCost
    ? +(parseFloat(form.quantityReceived) * parseFloat(form.unitCost)).toFixed(2)
    : 0;

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Date required';
    if (!form.quantityOrdered || parseFloat(form.quantityOrdered) <= 0) e.quantityOrdered = 'Enter ordered quantity';
    if (!form.quantityReceived || parseFloat(form.quantityReceived) <= 0) e.quantityReceived = 'Enter received quantity';
    if (!form.invoiceNumber.trim()) e.invoiceNumber = 'Invoice number required';
    if (!form.unitCost || parseFloat(form.unitCost) <= 0) e.unitCost = 'Enter unit cost';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    const delivery = {
      id: `DEL-${Date.now()}`,
      date: form.date,
      fuelType: form.fuelType,
      quantityOrdered: parseFloat(form.quantityOrdered),
      quantityReceived: parseFloat(form.quantityReceived),
      unit: form.fuelType === 'cng' ? 'kg' : 'L',
      supplierName: form.supplierName,
      invoiceNumber: form.invoiceNumber,
      unitCost: parseFloat(form.unitCost),
      totalCost,
      tankId: TANK_IDS[form.fuelType],
      driverName: form.driverName,
      truckNumber: form.truckNumber.toUpperCase(),
      receivedBy: 'EMP-001',
      notes: form.notes,
      demo: true,
      _manualEntry: true,
    };

    setTimeout(() => {
      addDelivery(delivery);
      setSaving(false);
      setSaved(true);
      setTimeout(() => { onSuccess?.(delivery); }, 1000);
    }, 600);
  }

  const fieldClass = (key) =>
    `w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors
    ${errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-200'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">Adding a delivery will update the corresponding tank inventory level.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date <span className="text-red-400">*</span></label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={fieldClass('date')} />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fuel Type <span className="text-red-400">*</span></label>
          <select value={form.fuelType} onChange={e => set('fuelType', e.target.value)} className={fieldClass('fuelType')}>
            {FUEL_TYPES.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Qty Ordered <span className="text-red-400">*</span></label>
          <input type="number" value={form.quantityOrdered} onChange={e => set('quantityOrdered', e.target.value)} placeholder="e.g., 10000" min="0" className={fieldClass('quantityOrdered')} />
          {errors.quantityOrdered && <p className="text-xs text-red-500 mt-1">{errors.quantityOrdered}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Qty Received <span className="text-red-400">*</span></label>
          <input type="number" value={form.quantityReceived} onChange={e => set('quantityReceived', e.target.value)} placeholder="e.g., 10000" min="0" className={fieldClass('quantityReceived')} />
          {errors.quantityReceived && <p className="text-xs text-red-500 mt-1">{errors.quantityReceived}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Invoice Number <span className="text-red-400">*</span></label>
          <input type="text" value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} placeholder="INV-BP-2026-XXXXX" className={fieldClass('invoiceNumber')} />
          {errors.invoiceNumber && <p className="text-xs text-red-500 mt-1">{errors.invoiceNumber}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Unit Cost (₹/{form.fuelType === 'cng' ? 'kg' : 'L'}) <span className="text-red-400">*</span></label>
          <input type="number" value={form.unitCost} onChange={e => set('unitCost', e.target.value)} placeholder="e.g., 74.50" min="0" step="0.01" className={fieldClass('unitCost')} />
          {errors.unitCost && <p className="text-xs text-red-500 mt-1">{errors.unitCost}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Supplier</label>
          <input type="text" value={form.supplierName} onChange={e => set('supplierName', e.target.value)} className={fieldClass('supplierName')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Driver Name</label>
          <input type="text" value={form.driverName} onChange={e => set('driverName', e.target.value)} placeholder="Driver name" className={fieldClass('driverName')} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Truck Number</label>
          <input type="text" value={form.truckNumber} onChange={e => set('truckNumber', e.target.value.toUpperCase())} placeholder="MH31BT0000" className={fieldClass('truckNumber')} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any shortage, quality issues, etc." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors resize-none" />
      </div>

      <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-slate-300 text-sm">Total Delivery Cost</span>
        <span className="text-white text-xl font-bold font-tabular">{fmtCurrency(totalCost)}</span>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <SecondaryButton onClick={onCancel} type="button">Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving || saved}>
          {saved ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved!</span> : saving ? 'Saving...' : 'Record Delivery'}
        </PrimaryButton>
      </div>
    </form>
  );
}
