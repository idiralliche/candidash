import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WizardStepId } from "@/pages/wizards/application-wizard-page.tsx";

interface WizardNavbarProps {
  currentStep: WizardStepId;
  onNext?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
  showNextButton: boolean;
}

export function WizardNavbar ({
  currentStep,
  onNext,
  onBack,
  onFinish,
  showNextButton=false,
} : WizardNavbarProps) {
  return (
    <div className="w-full flex items-center justify-between">
      <div>
        {(currentStep > 1 && currentStep < 8) && (
          <Button
            variant="ghost"
            onClick={onBack}
            palette={"gray"}
            className="hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
        )}
      </div>

      {currentStep < 8 ? (
        <>
        <div>
          {showNextButton ? (
            <Button
              variant={currentStep === 1 ? "solid" : "ghost"}
              palette="primary"
              onClick={onNext}
              className={currentStep !== 1 ? "hover:bg-transparent hover:text-primary-hover" : ""}
            >
              {currentStep === 1 ? "Continuer" : "Suivant"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            currentStep !== 1 && (
              <Button
                variant="ghost"
                onClick={onNext}
                className="text-gray-400 hover:text-white"
              >
                Passer cette étape
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          )}
        </div>
        </>
      ) : (
        <div>
          <Button
            variant="solid"
            palette="primary"
            size="lg"
            onClick={onFinish}
            className="px-8"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Confirmer et Terminer
          </Button>
        </div>
      )}
    </div>
  )
}
