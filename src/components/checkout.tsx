'use client';
import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Check, ArrowUpRight } from 'lucide-react';
import { money, findProduct } from '@/lib/catalog';
import {
  subtotal,
  deliveryPrice,
  unitPrice,
  intervals,
  validateCheckout,
  type Checkout,
  type CheckoutErrors,
  type CartLine,
} from '@/lib/shop';
import { useStore, StorageNotice } from './store';
import { EmptyCart, LineDescription } from './cart';
const initial: Checkout = {
  method: 'delivery',
  interval: '',
  sender: '',
  phone: '',
  recipient: '',
  recipientPhone: '',
  address: '',
  message: '',
  consent: false,
};
export function CheckoutForm() {
  const { lines, ready, clear } = useStore(),
    [form, setForm] = useState<Checkout>(initial),
    [errors, setErrors] = useState<CheckoutErrors>({}),
    [step, setStep] = useState<'form' | 'review' | 'done'>('form'),
    [snapshot, setSnapshot] = useState<CartLine[]>([]),
    [finalTotal, setFinalTotal] = useState(0);
  const formRef = useRef<HTMLFormElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const hasCard = lines.some((l) => l.card),
    shipping = deliveryPrice(form.method),
    total = subtotal(lines) + shipping;
  function update<K extends keyof Checkout>(key: K, value: Checkout[K]) {
    setForm((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: undefined }));
  }
  function move(next: typeof step) {
    setStep(next);
    requestAnimationFrame(() => {
      heading.current?.focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const next = validateCheckout(form, hasCard);
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setSnapshot(lines.map((l) => ({ ...l })));
    move('review');
  }
  function finish() {
    setFinalTotal(subtotal(snapshot) + deliveryPrice(form.method));
    clear();
    setForm(initial);
    move('done');
  }
  if (!ready) return <p role="status">Открываем оформление…</p>;
  if (step === 'done')
    return (
      <div className="completion">
        <div className="completion-mark">
          <Check strokeWidth={1} />
        </div>
        <p className="eyebrow">Спасибо, что заглянули</p>
        <h1 ref={heading} tabIndex={-1}>
          Демонстрация
          <br />
          завершена.
        </h1>
        <p className="completion-result" role="status">
          Заказ не отправлен, оплата не списывалась.
        </p>
        <p>Вы прошли путь от первого цветка до готовой подборки.</p>
        <div className="final-receipt">
          <h2>Ваш демонстрационный выбор</h2>
          {snapshot.map((l, i) => (
            <p key={i}>
              {findProduct(l.productId)?.name} × {l.quantity}
              <strong>{money(unitPrice(l) * l.quantity)}</strong>
            </p>
          ))}
          <p className="summary-total">
            Итог с получением<strong>{money(finalTotal)}</strong>
          </p>
        </div>
        <p className="field-hint">
          Введённые имена, телефоны, адрес и текст открытки удалены из формы. Корзина очищена.
        </p>
        <Link prefetch={false} className="button" href="/catalog/">
          Вернуться к цветам <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  if (!lines.length)
    return (
      <>
        <h1>Оформление</h1>
        <EmptyCart />
      </>
    );
  const field = (
    key: 'sender' | 'phone' | 'recipient' | 'recipientPhone' | 'address',
    label: string,
    placeholder: string,
    type = 'text',
  ) => (
    <label className={`form-field ${key === 'address' ? 'full' : ''}`}>
      <span>{label} *</span>
      <input
        name={key}
        type={type}
        inputMode={type === 'tel' ? 'tel' : undefined}
        autoComplete="off"
        aria-required="true"
        value={form[key]}
        maxLength={key === 'address' ? 300 : type === 'tel' ? 24 : 80}
        placeholder={placeholder}
        onChange={(e) => update(key, e.target.value)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `error-${key}` : undefined}
      />
      {errors[key] && (
        <small id={`error-${key}`} className="error">
          {errors[key]}
        </small>
      )}
    </label>
  );
  return (
    <>
      <h1 ref={heading} tabIndex={-1}>
        {step === 'review' ? 'Всё верно?' : 'Пусть день расцветёт'}
      </h1>
      <p className="checkout-intro">
        {step === 'review'
          ? 'Проверьте состав и демонстрационную стоимость перед завершением.'
          : 'Демонстрационное оформление. Используйте вымышленные данные.'}
      </p>
      <div className="steps">
        <span className={step === 'form' ? 'current' : ''}>1. Данные и получение</span>
        <span className={step === 'review' ? 'current' : ''}>2. Проверка</span>
        <span>3. Демо-итог</span>
      </div>
      <StorageNotice />
      {step === 'review' ? (
        <div className="cart-layout">
          <div className="review-content">
            <h2>Получение</h2>
            <p>
              {form.method === 'delivery'
                ? 'Демонстрационная доставка'
                : 'Демонстрационный самовывоз'}{' '}
              · {form.interval}
            </p>
            {form.method === 'delivery' ? (
              <p>{form.address}</p>
            ) : (
              <p>Учебный пункт выдачи: реальный адрес отсутствует.</p>
            )}
            <h2>Отправитель и получатель</h2>
            <p>
              Отправитель: {form.sender}, {form.phone}
              <br />
              Получатель: {form.recipient}, {form.recipientPhone}
            </p>
            {hasCard && (
              <>
                <h2>Открытка</h2>
                <p className="card-message">
                  {form.message || 'Без текста — оставим место для ваших слов.'}
                </p>
                <p className="field-hint">Текст будет одинаковым для всех выбранных открыток.</p>
              </>
            )}
            <button className="button secondary" onClick={() => move('form')}>
              Изменить данные
            </button>
          </div>
          <aside className="order-summary">
            <OrderItems lines={snapshot} />
            <div className="summary-row">
              <span>{form.method === 'delivery' ? 'Доставка' : 'Самовывоз'}</span>
              <span>{money(shipping)}</span>
            </div>
            <div className="summary-total">
              <span>Итого</span>
              <strong>{money(subtotal(snapshot) + shipping)}</strong>
            </div>
            <p className="note">
              Это финальный шаг демонстрации. Ничего не отправляется и не оплачивается.
            </p>
            <button className="button" onClick={finish}>
              Завершить демонстрацию <Check size={18} />
            </button>
          </aside>
        </div>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate className="cart-layout">
          <div className="checkout-fields">
            <fieldset>
              <legend>Как получить цветы</legend>
              <div className="delivery-options">
                {[
                  ['delivery', 'Доставка', '450 ₽ · учебный тариф'],
                  ['pickup', 'Самовывоз', 'Бесплатно · учебный пункт'],
                ].map(([key, title, desc]) => (
                  <label
                    key={key}
                    className={form.method === key ? 'delivery-option selected' : 'delivery-option'}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={key}
                      checked={form.method === key}
                      onChange={() => update('method', key)}
                    />
                    <span>
                      {title}
                      <small>{desc}</small>
                    </span>
                  </label>
                ))}
              </div>
              <p className="field-hint">
                Реальная доставка и пункт выдачи отсутствуют. Интервалы приведены для примера,
                бронирования нет.
              </p>
              <label className="form-field">
                <span>Демонстрационный интервал *</span>
                <select
                  name="interval"
                  aria-required="true"
                  value={form.interval}
                  onChange={(e) => update('interval', e.target.value)}
                  aria-invalid={!!errors.interval}
                  aria-describedby={errors.interval ? 'error-interval' : undefined}
                >
                  <option value="">Выберите время</option>
                  {intervals.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
                {errors.interval && (
                  <small className="error" id="error-interval">
                    {errors.interval}
                  </small>
                )}
              </label>
            </fieldset>
            <fieldset>
              <legend>Кто дарит</legend>
              <div className="form-grid">
                {field('sender', 'Ваше имя', 'Например, Анна')}
                {field('phone', 'Ваш телефон', '+7 900 000-00-00', 'tel')}
              </div>
            </fieldset>
            <fieldset>
              <legend>Кому дарим</legend>
              <div className="form-grid">
                {field('recipient', 'Имя получателя', 'Например, Мария')}
                {field('recipientPhone', 'Телефон получателя', '+7 900 000-00-01', 'tel')}
                {form.method === 'delivery' &&
                  field(
                    'address',
                    'Демонстрационный адрес',
                    'Улица, дом, квартира — вымышленные данные',
                  )}
              </div>
            </fieldset>
            {hasCard && (
              <fieldset>
                <legend>Несколько тёплых слов</legend>
                <label className="form-field">
                  <span>Текст открытки</span>
                  <textarea
                    name="message"
                    rows={4}
                    maxLength={300}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="То самое, что хочется сказать"
                    aria-invalid={!!errors.message}
                  />
                  <small>{form.message.length} / 300 · Для всех открыток в заказе</small>
                </label>
              </fieldset>
            )}
            <label className="checkbox consent">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update('consent', e.target.checked)}
                aria-invalid={!!errors.consent}
                aria-required="true"
                aria-describedby={errors.consent ? 'consent-help' : undefined}
              />
              <span>
                Я понимаю, что это демо: заказ не будет отправлен и оплата не потребуется. *
              </span>
            </label>
            {errors.consent && (
              <p id="consent-help" className="error">
                {errors.consent}
              </p>
            )}
            <p className="field-hint">
              Поля с * обязательны. Данные формы не отправляются на сервер и не сохраняются в
              браузере. Аналитика не подключена.
            </p>
          </div>
          <aside className="order-summary">
            <OrderItems lines={lines} />
            <div className="summary-row">
              <span>{form.method === 'delivery' ? 'Доставка' : 'Самовывоз'}</span>
              <span>{money(shipping)}</span>
            </div>
            <div className="summary-total">
              <span>Итого</span>
              <strong aria-live="polite">{money(total)}</strong>
            </div>
            <button className="button" type="submit">
              Проверить состав <ArrowUpRight size={18} />
            </button>
            <Link prefetch={false} href="/cart/" className="back-cart">
              Вернуться в корзину
            </Link>
          </aside>
        </form>
      )}
    </>
  );
}
function OrderItems({ lines }: { lines: CartLine[] }) {
  return (
    <>
      <h2>Ваши цветы</h2>
      <div className="order-items">
        {lines.map((l, i) => (
          <div key={i}>
            <p>
              <strong>{findProduct(l.productId)?.name}</strong>
              <span>× {l.quantity}</span>
            </p>
            <small>
              <LineDescription line={l} />
            </small>
            <p>{money(unitPrice(l) * l.quantity)}</p>
          </div>
        ))}
      </div>
    </>
  );
}
