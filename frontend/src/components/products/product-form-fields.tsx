import { Control } from 'react-hook-form';
import { Package, Globe } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import { SmartSelect } from '@/components/ui/smart-select';
import { MultiSelect } from '@/components/ui/multi-select';
import { ProductFormValues } from '@/hooks/products/use-product-form-logic';
import { Company, Opportunity } from '@/api/model';

interface ProductFormFieldsProps {
  control: Control<ProductFormValues>;
  companies?: Company[];
  isLoadingCompanies?: boolean;
  opportunities?: Opportunity[];
  isLoadingOpportunities?: boolean;
}

export function ProductFormFields({
  control,
  companies,
  isLoadingCompanies,
  opportunities,
  isLoadingOpportunities
}: ProductFormFieldsProps) {

  const opportunityOptions = (opportunities || []).map(opp => {
    const label = opp.company?.name
      ? `${opp.job_title} (${opp.company.name})`
      : opp.job_title;

    return {
      label: label,
      value: String(opp.id),
    };
  });

  return (
    <>
      {/* IDENTITY */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Identité</h3>

        <SmartFormField
          control={control}
          name="name"
          label="Nom du produit *"
          component={Input}
          placeholder="Ex: SaaS Platform, Mobile App..."
          leadingIcon={Package}
        />

        <SmartFormField
          control={control}
          name="company_id"
          label="Entreprise liée *"
          description="L'entreprise qui développe ou vend ce produit."
        >
          <SmartSelect
            disabled={isLoadingCompanies}
            placeholder={{topic: "entreprise", suffix:"e"}}
            items={companies?.map(c => ({
              key: c.id,
              value: c.id.toString(),
              label: c.name
            }))}
          />
        </SmartFormField>
      </div>

      {/* CONTEXT (OPPORTUNITIES) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Contexte</h3>

        <SmartFormField
            control={control}
            name="opportunity_ids"
            label="Opportunités liées"
            description="Lier ce produit à une ou plusieurs opportunités existantes."
        >
          <MultiSelect
            options={opportunityOptions}
            placeholder="Choisir des opportunités..."
            isLoading={isLoadingOpportunities}
          />
        </SmartFormField>
      </div>

      {/* TECHNICAL DETAILS */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Détails Techniques</h3>

        <SmartFormField
          control={control}
          name="technologies_used"
          label="Technologies / Stack"
          component={Textarea}
          placeholder="React, Python, AWS, Docker..."
          maxLength={5000}
        />

        <SmartFormField
          control={control}
          name="website"
          label="Site Web (Produit)"
          component={Input}
          placeholder="https://product.example.com"
          leadingIcon={Globe}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Description</h3>
        <SmartFormField
          control={control}
          name="description"
          label="Description détaillée"
          component={Textarea}
          placeholder="Fonctionnalités principales, cible, contexte..."
          maxLength={5000}
          className="min-h-[100px]"
          showCharCount
        />
      </div>
    </>
  );
}
