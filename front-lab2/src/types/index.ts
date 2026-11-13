export type Product = {
  id: number,
  title: string,
  brand: string,
  category: string,
  price: number,
  rating: number,
  description: string,
  image: string, // ссылка относительно /api/public
  inStock: boolean,
  specs?: Record<string, string | number | boolean>
}

export type Reviews = {
  id: number,
  productId: number,
  author: string,
  rating: number,
  text: string,
  date: string
}
