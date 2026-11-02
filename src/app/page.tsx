import Link from 'next/link';
import { ArrowUpRight, Sprout, Package, Flower2 } from 'lucide-react';
import { products, money, asset } from '@/lib/catalog';
import { ProductCard, ProductImage } from '@/components/product-card';
export default function Home() {
  return (
    <>
      <section className="hero-immersive" aria-labelledby="hero-title">
        <picture className="hero-backdrop">
          <source
            media="(max-width: 600px)"
            srcSet={`${asset('/images/01-640.webp')} 640w, ${asset('/images/01-1120.webp')} 1120w`}
            sizes="100vw"
          />
          <img
            src={asset('/images/hero-v3-1440.webp')}
            srcSet={`${asset('/images/hero-v3-960.webp')} 960w, ${asset('/images/hero-v3-1440.webp')} 1440w, ${asset('/images/hero-v3-1600.webp')} 1600w`}
            sizes="100vw"
            width={1600}
            height={900}
            alt="Пудровые розы, винная скабиоза и эвкалипт в выразительном авторском букете"
            fetchPriority="high"
            loading="eager"
          />
        </picture>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-stage shell">
          <div className="hero-message">
            <p className="hero-kicker">Цветочная мастерская · Волгоград</p>
            <h1 id="hero-title">
              Цветы для того,
              <br />
              что трудно сказать
              <br />
              словами.
            </h1>
            <p className="hero-intro">
              Для важных встреч.
              <br />
              Для обычных вторников. Для вас.
            </p>
            <Link prefetch={false} href="/catalog/" className="hero-cta">
              <span>Выбрать букет</span>
              <span className="hero-cta-icon" aria-hidden="true">
                <ArrowUpRight size={23} strokeWidth={1.5} />
              </span>
            </Link>
          </div>
          <div className="hero-bottom">
            <p>
              Живые цветы. Свободные формы.
              <br />И немного нежности.
            </p>
            <Link prefetch={false} className="hero-featured" href="/bouquets/01/">
              <span>
                Букет на фотографии<strong>«Между строк»</strong>
              </span>
              <span>
                {money(products[0].price)}
                <ArrowUpRight size={21} />
              </span>
            </Link>
          </div>
        </div>
      </section>
      <div className="brand-strip">
        <span>Сезонные цветы</span>
        <Flower2 size={19} />
        <span>Свободные формы</span>
        <Flower2 size={19} />
        <span>Внимание к деталям</span>
        <Flower2 size={19} />
        <span>Повод — быть рядом</span>
      </div>
      <section className="home-featured">
        <div className="section shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Выбор мастерской</p>
              <h2>На языке цветов</h2>
            </div>
            <Link prefetch={false} className="text-link" href="/catalog/">
              Все букеты <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="product-grid featured">
            {[products[0], products[3], products[2]].map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="mood-section">
        <div className="shell mood-inner">
          <div>
            <p className="eyebrow">Не обязательно искать повод</p>
            <h2>Какое у вас сегодня чувство?</h2>
            <p>
              Иногда букет говорит точнее.
              <br />
              Начните с того, что хочется передать.
            </p>
          </div>
          <div className="mood-links">
            {[
              ['Просто так', 'Порадовать без причины'],
              ['Признание', 'Сказать самое важное'],
              ['Спасибо', 'Обнять на расстоянии'],
              ['День рождения', 'Отметить чей-то день'],
            ].map(([occasion, caption]) => (
              <Link
                prefetch={false}
                key={occasion}
                href={`/catalog/?occasion=${encodeURIComponent(occasion)}`}
              >
                <div>
                  <span>{occasion}</span>
                  <small>{caption}</small>
                </div>
                <ArrowUpRight strokeWidth={1.2} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section shell workshop-teaser">
        <div className="workshop-photo">
          <ProductImage id="07" name="Персиковые розы и гвоздики в естественном свете" />
        </div>
        <div className="workshop-copy">
          <p className="eyebrow">Всё начинается с цветка</p>
          <h2>
            Не по шаблону.
            <br />
            По чувству.
          </h2>
          <p>
            Нам близки живые линии, неожиданные сочетания и красота, в которой есть воздух. В каждом
            букете — свой ритм, своя маленькая история.
          </p>
          <p>
            «Тихий сад» — вымышленная мастерская. Здесь можно примерить на себя роль покупателя и
            пройти весь путь выбора цветов.
          </p>
          <Link prefetch={false} className="text-link" href="/workshop/">
            Заглянуть в мастерскую <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="shell care-grid">
        <div>
          <Sprout />
          <h3>Живой характер</h3>
          <p>
            Сезонный состав и свободные формы. Возможные замены в реальном заказе согласуют заранее.
          </p>
        </div>
        <div>
          <Package />
          <h3>Бережная упаковка</h3>
          <p>Молочная или пудровая бумага, открытые стебли и открытка с вашими словами.</p>
        </div>
        <div>
          <Flower2 />
          <h3>Забота после встречи</h3>
          <p>
            Свежая вода, чистая ваза и немного внимания.{' '}
            <Link prefetch={false} href="/delivery/#care">
              Рассказываем об уходе.
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
