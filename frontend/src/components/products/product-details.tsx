import { Globe } from "lucide-react";

import { Product } from "@/api/model";

import { ProductDetailsContent } from "@/components/products/product-details-content";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsMetaLinkButton } from "@/components/shared/details-meta-info-block";

interface ProductDetailsProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductDetails({
  product,
  onEdit,
  onDelete,
}: ProductDetailsProps) {
  return (
    <EntityDetailsSheet
      entityName="produit"
      onDelete={() => onDelete(product)}
    >
      <EntityDetailsSheet.Header>
        <EntityDetailsSheet.TitleRow
          title={product.name}
          onEdit={() => onEdit(product)}
        />

        <EntityDetailsSheet.Metadata>
          {product.website && (
            <DetailsMetaLinkButton
              href={product.website}
              icon={Globe}
              label="Voir le site web"
            />
          )}
        </EntityDetailsSheet.Metadata>
      </EntityDetailsSheet.Header>

      <ProductDetailsContent
        product={product}
      />
    </EntityDetailsSheet>
  );
}
