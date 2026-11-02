# Фотографии

## Обновлённый первый экран

Текущая версия после новых референсов: `public/images/hero-v3-{960,1440,1600}.webp`, WebP quality 85. Создана встроенным ImageGen с собственным кадром 01 как reference. Промпт: wide landscape 16:9 luxury editorial florist photograph; preserve blush garden roses, wine scabiosa, mauve lisianthus, eucalyptus, ivory paper; large bouquet on right 45%; luminous pale blush pink plaster room, soft sunny morning, diagonal window shadows; empty light left 50% for dark burgundy headline, pink marble table; no dark background, lettering, logos, collage or UI. На телефоне используется вертикальное фото 01 со светлым переходом к тексту. Исходный PNG генератора не нужен для сборки: оптимизированные файлы находятся в проекте.

По замечаниям к дизайну создан дополнительный горизонтальный кадр встроенным ImageGen с букетом 01 как reference: тот же состав, букет справа на пыльно-розовом каменном постаменте, спокойная сливовая стена слева под светлый текст, естественный боковой свет, формат 16:9, без надписей. Готовые ресурсы: `public/images/hero-v2-{960,1440,1600}.webp`. На телефоне используется исходный вертикальный кадр 01 с адаптивным затемнением под текст. Декоративная круглая надпись убрана.

Серия создана встроенным ImageGen для этого проекта. Итоговые изображения находятся в `public/images/`: 12 основных фотографий, 4 дополнительных ракурса, Open Graph. Внешние ссылки не используются. Все варианты 400, 640 и 1120 px предварительно оптимизированы в WebP с quality 83. Сборке не нужны исходные PNG, API-ключи или генератор.

Общая инструкция генерации: photorealistic editorial flower shop catalog photograph; botanically accurate fresh flowers; artisanal hand-tied bouquet, exposed stems, matte ivory paper; entire bouquet visible; soft daylight from left; muted dusty rose plaster wall and pale stone table; natural shadows; medium format film texture; vertical 4:5; no lettering, collage or watermark.

| ID  | Индивидуальное содержание промпта                                                     |
| --- | ------------------------------------------------------------------------------------- |
| 01  | Airy asymmetrical blush garden roses, burgundy scabiosa, mauve lisianthus, eucalyptus |
| 02  | White tulips and delicate green viburnum, loose sculptural bouquet                    |
| 03  | Deep burgundy dahlias, pink garden roses, eucalyptus, generous rounded bouquet        |
| 04  | White chamomile daisies, pale yellow spray roses, meadow grasses, small airy bouquet  |
| 05  | Purple irises, lavender lisianthus, delicate green branches                           |
| 06  | White hydrangea, ivory roses, eucalyptus, abundant cream bouquet                      |
| 07  | Peach roses, apricot carnations, eucalyptus                                           |
| 08  | White calla lilies, long green leaves, minimal sculptural bouquet                     |
| 09  | Dusty pink carnations, mauve lisianthus, eucalyptus                                   |
| 10  | Yellow tulips and white chamomile daisies                                             |
| 11  | Pink hydrangea, burgundy dahlias, blush roses, large dramatic bouquet                 |
| 12  | White lisianthus, pale pink roses, meadow grasses, elongated silhouette               |

Дополнительные кадры 01 и 07 создавались с основным изображением как reference: сохранить состав, цвета и молочную упаковку; вид под 45° и букет в руках человека в молочной льняной блузе (лицо вне кадра), тот же свет и фон. Масштаб на снимках иллюстративный. Размеры в каталоге ориентировочные, численность цветов не обещается.

Для повторной локальной оптимизации можно передать JSON-словарь `ID: абсолютный путь к PNG` в `node scripts/prepare-assets.mjs путь-к-файлу.json`. Генерация не входит в deploy и не запускается автоматически.
