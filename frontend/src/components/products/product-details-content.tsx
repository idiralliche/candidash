import {
  Building2,
  CodeXml,
  FileText,
} from "lucide-react";
import { Product } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
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
          variant="card"
        >
          <CompanyCard
            key={company.id}
            company={company}
            variant="minimal"
            isHighlighted
          />
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
          {product.technologies_used}
        </DetailsBlock>
      )}

      {/* Description */}
      {product.description && (
        <DetailsBlock
          icon={FileText}
          label="Description"
        >
          {product.description}
        </DetailsBlock>
      )}
    </>
  );
}
