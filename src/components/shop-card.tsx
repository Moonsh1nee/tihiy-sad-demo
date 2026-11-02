'use client';

import Link from 'next/link';
import { ArrowUpRight, Heart } from 'lucide-react';
import { money, type Product } from '@/lib/catalog';
import { ProductImage } from './product-card';

export function ShopCard({
  product: p,
  priority,
  favorite,
  onFavorite,
}: {
  product: Product;
  priority: boolean;
  favorite: boolean;
  onFavorite: () => void;
}) {
  return (
    <article className="product-card shop-card">
      <div className="shop-card-photo">
        <Link prefetch={false} href={`/bouquets/${p.id}/`} className="product-image">
          <ProductImage
            id={p.id}
            name={`${p.name}: ${p.composition}`}
            priority={priority}
            sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 23vw"
          />
        </Link>
        <button
          className="favorite-button"
          aria-label={`${favorite ? 'Убрать из избранного' : 'В избранное'}: ${p.name}`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart size={19} strokeWidth={1.5} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="shop-card-info">
        <p className="shop-card-price">{money(p.price)}</p>
        <h3>
          <Link prefetch={false} href={`/bouquets/${p.id}/`}>
            {p.name}
          </Link>
        </h3>
        <p className="shop-card-composition">{p.composition}</p>
        <div className="shop-card-bottom">
          <span>Классический · {p.dimensions}</span>
          <Link
            prefetch={false}
            href={`/bouquets/${p.id}/`}
            aria-label={`Выбрать варианты: ${p.name}`}
          >
            Выбрать <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
