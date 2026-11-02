import type { Metadata } from 'next';
import { Cart } from '@/components/cart';
export const metadata: Metadata = { title: 'Корзина' };
export default function CartPage() {
  return (
    <div className="shell page">
      <p className="breadcrumbs">Главная / Корзина</p>
      <h1>Ваши цветы</h1>
      <Cart />
    </div>
  );
}
