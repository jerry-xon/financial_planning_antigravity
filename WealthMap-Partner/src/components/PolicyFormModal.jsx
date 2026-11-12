import { useEffect, useState } from 'react';
import { invokePartnerApi } from '../lib/partnerApi';

const empty = {
  category: 'life',
  sub_category: '',
  policy_no: '',
  insurer_name: '',
  plan_name: '',
  insured_name: '',
  policy_start_date: '',
  policy_end_date: '',
  next_premium_due_date: '',
  premium_frequency: 'Annual',
  premium_amount: '',
  total_premium: '',
  status: 'Active',
  nominee_name: '',
  nominee_relation: '',
  sum_assured: '',
  sum_insured: '',
  vehicle_no: '',
  vehicle_model: '',
};

export function PolicyFormModal({ open, onClose, clients, initial, defaultClientId, onSaved }) {
  const [form, setForm] = useState(empty);
  const [clientId, setClientId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        ...empty,
        ...initial,
        premium_amount: initial.premium_amount ?? '',
        total_premium: initial.total_premium ?? '',
        sum_assured: initial.crm_life_policy_details?.sum_assured ?? '',
        sum_insured:
          initial.crm_health_policy_details?.sum_insured ??
          initial.crm_non_motor_policy_details?.sum_insured ??
          '',
        vehicle_no: initial.crm_motor_policy_details?.vehicle_no ?? '',
        vehicle_model: initial.crm_motor_policy_details?.vehicle_model ?? '',
      });
      setClientId(initial.client_id || '');
    } else {
      setForm(empty);
      setClientId(defaultClientId || clients?.[0]?.id || '');
    }
    setError('');
  }, [open, initial, defaultClientId, clients]);

  if (!open) return null;

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const categoryDetails =
        form.category === 'life'
          ? { sum_assured: form.sum_assured || null }
          : form.category === 'health' || form.category === 'non_motor'
            ? { sum_insured: form.sum_insured || null }
            : form.category === 'motor'
              ? { vehicle_no: form.vehicle_no || null, vehicle_model: form.vehicle_model || null }
              : {};

      await invokePartnerApi('crm_upsert_policy', {
        policy_id: initial?.id,
        client_id: clientId,
        category: form.category,
        sub_category: form.sub_category || null,
        policy_no: form.policy_no,
        insurer_name: form.insurer_name,
        plan_name: form.plan_name || null,
        insured_name: form.insured_name || null,
        policy_start_date: form.policy_start_date || null,
        policy_end_date: form.policy_end_date || null,
        next_premium_due_date: form.next_premium_due_date || null,
        premium_frequency: form.premium_frequency || null,
        premium_amount: form.premium_amount,
        total_premium: form.total_premium || form.premium_amount,
        status: form.status,
        nominee_name: form.nominee_name || null,
        nominee_relation: form.nominee_relation || null,
        category_details: categoryDetails,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal-card" onSubmit={submit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{initial ? 'Edit policy' : 'Add policy'}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>

        {error ? <p style={{ color: 'var(--danger)', marginTop: 0 }}>{error}</p> : null}

        <div className="form-grid">
          <div className="field span-2">
            <label className="label">Client</label>
            <select className="input" required value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={Boolean(initial)}>
              <option value="">Select client</option>
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="life">Life</option>
              <option value="health">Health</option>
              <option value="motor">Motor</option>
              <option value="non_motor">Non-motor</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Sub-category</label>
            <input className="input" value={form.sub_category} onChange={(e) => set('sub_category', e.target.value)} placeholder="Term / Floater / Private car" />
          </div>
          <div className="field">
            <label className="label">Policy no</label>
            <input className="input" required value={form.policy_no} onChange={(e) => set('policy_no', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Insurer</label>
            <input className="input" required value={form.insurer_name} onChange={(e) => set('insurer_name', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Plan name</label>
            <input className="input" value={form.plan_name} onChange={(e) => set('plan_name', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Insured name</label>
            <input className="input" value={form.insured_name} onChange={(e) => set('insured_name', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Premium due</label>
            <input className="input" type="date" value={form.next_premium_due_date || ''} onChange={(e) => set('next_premium_due_date', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Frequency</label>
            <select className="input" value={form.premium_frequency} onChange={(e) => set('premium_frequency', e.target.value)}>
              {['Annual', 'Half-yearly', 'Quarterly', 'Monthly', 'Single'].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Premium (₹)</label>
            <input className="input" inputMode="decimal" value={form.premium_amount} onChange={(e) => set('premium_amount', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Total premium (₹)</label>
            <input className="input" inputMode="decimal" value={form.total_premium} onChange={(e) => set('total_premium', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Start</label>
            <input className="input" type="date" value={form.policy_start_date || ''} onChange={(e) => set('policy_start_date', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">End</label>
            <input className="input" type="date" value={form.policy_end_date || ''} onChange={(e) => set('policy_end_date', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {['Active', 'Grace Period', 'Lapsed', 'Matured', 'Surrendered', 'Claimed', 'Cancelled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Nominee</label>
            <input className="input" value={form.nominee_name} onChange={(e) => set('nominee_name', e.target.value)} />
          </div>
          {form.category === 'life' ? (
            <div className="field span-2">
              <label className="label">Sum assured</label>
              <input className="input" inputMode="decimal" value={form.sum_assured} onChange={(e) => set('sum_assured', e.target.value)} />
            </div>
          ) : null}
          {form.category === 'health' || form.category === 'non_motor' ? (
            <div className="field span-2">
              <label className="label">Sum insured</label>
              <input className="input" inputMode="decimal" value={form.sum_insured} onChange={(e) => set('sum_insured', e.target.value)} />
            </div>
          ) : null}
          {form.category === 'motor' ? (
            <>
              <div className="field">
                <label className="label">Vehicle no</label>
                <input className="input" value={form.vehicle_no} onChange={(e) => set('vehicle_no', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Model</label>
                <input className="input" value={form.vehicle_model} onChange={(e) => set('vehicle_model', e.target.value)} />
              </div>
            </>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save policy'}
          </button>
        </div>
      </form>
    </div>
  );
}
