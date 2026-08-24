import {
    computeDeployableSurplusWithCarry,
    buildThreeMonthSurplusOutlook,
    computeOrderedMonthResidual,
    computeAllocationImpactForMonth
} from './apps/web/src/components/DetailedReport/putYourMoneyToWorkLogic.js';

const calendarYear = 2026;
const planStartMonth = 7; // Aug 2026

// User has 13739 unallocated surplus per month.
const unallocatedSurplusByMonth = {};
for (let i=0; i<12; i++) unallocatedSurplusByMonth[i] = 13739;

// User saved Term and Health in Gaps (Aug 2026)
const investmentAllocations = [
    { type: 'Term Insurance', amount: 24000, frequency: 'Monthly', startMonth: 8, startYear: 2026, studioPlanKey: '2026-7' },
    { type: 'Health Insurance', amount: 18000, frequency: 'Monthly', startMonth: 8, startYear: 2026, studioPlanKey: '2026-7' }
];

const selectedMonthIndex = 7; // Aug

console.log('--- AUGUST ---');
const augRes = computeDeployableSurplusWithCarry({
    unallocatedSurplusByMonth,
    investmentAllocations,
    calendarYear,
    planStartMonth,
    selectedMonthIndex
});
console.log('deployableSurplus:', augRes.deployableSurplus);

const outlookAug = buildThreeMonthSurplusOutlook({
    unallocatedSurplusByMonth,
    investmentAllocations,
    calendarYear,
    planStartMonth,
    currentMonth: 7,
    isPymtw: true
});
console.log('outlook deployableSurplus (Aug):', outlookAug[0].deployableSurplus);

console.log('\n--- SEPTEMBER ---');
const sepRes = computeDeployableSurplusWithCarry({
    unallocatedSurplusByMonth,
    investmentAllocations,
    calendarYear,
    planStartMonth,
    selectedMonthIndex: 8
});
console.log('deployableSurplus:', sepRes.deployableSurplus);

const outlookSep = buildThreeMonthSurplusOutlook({
    unallocatedSurplusByMonth,
    investmentAllocations,
    calendarYear,
    planStartMonth,
    currentMonth: 8,
    isPymtw: true
});
console.log('outlook deployableSurplus (Sep):', outlookSep[0].deployableSurplus);
