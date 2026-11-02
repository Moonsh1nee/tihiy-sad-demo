import { describe, it, expect } from 'vitest';
import { products } from '../src/lib/catalog';
import {
  addLine,
  restoreCart,
  unitPrice,
  subtotal,
  deliveryPrice,
  validateCheckout,
  intervals,
  validVariant,
  type Variant,
  type Checkout,
} from '../src/lib/shop';
const variant: Variant = { productId: '01', size: 'm', wrap: 'paper', card: false };
const valid: Checkout = {
  method: 'delivery',
  interval: intervals[0],
  sender: 'Анна',
  phone: '+7 900 000-00-00',
  recipient: 'Мария',
  recipientPhone: '89000000001',
  address: 'Учебная улица, дом 1',
  message: 'Спасибо!',
  consent: true,
};
describe('product pricing', () => {
  it('calculates sizes and extras in kopecks', () => {
    expect(unitPrice(variant)).toBe(490000);
    expect(unitPrice({ ...variant, size: 's' })).toBe(392000);
    expect(unitPrice({ ...variant, size: 'l', wrap: 'rose', card: true })).toBe(711000);
  });
  it('prices every combination with integers', () => {
    for (const p of products)
      for (const size of ['s', 'm', 'l'] as const)
        for (const wrap of ['paper', 'rose'] as const)
          for (const card of [false, true]) {
            const n = unitPrice({ productId: p.id, size, wrap, card });
            expect(Number.isSafeInteger(n)).toBe(true);
            expect(n).toBeGreaterThan(0);
          }
  });
  it('rejects inherited option names and unknown ids', () => {
    for (const change of [
      { size: 'toString' },
      { wrap: '__proto__' },
      { productId: 'unknown' },
      { card: 'true' },
    ])
      expect(validVariant({ ...variant, ...change })).toBe(false);
  });
});
describe('cart', () => {
  it('merges identical variants only', () => {
    let cart = addLine([], variant);
    cart = addLine(cart, variant);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
    for (const change of [{ size: 's' as const }, { wrap: 'rose' as const }, { card: true }])
      cart = addLine(cart, { ...variant, ...change });
    expect(cart).toHaveLength(4);
  });
  it('caps quantity and rejects fractional or negative quantities', () => {
    expect(addLine(addLine([], variant, 20), variant)[0].quantity).toBe(20);
    expect(addLine([], variant, -1)).toEqual([]);
    expect(addLine([], variant, 1.5)).toEqual([]);
  });
  it('recalculates totals from catalog ignoring injected prices', () => {
    const restored = restoreCart(JSON.stringify([{ ...variant, quantity: 2, price: 1, total: 1 }]));
    expect(restored[0]).not.toHaveProperty('price');
    expect(subtotal(restored)).toBe(980000);
    expect(subtotal(restored) + deliveryPrice('delivery')).toBe(1025000);
    expect(deliveryPrice('pickup')).toBe(0);
  });
  it.each([null, 'broken', '{}', 'null', '123', '[null,"text",{}]'])(
    'handles corrupt storage: %s',
    (raw) => expect(restoreCart(raw)).toEqual([]),
  );
  it('recovers valid entries while discarding malformed ones', () => {
    const good = { ...variant, quantity: 1 };
    expect(
      restoreCart(
        JSON.stringify([
          good,
          { ...good, quantity: 21 },
          { ...good, quantity: 0 },
          { ...good, quantity: 1.5 },
          { ...good, productId: 'missing' },
          { ...good, card: null },
          good,
        ]),
      ),
    ).toEqual([{ ...variant, quantity: 2 }]);
  });
  it('never restores arbitrary properties or personal data', () => {
    expect(
      restoreCart(
        JSON.stringify([{ ...variant, quantity: 1, sender: 'secret', address: 'secret' }]),
      ),
    ).toEqual([{ ...variant, quantity: 1 }]);
  });
});
describe('checkout', () => {
  it('accepts valid delivery and pickup', () => {
    expect(validateCheckout(valid, true)).toEqual({});
    expect(validateCheckout({ ...valid, method: 'pickup', address: '' }, false)).toEqual({});
  });
  it('requires explicit interval, contact details, address and demo acknowledgement', () => {
    const errors = validateCheckout(
      {
        ...valid,
        interval: '',
        sender: ' ',
        phone: '123',
        recipient: '',
        recipientPhone: '',
        address: '',
        consent: false,
      },
      true,
    );
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'interval',
        'sender',
        'phone',
        'recipient',
        'recipientPhone',
        'address',
        'consent',
      ]),
    );
  });
  it('rejects foreign methods, intervals and overlong text', () => {
    expect(
      validateCheckout({ ...valid, method: 'x', interval: 'x', message: 'x'.repeat(301) }, true),
    ).toMatchObject({
      method: expect.any(String),
      interval: expect.any(String),
      message: expect.any(String),
    });
  });
  it.each(['+7 900 000-00-00', '89000000001'])('accepts Russian format %s', (phone) =>
    expect(validateCheckout({ ...valid, phone }, false).phone).toBeUndefined(),
  );
  it.each(['+1 900 000-00-00', '+7abc9000000000', '+790000000000', ''])(
    'rejects invalid phone %s',
    (phone) => expect(validateCheckout({ ...valid, phone }, false).phone).toBeTruthy(),
  );
});
