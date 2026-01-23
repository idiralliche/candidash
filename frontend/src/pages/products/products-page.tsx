import {
  Plus,
  Package,
} from 'lucide-react';

import { Fab } from '@/components/ui/fab';
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { EmptyState } from '@/components/shared/empty-state';

// Layout Components
import { PageLayout } from '@/components/layouts/page-layout';
import { PageHeader } from '@/components/layouts/page-header';
import { PageContent } from '@/components/layouts/page-content';

// Shared Components
import { EntitySheet } from '@/components/shared/entity-sheet';
import { EntityDeleteDialog } from '@/components/shared/entity-delete-dialog';
import { FormDialog } from '@/components/shared/form-dialog';

// Feature Components
import { ProductForm } from '@/components/products/product-form';
import { ProductDetails } from '@/components/products/product-details';
import { ProductCard } from '@/components/products/product-card';

// Logic Hook
import { useProductsPageLogic } from '@/hooks/products/use-products-page-logic';

export function ProductsPage() {
  const logic = useProductsPageLogic();

  return (
    <PageLayout>
      <PageHeader
        title="Produits"
        action={
          <FormDialog
            title="Nouveau Produit"
            description="Ajoutez un produit ou service lié à une entreprise."
            trigger={
              <Fab>
                <Plus className="h-5 w-5" />
              </Fab>
            }
          >
            {(close) => <ProductForm onSuccess={close} />}
          </FormDialog>
        }
      />

      <PageContent>
        {logic.isLoading ? (
          <CardListSkeleton />
        ) : logic.sortedProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            message="Aucun produit trouvé. Commencez par en ajouter un !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {logic.sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={logic.setSelectedProduct}
                onEdit={logic.setEditingProduct}
                onDelete={logic.setProductToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!logic.selectedProduct}
        onOpenChange={(open) => !open && logic.setSelectedProduct(null)}
        title="Fiche Produit"
      >
        {logic.selectedProduct && (
          <ProductDetails
            product={logic.selectedProduct}
            onEdit={logic.openEditFromDetails}
            onDelete={logic.openDeleteFromDetails}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!logic.editingProduct}
        onOpenChange={(open) => !open && logic.setEditingProduct(null)}
        title="Modifier le produit"
        description="Modifiez les informations du produit."
      >
        {(close) => logic.editingProduct && (
          <ProductForm
            initialData={logic.editingProduct}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!logic.productToDelete}
        onOpenChange={logic.closeDeleteDialog}
        entityType="produit"
        entityLabel={logic.productToDelete?.name || ''}
        onConfirm={logic.handleDelete}
        isDeleting={logic.isDeleting}
        error={logic.deleteError}
      />
    </PageLayout>
  );
}
