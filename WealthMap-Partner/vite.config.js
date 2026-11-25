import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partnerSrc = path.resolve(__dirname, 'src');
const partnerPlanContext = path.resolve(partnerSrc, 'lib/PartnerPlanContext.jsx');
const partnerAuthContext = path.resolve(partnerSrc, 'lib/AuthContext.jsx');
const workspaceShim = path.resolve(partnerSrc, 'lib/b2cShims/workspaceShim.jsx');
const projectionShim = path.resolve(partnerSrc, 'lib/b2cShims/projectionLogicShim.js');
const profileShim = path.resolve(partnerSrc, 'lib/b2cShims/profileLogicShim.js');

/** Redirect B2C context/heavy modules to partner shims when bundling partner app. */
function partnerB2cBridge() {
  return {
    name: 'partner-b2c-bridge',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null;
      if (source.includes('FinancialPlanContext')) return partnerPlanContext;
      if (source.includes('FinancialWorkspaceContext')) return workspaceShim;
      if (source.includes('contexts/AuthContext')) return partnerAuthContext;
      if (source.includes('JourneyModule/ProjectionLogic') || source.endsWith('/ProjectionLogic')) {
        return projectionShim;
      }
      if (source.includes('ProfileModule/ProfileLogic') || source.endsWith('/ProfileLogic')) {
        return profileShim;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [partnerB2cBridge(), react()],
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    alias: { '@': partnerSrc },
    dedupe: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'framer-motion', 'recharts'],
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    allowedHosts: true,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'framer-motion', 'recharts'],
  },
});
