import { test, expect, type Page } from '@playwright/test';
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/tihiy-sad-demo';
const url = (path = '') => `${base}/${path}`;
const product = url('bouquets/01/');
const variant = { productId: '01', size: 'm', wrap: 'paper', card: false, quantity: 1 };
async function add(page: Page) {
  await page.goto(product);
  await page.getByRole('button', { name: /Добавить в корзину/ }).click();
}
async function fillCheckout(page: Page) {
  await page.getByLabel('Демонстрационный интервал').selectOption({ index: 1 });
  await page.getByLabel('Ваше имя').fill('Тестовая Анна');
  await page.getByLabel('Ваш телефон').fill('+7 900 000-00-00');
  await page.getByLabel('Имя получателя').fill('Тестовая Мария');
  await page.getByLabel('Телефон получателя').fill('+7 900 000-00-01');
  if (await page.getByLabel('Демонстрационный адрес').count())
    await page.getByLabel('Демонстрационный адрес').fill('Учебная улица, дом 1');
  await page.getByRole('checkbox', { name: /Я понимаю/ }).check();
}
test('catalog → variant → persistent cart → validated checkout → demo result', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (e) => failures.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(url('catalog/'));
  await page.getByRole('heading', { name: 'Между строк', exact: true }).getByRole('link').click();
  await expect(page).toHaveURL(new RegExp('/bouquets/01/$'));
  await page.getByRole('radio', { name: /Большой/ }).check();
  await page.getByRole('radio', { name: /Пудровая бумага/ }).check();
  await page.getByRole('checkbox', { name: /Добавить открытку/ }).check();
  await expect(page.locator('.product-price')).toHaveText(/7\s?110/);
  await page.getByRole('button', { name: /Добавить в корзину/ }).click();
  await expect(page.getByRole('status')).toContainText('Букет добавлен');
  await page.getByRole('status').getByRole('link', { name: 'В корзину' }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await page.getByRole('button', { name: /Увеличить количество/ }).click();
  await expect(page.locator('.summary-total')).toContainText(/14\s?220/);
  await page.reload();
  await expect(page.locator('.quantity>span')).toHaveText('2');
  await page.getByRole('link', { name: 'К оформлению' }).click();
  await page.getByRole('button', { name: 'Проверить состав' }).click();
  await expect(page.locator('[aria-invalid=true]').first()).toBeFocused();
  await expect(page.getByText('Выберите демонстрационный интервал', { exact: true })).toBeVisible();
  await fillCheckout(page);
  await page.getByLabel('Текст открытки').fill('Учебное поздравление');
  const raw = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(raw).not.toContain('Тестовая');
  expect(raw).not.toContain('Учебная');
  expect(raw).not.toContain('поздравление');
  await expect(page.locator('.summary-total')).toContainText(/14\s?670/);
  await page.getByRole('button', { name: 'Проверить состав' }).click();
  await expect(page.getByRole('heading', { name: 'Всё верно?' })).toBeFocused();
  await expect(page.locator('.review-content')).toContainText('Учебное поздравление');
  await page.getByRole('button', { name: 'Изменить данные' }).click();
  await expect(page.getByLabel('Ваше имя')).toHaveValue('Тестовая Анна');
  await page.getByRole('button', { name: 'Проверить состав' }).click();
  await page.getByRole('button', { name: 'Завершить демонстрацию' }).click();
  await expect(
    page.getByText('Заказ не отправлен, оплата не списывалась.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.final-receipt')).toContainText(/14\s?670/);
  expect(await page.evaluate(() => localStorage.getItem('tihiy-sad-cart-v1'))).toBe('[]');
  await page.goto(url('cart/'));
  await expect(page.getByRole('heading', { name: 'Здесь скоро что-то расцветёт' })).toBeVisible();
  expect(failures).toEqual([]);
});
test('same variants merge, other variants remain separate; remove and empty', async ({ page }) => {
  await add(page);
  await page.getByRole('button', { name: /Добавить ещё один/ }).click();
  await page.getByRole('radio', { name: /Небольшой/ }).check();
  await page.getByRole('button', { name: /Добавить в корзину/ }).click();
  await page.goto(url('cart/'));
  await expect(page.locator('.cart-line')).toHaveCount(2);
  await expect(page.locator('.quantity>span').first()).toHaveText('2');
  await page
    .getByRole('button', { name: /Уменьшить количество/ })
    .first()
    .click();
  await expect(page.locator('.quantity>span').first()).toHaveText('1');
  await page
    .getByRole('button', { name: /Удалить/ })
    .first()
    .click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await page.getByRole('button', { name: /Удалить/ }).click();
  await expect(page.getByRole('heading', { name: 'Здесь скоро что-то расцветёт' })).toBeVisible();
});
test('price, color, occasion, sort and useful empty filter state', async ({ page }) => {
  await page.goto(url('catalog/'));
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByLabel('Цена', { exact: true }).selectOption('low');
  await page.getByLabel('Оттенок', { exact: true }).selectOption('Винный');
  await expect(page.getByRole('heading', { name: 'Такого сочетания пока нет' })).toBeVisible();
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click();
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByLabel('Повод', { exact: true }).selectOption('Спасибо');
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click();
  await page.getByLabel('Сортировка').selectOption('asc');
  await expect(page.locator('.product-card h3').first()).toHaveText('По дороге домой');
  await page.goto(url('catalog/?occasion=' + encodeURIComponent('Признание')));
  await expect(page.locator('.product-card')).toHaveCount(6);
});
test('pickup excludes delivery charge', async ({ page }) => {
  await add(page);
  await page.goto(url('checkout/'));
  await page.getByRole('radio', { name: /Самовывоз/ }).check();
  await expect(page.getByLabel('Демонстрационный адрес')).toHaveCount(0);
  await expect(page.locator('.summary-total')).toContainText(/4\s?900/);
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Проверить состав' }).click();
  await expect(page.getByText('Учебный пункт выдачи: реальный адрес отсутствует.')).toBeVisible();
  await page.getByRole('button', { name: 'Завершить демонстрацию' }).click();
  await expect(page.locator('.final-receipt')).toContainText(/4\s?900/);
});

