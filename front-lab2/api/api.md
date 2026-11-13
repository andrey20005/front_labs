# API — json-server 1.0.0-beta.15

Запуск:

```sh
npx json-server@1.0.0-beta.15 api/db.json --port 3000 --static api/public
```

Флаг `--watch` больше не нужен: json-server 1+ сам отслеживает изменения файла.

Статика:

```text
http://localhost:3000/images/Bosch_TWK3A011.png
```

## Товары

```text
# Все товары
GET /products

# Поиск по названию (подстрока)
GET /products?title:contains=bosch

# Фильтр по одной категории
GET /products?category=kettle

# Несколько категорий
GET /products?category:in=kettle,toaster

# Несколько брендов
GET /products?brand:in=Bosch,Tefal

# Только товары в наличии
GET /products?inStock=true

# Диапазон цены
GET /products?price_gte=2500&price_lte=4000

# Фильтр по рейтингу (для «рекомендаций» на главной)
GET /products?rating_gte=4.5

# Комбинация: категории + бренды + поиск + цена + рейтинг
GET /products?category:in=kettle,toaster&brand:in=Bosch,Tefal&title:contains=tefal&price_gte=2000&price_lte=4000&rating_gte=4.2

# Сортировка по цене / рейтингу
GET /products?_sort=price
GET /products?_sort=-price
GET /products?_sort=-rating

# Пагинация
GET /products?_page=1&_per_page=8
```

При пагинации ответ приходит объектом:

```json
{
  "first": 1,
  "prev": null,
  "next": 2,
  "last": 2,
  "pages": 2,
  "items": 12,
  "data": []
}
```

## Страница товара

```text
# Товар
GET /products/1

# Отзывы товара
GET /reviews?productId=1
```

## Добавление отзыва

```text
POST /reviews
Content-Type: application/json

{
  "productId": 1,
  "author": "test_user",
  "rating": 5,
  "text": "Отличный чайник",
  "date": "2026-10-30"
}
```
