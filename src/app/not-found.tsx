import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="shell empty page">
      <p className="eyebrow">404</p>
      <h1>
        Эта тропинка
        <br />
        никуда не ведёт
      </h1>
      <p>Но в саду ещё много красивого.</p>
      <Link prefetch={false} href="/catalog/" className="button">
        Вернуться к букетам
      </Link>
    </div>
  );
}
