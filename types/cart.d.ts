import { Product } from './product'

export type CartItem = {
  product: Product
  quantity: number
}

export type Cart = {
  _id: string
  products: CartItem[]
}
