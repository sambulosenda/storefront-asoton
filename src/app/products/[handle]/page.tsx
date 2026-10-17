import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatMoney, getProduct } from "@/lib/shopify";

export default function ProductPage({ params }: PageProps<"/products/[handle]">) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/products/[handle]">, "params">) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{product.title}</h1>
        <p className="text-xl">{formatMoney(product.priceRange.minVariantPrice)}</p>
        <p className="leading-7 text-zinc-600 dark:text-zinc-400">{product.description}</p>
      </div>
    </div>
  );
}
