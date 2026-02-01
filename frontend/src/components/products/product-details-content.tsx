import {
  Building2,
  CodeXml,
  FileText,
} from "lucide-react";
import { Product } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
import { BasicDetails } from '@/components/shared/basic-details';
import { DetailsEntityCard } from '@/components/shared/details-entity-card';
import { CompanyCard } from '@/components/companies/company-card';
import { ProductOpportunitiesList } from '@/components/products/product-opportunities-list';

export function ProductDetailsContent({ product }: { product: Product; }) {
  const company = product.company;
  return (
    <>
      {/* Company */}
      {company?.name && (
        <DetailsBlock
          icon={Building2}
          label="Entreprise"
        >
          <DetailsEntityCard>
            <CompanyCard
              key={company.id}
              company={company}
              variant="minimal"
              isHighlighted
            />
          </DetailsEntityCard>
        </DetailsBlock>
      )}

      {/* OPPORTUNITIES (ASYNC) */}
      <ProductOpportunitiesList productId={product.id} />

      {/* Technologies Stack */}
      {product.technologies_used && (
        <DetailsBlock
          icon={CodeXml}
          label="Technologies / Stack"
        >
          <BasicDetails>
            {product.technologies_used}
          </BasicDetails>
        </DetailsBlock>
      )}

      {/* Description */}
      {product.description && (
        <DetailsBlock
          icon={FileText}
          label="Description"
        >
          <BasicDetails>
            {product.description}
          </BasicDetails>
        </DetailsBlock>
      )}
    </>
  );
}
