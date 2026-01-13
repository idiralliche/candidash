import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Package } from 'lucide-react';

import { useProducts } from '@/hooks/use-products';
import { useDeleteProduct } from '@/hooks/use-delete-products';
import { Product } from '@/api/model';

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

export function ProductsPage() {
  const { products, isLoading } = useProducts();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return [...products].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setDeleteError('');
    try {
      await deleteProduct({ productId: productToDelete.id });
      toast.success('Produit supprimé avec succès');
      setProductToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setDeleteError('Une erreur est survenue lors de la suppression.');
    }
  };

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
        {isLoading ? (
          <CardListSkeleton />
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            message="Aucun produit trouvé. Commencez par en ajouter un !"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
                onEdit={setEditingProduct}
                onDelete={setProductToDelete}
              />
            ))}
          </div>
        )}
      </PageContent>

      {/* DETAILS SHEET */}
      <EntitySheet
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        title="Fiche Produit"
      >
        {selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onEdit={(p) => {
              setSelectedProduct(null);
              setEditingProduct(p);
            }}
            onDelete={(p) => {
              setSelectedProduct(null);
              setProductToDelete(p);
            }}
          />
        )}
      </EntitySheet>

      {/* EDIT DIALOG */}
      <FormDialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        title="Modifier le produit"
        description="Modifiez les informations du produit."
      >
        {(close) => editingProduct && (
          <ProductForm
            initialData={editingProduct}
            onSuccess={close}
          />
        )}
      </FormDialog>

      {/* DELETE ALERT */}
      <EntityDeleteDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
            setDeleteError('');
          }
        }}
        entityType="produit"
        entityLabel={productToDelete?.name || ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </PageLayout>
  );
}
