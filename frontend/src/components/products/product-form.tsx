import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  Package,
  Globe,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
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

import { useCreateProduct } from '@/hooks/products/use-create-product';
import { useUpdateProduct } from '@/hooks/products/use-update-product';
import { useCompanies } from '@/hooks/companies/use-companies';
import { Product } from '@/api/model';

const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis").max(255),
  company_id: z.string({ required_error: "L'entreprise est requise" }).min(1, "L'entreprise est requise"),
  description: z.string().max(5000).optional().or(z.literal('')),
  website: z.string().url("URL invalide").max(255).optional().or(z.literal('')),
  technologies_used: z.string().max(5000).optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess?: (product?: Product) => void;
  className?: string;
  initialData?: Product;
}

export function ProductForm({ onSuccess, className, initialData }: ProductFormProps) {
  const {
    mutateAsync: createProduct,
    isPending: isCreating,
    error: createError
  } = useCreateProduct();

  const {
    mutateAsync: updateProduct,
    isPending: isUpdating,
    error: updateError
  } = useUpdateProduct();
  const { companies, isLoading: isLoadingCompanies } = useCompanies();

  const isEditing = !!initialData;
  const isPending = isCreating || isUpdating;
  const error = createError || updateError;

  const initialCompanyId = initialData?.company_id ?? initialData?.company?.id;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      company_id: initialCompanyId ? String(initialCompanyId) : '',
      description: initialData?.description || '',
      website: initialData?.website || '',
      technologies_used: initialData?.technologies_used || '',
    },
  });

  useEffect(() => {
    if (initialData) {
      const companyId = initialData.company_id ?? initialData.company?.id;

      form.reset({
        name: initialData.name,
        company_id: companyId ? String(companyId) : '',
        description: initialData.description || '',
        website: initialData.website || '',
        technologies_used: initialData.technologies_used || '',
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: ProductFormValues) {
    const companyId = parseInt(values.company_id);
    const payload = {
      name: values.name,
      company_id: companyId,
      description: values.description || null,
      website: values.website || null,
      technologies_used: values.technologies_used || null,
    };

    try {
      let resultProduct: Product | undefined;

      if (isEditing && initialData) {
         const result = await updateProduct({ productId: initialData.id, data: payload });
         resultProduct = result as unknown as Product;
      } else {
         resultProduct = await createProduct({ data: payload });
      }

      form.reset();
      if (onSuccess) onSuccess(resultProduct);

    } catch (err) {
      console.error("Erreur lors de la soumission du produit", err);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-6 ${className} pr-2 max-h-[80vh] overflow-y-auto`}
      >

        {/* IDENTITY */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Identité</h3>

          <SmartFormField
            control={form.control}
            name="name"
            label="Nom du produit *"
            component={Input}
            placeholder="Ex: SaaS Platform, Mobile App..."
            leadingIcon={Package}
          />

          <SmartFormField
            control={form.control}
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
            control={form.control}
            name="technologies_used"
            label="Technologies / Stack"
            component={Textarea}
            placeholder="React, Python, AWS, Docker..."
            maxLength={5000}
          />

          <SmartFormField
            control={form.control}
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
            control={form.control}
            name="description"
            label="Description détaillée"
            component={Textarea}
            placeholder="Fonctionnalités principales, cible, contexte..."
            maxLength={5000}
            className="min-h-[100px]"
            showCharCount
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive text-center">
            Erreur lors de l'enregistrement.
          </div>
        )}

        <div className="sticky bottom-0">
          <Button
            type="submit"
            variant="solid"
            palette="primary"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Enregistrement..." : "Ajout en cours..."}
              </>
            ) : (
              isEditing ? "Enregistrer les modifications" : "Ajouter le produit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
