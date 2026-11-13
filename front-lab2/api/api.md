запуск:
npx json-server --watch api/db.json --port 3000 --static api/public

Статика 
http://localhost:3000/images/Bosch_TWK3A011.png

Запросы:

# Каталог — все товары
GET /products

# Фильтр по категории
GET /products?category=kettle

# Полнотекстовый поиск (title, description, brand, …)
GET /products?q=bosch

# Комбинация: категория + поиск + диапазон цены
GET /products?category=kettle&price_gte=2500&price_lte=4000&q=tefal

# Фильтр по рейтингу (для «рекомендаций» на главной)
GET /products?rating_gte=4.5

# Сортировка по цене / рейтингу
GET /products?_sort=price&_order=asc
GET /products?_sort=rating&_order=desc

# Пагинация (если захотите)
GET /products?_page=1&_limit=8

# Страница товара — с отзывами через _embed
GET /products/1?_embed=reviews

# Если открыли /product/5 без отзывов, но нужны отдельно:
GET /reviews?productId=5

POST /reviews
Content-Type: application/json

{
  "productId": 1,
  "author": "test_user",
  "rating": 5,
  "text": "Отличный чайник",
  "date": "2026-10-30"
}