test('catalog search, favorites and occasion shortcuts', async ({ page }) => {
  await page.goto(url('catalog/'));
  await page.getByRole('searchbox', { name: 'Поиск букетов' }).fill('каллы');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card h3')).toHaveText('Линия тишины');
  await page.getByRole('button', { name: 'В избранное: Линия тишины', exact: true }).click();
  await page.getByRole('button', { name: 'Очистить поиск', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(12);
  await page.getByRole('heading', { name: 'Линия тишины', exact: true }).getByRole('link').click();
  await expect(page).toHaveURL(new RegExp('/bouquets/08/$'));
  await page
    .getByRole('navigation', { name: 'Хлебные крошки' })
    .getByRole('link', { name: 'Букеты', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Убрать из избранного: Линия тишины', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /^Избранное/ }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Убрать из избранного: Линия тишины', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Сохраните то, что нравится' })).toBeVisible();
  await page.getByRole('button', { name: 'Показать все букеты', exact: true }).click();
  await page.getByRole('button', { name: 'Спасибо', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(6);
  await page.getByRole('button', { name: 'Убрать фильтр: Спасибо', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(12);
});
test('corrupted storage and hostile entries recover safely', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tihiy-sad-cart-v1', '{broken'));
  await page.goto(url('cart/'));
  await expect(page.getByRole('heading', { name: 'Здесь скоро что-то расцветёт' })).toBeVisible();
  await page.evaluate(
    (v) =>
      localStorage.setItem(
        'tihiy-sad-cart-v1',
        JSON.stringify([
          { ...v, price: 1, quantity: 2 },
          { ...v, productId: 'fake' },
          { ...v, quantity: -5 },
        ]),
      ),
    variant,
  );
  await page.context().clearCookies();
  // A fresh page avoids the current in-memory store; no untrusted price is used.
  const fresh = await page.context().newPage();
  // The malformed init script is scoped to the first page, not the context.
  await fresh.goto(url('cart/'));
  await expect(fresh.locator('.cart-line')).toHaveCount(1);
  await expect(fresh.locator('.summary-total')).toContainText(/9\s?800/);
  await fresh.close();
});
test('storage read/write denial preserves in-tab shopping', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', {
      value() {
        throw new DOMException('Denied', 'SecurityError');
      },
    });
    Object.defineProperty(Storage.prototype, 'setItem', {
      value() {
        throw new DOMException('Denied', 'QuotaExceededError');
      },
    });
  });
  await add(page);
  await page.getByRole('link', { name: /Корзина, товаров/ }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await expect(page.getByText(/Браузер не разрешил сохранить корзину/)).toBeVisible();
  await page.getByRole('link', { name: 'К оформлению' }).click();
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Проверить состав' }).click();
  await page.getByRole('button', { name: 'Завершить демонстрацию' }).click();
  await expect(
    page.getByText('Заказ не отправлен, оплата не списывалась.', { exact: true }),
  ).toBeVisible();
});
test('direct nested links, refresh, gallery assets, metadata and 404', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(r.url());
  });
  for (const path of ['bouquets/01/', 'bouquets/07/', 'delivery/', 'workshop/']) {
    const response = await page.goto(url(path));
    expect(response?.status()).toBe(200);
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
    if (path.startsWith('bouquets')) {
      await page.getByRole('button', { name: 'Букет в руках' }).click();
      await expect(page.locator('.gallery-main img')).toHaveAttribute('src', /hands/);
    }
    expect(
      await page
        .locator('img')
        .evaluateAll((images) =>
          images
            .filter((i) => i.getAttribute('loading') !== 'lazy')
            .every(
              (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
            ),
        ),
    ).toBe(true);
  }
  const manifest = await request.get(url('manifest.webmanifest'));
  expect((await manifest.json()).start_url).toBe(base + '/');
  expect(errors).toEqual([]);
  const response = await page.goto(url('missing-page/'));
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /Эта тропинка/ })).toBeVisible();
  await page.getByRole('link', { name: 'Вернуться к букетам' }).click();
  await expect(page).toHaveURL(new RegExp('/catalog/$'));
});
test('320px, long product names, keyboard and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['', 'catalog/', 'bouquets/12/', 'cart/']) {
    await page.goto(url(path));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.goto(url('bouquets/12/'));
  await page.getByRole('button', { name: /Добавить в корзину/ }).click();
  await page.goto(url('cart/'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'К оформлению' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel('Ваше имя').focus();
  await page.keyboard.type('Анна');
  await expect(page.getByLabel('Ваше имя')).toHaveValue('Анна');
  await page.getByRole('button', { name: 'Открыть меню' }).click();
  await page
    .getByRole('navigation', { name: 'Мобильная навигация' })
    .getByRole('link', { name: 'Букеты', exact: true })
    .focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Мобильная навигация' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Открыть меню' })).toBeFocused();
});
