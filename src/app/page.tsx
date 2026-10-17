import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/shopify";

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-semibold tracking-tight">Shop</h1>
      {products.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
