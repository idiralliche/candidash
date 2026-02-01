import { Briefcase } from "lucide-react";
import { useOpportunityProducts } from '@/hooks/opportunity-products/use-opportunity-products';
import { EntityDetailsAssociationBlock } from "@/components/shared/entity-details-association-block";
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { OpportunityProduct } from "@/api/model/opportunityProduct";


interface ProductOpportunitiesListProps {
  productId: number;
}

export function ProductOpportunitiesList({ productId }: ProductOpportunitiesListProps) {
  const { opportunityProducts, isLoading } = useOpportunityProducts({
    product_id: productId
  });

  const renderItem = (assoc: OpportunityProduct) => (
    assoc.opportunity ? (
      <OpportunityCard
        key={assoc.opportunity.id}
        opportunity={assoc.opportunity}
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
      icon={Briefcase}
      label="Opportunités liées"
    />
  );
}
