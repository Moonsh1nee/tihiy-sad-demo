import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout';
export const metadata: Metadata = { title: 'Демонстрационное оформление' };
export default function CheckoutPage() {
  return (
    <div className="shell page checkout-page">
      <p className="breadcrumbs">Корзина / Оформление</p>
      <CheckoutForm />
    </div>
  );
}
