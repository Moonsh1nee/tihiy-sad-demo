import { findProduct } from './catalog';
export const sizes = {
  s: { label: 'Небольшой', factor: 80, note: 'примерно на 20% компактнее' },
  m: { label: 'Классический', factor: 100, note: 'как на фотографии' },
  l: { label: 'Большой', factor: 140, note: 'примерно на 40% объёмнее' },
} as const;
export const wraps = {
  paper: { label: 'Молочная бумага', price: 0 },
  rose: { label: 'Пудровая бумага', price: 15000 },
} as const;
export type Variant = {
  productId: string;
  size: keyof typeof sizes;
  wrap: keyof typeof wraps;
  card: boolean;
};
export type CartLine = Variant & { quantity: number };
export const MAX_QUANTITY = 20;
export const keyOf = (v: Variant) => `${v.productId}:${v.size}:${v.wrap}:${v.card}`;
export function validVariant(value: unknown): value is Variant {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productId === 'string' &&
    !!findProduct(v.productId) &&
    typeof v.size === 'string' &&
    Object.hasOwn(sizes, v.size) &&
    typeof v.wrap === 'string' &&
    Object.hasOwn(wraps, v.wrap) &&
    typeof v.card === 'boolean'
  );
}
export function unitPrice(v: Variant): number {
  const p = findProduct(v.productId);
  if (!p || !validVariant(v)) throw new Error('Invalid product variant');
  return (
    Math.round((p.price * sizes[v.size].factor) / 100) + wraps[v.wrap].price + (v.card ? 10000 : 0)
  );
}
export function addLine(lines: CartLine[], v: Variant, quantity = 1): CartLine[] {
  if (!validVariant(v) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY)
    return lines;
  const key = keyOf(v),
    existing = lines.find((l) => keyOf(l) === key);
  return existing
    ? lines.map((l) =>
        keyOf(l) === key ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + quantity) } : l,
      )
    : [...lines, { productId: v.productId, size: v.size, wrap: v.wrap, card: v.card, quantity }];
}
export function restoreCart(raw: string | null): CartLine[] {
  try {
    if (!raw || raw.length > 50000) return [];
    const input: unknown = JSON.parse(raw);
    if (!Array.isArray(input)) return [];
    return input.slice(0, 100).reduce<CartLine[]>((all, item) => {
      if (!validVariant(item)) return all;
      const q = (item as CartLine).quantity;
      return Number.isInteger(q) && q >= 1 && q <= MAX_QUANTITY ? addLine(all, item, q) : all;
    }, []);
  } catch {
    return [];
  }
}
export const subtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + unitPrice(l) * l.quantity, 0);
export const deliveryPrice = (method: string) => (method === 'delivery' ? 45000 : 0);
export const intervals = [
  'Завтра, 10:00–13:00',
  'Завтра, 13:00–16:00',
  'Завтра, 16:00–19:00',
] as const;
export type Checkout = {
  method: string;
  interval: string;
  sender: string;
  phone: string;
  recipient: string;
  recipientPhone: string;
  address: string;
  message: string;
  consent: boolean;
};
export type CheckoutErrors = Partial<Record<keyof Checkout, string>>;
export function validateCheckout(v: Checkout, hasCard: boolean): CheckoutErrors {
  const errors: CheckoutErrors = {};
  if (!['pickup', 'delivery'].includes(v.method)) errors.method = 'Выберите способ получения';
  if (!intervals.includes(v.interval as (typeof intervals)[number]))
    errors.interval = 'Выберите демонстрационный интервал';
  for (const k of ['sender', 'recipient'] as const)
    if (v[k].trim().length < 2 || v[k].trim().length > 80)
      errors[k] = 'Введите имя от 2 до 80 символов';
  for (const k of ['phone', 'recipientPhone'] as const)
    if (
      !/^\+?[\d\s()\-]{10,24}$/.test(v[k]) ||
      v[k].replace(/\D/g, '').length !== 11 ||
      !/[78]/.test(v[k].replace(/\D/g, '')[0])
    )
      errors[k] = 'Введите телефон: +7 и 10 цифр';
  if (v.method === 'delivery' && (v.address.trim().length < 8 || v.address.length > 300))
    errors.address = 'Укажите демонстрационный адрес от 8 до 300 символов';
  if (hasCard && v.message.length > 300) errors.message = 'Не более 300 символов';
  if (!v.consent) errors.consent = 'Подтвердите, что понимаете условия демонстрации';
  return errors;
}
