import {
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  Check,
  LucideIcon,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepItem {
  id: number;
  title: string;
  icon?: LucideIcon;
}

interface WizardStepperProps {
  currentStep: number;
  steps: WizardStepItem[];
  onStepClick: (stepId: number) => void;
  completedSteps: number[];
  highestVisitedStep: number;
}

export function WizardStepper({
  currentStep,
  steps,
  onStepClick,
  completedSteps,
  highestVisitedStep,
}: WizardStepperProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  const activeStep = steps.find(s => s.id === currentStep);
  const progressPercentage = (currentStep / steps.length) * 100;

  // Auto-scroll to active step
  useEffect(() => {
    if (activeStepRef.current && containerRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentStep]);
  return (
    <div className="w-full bg-surface-base border border-white-light rounded-t-lg">

      {/* MOBILE */}
      <div className="md:hidden flex flex-col">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="flex items-center gap-3">
             <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center border border-primary/30">
                {activeStep?.icon ? <activeStep.icon className="h-4 w-4" /> : currentStep}
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Étape {currentStep} / {steps.length}
                </span>
                <span className="font-semibold text-white">
                  {activeStep?.title}
                </span>
             </div>
          </div>
          <ChevronDown className={cn("text-gray-400 transition-transform", isMobileMenuOpen && "rotate-180")} />
        </div>

        <div className="h-1 w-full bg-surface-alt">
           <div
             className="h-full bg-primary transition-all duration-300"
             style={{ width: `${progressPercentage}%` }}
           />
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-white-light/10 bg-surface-alt/50 animate-in slide-in-from-top-2">
            {steps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isClickable = isCompleted;

              return (
                <div
                  key={step.id}
                  onClick={() => {
                    if (isClickable) {
                      onStepClick(step.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 p-4 border-b border-white-light/5 last:border-0",
                    isCurrent ? "bg-primary/10" : "",
                    isClickable ? "cursor-pointer hover:bg-white/5" : "opacity-50 cursor-not-allowed"
                  )}
                >

                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs border",
                    isCompleted ? "bg-green-500/20 text-green-400 border-green-500/30" :
                    isCurrent ? "bg-primary/20 text-primary border-primary/30" :
                    "bg-surface-base text-gray-500 border-white-light/20"
                  )}>
                    {isCompleted ? <Check className="w-3 h-3" /> : (
                      !isClickable ? <Lock className="w-3 h-3" /> : step.id
                    )}
                  </div>

                  <span className={cn(
                    "text-sm",
                    isCurrent ? "font-semibold text-white" :
                    isClickable ? "text-gray-300" : "text-gray-600"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DESKTOP/TABLET */}
      <div
        ref={containerRef}
        className="hidden md:flex items-center justify-between p-4 overflow-x-auto scroll-smooth"
      >
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = step.id <= highestVisitedStep;
          const isLastVisited = step.id === highestVisitedStep
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={cn("flex items-center flex-1", isLast ? "flex-none" : "")}
            >
              <div
                ref={isCurrent ? activeStepRef : null}
                onClick={() => isClickable && onStepClick(step.id)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer group px-2 py-1 rounded-md transition-colors",
                  isCurrent ? "bg-info/5 hover:bg-info/10" :
                    isClickable ? "bg-white-subtle hover:bg-white-subtle/10" : "bg-transparent cursor-not-allowed opacity-30",
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  isCompleted ? "border-success text-success" :
                    isCurrent ? "border-info text-info" :
                    isClickable ? "border-warning text-warning" :
                      "border-muted-foreground text-muted-foreground"
                )}>
                  {isCompleted ?
                    <Check className="w-5 h-5" /> :
                    (step.icon ?
                      <step.icon className="w-4 h-4" /> :
                      <span className="text-xs">{step.id}</span>
                    )
                  }
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-medium whitespace-nowrap",
                    isCompleted ? "text-success" :
                      isCurrent ? "text-info" :
                        isClickable? "text-warning" :
                        "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
              </div>
              {!isLast && (
                <div className={cn(
                  "h-[2px] w-full mx-4 rounded-full flex-1",
                  isCompleted ? "bg-success" :  "bg-muted-foreground",
                  (!isClickable || isLastVisited) && ("opacity-30")
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
