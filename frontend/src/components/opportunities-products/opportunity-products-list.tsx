import { Package } from "lucide-react";
import { useOpportunityProducts } from '@/hooks/opportunity-products/use-opportunity-products';
import { EntityAssociationDetailsComponent } from "@/components/shared/entity-association-details-component";
import { ProductCard } from '@/components/products/product-card';
import { OpportunityProduct } from "@/api/model/opportunityProduct";


interface OpportunitiesProductsListProps {
  opportunityId: number;
  productId: number;
}

export function OpportunitiesProductsList({ opportunityId }: OpportunitiesProductsListProps) {
  const { opportunityProducts, isLoading } = useOpportunityProducts({
    opportunity_id: opportunityId
  });

  const renderItem = (assoc: OpportunityProduct) => (
    assoc.product ? (
      <ProductCard
        key={assoc.product.id}
        product={assoc.product}
        variant="minimal"
      />
    ) : null
  );

  return (
    <EntityAssociationDetailsComponent
      isLoading={isLoading}
      data={opportunityProducts}
      renderItem={renderItem}
      icon={Package}
      label="Produits / Projets"
    />
  );
}
