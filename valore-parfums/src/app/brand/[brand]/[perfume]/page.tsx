import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PerfumePageClient from "@/components/store/PerfumeDetailClient";
import {
  buildFaqJsonLd,
  buildProductJsonLd,
  buildProductMetaDescription,
  buildProductMetaTitle,
  buildCanonicalProductPath,
  buildCanonicalProductUrl,
  getPerfumeByBrandAndSlug,
  getPerfumeOffers,
  getPerfumeReviews,
  computeAggregateRating,
  getProductKeywordBundle,
  SITE_URL,
  SITE_NAME,
} from "@/lib/seo-catalog";

type RouteProps = {
  params: Promise<{ brand: string; perfume: string }>;
};

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { brand, perfume } = await params;
  const product = await getPerfumeByBrandAndSlug(brand, perfume);
  if (!product) {
    return {
      title: `${SITE_NAME} | Perfume Not Found`,
      description: "Browse authentic perfume decants and full bottle requests in Bangladesh.",
    };
  }

  const title = buildProductMetaTitle(product);
  const description = buildProductMetaDescription(product);
  const canonicalPath = buildCanonicalProductPath(product);
  const keywords = getProductKeywordBundle(product.name);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    keywords: [...keywords.titleKeywords, ...keywords.descriptionKeywords, ...keywords.headingKeywords],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export default async function CanonicalProductPage({ params }: RouteProps) {
  const { brand, perfume } = await params;
  const product = await getPerfumeByBrandAndSlug(brand, perfume);
  if (!product) notFound();

  const [offers, reviews] = await Promise.all([
    getPerfumeOffers(product),
    getPerfumeReviews(product.id),
  ]);
  const reviewAverage = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : product.rating;
  const aggregate = computeAggregateRating(product, reviews.length, reviewAverage);

  const productJsonLd = buildProductJsonLd(product, offers, aggregate);
  const faqJsonLd = buildFaqJsonLd(product);
  const canonicalUrl = buildCanonicalProductUrl(product);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: buildProductMetaTitle(product),
            description: buildProductMetaDescription(product),
            url: canonicalUrl,
          }),
        }}
      />
      <PerfumePageClient params={Promise.resolve({ id: product.id })} />
    </>
  );
}
