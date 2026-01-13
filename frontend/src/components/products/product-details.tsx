import {
  Building2,
  Globe,
  CodeXml,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Product,
} from "@/api/model";
import { EntityDetailsSheet } from "@/components/shared/entity-details-sheet";
import { DetailsBlock } from "@/components/shared/details-block";

interface ProductDetailsProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductDetails({
  product,
  onEdit,
  onDelete
}: ProductDetailsProps) {
  const company = product.company;

  return (
    <EntityDetailsSheet
      title={product.name}
      metadata={company?.name && (
        <div className="flex items-center gap-2 rounded border border-white-light bg-white-subtle px-3 py-1.5 text-primary font-bold mb-2">
          <Building2 className="h-4 w-4" />
          {company.name}
        </div>
      )}
      onEdit={onEdit ? () => onEdit(product) : undefined}
      footer={
        onDelete && (
          <Button
            variant="ghost"
            palette="destructive"
            className="w-full"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le produit
          </Button>
        )
      }
    >
      {/* ACTIONS ROW */}
      {product.website && (
        <div className="mb-6">
          <Button
            variant="outline"
            palette="blue"
            className="w-full justify-start"
            asChild
          >
            <a
              href={product.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe className="mr-2 h-4 w-4" />
              Voir le site web
            </a>
          </Button>
        </div>
      )}

      <Separator className="bg-white-light mb-6" />

      {/* MAIN CONTENT */}
      <div className="space-y-6">

        {/* Technologies Stack */}
        {product.technologies_used && (
          <DetailsBlock icon={CodeXml} label="Technologies / Stack">
            <div className="whitespace-pre-wrap leading-relaxed">
              {product.technologies_used}
            </div>
          </DetailsBlock>
        )}

        {/* Description */}
        {product.description && (
          <DetailsBlock icon={FileText} label="Description">
            <div className="whitespace-pre-wrap leading-relaxed">
               {product.description}
            </div>
          </DetailsBlock>
        )}
      </div>
    </EntityDetailsSheet>
  );
}
