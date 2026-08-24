const PROTECTION_ALLOCATION_TYPES = [
    'Term Insurance',
    'Health Insurance',
    'Liquid Mutual Fund',
];

function isProtectionAllocationType(type) {
    if (!type) return false;
    const normalized = type === 'RD' ? 'Recurring Deposit' : type;
    return PROTECTION_ALLOCATION_TYPES.includes(normalized)
        || PROTECTION_ALLOCATION_TYPES.includes(type);
}

function allocationMatchesProtectionFilter(alloc, { protectionOnly = false, excludeProtection = false } = {}) {
    const isProtection = isProtectionAllocationType(alloc?.type);
    if (protectionOnly) return isProtection;
    if (excludeProtection) return !isProtection;
    return true;
}

function computeAllocationImpactForMonth(
    investmentAllocations = [],
    calendarYear,
    monthIndex,
    { protectionOnly = false, excludeProtection = false } = {},
) {
    let allocated = 0;
    investmentAllocations.forEach((alloc) => {
        if (!allocationMatchesProtectionFilter(alloc, { protectionOnly, excludeProtection })) {
            return;
        }
        if (alloc.startYear === calendarYear && alloc.startMonth - 1 === monthIndex) {
            allocated += alloc.amount;
        }
    });
    return allocated;
}

const allocs = [
    { type: 'Term Insurance', amount: 2000, startYear: 2026, startMonth: 8 },
    { type: 'Health Insurance', amount: 1500, startYear: 2026, startMonth: 8 }
];

const prot = computeAllocationImpactForMonth(allocs, 2026, 7, { protectionOnly: true });
const other = computeAllocationImpactForMonth(allocs, 2026, 7, { excludeProtection: true });

const available = 13739;
const afterProt = available - prot;
const leftover = Math.max(0, afterProt - other);

console.log({ prot, other, afterProt, leftover });
