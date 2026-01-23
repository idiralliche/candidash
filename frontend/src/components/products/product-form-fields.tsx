import { Control } from 'react-hook-form';
import { Package, Globe } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SmartFormField } from '@/components/ui/form-field-wrapper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompanies } from '@/hooks/companies/use-companies';
import { ProductFormValues } from '@/hooks/products/use-product-form-logic';

interface ProductFormFieldsProps {
  control: Control<ProductFormValues>;
}

export function ProductFormFields({ control }: ProductFormFieldsProps) {
  const { companies, isLoading: isLoadingCompanies } = useCompanies();

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
          {(field) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingCompanies}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une entreprise" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
