import {
  Package,
  Globe,
  Code2,
  Building2,
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Product } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";
import { CardInfoBlock } from '@/components/shared/card-info-block';

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  variant?: "default" | "compact" | "minimal";
  isHighlighted?: boolean;
}

export function ProductCard({
  product,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
  isHighlighted = false,
}: ProductCardProps) {
  const company = product.company;
  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";

  return (
    <EntityCard
      onClick={onClick && (() => onClick(product))}
      isHighlighted={isHighlighted}
      isMinimal={isMinimal}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity
        iconBoxProps={{ palette: "indigo" }} //  isHighlighted -> palette: "blue"!
        icon={Package}
      >
        <EntityCard.Info
          title={product.name}
          subtitle={company?.name && (
            <CardInfoBlock icon={Building2}>
              {company.name}
            </CardInfoBlock>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Meta>
        {/* Technologies Stack */}
        <div className="flex justify-start min-w-0">
          {product.technologies_used && (
            <CardInfoBlock icon={Code2}>
              {product.technologies_used}
            </CardInfoBlock>
          )}
        </div>

        <div className="flex justify-start lg:justify-center">
          {/* TODO : Add link to opportunity */}
        </div>

        {/* Custom Action: Website Link */}
        <div className="flex justify-start lg:justify-end min-w-0">
          {(!isCompact && product.website) && (
            <Button
              variant="link"
              palette="blue"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(product.website!, "_blank", "noopener,noreferrer");
              }}
            >
              <Globe className="h-3 w-3" />
              Visiter le site
            </Button>
          )}
        </div>
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      {/*null if variant === "minimal"*/}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(product))}
        onDelete={onDelete && (() => onDelete(product))}
      />
    </EntityCard>
  );
}
