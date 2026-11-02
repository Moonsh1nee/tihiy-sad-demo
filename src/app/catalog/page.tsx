import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Catalog } from '@/components/catalog';
export const metadata: Metadata = { title: 'Букеты' };
export default function CatalogPage() {
  return (
    <div className="shell page catalog-page">
      <p className="breadcrumbs">Главная / Букеты</p>
      <div className="catalog-heading">
        <div>
          <h1>Букеты</h1>
        </div>
        <p>Для человека, момента или себя.</p>
      </div>
      <Suspense fallback={<p>Готовим подборку…</p>}>
        <Catalog />
      </Suspense>
    </div>
  );
}
