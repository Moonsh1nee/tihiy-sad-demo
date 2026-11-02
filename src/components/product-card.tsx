import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { asset, money, type Product } from '@/lib/catalog';
export function ProductImage({
  id,
  name,
  priority = false,
  className = '',
  sizes = '(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 30vw',
}: {
  id: string;
  name: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <img
      className={className}
      src={asset(`/images/${id}-640.webp`)}
      srcSet={`${asset(`/images/${id}-400.webp`)} 400w, ${asset(`/images/${id}-640.webp`)} 640w, ${asset(`/images/${id}-1120.webp`)} 1120w`}
      sizes={sizes}
      alt={name}
      width={896}
      height={1120}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
export function ProductCard({
  product: p,
  priority = false,
  imageSizes = '(max-width: 600px) 45vw, 30vw',
}: {
  product: Product;
  priority?: boolean;
  imageSizes?: string;
}) {
  return (
    <article className="product-card">
      <Link prefetch={false} href={`/bouquets/${p.id}/`} className="product-image">
        <ProductImage
          id={p.id}
          name={`${p.name}: ${p.composition}`}
          priority={priority}
          sizes={imageSizes}
        />
        <span className="card-open" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </Link>
      <div className="card-title">
        <h3>
          <Link prefetch={false} href={`/bouquets/${p.id}/`}>
            {p.name}
          </Link>
        </h3>
        <span>{money(p.price)}</span>
      </div>
      <p>{p.subtitle}</p>
    </article>
  );
}
