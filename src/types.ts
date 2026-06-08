export interface Swatch {
  name: string;
  color: string;
}

export interface Specifications {
  threadCount?: string;
  width?: string;
  weight?: string;
  composition?: string;
  dyeType?: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  material: string;
  isNew: boolean;
  isFeatured: boolean;
  minOrder: number;
  priceRange: {
    min: number;
    max: number;
  };
  slug: string;
  createdAt: string;
  specifications?: Specifications;
  swatches?: Swatch[];
}

export interface InquiryPayload {
  name: string;
  phone: string;
  quantity: number;
  message: string;
  productId: string;
  productName: string;
}
