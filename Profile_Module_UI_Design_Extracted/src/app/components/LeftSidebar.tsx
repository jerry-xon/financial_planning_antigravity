import { 
  Users, 
  TrendingUp, 
  PiggyBank, 
  FileText, 
  Target, 
  Home,
  Briefcase,
  Shield,
  AlertTriangle,
  LifeBuoy,
  Map,
  LayoutGrid,
  Sparkles,
  MapPin,
  Eye
} from 'lucide-react';
import { cn } from './ui/utils';

interface LeftSidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const processSteps = [
  { id: 1, name: 'Profile Module', icon: Users, status: 'active', description: 'Personal & family details', color: 'text-blue-600' },
  { id: 2, name: 'Cash Flow Module', icon: TrendingUp, status: 'pending', description: 'Income & expenses', color: 'text-green-600' },
  { id: 3, name: 'Asset Module', icon: Home, status: 'pending', description: 'Property & investments', color: 'text-purple-600' },
  { id: 4, name: 'Goal Module', icon: Target, status: 'pending', description: 'Financial objectives', color: 'text-orange-600' },
  { id: 5, name: 'Insurance Module', icon: Shield, status: 'pending', description: 'Insurance coverage', color: 'text-cyan-600' },
  { id: 6, name: 'Protection Gap Analysis', icon: AlertTriangle, status: 'pending', description: 'Coverage analysis', color: 'text-red-600' },
  { id: 7, name: 'Contingency Planning', icon: LifeBuoy, status: 'pending', description: 'Emergency planning', color: 'text-pink-600' },
  { id: 8, name: 'Journey Module', icon: Map, status: 'pending', description: 'Financial roadmap', color: 'text-indigo-600' },
  { id: 9, name: 'Allocation Module', icon: LayoutGrid, status: 'pending', description: 'Asset allocation', color: 'text-teal-600' },
  { id: 10, name: 'Growth Module', icon: Sparkles, status: 'pending', description: 'Growth planning', color: 'text-yellow-600' },
  { id: 11, name: 'Road Map Module', icon: MapPin, status: 'pending', description: 'Implementation plan', color: 'text-lime-600' },
  { id: 12, name: 'Overview Module', icon: Eye, status: 'pending', description: 'Complete summary', color: 'text-slate-600' },
];

export function LeftSidebar({ isOpen, onOpenChange }: LeftSidebarProps) {
  return (
    <>
      {/* Trigger Strip */}
      <div 
        className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-3 hover:bg-gray-50 transition-colors cursor-pointer overflow-y-auto"
        onMouseEnter={() => onOpenChange(true)}
      >
        <div className="flex flex-col items-center gap-2 text-blue-600 mb-2">
          <FileText className="w-5 h-5" />
          <span className="text-xs font-medium writing-mode-vertical-rl rotate-180">Process</span>
        </div>
        
        {processSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.id}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110",
                step.status === 'active' 
                  ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      <div 
        className={cn(
          "absolute left-16 top-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-40 overflow-y-auto",
          isOpen ? "w-80" : "w-0 overflow-hidden"
        )}
        onMouseLeave={() => onOpenChange(false)}
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Financial Process</h2>
            <p className="text-sm text-gray-500">Complete each step to build your plan</p>
          </div>

          <div className="space-y-3">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                    step.status === 'active' 
                      ? "bg-blue-50 border-blue-500" 
                      : "bg-white border-gray-200 hover:border-blue-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      step.status === 'active' ? "bg-blue-600 text-white" : "bg-gray-100",
                      step.status !== 'active' && step.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold text-sm mb-1",
                        step.status === 'active' ? "text-blue-900" : "text-gray-900"
                      )}>
                        {step.name}
                      </h3>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
