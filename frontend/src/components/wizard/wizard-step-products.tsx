import { Package } from 'lucide-react';
import { ProductForm } from '@/components/products/product-form';
import { useDeleteProduct } from '@/hooks/products/use-delete-product';
import { WizardStepGeneric } from '@/components/wizard/wizard-step-generic';
import { Product } from '@/api/model';
import { ProductCard } from '@/components/products/product-card';

interface WizardStepProductsProps {
  products: Product[];
  onProductAdded: (product: Product) => void;
  onProductRemoved: (productId: number) => void;
}

export function WizardStepProducts({
  products = [],
  onProductAdded,
  onProductRemoved
}: WizardStepProductsProps) {

  const renderProduct = (
    product: Product,
    onDelete: (product: Product) => void
  ) => (
    <ProductCard
      key={product.id}
      product={product}
      onDelete={() => onDelete(product)}
      variant="compact"
    />
  );

  const config = {
    title: "Produits",
    entityName: "Produit",
    entityNamePlural: "Produits",
    icon: Package,
    emptyMessage: "Aucun produit ajouté. Ajoutez des applications, services ou projets liés à cette candidature.",
    addButtonText: "Ajouter un produit",

    formComponent: ProductForm,
    deleteHook: useDeleteProduct,
    getDeletePayload: (id: number) => ({ productId: id }),
    getEntityLabel: (product: Product) => product.name,

    renderEntity: renderProduct,
    onSuccess: onProductAdded,
    onRemove: onProductRemoved,
    extraProps: {}
  };

  return (
    <WizardStepGeneric<Product, { productId: number }>
      entities={products}
      config={config}
    />
  );
}
