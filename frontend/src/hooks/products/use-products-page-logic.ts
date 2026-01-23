import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { useProducts } from '@/hooks/products/use-products';
import { useDeleteProduct } from '@/hooks/products/use-delete-product';
import { Product } from '@/api/model';

export function useProductsPageLogic() {
  const { products, isLoading } = useProducts();
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // --- STATE ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // --- SORTING ---
  const sortedProducts = useMemo(() => {
    if (!products) return [];
    return [...products].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  // --- HANDLERS ---
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

  const closeDeleteDialog = (open: boolean) => {
    if (!open) {
      setProductToDelete(null);
      setDeleteError('');
    }
  };

  const openEditFromDetails = (product: Product) => {
    setSelectedProduct(null);
    setEditingProduct(product);
  };

  const openDeleteFromDetails = (product: Product) => {
    setSelectedProduct(null);
    setProductToDelete(product);
  };

  return {
    // Data
    sortedProducts,
    isLoading,

    // State
    selectedProduct,
    setSelectedProduct,
    productToDelete,
    setProductToDelete,
    editingProduct,
    setEditingProduct,
    deleteError,
    isDeleting,

    // Handlers
    handleDelete,
    closeDeleteDialog,
    openEditFromDetails,
    openDeleteFromDetails,
  };
}
