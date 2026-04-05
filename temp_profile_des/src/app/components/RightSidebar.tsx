import { 
  Calculator,
  Home,
  GraduationCap,
  TrendingUp,
  PiggyBank,
  LineChart,
  BarChart3,
  Percent,
  CreditCard,
  Car,
  Bike,
  DollarSign,
  ArrowDownToLine,
  Layers
} from 'lucide-react';
import { cn } from './ui/utils';

interface RightSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const calculators = [
  { 
    id: 1, 
    name: 'Income Tax', 
    icon: Percent, 
    color: 'bg-red-500',
    description: 'Calculate income tax liability'
  },
  { 
    id: 2, 
    name: 'SIP Calculator', 
    icon: TrendingUp, 
    color: 'bg-purple-500',
    description: 'Systematic investment planning'
  },
  { 
    id: 3, 
    name: 'PPF Calculator', 
    icon: LineChart, 
    color: 'bg-indigo-500',
    description: 'Public Provident Fund returns'
  },
  { 
    id: 4, 
    name: 'NPS Calculator', 
    icon: PiggyBank, 
    color: 'bg-green-500',
    description: 'National Pension Scheme returns'
  },
  { 
    id: 5, 
    name: 'Fixed Deposit', 
    icon: BarChart3, 
    color: 'bg-cyan-500',
    description: 'FD maturity calculator'
  },
  { 
    id: 6, 
    name: 'Recurring Deposit', 
    icon: Calculator, 
    color: 'bg-teal-500',
    description: 'RD maturity calculator'
  },
  { 
    id: 7, 
    name: 'Personal Loan', 
    icon: CreditCard, 
    color: 'bg-orange-500',
    description: 'Personal loan EMI calculator'
  },
  { 
    id: 8, 
    name: 'Home Loan', 
    icon: Home, 
    color: 'bg-blue-500',
    description: 'Home loan EMI calculator'
  },
  { 
    id: 9, 
    name: 'Car Loan', 
    icon: Car, 
    color: 'bg-violet-500',
    description: 'Car loan EMI calculator'
  },
  { 
    id: 10, 
    name: 'Two-Wheeler Loan', 
    icon: Bike, 
    color: 'bg-fuchsia-500',
    description: 'Two-wheeler loan EMI'
  },
  { 
    id: 11, 
    name: 'Education Loan', 
    icon: GraduationCap, 
    color: 'bg-amber-500',
    description: 'Education loan EMI calculator'
  },
  { 
    id: 12, 
    name: 'Lumpsum Investment', 
    icon: DollarSign, 
    color: 'bg-emerald-500',
    description: 'One-time investment returns'
  },
  { 
    id: 13, 
    name: 'Equity & ETFs', 
    icon: Layers, 
    color: 'bg-rose-500',
    description: 'Stock market returns calculator'
  },
  { 
    id: 14, 
    name: 'SWP Calculator', 
    icon: ArrowDownToLine, 
    color: 'bg-lime-500',
    description: 'Systematic withdrawal planning'
  },
];

export function RightSidebar({ isOpen, onOpenChange }: RightSidebarProps) {
  return (
    <>
      {/* Drawer */}
      <div 
        className={cn(
          "absolute right-16 top-0 h-full bg-white border-l border-gray-200 shadow-xl transition-all duration-300 z-40 overflow-y-auto",
          isOpen ? "w-80" : "w-0 overflow-hidden"
        )}
        onMouseLeave={() => onOpenChange(false)}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Financial Calculators</h2>
            <p className="text-sm text-gray-500">Quick tools for financial planning</p>
          </div>

          <div className="space-y-3">
            {calculators.map((calc) => {
              const Icon = calc.icon;
              return (
                <div
                  key={calc.id}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all hover:shadow-md bg-white"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                      calc.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        {calc.name}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{calc.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trigger Strip */}
      <div 
        className="w-16 bg-white border-l border-gray-200 flex flex-col items-center py-6 gap-2 hover:bg-gray-50 transition-colors cursor-pointer overflow-y-auto"
        onMouseEnter={() => onOpenChange(true)}
      >
        <div className="flex flex-col items-center gap-2 text-blue-600 mb-2">
          <Calculator className="w-5 h-5" />
          <span className="text-xs font-medium writing-mode-vertical-rl rotate-180">Calculators</span>
        </div>

        <div className="flex flex-col gap-2 items-center">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <div 
                key={calc.id}
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110",
                  calc.color
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
