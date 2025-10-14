export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  image: string; // Can be a URL or a base64 string
  description: string;
  specifications: { [key: string]: string };
  price?: number;
}

export enum ProductCategory {
  All = 'All',
  PowerTiller = 'Power Tillers',
  BrushCutter = 'Brush Cutters',
  EarthAuger = 'Earth Augers',
  Chainsaw = 'Chainsaws',
}

export interface SiteImages {
  logo: string;
  hero: string;
  about: string;
  qrCode: string;
}

export interface AdminPanelProps {
    products: Product[];
    siteImages: SiteImages;
    onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
    onUpdateSiteImages: (newImages: SiteImages) => void;
    onDeleteProduct: (productId: number) => void;
    onSelectProductToEdit: (product: Product) => void;
}

export interface EditProductModalProps {
    product: Product | null;
    onUpdateProduct: (updatedProduct: Product) => void;
    onClose: () => void;
}

export interface ProductsProps {
  products: Product[];
  onBuyNow: (product: Product) => void;
}

export interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
}

export interface PaymentModalProps {
  product: Product | null;
  siteImages: SiteImages;
  onClose: () => void;
}