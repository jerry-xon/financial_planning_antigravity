/** Stubs so calculator .jsx can be bundled for Edge (compute* only used at runtime). */

export function jsx() {
  return null;
}
export function jsxs() {
  return null;
}
export function jsxDEV() {
  return null;
}
export const Fragment = 'fragment';

export default function Stub() {
  return null;
}
export const createElement = () => null;
export const useEffect = () => {};
export const useMemo = (fn) => (typeof fn === 'function' ? fn() : fn);
export const useCallback = (fn) => fn;
export const useState = (v) => [typeof v === 'function' ? v() : v, () => {}];
export const useRef = (v) => ({ current: v });
export const useContext = () => ({});
export const createContext = () => ({ Provider: Stub, Consumer: Stub });
export const memo = (c) => c;
export const forwardRef = (c) => c;

// lucide-react named icons
const Icon = () => null;
export const TrendingUp = Icon;
export const Wallet = Icon;
export const Calculator = Icon;
export const Clock = Icon;
export const DollarSign = Icon;
export const RefreshCcw = Icon;
export const ArrowRight = Icon;
export const ShieldCheck = Icon;
export const Shield = Icon;
export const PiggyBank = Icon;
export const Landmark = Icon;
export const Home = Icon;
export const Car = Icon;
export const Bike = Icon;
export const GraduationCap = Icon;
export const Percent = Icon;
export const Calendar = Icon;
export const Info = Icon;
export const AlertCircle = Icon;
export const Check = Icon;
export const X = Icon;
export const Plus = Icon;
export const Minus = Icon;
export const ChevronDown = Icon;
export const ChevronUp = Icon;
export const ChevronRight = Icon;
export const ChevronLeft = Icon;
export const Settings = Icon;
export const User = Icon;
export const Users = Icon;
export const Mail = Icon;
export const Lock = Icon;
export const Eye = Icon;
export const EyeOff = Icon;
export const Loader2 = Icon;
export const Sparkles = Icon;
export const Target = Icon;
export const Heart = Icon;
export const BarChart3 = Icon;
export const LineChart = Icon;
export const PieChart = Icon;
