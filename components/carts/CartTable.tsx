'use client'
import http from '@/services/http'
import { Cart } from '@/types/cart'
import { Delete } from '@mui/icons-material'
import { IconButton, Sheet, Link, Typography, Button, Stack, CircularProgress } from '@mui/joy'
import Table from '@mui/joy/Table'
import Image from 'next/image'
import NextLink from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import GotoCheckoutButton from './GotoCheckoutButton'
import { getErrorText } from '@/utils/error'

export default function CartsTable() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function handleDelete(productId: string) {
    try {
      await http(`/carts`, { method: 'DELETE', data: { product: productId } })
      setCart((prevCart: Cart | null) => ({
        ...prevCart!,
        products: prevCart!.products.filter((item) => item.product._id !== productId)
      }))
      toast.success('Product removed from cart')
    } catch (error) {
      toast.error(getErrorText(error))
      console.error(error)
    }
  }

  useEffect(() => {
    async function getCart() {
      setIsLoading(true)
      try {
        const response = await http<{ cart: Cart }>('/carts')
        setCart(response.cart)
      } catch (error) {
        toast.error(getErrorText(error))
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    getCart()
  }, [])

  if (isLoading) return <LoadingCart />
  if (cart === null || cart.products.length === 0) return <EmptyCart />

  return (
    <>
      <Sheet variant="outlined" sx={{ borderRadius: 'md', overflow: 'hidden' }}>
        <Table aria-label="Cart Table" stripe="even">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart &&
              cart.products.map((item) => (
                <tr key={item.product._id}>
                  <td>
                    <Image
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      style={{
                        borderRadius: 50,
                        objectFit: 'cover'
                      }}
                    />
                  </td>
                  <td>
                    <Link
                      level="title-md"
                      component={NextLink}
                      href={`/products/${item.product.slug}`}
                    >
                      {item.product.name}
                    </Link>
                  </td>
                  <td>£{item.product.price}</td>
                  <td>
                    {item.quantity} {item.product.unit}
                  </td>
                  <td>£{(item.product.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <IconButton
                      onClick={() => handleDelete(item.product._id)}
                      size="sm"
                      color="danger"
                      variant="outlined"
                    >
                      <Delete />
                    </IconButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Sheet>
      <GotoCheckoutButton />
    </>
  )
}

function EmptyCart() {
  return (
    <Stack alignItems="center" justifyContent="center" gap={2} minHeight="40vh">
      <Typography level="title-lg" textAlign="center">
        Your cart is empty
      </Typography>
      <Typography level="body-md" textAlign="center">
        You have no items in your cart. Start shopping to add items to your cart.
      </Typography>
      <Button component={NextLink} href="/products">
        Start Shopping
      </Button>
    </Stack>
  )
}

function LoadingCart() {
  return (
    <Stack alignItems="center" justifyContent="center" gap={2} minHeight="40vh">
      <CircularProgress />
      <Typography level="title-lg" textAlign="center">
        Loading your cart...
      </Typography>
    </Stack>
  )
}
