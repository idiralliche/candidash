import {
  Building2,
  Star,
  StarOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from "@/components/ui/switch"
import { CompanyForm } from '@/components/companies/company-form';
import { useDeleteCompany } from '@/hooks/companies/use-delete-company';
import { useUpdateOpportunity } from '@/hooks/opportunities/use-update-opportunity';
import { WizardStepGeneric } from './wizard-step-generic';
import { Company } from '@/api/model';
import { Badge } from '@/components/ui/badge';
import { CompanyCard } from '@/components/companies/company-card';

interface WizardStepCompaniesProps {
  opportunityId: number | null;
  companies: Company[];
  linkedCompanyId: number | null;
  onCompanyAdded: (company: Company) => void;
  onCompanyRemoved: (companyId: number) => void;
  onLinkCompany: (companyId: number | null) => void;
}

interface CompanyExtraProps {
  linkedCompanyId: number | null;
  opportunityId: number | null;
  onLinkCompany: (company: Company) => void;
  onUnlinkCompany: () => void;
  isLinking: boolean;
}

export function WizardStepCompanies({
  opportunityId,
  companies = [],
  linkedCompanyId,
  onCompanyAdded,
  onCompanyRemoved,
  onLinkCompany
}: WizardStepCompaniesProps) {
  const { mutateAsync: updateOpportunity, isPending: isLinking } = useUpdateOpportunity();

  const handleLinkCompany = async (company: Company) => {
    if (!opportunityId) return;

    try {
      await updateOpportunity({
        opportunityId: opportunityId,
        data: { company_id: company.id }
      });
      onLinkCompany(company.id);
      toast.success(`${company.name} définie comme entreprise principale`);
    } catch (error) {
      console.error("Failed to link company", error);
      toast.error("Erreur lors de la liaison de l'entreprise");
    }
  };

  const handleUnlinkCompany = async () => {
    if (!opportunityId) return;

    try {
      await updateOpportunity({
        opportunityId: opportunityId,
        data: { company_id: null }
      });
      onLinkCompany(null);
      toast.success("Entreprise détachée de l'opportunité");
    } catch (error) {
      console.error("Failed to unlink company", error);
      toast.error("Erreur lors du détachement de l'entreprise");
    }
  };

  const renderCompany = (
    company: Company,
    onDelete: (company: Company) => void,
    extraProps: CompanyExtraProps
  ) => {
    const isLinked = extraProps.linkedCompanyId === company.id;
    const mainCompanyBadge = isLinked && (
      <Badge
        variant="subtle"
        palette="blue"
      >
        <Star className="mr-2 h-3.5 w-3.5" />
        Principale
      </Badge>
    )

    const switchLinkToOpportunity = extraProps && (
      <Badge
        variant="outline"
        palette="red"
        className="flex items-center gap-2"
      >
        <label className={`text-sm p-1.5 flex justify-between items-center ${isLinked ? "text-primary" : ""}`}>
          {isLinked ? (
            <>
              <StarOff className="mr-2 h-3.5 w-3.5"/>
              Dissocier
            </>
          ) : (
            <>
              <Star className="mr-2 h-3.5 w-3.5"/>
              Associer
            </>
          )}
        </label>
        <Switch
          checked={isLinked}
          onCheckedChange={() => !isLinked ? extraProps.onLinkCompany(company) : extraProps.onUnlinkCompany()}
        />
      </Badge>
    )

    return (
      <CompanyCard
        key={company.id}
        company={company}
        onDelete={() => onDelete(company)}
        variant="compact"
        isHighlighted={isLinked}
        badges={mainCompanyBadge}
        extraActions={switchLinkToOpportunity}
      />
    );
  };

  const config = {
    title: "Entreprises",
    entityName: "Entreprise",
    entityNamePlural: "Entreprises",
    icon: Building2,
    emptyMessage: "Aucune entreprise ajoutée. Ajoutez l'entreprise pour laquelle vous postulez ou un cabinet de recrutement.",
    addButtonText: "Ajouter une entreprise",

    formComponent: CompanyForm,
    deleteHook: useDeleteCompany,
    getDeletePayload: (id: number) => ({ companyId: id }),
    getEntityLabel: (company: Company) => company.name,

    renderEntity: renderCompany,
    onSuccess: onCompanyAdded,
    onRemove: onCompanyRemoved,

    extraProps: {
      linkedCompanyId,
      opportunityId,
      onLinkCompany: handleLinkCompany,
      onUnlinkCompany: handleUnlinkCompany, // Ajout aux props
      isLinking
    }
  };

  return (
    <WizardStepGeneric<Company, { companyId: number }, CompanyExtraProps>
      entities={companies}
      config={config}
    />
  );
}
