import { Package } from "lucide-react";
import { useOpportunityProducts } from '@/hooks/opportunity-products/use-opportunity-products';
import { EntityDetailsAssociationBlock } from "@/components/shared/entity-details-association-block";
import { ProductCard } from '@/components/products/product-card';
import { OpportunityProduct } from "@/api/model/opportunityProduct"


interface OpportunityProductsListProps {
  opportunityId: number;
}

export function OpportunityProductsList({ opportunityId }: OpportunityProductsListProps) {
  const { opportunityProducts, isLoading } = useOpportunityProducts({
    opportunity_id: opportunityId
  });

  const renderItem = (assoc: OpportunityProduct) => (
    assoc.product ? (
      <ProductCard
        key={assoc.product.id}
        product={assoc.product}
        variant="minimal"
        isHighlighted
      />
    ) : null
  );

  return (
    <EntityDetailsAssociationBlock
      isLoading={isLoading}
      data={opportunityProducts}
      renderItem={renderItem}
      icon={Package}
      label="Produits / Projets"
    />
  );
}
