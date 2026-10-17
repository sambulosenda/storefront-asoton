import Image from "next/image";
import Link from "next/link";
import { formatMoney, type Product } from "@/lib/shopify";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.handle}`} className="group flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <h2 className="font-medium">{product.title}</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {formatMoney(product.priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}
