export type Money = { amount: string; currencyCode: string };

export type Image = { url: string; altText: string | null; width: number; height: number };

export type Product = {
  id: string;
  handle: string;
  title: string;
  tags: string[];
  productType: string;
  availableForSale: boolean;
  featuredImage: Image | null;
  priceRange: { minVariantPrice: Money };
  options: { name: string; optionValues: { name: string; swatch?: { color: string | null } | null }[] }[];
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
};

export type ProductDetail = Product & {
  description: string;
  descriptionHtml: string;
  seo: { title: string | null; description: string | null };
  variants: Variant[];
  images: Image[];
  collections: { handle: string; title: string }[];
  care: string | null;
  fit: string | null;
  model: string | null;
  clothFields: Record<string, string | null> | null;
  rating: number | null;
  ratingCount: number | null;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image | null;
};

export type FilterValue = {
  id: string;
  label: string;
  count: number;
  input: string;
  swatch: { color: string | null } | null;
};

export type Filter = {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: FilterValue[];
};

export type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export type CollectionPage = {
  collection: Collection | null;
  products: Product[];
  filters: Filter[];
  pageInfo: PageInfo;
};

export type SortKey = "featured" | "best-selling" | "newest" | "price-asc" | "price-desc";

export type MenuLink = { title: string; href: string };

export type ClothEntry = {
  handle: string;
  name: string;
  technique: string | null;
  origin: string | null;
  caption: string | null;
  collectionHandle: string | null;
};

export type PredictiveResults = {
  queries: { text: string }[];
  collections: { handle: string; title: string }[];
  products: Product[];
};

export type CartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: Money };
  merchandise: {
    id: string;
    title: string;
    quantityAvailable: number | null;
    selectedOptions: { name: string; value: string }[];
    image: Image | null;
    product: { handle: string; title: string; tags: string[]; productType: string };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money };
  lines: CartLine[];
};
