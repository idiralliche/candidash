import {
  MapPin,
  FileText,
  Hash,
  Package,
} from "lucide-react";
import { Company } from "@/api/model";
import { DetailsBlock } from "@/components/shared/details-block";
import { LinkCard } from "@/components/shared/link-card";
import { Product } from "@/api/model";
import { BasicDetails } from '@/components/shared/basic-details';
import { DetailsList } from '@/components/shared/details-list';

export function CompanyDetailsContent({
  company,
  products,
}: {
  company: Company;
  products?: Product[];
}) {
  return (
    <>
      {/* Headquarters */}
      {company.headquarters && (
        <DetailsBlock
          icon={MapPin}
          label="Siège social"
        >
          <BasicDetails>
            {company.headquarters}
          </BasicDetails>
        </DetailsBlock>
      )}

      {/* SIRET */}
      {company.siret && (
        <DetailsBlock
          icon={Hash}
          label="SIRET"
        >
          <BasicDetails>
            <p className="font-mono tracking-wider">{company.siret}</p>
            <a
              href={`https://www.pappers.fr/recherche?q=${company.siret}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline inline-block mt-1 "
            >
              Voir sur Pappers.fr
            </a>
          </BasicDetails>
        </DetailsBlock>
      )}

      {/* PRODUCTS LIST */}
      {products && products.length > 0 && (
        <DetailsBlock
          className="space-y-4"
          icon={Package}
          label="Produits & Services"
        >
          <DetailsList>
            {products.map(product => (
              <LinkCard
                key={product.id}
                href="#"
                icon={Package}
                label={product.name}
                value={product.description || "Pas de description"}
              />
            ))}
          </DetailsList>
        </DetailsBlock>
      )}


      {/* NOTES */}
      {company.notes && (
        <DetailsBlock
          icon={FileText}
          label="Notes & Informations"
        >
          <BasicDetails>
            {company.notes}
          </BasicDetails>
        </DetailsBlock>
      )}
    </>
  );
}
