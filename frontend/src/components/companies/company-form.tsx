import { SmartForm } from '@/components/shared/smart-form';
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
    <SmartForm
      form={logic.form}
      onSubmit={logic.onSubmit}
      isPending={logic.isPending}
      className={className}
      error={logic.error}
      isEditing={logic.isEditing}
      entityType="entreprise"
    >
      <CompanyFormFields control={logic.form.control} />
    </SmartForm>
  );
}
