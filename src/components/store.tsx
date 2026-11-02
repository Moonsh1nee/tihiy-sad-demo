'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  useRef,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { basePath, findProduct } from '@/lib/catalog';
import { ShoppingBag, ArrowUpRight, Flower2, Menu, X } from 'lucide-react';
import { type CartLine, type Variant } from '@/lib/shop';
import { subscribe, cartSnapshot, serverSnapshot, cartActions } from '@/lib/cart-store';
type Store = {
  lines: CartLine[];
  ready: boolean;
  storageError: boolean;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  add: (v: Variant) => void;
  setQuantity: (key: string, q: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};
const Context = createContext<Store | null>(null);
export const useStore = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('Missing store');
  return ctx;
};
export function StoreProvider({ children }: { children: ReactNode }) {
  const { lines, ready, storageError } = useSyncExternalStore(
    subscribe,
    cartSnapshot,
    serverSnapshot,
  );
  const [notice, setNotice] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggleFavorite = useCallback((id: string) => {
    if (findProduct(id))
      setFavorites((old) =>
        old.includes(id) ? old.filter((value) => value !== id) : [...old, id],
      );
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(timer);
  }, [notice, lines]);
  const add = useCallback((v: Variant) => {
    setNotice(
      cartActions.add(v)
        ? 'Букет добавлен в корзину'
        : 'В корзине уже 20 таких букетов — это максимум',
    );
  }, []);
  const value: Store = {
    lines,
    ready,
    storageError,
    ...cartActions,
    add,
    favorites,
    toggleFavorite,
  };
  return (
    <Context.Provider value={value}>
      {children}
      <div className="toast" role="status" aria-live="polite">
        {notice && (
          <>
            <span>{notice}</span>
            <Link prefetch={false} href="/cart/" onClick={() => setNotice('')}>
              В корзину <ArrowUpRight size={16} />
            </Link>
            <button aria-label="Закрыть уведомление" onClick={() => setNotice('')}>
              <X size={18} />
            </button>
          </>
        )}
      </div>
    </Context.Provider>
  );
}
export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/' || pathname === basePath + '/' || pathname === basePath;
  const { lines } = useStore(),
    [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  return (
    <>
      <div className="demo-banner">Демо-магазин: заказы и оплата не принимаются</div>
      <header className={`header shell ${isHome ? 'header--home' : ''}`}>
        <Link prefetch={false} href="/" className="brand" aria-label="Тихий сад — главная">
          <Flower2 strokeWidth={1.1} />
          <span>
            тихий сад<small>цветочная мастерская</small>
          </span>
        </Link>
        <nav aria-label="Основная навигация" className="desktop-nav">
          <Link prefetch={false} href="/catalog/">
            Букеты
          </Link>
          <Link prefetch={false} href="/workshop/">
            Мастерская
          </Link>
          <Link prefetch={false} href="/delivery/">
            Доставка и забота
          </Link>
        </nav>
        <div className="header-right">
          <span className="city">Волгоград</span>
          <Link
            prefetch={false}
            className="bag"
            href="/cart/"
            aria-label={`Корзина, товаров: ${count}`}
          >
            <ShoppingBag size={21} />
            <span className="bag-label">Корзина</span>
            <span className="count">{count}</span>
          </Link>
          <button
            ref={menuButton}
            className="menu-toggle"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {open && (
        <nav
          className="mobile-nav"
          aria-label="Мобильная навигация"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              menuButton.current?.focus();
            }
          }}
        >
          {[
            ['/catalog/', 'Букеты'],
            ['/workshop/', 'Мастерская'],
            ['/delivery/', 'Доставка и забота'],
          ].map(([href, label]) => (
            <Link prefetch={false} key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-top">
        <Link prefetch={false} className="brand" href="/">
          <Flower2 strokeWidth={1} />
          <span>
            тихий сад<small>цветы с чувством</small>
          </span>
        </Link>
        <p>
          Красота в простом.
          <br />
          Тепло — в небольших жестах.
        </p>
        <nav aria-label="Навигация в подвале">
          <Link prefetch={false} href="/catalog/">
            Выбрать букет
          </Link>
          <Link prefetch={false} href="/delivery/">
            Доставка и уход
          </Link>
          <Link prefetch={false} href="/workshop/">
            О мастерской
          </Link>
        </nav>
      </div>
      <div className="shell footer-bottom">
        <span>Вымышленная мастерская · Волгоград</span>
        <span>Учебный проект. Фотографии созданы с помощью ИИ.</span>
        <span>© Тихий сад, 2026</span>
      </div>
    </footer>
  );
}
export function StorageNotice() {
  const { storageError } = useStore();
  return storageError ? (
    <p className="note" role="status">
      Браузер не разрешил сохранить корзину. Она работает в этой вкладке до перезагрузки.
    </p>
  ) : null;
}
