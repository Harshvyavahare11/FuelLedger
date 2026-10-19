// src/components/forms/TransactionForm.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getPriceOnDate, FUEL_PRICES } from '../../data/seedData';
import { fmtCurrency, DEMO_TODAY, FUEL_UNITS } from '../../utils/formatters';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

const FUEL_TYPES = ['petrol', 'diesel', 'cng'];
const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Fleet Card'];
const VEHICLE_TYPES = ['Two-Wheeler', 'Three-Wheeler', 'Car', 'SUV', 'Truck', 'Bus', 'Auto'];

const INITIAL = {
  date: DEMO_TODAY,
  fuelType: 'petrol',
  quantity: '',
  paymentMethod: 'Cash',
  customerName: 'Walk-in',
  vehicleNumber: '',
  vehicleType: 'Car',
  notes: '',
};

export default function TransactionForm({ onSuccess, onCancel, prefill = {} }) {
  const { addTransaction, demoToday } = useApp();
  const [form, setForm] = useState({ ...INITIAL, ...prefill });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const unitPrice = getPriceOnDate(form.fuelType, form.date);
  const totalAmount = form.quantity ? +(parseFloat(form.quantity) * unitPrice).toFixed(2) : 0;
  const unit = FUEL_UNITS[form.fuelType];

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.quantity || isNaN(form.quantity) || parseFloat(form.quantity) <= 0)
      e.quantity = 'Enter a valid positive quantity';
    if (parseFloat(form.quantity) > 50000) e.quantity = 'Quantity seems too high';
    if (!form.paymentMethod) e.paymentMethod = 'Select payment method';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    const ts = dayjs(`${form.date}T${dayjs().format('HH:mm:ss')}`).format('YYYY-MM-DDTHH:mm:ss');
    const id = `TXN-${Date.now()}`;

    const txn = {
      id,
      date: form.date,
      timestamp: ts,
      fuelType: form.fuelType,
      quantity: parseFloat(form.quantity),
      unit,
      unitPrice,
      totalAmount,
      paymentMethod: form.paymentMethod,
      customerName: form.customerName || 'Walk-in',
      vehicleType: form.vehicleType,
      vehicleNumber: form.vehicleNumber.toUpperCase(),
      shiftId: `SH-${form.date}-MANUAL`,
      attendantId: 'EMP-001',
      nozzleId: 'NZ-1',
      receiptNo: `RCP-${id}`,
      notes: form.notes,
      demo: true,
      _manualEntry: true,
    };

    setTimeout(() => {
      addTransaction(txn);
      setSaving(false);
      setSaved(true);
      setTimeout(() => { onSuccess?.(txn); }, 1000);
    }, 600);
  }

  const fieldClass = (key) =>
    `w-full px-3 py-2 text-sm border rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors
    ${errors[key] ? 'border-red-300 bg-red-50' : 'border-slate-200'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Demo notice */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Demo Mode: Transactions are stored in browser LocalStorage. Unit price is auto-calculated from historical price ladder and saved with the record.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date <span className="text-red-400">*</span></label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} max={demoToday} className={fieldClass('date')} />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Fuel Type <span className="text-red-400">*</span></label>
          <select value={form.fuelType} onChange={e => set('fuelType', e.target.value)} className={fieldClass('fuelType')}>
            {FUEL_TYPES.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Quantity ({unit}) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            placeholder={`e.g., 10.5`}
            min="0"
            step="0.01"
            className={fieldClass('quantity')}
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
        </div>

        {/* Unit Price (auto) */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price (₹/{unit})</label>
          <div className="w-full px-3 py-2 text-sm border border-slate-100 rounded-lg bg-slate-50 text-slate-700 font-tabular flex items-center justify-between">
            <span>₹{unitPrice.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">AUTO</span>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method <span className="text-red-400">*</span></label>
          <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} className={fieldClass('paymentMethod')}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Type</label>
          <select value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} className={fieldClass('vehicleType')}>
            {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
          </select>
        </div>

        {/* Vehicle Number */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Number</label>
          <input
            type="text"
            value={form.vehicleNumber}
            onChange={e => set('vehicleNumber', e.target.value)}
            placeholder="e.g., MH40AB1234"
            className={fieldClass('vehicleNumber')}
            style={{ textTransform: 'uppercase' }}
          />
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Customer Name</label>
          <input
            type="text"
            value={form.customerName}
            onChange={e => set('customerName', e.target.value)}
            placeholder="Walk-in"
            className={fieldClass('customerName')}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          rows={2}
          placeholder="Optional notes..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-emerald-400 transition-colors resize-none"
        />
      </div>

      {/* Total Amount */}
      <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-slate-300 text-sm">Total Amount</span>
        <span className="text-white text-xl font-bold font-tabular">{fmtCurrency(totalAmount)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <SecondaryButton onClick={onCancel} type="button">Cancel</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving || saved}>
          {saved ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          ) : saving ? 'Saving...' : 'Record Transaction'}
        </PrimaryButton>
      </div>
    </form>
  );
}
