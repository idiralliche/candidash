import {
  Package,
  Globe,
  Code2,
  Building2,
} from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { Product } from "@/api/model";
import { EntityCard } from "@/components/shared/entity-card";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductCard({
  product,
  onClick,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const company = product.company;

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
        <div className={`${product.technologies_used ? "flex items-center gap-2" : "hidden sm:block "} sm:mx-auto`}>
          {product.technologies_used && (
            <>
              <Code2 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
              <span className="truncate max-w-[150px]">
                {product.technologies_used}
              </span>
            </>
          )}
        </div>

        {/* Custom Action: Website Link */}
        {(onClick && product.website) && (
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs text-blue-400/80 hover:text-blue-400 hover:underline px-2 py-1 rounded cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              window.open(product.website!, "_blank", "noopener,noreferrer");
            }}
          >
            <Globe className="h-3 w-3" />
            Visiter le site
          </div>
        )}
      </EntityCard.Meta>

      {/* ACTIONS ZONE */}
      <EntityCard.Actions
        onEdit={onEdit && (() => onEdit(product))}
        onDelete={onDelete && (() => onDelete(product))}
      />
    </EntityCard>
  );
}
