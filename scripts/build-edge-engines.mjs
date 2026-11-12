#!/usr/bin/env node
/**
 * Bundles pure financial engines from apps/web into
 * supabase/functions/_shared/engines/ for Deno Edge Functions.
 */
import * as esbuild from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'supabase/functions/_shared/engines');

const ENGINES = [
  { name: 'cashFlow', entry: 'apps/web/src/components/CashFlowModule/CashFlowLogic.js' },
  { name: 'projections', entry: 'apps/web/src/components/JourneyModule/ProjectionLogic.js' },
  { name: 'protectionGap', entry: 'apps/web/src/components/ProtectionGapModule/ProtectionGapLogic.js' },
  { name: 'incomeTax', entry: 'apps/web/src/components/IncomeTaxModule/IncomeTaxLogic.js' },
  { name: 'netWorth', entry: 'apps/web/src/components/AssetModule/AssetLogic.js' },
  { name: 'goals', entry: 'apps/web/src/components/GoalModule/GoalLogic.js' },
  { name: 'contingency', entry: 'apps/web/src/components/ContingencyModule/ContingencyLogic.js' },
  { name: 'profile', entry: 'apps/web/src/components/ProfileModule/ProfileLogic.js' },
  { name: 'employmentType', entry: 'apps/web/src/components/DetailedFlow/employmentTypeSync.js' },
  { name: 'executiveSummary', entry: 'apps/web/src/components/SummaryReport/ExecutiveSummaryLogic.js' },
  { name: 'safetyNet', entry: 'apps/web/src/components/SummaryReport/SafetyNetLogic.js' },
  { name: 'futureSelf', entry: 'apps/web/src/components/SummaryReport/FutureSelfLogic.js' },
  { name: 'moneyStory', entry: 'apps/web/src/components/SummaryReport/MoneyStoryLogic.js' },
  { name: 'moneyFlow', entry: 'apps/web/src/components/DetailedReport/moneyFlowLedgerLogic.js' },
  { name: 'investSurplus', entry: 'apps/web/src/components/DetailedReport/investSurplusLogic.js' },
  { name: 'lifeJourneyTable', entry: 'apps/web/src/components/DetailedReport/lifeJourneyTableLogic.js' },
  { name: 'yourMoneysMagic', entry: 'apps/web/src/components/DetailedReport/trackSurplusAllocationLogic.js', stubUi: true },
];

mkdirSync(outDir, { recursive: true });

const stubPlugin = {
  name: 'stub-ui',
  setup(build) {
    const reactStub = join(root, 'scripts/edge-react-stub.js');
    const lucideStub = join(root, 'scripts/edge-lucide-stub.js');
    const supabaseStub = join(root, 'scripts/edge-supabase-stub.js');
    const contextStub = join(root, 'scripts/edge-context-stub.js');

    build.onResolve({ filter: /^(react|react-dom|react\/jsx-runtime)$/ }, () => ({
      path: reactStub,
    }));
    build.onResolve({ filter: /^lucide-react$/ }, () => ({ path: lucideStub }));
    build.onResolve({ filter: /^(recharts|framer-motion)$/ }, () => ({ path: reactStub }));
    build.onResolve({ filter: /^@supabase\/.*$/ }, () => ({ path: supabaseStub }));

    build.onResolve({ filter: /(FinancialPlanContext|AuthContext)/ }, () => ({
      path: contextStub,
    }));

    // Calculator JSX can pull browser-only services — stub them out.
    build.onResolve(
      {
        filter:
          /(lib\/supabase|firebase|notificationDelivery|services\/(auth|plan|edge|razorpay|firebase)|web-vitals)/,
      },
      () => ({ path: supabaseStub }),
    );
  },
};

const results = [];
for (const { name, entry, stubUi } of ENGINES) {
  const outfile = join(outDir, `${name}.js`);
  await esbuild.build({
    entryPoints: [join(root, entry)],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile,
    logLevel: 'warning',
    jsx: 'automatic',
    plugins: stubUi ? [stubPlugin] : [],
    // Neutralize Vite-only env access inside any residual modules
    define: stubUi
      ? {
          'import.meta.env': '{}',
          'process.env': '{}',
        }
      : undefined,
    external: stubUi
      ? []
      : ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', 'recharts', 'framer-motion'],
  });
  results.push(name);
}

writeFileSync(
  join(outDir, '.generated'),
  `Generated ${new Date().toISOString()}\n${results.join('\n')}\n`,
);

console.log(`Built ${results.length} edge engines → supabase/functions/_shared/engines/`);
console.log(results.join(', '));
