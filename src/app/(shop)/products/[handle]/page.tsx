import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Accordion } from "@/components/accordion";
import { ClothSwatch, drawingFor } from "@/components/cloth";
import { ArrowRight, StarIcon } from "@/components/icons";
import { ProductGrid, ProductRail } from "@/components/product-card";
import { ProductForm } from "@/components/product-form";
import { ProductGallery } from "@/components/product-gallery";
import { ProductSkeleton } from "@/components/skeletons";
import { clothLinks, deliveryThreshold } from "@/lib/catalog";
import { clothByName, clothFor } from "@/lib/cloths";
import { getProduct, getRecommendations } from "@/lib/shopify";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return {
    title: product.seo.title ?? product.title,
    description: product.seo.description ?? product.description.slice(0, 160),
    openGraph: product.featuredImage ? { images: [product.featuredImage.url] } : undefined,
  };
}

export default function ProductPage({ params }: PageProps<"/products/[handle]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const [recommendations, cloths, threshold] = await Promise.all([
    getRecommendations(product.id),
    clothLinks(),
    deliveryThreshold(),
  ]);

  const text = [product.title, product.productType, ...product.tags].join(" ");
  const clothKey = (clothByName(product.clothFields?.name) ?? clothFor(text))?.key;
  const cloth = cloths.find((c) => c.key === clothKey);
  const dept = product.collections.some((c) => c.handle === "men") ? "men" : "women";
  const department = product.collections.find((c) => c.handle === "women" || c.handle === "men");
  const crumbs = [
    ...(department ? [department] : []),
    ...product.collections.filter((c) => c !== department && !["new-in", "all", "frontpage"].includes(c.handle)).slice(0, 1),
  ];

  const care = product.care ?? cloth?.care;
  const panels: ({ title: string; body: ReactNode } | false | null | undefined | "")[] = [
    product.descriptionHtml && {
      title: "Description",
      body: <div className="[&_p+p]:mt-3" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />,
    },
    care && { title: "Fabric and care", body: care },
    (product.fit || product.model) && { title: "Size and fit", body: [product.fit, product.model].filter(Boolean).join(" ") },
    {
      title: "Delivery and returns",
      body: `UK delivery in ${site.deliveryDays} working days, complimentary over ${threshold.label}. International rates are shown at checkout. Unworn pieces can be returned within ${site.returnDays} days.`,
    },
  ];

  const about = product.clothFields?.about ?? cloth?.about ?? cloth?.caption;
  const terms = cloth?.styles ?? (cloth ? [
    { name: "Technique", note: cloth.technique },
    { name: "Origin", note: cloth.origin },
  ] : []);

  return (
    <>
      <nav aria-label="Breadcrumb" className="page-x hidden py-6 text-[13px] text-ink-2 md:block">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="text-ink-2 underline-offset-4">
              Home
            </Link>
          </li>
          {crumbs.map((c) => (
            <li key={c.handle} className="flex gap-2">
              <span aria-hidden="true">/</span>
              <Link href={`/collections/${c.handle}`} className="text-ink-2 underline-offset-4">
                {c.title}
              </Link>
            </li>
          ))}
          <li aria-hidden="true">/</li>
          <li aria-current="page">{product.title}</li>
        </ol>
      </nav>

      <section className="flex flex-col md:page-x md:flex-row md:flex-wrap md:items-start md:gap-x-16 md:gap-y-12">
        <ProductGallery images={product.images} title={product.title} drawing={drawingFor(product)} />

        <div className="flex min-w-0 flex-col gap-6 px-4 pt-5 pb-12 md:sticky md:top-6 md:flex-[5_1_380px] md:gap-8 md:p-0">
          <div className="flex flex-col gap-2 md:gap-3">
            {cloth && (
              <Link
                href={cloth.href}
                className="self-start text-[11px] tracking-[0.14em] text-ink-2 uppercase no-underline md:text-[12px]"
              >
                {cloth.name} · {cloth.technique}
              </Link>
            )}
            <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.01em] md:text-[clamp(36px,3.4vw,48px)] md:leading-[1.05]">
              {product.title}
            </h1>
          </div>

          <ProductForm product={product} dept={dept} model={product.model} />

          <ul className="flex flex-col gap-1.5 border-t border-line pt-4 text-[13px] text-ink-2 md:gap-2">
            <li>Complimentary UK delivery on orders over {threshold.label}</li>
            <li>Returns within {site.returnDays} days of delivery</li>
          </ul>

          <Accordion panels={panels.filter((p) => !!p)} />
        </div>
      </section>

      {cloth && about && (
        <section aria-labelledby="about-cloth" className="bg-stone md:mt-[120px]">
          <div className="flex flex-col gap-4 px-4 py-14 md:page-x md:flex-row md:flex-wrap md:items-center md:gap-x-16 md:gap-y-12 md:py-24">
            <div className="mb-2 h-[268px] overflow-hidden bg-indigo md:mb-0 md:aspect-[4/3] md:h-auto md:min-w-0 md:flex-[1_1_440px]">
              <ClothSwatch cloth={cloth.key} />
            </div>
            <div className="flex min-w-0 flex-col items-start gap-4 md:max-w-[540px] md:flex-[1_1_400px] md:gap-5">
              <span className="text-[11px] tracking-[0.16em] text-ink-2 uppercase md:text-[12px]">About the cloth</span>
              <h2 id="about-cloth" className="font-display text-[40px] leading-none md:text-[clamp(44px,4vw,56px)] md:tracking-[-0.01em]">
                {cloth.name}
              </h2>
              <p className="text-[15px] leading-[1.65] text-ink-2 md:text-[16px]">{about}</p>
              {terms.length > 0 && (
                <dl className="w-full border-t border-line-cloth md:mt-2">
                  {terms.map((t) => (
                    <div
                      key={t.name}
                      className="flex flex-col gap-0.5 border-b border-line-cloth py-3 text-[14px] md:grid md:grid-cols-[112px_minmax(0,1fr)] md:gap-4 md:py-3.5 md:text-[15px]"
                    >
                      <dt className="font-medium">{t.name}</dt>
                      <dd className="text-ink-2">{t.note}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <Link href={cloth.href} className="arrow-link min-h-11 text-[12px] md:mt-2 md:py-3 md:text-[13px]">
                Shop all {cloth.name.toLowerCase()}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {product.rating && (
        <section aria-labelledby="reviews" className="page-x hidden pt-[120px] md:block">
          <div className="flex max-w-[380px] flex-col gap-5">
            <h2 id="reviews" className="font-display text-[clamp(36px,3.4vw,48px)] leading-none tracking-[-0.01em]">
              Reviews
            </h2>
            <div className="flex items-center gap-3">
              <span role="img" aria-label={`Rated ${product.rating} out of 5`} className="inline-flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= Math.round(product.rating!) ? "text-ink" : "text-line"}>
                    <StarIcon />
                  </span>
                ))}
              </span>
              <span className="text-[15px]">
                <strong className="font-medium">{product.rating.toFixed(1)}</strong>
                {product.ratingCount && <span className="text-ink-2"> from {product.ratingCount} reviews</span>}
              </span>
            </div>
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section aria-labelledby="wear-with" className="py-14 md:page-x md:py-[120px]">
          <h2
            id="wear-with"
            className="mx-4 mb-5 font-display text-[32px] leading-none md:mx-0 md:mb-8 md:text-[clamp(36px,3.4vw,48px)] md:tracking-[-0.01em]"
          >
            Wear it with
          </h2>
          <div className="md:hidden">
            <ProductRail products={recommendations} />
          </div>
          <ProductGrid products={recommendations} tight className="hidden md:grid" />
        </section>
      )}
    </>
  );
}
