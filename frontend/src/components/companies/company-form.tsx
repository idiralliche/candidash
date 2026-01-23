import { Form } from '@/components/ui/form';
import { FormSubmitButton } from '@/components/shared/form-submit-button';
import { CompanyFormFields } from '@/components/companies/company-form-fields';

import { useCompanyFormLogic } from '@/hooks/companies/use-company-form-logic';
import { Company } from '@/api/model';

interface CompanyFormProps {
  onSuccess?: (company?: Company) => void;
  className?: string;
  initialData?: Company;
}

export function CompanyForm({ onSuccess, className, initialData }: CompanyFormProps) {
  const logic = useCompanyFormLogic({ initialData, onSuccess });

  return (
    <Form {...logic.form}>
      <form
        onSubmit={logic.onSubmit}
        className={`space-y-4 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >
        <CompanyFormFields control={logic.form.control} />

        {logic.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center animate-in fade-in slide-in-from-top-1">
            Une erreur est survenue lors de la création.
          </div>
        )}

        <FormSubmitButton
          isPending={logic.isPending}
          isEditing={logic.isEditing}
          entityType="entreprise"
        />
      </form>
    </Form>
  );
}
