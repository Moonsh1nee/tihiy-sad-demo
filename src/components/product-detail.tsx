'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { type Product, products, money } from '@/lib/catalog';
import { sizes, wraps, unitPrice, type Variant } from '@/lib/shop';
import { useStore, StorageNotice } from './store';
import { ProductImage, ProductCard } from './product-card';
export function ProductDetail({ product: p }: { product: Product }) {
  const [size, setSize] = useState<Variant['size']>('m'),
    [wrap, setWrap] = useState<Variant['wrap']>('paper'),
    [card, setCard] = useState(false),
    [photo, setPhoto] = useState(p.id),
    [added, setAdded] = useState(false);
  const { add, ready } = useStore();
  const variant = { productId: p.id, size, wrap, card },
    price = unitPrice(variant);
  const gallery = [p.id, ...(p.gallery || [])];
  return (
    <div className="shell page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки">
        <Link prefetch={false} href="/">
          Главная
        </Link>{' '}
        /{' '}
        <Link prefetch={false} href="/catalog/">
          Букеты
        </Link>{' '}
        / {p.name}
      </nav>
      <div className="product-detail">
        <div className="gallery">
          <div className="gallery-main">
            <ProductImage
              id={photo}
              name={`${p.name}, ${photo.includes('hands') ? 'букет в руках для понимания масштаба' : photo.includes('side') ? 'вид сбоку' : p.composition}`}
              priority
              sizes="(max-width: 600px) 92vw, 48vw"
            />
          </div>
          {gallery.length > 1 && (
            <div className="gallery-thumbs" aria-label="Фотографии букета">
              {gallery.map((id, i) => (
                <button
                  key={id}
                  className={photo === id ? 'selected' : ''}
                  aria-label={['Основное фото', 'Вид сбоку', 'Букет в руках'][i]}
                  aria-pressed={photo === id}
                  onClick={() => setPhoto(id)}
                >
                  <ProductImage
                    id={id}
                    name={['Основное фото', 'Вид сбоку', 'Букет в руках'][i]}
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
          <p className="image-note">
            На фото — классический размер и молочная упаковка. Другие варианты показаны условно:
            цвет бумаги и объём изменятся.
          </p>
        </div>
        <div className="product-options">
          <p className="eyebrow">{p.subtitle}</p>
          <h1>{p.name}</h1>
          <p className="detail-description">{p.description}</p>
          <p className="product-price" aria-live="polite">
            {money(price)}
          </p>
          <fieldset>
            <legend>Размер букета</legend>
            <div className="size-options">
              {Object.entries(sizes).map(([key, v]) => (
                <label key={key} className={size === key ? 'option selected' : 'option'}>
                  <input
                    type="radio"
                    name="size"
                    value={key}
                    checked={size === key}
                    onChange={() => {
                      setSize(key as Variant['size']);
                      setAdded(false);
                    }}
                  />
                  <span>{v.label}</span>
                  <small>{key === 's' ? 'S' : key === 'm' ? 'M' : 'L'}</small>
                </label>
              ))}
            </div>
            <p className="field-hint">
              {size === 'm' ? `Ориентировочно ${p.dimensions}.` : sizes[size].note + '.'} Размеры
              зависят от раскрытия цветов.
            </p>
          </fieldset>
          <fieldset>
            <legend>Упаковка</legend>
            <div className="wrap-options">
              {Object.entries(wraps).map(([key, v]) => (
                <label key={key} className={wrap === key ? 'wrap-option selected' : 'wrap-option'}>
                  <input
                    type="radio"
                    name="wrap"
                    checked={wrap === key}
                    onChange={() => {
                      setWrap(key as Variant['wrap']);
                      setAdded(false);
                    }}
                  />
                  <span className={`swatch ${key}`} />
                  <span>
                    {v.label}
                    <small>{v.price ? `+ ${money(v.price)}` : 'Включена'}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="checkbox card-choice">
            <input
              type="checkbox"
              checked={card}
              onChange={(e) => {
                setCard(e.target.checked);
                setAdded(false);
              }}
            />
            <span>
              Добавить открытку <small>Ваши слова при оформлении</small>
            </span>
            <span>+ {money(10000)}</span>
          </label>
          <div className="buy-action">
            <button
              className="button"
              disabled={!ready}
              onClick={() => {
                add(variant);
                setAdded(true);
              }}
            >
              {added ? <Check size={19} /> : <ShoppingBag size={19} />}{' '}
              {added ? 'Добавить ещё один' : 'Добавить в корзину'}
              <span>{money(price)}</span>
            </button>
            {added && (
              <Link prefetch={false} className="text-link added-link" href="/cart/">
                Перейти в корзину <ArrowUpRight size={18} />
              </Link>
            )}
          </div>
          <StorageNotice />
          <div className="product-info">
            <details open>
              <summary>Состав и характер</summary>
              <p>
                {p.composition}. Состав примерный. Генерированная фотография показывает настроение и
                основные цветы.
              </p>
            </details>
            <details>
              <summary>Сезонные замены</summary>
              <p>
                В реальной флористике оттенок и сорт зависят от сезона. Мастерская должна заранее
                согласовать замены с клиентом, сохраняя палитру и стоимость. Здесь показан
                демонстрационный сценарий.
              </p>
            </details>
            <details>
              <summary>Получение и забота</summary>
              <p>
                В демо можно выбрать самовывоз или доставку за 450 ₽. Реального пункта выдачи и
                доставки нет.{' '}
                <Link prefetch={false} href="/delivery/">
                  Подробнее об условиях и уходе.
                </Link>
              </p>
            </details>
          </div>
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>В другом настроении</h2>
          <Link prefetch={false} href="/catalog/" className="text-link">
            Все букеты <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((v) => v.id !== p.id)
            .slice(0, 3)
            .map((v) => (
              <ProductCard product={v} key={v.id} />
            ))}
        </div>
      </section>
    </div>
  );
}
