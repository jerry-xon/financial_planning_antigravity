import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  HeartPulse,
  Shield,
  Car,
  Bike,
  Home,
  User,
  Sparkles,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useFinancialPlan } from '../../lib/PartnerPlanContext';
import { invokeParsePolicy } from '../../lib/partnerApi';
import {
  FREQUENCY_OPTIONS,
  getMemberInsuranceKey,
  migrateLifeEntry,
  applyLifeEntryUpdate,
  getLifeMemberMonthlyTotal,
  syncPolicySlots,
} from '../../../../apps/web/src/components/DetailedFlow/insuranceDetailSync';
import CurrencyInput from '../../../../apps/web/src/components/common/CurrencyInput';
import IntegerInput from '../../../../apps/web/src/components/common/IntegerInput';
import B2BLifePolicyDetailsModal from './B2BLifePolicyDetailsModal';

const formatInr = (val) => {
  if (!val || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const toStored = (v) => (v == null ? '' : String(v));

const CurrencyField = ({ label, value, onChange, placeholder = '0', disabled = false }) => (
  <div>
    {label && (
      <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
        {label}
      </label>
    )}
    <CurrencyInput
      className="conversational-input"
      placeholder={placeholder}
      value={value ?? ''}
      disabled={disabled}
      onValueChange={(v) => onChange(toStored(v))}
    />
  </div>
);

const FrequencySelect = ({ label = 'Frequency', value, onChange }) => (
  <div>
    {label && (
      <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
        {label}
      </label>
    )}
    <select
      className="conversational-input conversational-select"
      value={value || 'Annual'}
      onChange={(e) => onChange(e.target.value)}
    >
      {FREQUENCY_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const UserNote = ({ children }) => (
  <div style={{
    fontWeight: 500,
    fontSize: '0.85rem',
    color: 'var(--primary)',
    marginTop: '0.75rem',
    marginBottom: '1rem',
    background: 'rgba(37, 99, 235, 0.05)',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    borderLeft: '4px solid var(--primary)',
    lineHeight: 1.5,
  }}>
    {children}
  </div>
);

// Helper to calculate Policy End Date based on Start Date and Tenure (Years)
function calculateEndDate(startDateStr, tenureYears) {
  if (!startDateStr) return '';
  const parts = startDateStr.split('-');
  if (parts.length !== 3) return '';
  const [yearStr, monthStr, dayStr] = parts;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  const tenure = parseInt(tenureYears, 10) || 1;
  const targetDate = new Date(year + tenure, month, day);
  targetDate.setDate(targetDate.getDate() - 1);

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const TAB_CONFIG = [
  { id: 'health', label: 'Health Insurance', icon: HeartPulse },
  { id: 'life', label: 'Life Insurance', icon: Shield },
  { id: 'car', label: 'Car Insurance', icon: Car },
  { id: 'bike', label: 'Two-wheeler Insurance', icon: Bike },
  { id: 'others', label: 'Others (Property, etc.)', icon: Home },
];

export default function B2BBreakdownInsurance() {
  const {
    familyMembers,
    expenseCategories,
    setExpenseCategories,
    policies,
    setPolicies,
  } = useFinancialPlan();

  const [activeTab, setActiveTab] = useState('health');
  const [modalTargetMember, setModalTargetMember] = useState(null);
  const [selectedLifeMemberKey, setSelectedLifeMemberKey] = useState(null);

  // AI Extraction State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [aiErrorMsg, setAiErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const insurance = expenseCategories.insurance || {};
  const lifeMap = insurance.life || {};
  const healthData = insurance.health || {};
  const carData = insurance.car || {};
  const bikeData = insurance.bike || {};

  const handleInsuranceFieldChange = useCallback((key, field, value) => {
    setExpenseCategories((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        [key]: {
          ...prev.insurance?.[key],
          [field]: value,
        },
      },
    }));
  }, [setExpenseCategories]);

  // Handle changes when Start Date or Tenure changes to auto-update End Date for Health
  const handleHealthStartDateChange = useCallback((newStartDate) => {
    const tenure = healthData.policyTenure || '1';
    const computedEnd = calculateEndDate(newStartDate, tenure);
    setExpenseCategories((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        health: {
          ...prev.insurance?.health,
          policyStartDate: newStartDate,
          ...(computedEnd ? { policyEndDate: computedEnd } : {}),
        },
      },
    }));
  }, [healthData.policyTenure, setExpenseCategories]);

  const handleHealthTenureChange = useCallback((newTenure) => {
    const startDate = healthData.policyStartDate || '';
    const computedEnd = calculateEndDate(startDate, newTenure);
    setExpenseCategories((prev) => ({
      ...prev,
      insurance: {
        ...prev.insurance,
        health: {
          ...prev.insurance?.health,
          policyTenure: newTenure,
          ...(computedEnd ? { policyEndDate: computedEnd } : {}),
        },
      },
    }));
  }, [healthData.policyStartDate, setExpenseCategories]);

  // Motor Insurance (Car & Bike) specific handlers with auto-calculated GST & Total Premium
  const updateMotorInsurance = useCallback((key, updates) => {
    setExpenseCategories((prev) => {
      const current = prev.insurance?.[key] || {};
      const merged = { ...current, ...updates };

      const od = parseFloat(merged.odPremium) || 0;
      const tp = parseFloat(merged.tpPremium) || 0;
      const gstRate = parseFloat(merged.gstPercent ?? 18) || 0;

      const subtotal = od + tp;
      const gstAmount = Math.round((subtotal * gstRate) / 100);
      const total = subtotal + gstAmount;

      merged.gstAmount = subtotal > 0 ? String(gstAmount) : (merged.gstAmount || '');
      merged.value = subtotal > 0 ? String(total) : (merged.value || '');
      merged.frequency = 'Annual';

      return {
        ...prev,
        insurance: {
          ...prev.insurance,
          [key]: merged,
        },
      };
    });
  }, [setExpenseCategories]);

  const handleMotorStartDateChange = useCallback((key, type, newStartDate) => {
    const current = (key === 'car' ? carData : bikeData) || {};
    const tenure = (type === 'od' ? current.odTenure : current.tpTenure) || '1';
    const computedEnd = calculateEndDate(newStartDate, tenure);
    const updates = type === 'od'
      ? { odStartDate: newStartDate, ...(computedEnd ? { odEndDate: computedEnd } : {}) }
      : { tpStartDate: newStartDate, ...(computedEnd ? { tpEndDate: computedEnd } : {}) };
    updateMotorInsurance(key, updates);
  }, [bikeData, carData, updateMotorInsurance]);

  const handleMotorTenureChange = useCallback((key, type, newTenure) => {
    const current = (key === 'car' ? carData : bikeData) || {};
    const startDate = (type === 'od' ? current.odStartDate : current.tpStartDate) || '';
    const computedEnd = calculateEndDate(startDate, newTenure);
    const updates = type === 'od'
      ? { odTenure: newTenure, ...(computedEnd ? { odEndDate: computedEnd } : {}) }
      : { tpTenure: newTenure, ...(computedEnd ? { tpEndDate: computedEnd } : {}) };
    updateMotorInsurance(key, updates);
  }, [bikeData, carData, updateMotorInsurance]);

  // AI Policy Upload & Extraction Handler
  const handlePolicyFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-uploaded if needed
    e.target.value = '';

    setAiLoading(true);
    setAiErrorMsg('');
    setAiSuccessMsg('');

    try {
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result;
          if (typeof res === 'string') {
            const base64 = res.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to read file as Base64'));
          }
        };
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const category = (activeTab === 'car' || activeTab === 'bike') ? 'motor' : 'health';
      const extracted = await invokeParsePolicy(base64Data, file.type, category);

      if (category === 'motor') {
        const od = extracted.odPremium || '';
        const tp = extracted.tpPremium || '';
        const gstRate = extracted.gstPercent || '18';
        const odTen = extracted.odTenure || '1';
        const tpTen = extracted.tpTenure || '1';

        const odStart = extracted.odStartDate || '';
        const odEnd = extracted.odEndDate || calculateEndDate(odStart, odTen);
        const tpStart = extracted.tpStartDate || '';
        const tpEnd = extracted.tpEndDate || calculateEndDate(tpStart, tpTen);

        updateMotorInsurance(activeTab, {
          odPremium: od,
          tpPremium: tp,
          gstPercent: gstRate,
          insuredName: extracted.insuredName || '',
          makeModel: extracted.makeModel || '',
          registrationCity: extracted.registrationCity || '',
          mfgYear: extracted.mfgYear || '',
          vehicleNo: extracted.vehicleNo || '',
          fuelType: extracted.fuelType || 'Petrol',
          odTenure: odTen,
          tpTenure: tpTen,
          odStartDate: odStart,
          odEndDate: odEnd,
          tpStartDate: tpStart,
          tpEndDate: tpEnd,
          idv: extracted.idv || '',
          insurer: extracted.insurer || '',
          claimsMade: extracted.claimsMade || 'No',
          addons: extracted.addons || '',
        });
        setAiSuccessMsg(`Success! Extracted details from ${file.name} have been auto-filled below.`);
      } else if (category === 'health') {
        const tenure = extracted.policyTenure || '1';
        const startDate = extracted.policyStartDate || '';
        const endDate = extracted.policyEndDate || calculateEndDate(startDate, tenure);

        setExpenseCategories((prev) => ({
          ...prev,
          insurance: {
            ...prev.insurance,
            health: {
              ...prev.insurance?.health,
              value: extracted.premiumAmount || prev.insurance?.health?.value || '',
              frequency: extracted.frequency || prev.insurance?.health?.frequency || 'Annual',
              membersCount: extracted.membersCount || prev.insurance?.health?.membersCount || '',
              planType: extracted.planType || prev.insurance?.health?.planType || 'Family Floater',
              insuredName: extracted.insuredName || prev.insurance?.health?.insuredName || '',
              policyStartDate: startDate,
              policyEndDate: endDate,
              policyTenure: tenure,
              insurer: extracted.insurer || prev.insurance?.health?.insurer || '',
              planName: extracted.planName || prev.insurance?.health?.planName || '',
              sumInsured: extracted.sumInsured || prev.insurance?.health?.sumInsured || '',
              pedDetails: extracted.pedDetails || prev.insurance?.health?.pedDetails || '',
              planDescription: extracted.planDescription || prev.insurance?.health?.planDescription || '',
            },
          },
        }));
        setAiSuccessMsg(`Success! Extracted details from ${file.name} have been auto-filled below.`);
      }
    } catch (err) {
      console.error('AI upload error:', err);
      setAiErrorMsg(err.message || 'Failed to extract policy details with AI');
    } finally {
      setAiLoading(false);
    }
  }, [activeTab, setExpenseCategories, updateMotorInsurance]);

  const updateLifeMember = useCallback((member, updater) => {
    const memberKey = getMemberInsuranceKey(member);
    const memberName = member.name || member.relation;
    setExpenseCategories((prev) => {
      const current = migrateLifeEntry(prev.insurance?.life?.[memberKey]);
      const updatedEntry = typeof updater === 'function'
        ? updater(current)
        : applyLifeEntryUpdate(current, updater);

      setPolicies((p) => syncPolicySlots(
        memberName,
        updatedEntry.policyCount,
        p,
        updatedEntry.premiums,
        false,
      ));

      return {
        ...prev,
        insurance: {
          ...prev.insurance,
          life: {
            ...prev.insurance?.life,
            [memberKey]: updatedEntry,
          },
        },
      };
    });
  }, [setExpenseCategories, setPolicies]);

  // Life-eligible family members (Self, Spouse, Children, etc.)
  const allLifeMembers = useMemo(() => {
    return (familyMembers || []).filter(
      (m) => m.relation === 'Self' || m.relation === 'Spouse' || m.relation === 'Child' || m.relation === 'Parent',
    );
  }, [familyMembers]);

  // Active life member selection fallback to first member
  const activeLifeMember = useMemo(() => {
    if (!allLifeMembers.length) return null;
    if (selectedLifeMemberKey) {
      const found = allLifeMembers.find((m) => getMemberInsuranceKey(m) === selectedLifeMemberKey);
      if (found) return found;
    }
    return allLifeMembers[0];
  }, [allLifeMembers, selectedLifeMemberKey]);

  // Overall family life monthly premium sum
  const totalFamilyLifeMonthly = useMemo(() => {
    return allLifeMembers.reduce((sum, member) => {
      const memberKey = getMemberInsuranceKey(member);
      const entry = migrateLifeEntry(lifeMap[memberKey]);
      return sum + getLifeMemberMonthlyTotal(entry);
    }, 0);
  }, [allLifeMembers, lifeMap]);

  // Component for AI Policy Extraction Banner
  const renderAiUploadBanner = (label = 'Upload Policy (PDF / Image)') => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
        border: '1px solid rgba(15, 118, 110, 0.2)',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Sparkles size={18} style={{ color: 'var(--primary, #0f766e)' }} />
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>
            Auto-fill with AI Document Scanner
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
            Upload your policy PDF or scan photo to automatically extract and populate these fields.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={handlePolicyFileUpload}
        />
        <button
          type="button"
          disabled // always disabled
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.9rem',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--primary, #0f766e)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'not-allowed',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.15s ease',
          }}
        >
          <Upload size={16} />
          <span>{label}</span>
        </button>
        <span className="coming-soon" style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.78rem' }}>
          Coming Soon
        </span>
      </div>

      {aiSuccessMsg && (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.82rem', fontWeight: 600, marginTop: '0.25rem' }}>
          <CheckCircle size={15} />
          <span>{aiSuccessMsg}</span>
        </div>
      )}

      {aiErrorMsg && (
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontSize: '0.82rem', fontWeight: 500, marginTop: '0.25rem' }}>
          <AlertCircle size={15} />
          <span>{aiErrorMsg}</span>
        </div>
      )}
    </div>
  );

  // Health Insurance Form View
  const renderHealthTab = () => {
    const planType = healthData.planType || 'Family Floater';
    const isIndividual = planType === 'Individual';
    const policyTenure = healthData.policyTenure || '1';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {renderAiUploadBanner('Upload Health Policy (PDF/Image)')}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Premium Amount */}
          <CurrencyField
            label="Premium Amount"
            value={healthData.value}
            onChange={(v) => handleInsuranceFieldChange('health', 'value', v)}
            placeholder="0"
          />

          {/* Frequency */}
          <FrequencySelect
            label="Frequency"
            value={healthData.frequency || 'Annual'}
            onChange={(v) => handleInsuranceFieldChange('health', 'frequency', v)}
          />

          {/* Members in policy */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Members in policy
            </label>
            <IntegerInput
              min={1}
              className="conversational-input"
              placeholder="e.g. 4"
              value={healthData.membersCount ?? ''}
              onValueChange={(v) => handleInsuranceFieldChange('health', 'membersCount', v == null ? '' : v)}
            />
          </div>

          {/* Plan Type */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Plan Type
            </label>
            <select
              className="conversational-input conversational-select"
              value={planType}
              onChange={(e) => handleInsuranceFieldChange('health', 'planType', e.target.value)}
            >
              <option value="Family Floater">Family Floater</option>
              <option value="Individual">Individual</option>
            </select>
          </div>

          {/* Policy Tenure (Years) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Policy Tenure (Years)
            </label>
            <select
              className="conversational-input conversational-select"
              value={policyTenure}
              onChange={(e) => handleHealthTenureChange(e.target.value)}
            >
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years</option>
              <option value="5">5 Years</option>
            </select>
          </div>
        </div>

        {/* Insured Name (Conditional on Individual) */}
        {isIndividual && (
          <div style={{ maxWidth: '480px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Insured Name
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="Enter insured member's name"
              value={healthData.insuredName || ''}
              onChange={(e) => handleInsuranceFieldChange('health', 'insuredName', e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Policy Start Date */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Policy starts date
            </label>
            <input
              type="date"
              className="conversational-input"
              value={healthData.policyStartDate || ''}
              onChange={(e) => handleHealthStartDateChange(e.target.value)}
            />
          </div>

          {/* Policy End Date (Auto-calculated, still editable if required) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Policy end date
            </label>
            <input
              type="date"
              className="conversational-input"
              value={healthData.policyEndDate || ''}
              onChange={(e) => handleInsuranceFieldChange('health', 'policyEndDate', e.target.value)}
            />
          </div>

          {/* Insurer Company Name */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Insurer (Company name)
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="e.g. Star Health, HDFC ERGO"
              value={healthData.insurer || ''}
              onChange={(e) => handleInsuranceFieldChange('health', 'insurer', e.target.value)}
            />
          </div>

          {/* Plan Name */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Plan Name
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="e.g. Optima Secure, Comprehensive"
              value={healthData.planName || ''}
              onChange={(e) => handleInsuranceFieldChange('health', 'planName', e.target.value)}
            />
          </div>

          {/* Sum Insured */}
          <CurrencyField
            label="Sum Insured"
            value={healthData.sumInsured}
            onChange={(v) => handleInsuranceFieldChange('health', 'sumInsured', v)}
            placeholder="e.g. 10,00,000"
          />
        </div>

        {/* Short Descriptions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              PED details (Optional)
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="Pre-existing diseases declared if any (e.g. Diabetes, Hypertension)"
              value={healthData.pedDetails || ''}
              onChange={(e) => handleInsuranceFieldChange('health', 'pedDetails', e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Plan Short Description (Optional)
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="Brief notes (e.g. 2x restore benefit, room rent waiver)"
              value={healthData.planDescription || ''}
              onChange={(e) => handleInsuranceFieldChange('health', 'planDescription', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  // Motor Insurance (Car & Bike) Tab Component
  const renderMotorTab = (key, title) => {
    const data = (key === 'car' ? carData : bikeData) || {};
    const odTenure = data.odTenure || '1';
    const tpTenure = data.tpTenure || '1';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#111', margin: 0 }}>
          {title}
        </h3>

        {renderAiUploadBanner(key === 'car' ? 'Upload Car Policy (PDF/Image)' : 'Upload Two-Wheeler Policy (PDF/Image)')}

        {/* Premium Breakdown & Auto-Calculations Section */}
        <div
          style={{
            padding: '1.25rem',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary, #0f766e)', marginBottom: '1rem' }}>
            Premium & Tax Calculations
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* OD Premium */}
            <CurrencyField
              label="OD Premium Amount"
              value={data.odPremium}
              onChange={(v) => updateMotorInsurance(key, { odPremium: v })}
              placeholder="0"
            />

            {/* TP Premium */}
            <CurrencyField
              label="TP Premium Amount"
              value={data.tpPremium}
              onChange={(v) => updateMotorInsurance(key, { tpPremium: v })}
              placeholder="0"
            />

            {/* GST % */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
                GST %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                className="conversational-input"
                placeholder="18"
                value={data.gstPercent ?? '18'}
                onChange={(e) => updateMotorInsurance(key, { gstPercent: e.target.value })}
              />
            </div>

            {/* GST Amount (Auto calculated, editable override allowed) */}
            <CurrencyField
              label="GST Amount (Auto)"
              value={data.gstAmount}
              onChange={(v) => updateMotorInsurance(key, { gstAmount: v })}
              placeholder="0"
            />

            {/* Total Premium (Auto calculated, editable override allowed) */}
            <CurrencyField
              label="Total Premium (Auto)"
              value={data.value}
              onChange={(v) => updateMotorInsurance(key, { value: v })}
              placeholder="0"
            />
          </div>
        </div>

        {/* Vehicle Information */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Insured Name */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Insured Name
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="Name of vehicle owner / policyholder"
              value={data.insuredName || ''}
              onChange={(e) => updateMotorInsurance(key, { insuredName: e.target.value })}
            />
          </div>

          {/* Make & Model */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Make & Model
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder={key === 'car' ? 'e.g. Hyundai Creta SX' : 'e.g. Honda Activa 6G'}
              value={data.makeModel || ''}
              onChange={(e) => updateMotorInsurance(key, { makeModel: e.target.value })}
            />
          </div>

          {/* City of registration */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              City of registration
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="e.g. Mumbai, Delhi, Bengaluru"
              value={data.registrationCity || ''}
              onChange={(e) => updateMotorInsurance(key, { registrationCity: e.target.value })}
            />
          </div>

          {/* Year of Manufacture */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Year of Manufacture
            </label>
            <input
              type="number"
              min="1990"
              max="2035"
              className="conversational-input"
              placeholder="e.g. 2022"
              value={data.mfgYear || ''}
              onChange={(e) => updateMotorInsurance(key, { mfgYear: e.target.value })}
            />
          </div>

          {/* Vehicle No */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Vehicle No
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="e.g. MH 02 AB 1234"
              value={data.vehicleNo || ''}
              onChange={(e) => updateMotorInsurance(key, { vehicleNo: e.target.value })}
            />
          </div>

          {/* Fuel Type */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Fuel Type
            </label>
            <select
              className="conversational-input conversational-select"
              value={data.fuelType || 'Petrol'}
              onChange={(e) => updateMotorInsurance(key, { fuelType: e.target.value })}
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric (EV)">Electric (EV)</option>
              <option value="CNG">CNG</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Policy Dates & Tenures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* OD Premium Tenure */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              OD Premium Tenure
            </label>
            <select
              className="conversational-input conversational-select"
              value={odTenure}
              onChange={(e) => handleMotorTenureChange(key, 'od', e.target.value)}
            >
              <option value="1">1 Year</option>
              <option value="3">3 Years</option>
            </select>
          </div>

          {/* OD starts date */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              OD starts date
            </label>
            <input
              type="date"
              className="conversational-input"
              value={data.odStartDate || ''}
              onChange={(e) => handleMotorStartDateChange(key, 'od', e.target.value)}
            />
          </div>

          {/* OD end date (Auto-calculated) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              OD end date
            </label>
            <input
              type="date"
              className="conversational-input"
              value={data.odEndDate || ''}
              onChange={(e) => updateMotorInsurance(key, { odEndDate: e.target.value })}
            />
          </div>

          {/* TP Premium Tenure */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              TP Premium Tenure
            </label>
            <select
              className="conversational-input conversational-select"
              value={tpTenure}
              onChange={(e) => handleMotorTenureChange(key, 'tp', e.target.value)}
            >
              <option value="1">1 Year</option>
              <option value="3">3 Years</option>
              {key === 'bike' && <option value="5">5 Years</option>}
            </select>
          </div>

          {/* TP starts date */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              TP starts date
            </label>
            <input
              type="date"
              className="conversational-input"
              value={data.tpStartDate || ''}
              onChange={(e) => handleMotorStartDateChange(key, 'tp', e.target.value)}
            />
          </div>

          {/* TP end date (Auto-calculated) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              TP end date
            </label>
            <input
              type="date"
              className="conversational-input"
              value={data.tpEndDate || ''}
              onChange={(e) => updateMotorInsurance(key, { tpEndDate: e.target.value })}
            />
          </div>
        </div>

        {/* Insurer, IDV, Claims, Add-ons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* IDV */}
          <CurrencyField
            label="IDV (Insured Declared Value)"
            value={data.idv}
            onChange={(v) => updateMotorInsurance(key, { idv: v })}
            placeholder="e.g. 7,50,000"
          />

          {/* Insurer (Company name) */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Insurer (Company name)
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="e.g. Tata AIG, ICICI Lombard"
              value={data.insurer || ''}
              onChange={(e) => updateMotorInsurance(key, { insurer: e.target.value })}
            />
          </div>

          {/* Any claims made in this year policy */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Any claims made in this year policy
            </label>
            <select
              className="conversational-input conversational-select"
              value={data.claimsMade || 'No'}
              onChange={(e) => updateMotorInsurance(key, { claimsMade: e.target.value })}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          {/* Add-ons opted */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
              Add-ons opted (Optional)
            </label>
            <input
              type="text"
              className="conversational-input"
              placeholder="e.g. Zero Depreciation, Engine Protect, RSA, Consumables"
              value={data.addons || ''}
              onChange={(e) => updateMotorInsurance(key, { addons: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  };

  // Life Insurance Member Block (Single focused member form)
  const renderLifeMemberBlock = (member) => {
    if (!member) return null;
    const memberKey = getMemberInsuranceKey(member);
    const displayName = member.name || member.relation;
    const entry = migrateLifeEntry(lifeMap[memberKey]);
    const monthlyTotal = getLifeMemberMonthlyTotal(entry);

    return (
      <div
        key={memberKey}
        style={{
          padding: '1.25rem',
          borderRadius: '10px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a' }}>
            {displayName}
            <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '0.4rem' }}>
              ({member.relation})
            </span>
          </div>
          {monthlyTotal > 0 && (
            <div style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600 }}>
              {displayName}: {formatInr(monthlyTotal)} / month
            </div>
          )}
        </div>

        <div style={{ maxWidth: '320px', marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', display: 'block', color: 'var(--text-main)' }}>
            Number of policies
          </label>
          <IntegerInput
            min={0}
            className="conversational-input"
            placeholder="0"
            value={entry.policyCount || ''}
            onValueChange={(v) => {
              if (v == null) {
                updateLifeMember(member, () => applyLifeEntryUpdate(entry, { policyCount: 0 }));
                return;
              }
              const count = Math.max(0, v);
              updateLifeMember(member, () => applyLifeEntryUpdate(entry, { policyCount: count }));
            }}
          />
        </div>

        {entry.premiums.map((row, idx) => (
          <div
            key={`${memberKey}-policy-${idx}`}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Policy {idx + 1}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <CurrencyField
                label="Premium amount"
                value={row.amount}
                onChange={(v) => {
                  const premiums = entry.premiums.map((p, i) =>
                    i === idx ? { ...p, amount: v } : p,
                  );
                  updateLifeMember(member, () => applyLifeEntryUpdate(entry, { premiums }));
                }}
              />
              <FrequencySelect
                value={row.frequency}
                onChange={(v) => {
                  const premiums = entry.premiums.map((p, i) =>
                    i === idx ? { ...p, frequency: v } : p,
                  );
                  updateLifeMember(member, () => applyLifeEntryUpdate(entry, { premiums }));
                }}
              />

              <button
                type="button"
                className="btn btn-secondary"
                style={{
                  height: '48px',
                  borderStyle: 'dashed',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}
                onClick={() => setModalTargetMember(member)}
              >
                Fill policy details (Policy {idx + 1})
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLifeTab = () => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#111', margin: 0 }}>
          Life Insurance Policies
        </h3>
        {totalFamilyLifeMonthly > 0 && (
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--primary, #0f766e)',
              background: 'rgba(15, 118, 110, 0.08)',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
            }}
          >
            Total Family Life Premium: {formatInr(totalFamilyLifeMonthly)} / month
          </div>
        )}
      </div>

      {/* Member Buttons / Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {allLifeMembers.map((member) => {
          const memberKey = getMemberInsuranceKey(member);
          const isSelected = activeLifeMember && getMemberInsuranceKey(activeLifeMember) === memberKey;
          const entry = migrateLifeEntry(lifeMap[memberKey]);
          const policyCount = entry.policyCount || 0;
          const displayName = member.name || member.relation;

          return (
            <button
              key={memberKey}
              type="button"
              onClick={() => setSelectedLifeMemberKey(memberKey)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                border: isSelected ? '1.5px solid var(--primary, #0f766e)' : '1px solid #cbd5e1',
                background: isSelected ? 'rgba(15, 118, 110, 0.08)' : '#ffffff',
                color: isSelected ? 'var(--primary, #0f766e)' : '#334155',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={14} />
              <span>{displayName} ({member.relation})</span>
              {policyCount > 0 && (
                <span
                  style={{
                    marginLeft: '0.2rem',
                    background: isSelected ? 'var(--primary, #0f766e)' : '#64748b',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  {policyCount} {policyCount === 1 ? 'policy' : 'policies'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render the selected member form */}
      {activeLifeMember && renderLifeMemberBlock(activeLifeMember)}
    </div>
  );

  const renderSimpleInsuranceTab = (key, title) => (
    <div style={{ maxWidth: '480px' }}>
      <h3 style={{ fontSize: '1.05rem', color: '#111', marginBottom: '1.25rem', marginTop: 0 }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <CurrencyField
          label="Premium amount"
          value={insurance[key]?.value}
          onChange={(v) => handleInsuranceFieldChange(key, 'value', v)}
        />
        <FrequencySelect
          value={insurance[key]?.frequency}
          onChange={(v) => handleInsuranceFieldChange(key, 'frequency', v)}
        />
      </div>
    </div>
  );

  return (
    <div className="breakdown-insurance-container">
      {/* Insurance Sub-Tabs Bar: Pill / Tab switch in a single clean row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#f1f5f9',
          padding: '0.35rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setAiSuccessMsg('');
                setAiErrorMsg('');
              }}
              style={{
                flex: '1 1 0',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                gap: '0.45rem',
                padding: '0.55rem 0.75rem',
                borderRadius: '7px',
                border: isActive ? '1px solid rgba(15, 118, 110, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? 'var(--primary, #0f766e)' : '#475569',
                boxShadow: isActive ? '0 2px 6px rgba(0, 0, 0, 0.08)' : 'none',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div style={{ minHeight: '320px' }}>
        {activeTab === 'health' && renderHealthTab()}
        {activeTab === 'life' && renderLifeTab()}
        {activeTab === 'car' && renderMotorTab('car', 'Car Insurance')}
        {activeTab === 'bike' && renderMotorTab('bike', 'Two-wheeler Insurance')}
        {activeTab === 'others' && renderSimpleInsuranceTab('others', 'Others (Property, etc.)')}
      </div>

      <UserNote>
        You can upload all your PDFs safely in the Document Vault.
      </UserNote>

      {Boolean(modalTargetMember) && (
        <B2BLifePolicyDetailsModal
          isOpen={Boolean(modalTargetMember)}
          onClose={() => setModalTargetMember(null)}
          targetMember={modalTargetMember}
          policies={policies}
          setPolicies={setPolicies}
        />
      )}
    </div>
  );
}
