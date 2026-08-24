import { computeOrderedMonthResidual } from './src/components/DetailedReport/putYourMoneyToWorkLogic.js';

const allocs = [
    { type: 'Term Insurance', amount: 2000, startYear: 2026, startMonth: 8 },
    { type: 'Health Insurance', amount: 1500, startYear: 2026, startMonth: 8 }
];

const residual = computeOrderedMonthResidual({
    available: 13739,
    investmentAllocations: allocs,
    calendarYear: 2026,
    monthIndex: 7
});

console.log("Residual:", residual);
