'use client';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowUpRight, Flower2 } from 'lucide-react';
import { findProduct, money } from '@/lib/catalog';
import { keyOf, sizes, wraps, unitPrice, subtotal, type CartLine } from '@/lib/shop';
import { useStore, StorageNotice } from './store';
import { ProductImage } from './product-card';
export function LineDescription({ line: l }: { line: CartLine }) {
  return (
    <span>
      {sizes[l.size].label} · {wraps[l.wrap].label}
      {l.card ? ' · С открыткой' : ''}
    </span>
  );
}
export function EmptyCart() {
  return (
    <div className="empty">
      <Flower2 strokeWidth={1} size={48} />
      <h2>Здесь скоро что-то расцветёт</h2>
      <p>
        Выберите букет для близкого человека.
        <br />
        Или порадуйте себя без повода.
      </p>
      <Link prefetch={false} className="button" href="/catalog/">
        Выбрать букет <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}
export function Cart() {
  const { lines, ready, setQuantity, remove } = useStore();
  if (!ready) return <p role="status">Открываем корзину…</p>;
  if (!lines.length)
    return (
      <>
        <StorageNotice />
        <EmptyCart />
      </>
    );
  return (
    <>
      <StorageNotice />
      <div className="cart-layout">
        <div className="cart-lines">
          {lines.map((l) => {
            const p = findProduct(l.productId)!,
              key = keyOf(l);
            return (
              <article className="cart-line" key={key}>
                <Link prefetch={false} className="cart-image" href={`/bouquets/${p.id}/`}>
                  <ProductImage id={p.id} name={p.name} sizes="114px" />
                </Link>
                <div className="cart-line-info">
                  <h2>
                    <Link prefetch={false} href={`/bouquets/${p.id}/`}>
                      {p.name}
                    </Link>
                  </h2>
                  <p>
                    <LineDescription line={l} />
                  </p>
                  <p className="unit">{money(unitPrice(l))} за букет</p>
                  <div className="quantity">
                    <button
                      aria-label={`Уменьшить количество ${p.name}`}
                      disabled={l.quantity <= 1}
                      onClick={() => setQuantity(key, l.quantity - 1)}
                    >
                      <Minus size={15} />
                    </button>
                    <span aria-live="polite">{l.quantity}</span>
                    <button
                      aria-label={`Увеличить количество ${p.name}`}
                      disabled={l.quantity >= 20}
                      onClick={() => setQuantity(key, l.quantity + 1)}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
                <div className="line-total">
                  <strong>{money(unitPrice(l) * l.quantity)}</strong>
                  <button
                    className="remove"
                    aria-label={`Удалить ${p.name}`}
                    onClick={() => remove(key)}
                  >
                    <Trash2 size={16} />
                    <span>Убрать</span>
                  </button>
                </div>
              </article>
            );
          })}
          <Link prefetch={false} className="text-link" href="/catalog/">
            Добавить ещё цветов <ArrowUpRight size={17} />
          </Link>
        </div>
        <aside className="order-summary">
          <p className="eyebrow">Почти у вас</p>
          <h2>Ваша подборка</h2>
          <div className="summary-row">
            <span>Букеты ({lines.reduce((s, l) => s + l.quantity, 0)})</span>
            <span>{money(subtotal(lines))}</span>
          </div>
          <p className="field-hint">
            Доставка рассчитывается на следующем шаге. Самовывоз в демо — бесплатно.
          </p>
          <div className="summary-total">
            <span>Итого</span>
            <strong>{money(subtotal(lines))}</strong>
          </div>
          <Link prefetch={false} className="button" href="/checkout/">
            К оформлению <ArrowUpRight size={18} />
          </Link>
          <p className="field-hint">
            Это демонстрация. Заказ не будет отправлен, оплата не потребуется.
          </p>
        </aside>
      </div>
    </>
  );
}
