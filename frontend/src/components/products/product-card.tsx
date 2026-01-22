import {
  Package,
  Globe,
  Code2,
  Building2,
} from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { Button } from '@/components/ui/button.tsx';
import { Product } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  variant?: "default" | "compact";
}

export function ProductCard({
  product,
  onClick,
  onEdit,
  onDelete,
  variant ="default",
}: ProductCardProps) {
  const company = product.company;
  const isCompact = variant === "compact";

  return (
    <EntityCard
      onClick={onClick && (() => onClick(product))}
      className={onClick ? "cursor-pointer" : "cursor-default"}
    >

      {/* IDENTITY ZONE */}
      <EntityCard.Identity>
        <IconBox
          palette="indigo"
          groupHover
        >
          <Package className="h-5 w-5" />
        </IconBox>

        <EntityCard.Info
          title={product.name}
          subtitle={company?.name && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Building2 className="h-3 w-3" />
              <span className="truncate">
                {company.name}
              </span>
            </div>
          )}
        />
      </EntityCard.Identity>

      {/* META ZONE */}
      <EntityCard.Meta>
        {/* Technologies Stack */}
        <div className="flex justify-start min-w-0">
          {product.technologies_used && (
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-gray-500"/>
              <span className="truncate max-w-[150px] text-xs ">
                {product.technologies_used}
              </span>
            </div>
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
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(product))}
        onDelete={onDelete && (() => onDelete(product))}
      />
    </EntityCard>
  );
}
