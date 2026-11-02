'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, Search, X } from 'lucide-react';
import { products, asset } from '@/lib/catalog';
import { ShopCard } from './shop-card';
import { useStore } from './store';

const occasions = ['Просто так', 'Признание', 'Спасибо', 'День рождения'];
const categories = [
  { label: 'Все букеты', value: '', image: '01' },
  { label: 'Просто так', value: 'Просто так', image: '04' },
  { label: 'Признание', value: 'Признание', image: '03' },
  { label: 'Спасибо', value: 'Спасибо', image: '07' },
  { label: 'День рождения', value: 'День рождения', image: '11' },
];
const priceLabels: Record<string, string> = {
  low: 'До 4 000 ₽',
  mid: '4 001–6 000 ₽',
  high: 'Более 6 000 ₽',
};
const normalize = (value: string) => value.toLocaleLowerCase('ru').replaceAll('ё', 'е');

export function Catalog() {
  const { favorites, toggleFavorite } = useStore();
  const params = useSearchParams(),
    initial = params.get('occasion') || '';
  const [occasion, setOccasion] = useState(occasions.includes(initial) ? initial : ''),
    [color, setColor] = useState(''),
    [price, setPrice] = useState(''),
    [sort, setSort] = useState('selected'),
    [query, setQuery] = useState(''),
    [onlyFavorites, setOnlyFavorites] = useState(false);
  const filtered = products
    .filter(
      (p) =>
        (!occasion || p.occasions.includes(occasion)) &&
        (!color || p.color === color) &&
        (!price ||
          (price === 'low'
            ? p.price <= 400000
            : price === 'mid'
              ? p.price > 400000 && p.price <= 600000
              : p.price > 600000)) &&
        (!onlyFavorites || favorites.includes(p.id)) &&
        normalize(`${p.name} ${p.composition} ${p.subtitle} ${p.occasions.join(' ')}`).includes(
          normalize(query.trim()),
        ),
    )
    .sort((a, b) =>
      sort === 'asc'
        ? a.price - b.price
        : sort === 'desc'
          ? b.price - a.price
          : sort === 'name'
            ? a.name.localeCompare(b.name, 'ru')
            : 0,
    );
  const active = !!(occasion || color || price || query || onlyFavorites);
  function reset() {
    setOccasion('');
    setColor('');
    setPrice('');
    setQuery('');
    setOnlyFavorites(false);
  }
  const chips = [
    ...(query ? [{ label: `Поиск: ${query}`, clear: () => setQuery('') }] : []),
    ...(occasion ? [{ label: occasion, clear: () => setOccasion('') }] : []),
    ...(color ? [{ label: color, clear: () => setColor('') }] : []),
    ...(price ? [{ label: priceLabels[price], clear: () => setPrice('') }] : []),
  ];
  return (
    <>
      <div className="catalog-discovery">
        <div className="catalog-categories" aria-label="Букеты по поводу">
          {categories.map((c) => (
            <button
              key={c.label}
              className={`occasion-tile ${occasion === c.value ? 'is-active' : ''}`}
              aria-pressed={occasion === c.value}
              onClick={() => setOccasion(c.value)}
            >
              <span>
                <img src={asset(`/images/${c.image}-400.webp`)} alt="" width={88} height={88} />
              </span>
              {c.label}
            </button>
          ))}
        </div>
        <label className="catalog-search">
          <Search size={19} />
          <input
            aria-label="Поиск букетов"
            name="bouquet-search"
            type="search"
            placeholder="Название или цветы в составе"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
          />
          {query && (
            <button aria-label="Очистить поиск" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      <div className="filter-bar catalog-filters">
        <label>
          <span className="sr-only">Цена</span>
          <select
            name="price"
            aria-label="Цена"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="">Цена</option>
            <option value="low">До 4 000 ₽</option>
            <option value="mid">4 001–6 000 ₽</option>
            <option value="high">Более 6 000 ₽</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Оттенок</span>
          <select
            name="color"
            aria-label="Оттенок"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="">Цвет букета</option>
            {['Розовый', 'Белый', 'Винный', 'Жёлтый', 'Сиреневый', 'Персиковый'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Повод</span>
          <select
            name="occasion"
            aria-label="Повод"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
          >
            <option value="">Повод</option>
            {occasions.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button
          className={`favorites-filter ${onlyFavorites ? 'is-active' : ''}`}
          aria-pressed={onlyFavorites}
          onClick={() => setOnlyFavorites(!onlyFavorites)}
        >
          <Heart size={16} fill={onlyFavorites ? 'currentColor' : 'none'} />
          Избранное{favorites.length > 0 && <span>{favorites.length}</span>}
        </button>
        <label className="sort">
          <span className="sr-only">Сортировка</span>
          <select
            name="sort"
            aria-label="Сортировка"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="selected">Выбор мастерской</option>
            <option value="asc">Сначала дешевле</option>
            <option value="desc">Сначала дороже</option>
            <option value="name">По названию</option>
          </select>
        </label>
      </div>
      <div className="results-line">
        <span aria-live="polite">Найдено букетов: {filtered.length}</span>
        <div className="active-filters">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={chip.clear}
              aria-label={`Убрать фильтр: ${chip.label}`}
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
        </div>
        {active && (
          <button className="reset" onClick={reset}>
            Сбросить фильтры <X size={14} />
          </button>
        )}
      </div>
      {onlyFavorites && (
        <p className="favorites-note">Избранное доступно до перезагрузки страницы.</p>
      )}
      {filtered.length ? (
        <div className="product-grid catalog-grid">
          {filtered.map((p, i) => (
            <ShopCard
              key={p.id}
              product={p}
              priority={i < 4}
              favorite={favorites.includes(p.id)}
              onFavorite={() => toggleFavorite(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          {onlyFavorites && !favorites.length ? (
            <>
              <Heart size={35} strokeWidth={1} />
              <h2>Сохраните то, что нравится</h2>
              <p>Нажмите на сердечко рядом с букетом, чтобы вернуться к нему во время выбора.</p>
            </>
          ) : (
            <>
              <h2>Такого сочетания пока нет</h2>
              <p>Попробуйте другой оттенок, название или расширьте диапазон цены.</p>
            </>
          )}
          <button className="button" onClick={reset}>
            Показать все букеты
          </button>
        </div>
      )}
      <p className="catalog-note">
        На фотографиях — классический размер. В карточке можно выбрать объём, упаковку и открытку.
      </p>
    </>
  );
}
