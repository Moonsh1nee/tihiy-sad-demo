import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, findProduct, asset } from '@/lib/catalog';
import { ProductDetail } from '@/components/product-detail';
export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ id: p.id }));
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const p = findProduct((await params).id);
  return {
    title: p?.name || 'Букет',
    description: p?.description,
    openGraph: { images: [asset(`/images/${p?.id || '01'}-1120.webp`)] },
  };
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const p = findProduct((await params).id);
  if (!p) notFound();
  return <ProductDetail key={p.id} product={p} />;
}
