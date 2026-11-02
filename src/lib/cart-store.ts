import { addLine, keyOf, restoreCart, type CartLine, type Variant } from './shop';
type Snapshot = { lines: CartLine[]; ready: boolean; storageError: boolean };
const blank: Snapshot = { lines: [], ready: false, storageError: false };
let current = blank;
const listeners = new Set<() => void>();
const storageKey = 'tihiy-sad-cart-v1';
export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const serverSnapshot = () => blank;
export function cartSnapshot() {
  if (!current.ready) {
    try {
      current = {
        lines: restoreCart(localStorage.getItem(storageKey)),
        ready: true,
        storageError: false,
      };
    } catch {
      current = { lines: [], ready: true, storageError: true };
    }
  }
  return current;
}
function commit(lines: CartLine[]) {
  let storageError = current.storageError;
  try {
    localStorage.setItem(storageKey, JSON.stringify(lines));
  } catch {
    storageError = true;
  }
  current = { lines, ready: true, storageError };
  listeners.forEach((notify) => notify());
}
export const cartActions = {
  add: (v: Variant) => {
    const lines = cartSnapshot().lines;
    if (lines.find((l) => keyOf(l) === keyOf(v))?.quantity === 20) return false;
    commit(addLine(lines, v));
    return true;
  },
  setQuantity: (key: string, q: number) => {
    if (Number.isInteger(q) && q >= 1 && q <= 20)
      commit(cartSnapshot().lines.map((l) => (keyOf(l) === key ? { ...l, quantity: q } : l)));
  },
  remove: (key: string) => commit(cartSnapshot().lines.filter((l) => keyOf(l) !== key)),
  clear: () => commit([]),
};
