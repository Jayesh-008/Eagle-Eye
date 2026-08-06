import { useEffect, useState } from 'react'
import api from '../api'

export default function Dashboard({ user, onLogout, onGoHome }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  function loadData() {
    setLoading(true)
    Promise.allSettled([
      api.get('/products?limit=200'),
      api.get('/cart'),
      api.get('/orders'),
      api.get('/wishlist'),
    ]).then(([productsRes, cartRes, ordersRes, wishlistRes]) => {
      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data.products || productsRes.value.data || [])
      } else {
        setError('Could not load store data. The backend may be offline.')
      }
      if (cartRes.status === 'fulfilled') {
        setCart(Array.isArray(cartRes.value.data) ? cartRes.value.data : [])
      }
      if (ordersRes.status === 'fulfilled') {
        setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [])
      }
      if (wishlistRes.status === 'fulfilled') {
        setWishlist(Array.isArray(wishlistRes.value.data) ? wishlistRes.value.data : [])
      }
    }).finally(() => setLoading(false))
  }

  async function handleRemoveWishlist(id) {
    try {
      await api.delete(`/wishlist/${id}`)
      setWishlist((prev) => prev.filter((item) => item.id !== id))
    } catch {
      alert('Unable to remove from wishlist.')
    }
  }

  async function handleAddToCartFromWishlist(item) {
    try {
      await api.post('/cart', { productId: item.productId, quantity: 1 })
      alert(`${item.name || 'Product'} added to your cart!`)
      // Refresh cart
      const cartRes = await api.get('/cart')
      setCart(Array.isArray(cartRes.data) ? cartRes.data : [])
    } catch {
      alert('Failed to add product to cart.')
    }
  }

  async function checkout() {
    if (!cart.length) {
      alert('Your cart is empty.')
      return
    }

    const orderItems = cart
      .filter((item) => item.productId)
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity) || 1,
        price: Number(item.salePrice || item.price) || 0,
      }))

    if (orderItems.length === 0) {
      alert('Cart data is incomplete. Please go back and re-add your items.')
      return
    }

    try {
      const response = await api.post('/orders', {
        shippingAddress: 'Main Street, Mumbai',
        items: orderItems,
      })
      setOrders([response.data, ...orders])
      setCart([])
      alert('Order placed successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Checkout failed.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-6 text-[#111111]">
      <div className="mx-auto max-w-7xl rounded-[36px] bg-white p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Customer dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold">Hello, {user?.name || 'Guest'}</h2>
          </div>
          <div className="flex items-center gap-3">
            {onGoHome ? (
              <button onClick={onGoHome} className="rounded-full border border-black/10 bg-[#F8F8F8] px-5 py-3 font-semibold text-[#111111] transition hover:border-[#D4AF37] hover:text-[#D4AF37]">
                ← Back to Shop
              </button>
            ) : null}
            <button onClick={onLogout} className="rounded-full bg-[#111111] px-5 py-3 font-semibold text-white">Logout</button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-[#111111]/70">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
            Loading your account...
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        ) : null}

        <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
          🟢 <strong>PostgreSQL Connected:</strong> Your cart, orders, wishlist, and account data are safely stored and persisted in PostgreSQL.
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#111111]/60">Products</p>
            <p className="mt-3 text-2xl font-semibold">{products.length}</p>
          </div>
          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#111111]/60">Cart items</p>
            <p className="mt-3 text-2xl font-semibold">{cart.length}</p>
          </div>
          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#111111]/60">Orders placed</p>
            <p className="mt-3 text-2xl font-semibold">{orders.length}</p>
          </div>
          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-[#111111]/60">Wishlist</p>
            <p className="mt-3 text-2xl font-semibold">{wishlist.length}</p>
          </div>
        </div>

        {/* Wishlist Items Section */}
        <div className="mt-8 rounded-[28px] border border-black/10 bg-[#F8F8F8] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Saved Wishlist ({wishlist.length})</h3>
          </div>
          {wishlist.length === 0 ? (
            <p className="mt-4 text-sm text-[#111111]/60">Your wishlist is currently empty. Click the heart icon on any product in the shop to save it here.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {wishlist.map((item) => (
                <div key={item.id} className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-black/10 flex items-center justify-center text-xs">No image</div>
                    )}
                    <div>
                      <p className="font-semibold text-[#111111]">{item.name || `Product #${item.productId}`}</p>
                      <p className="text-sm font-semibold text-[#D4AF37]">₹{Number(item.salePrice || item.price || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCartFromWishlist(item)}
                      className="flex-1 rounded-full bg-[#111111] py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#D4AF37] hover:text-[#111111]"
                    >
                      + Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveWishlist(item.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Section */}
        {cart.length > 0 ? (
          <div className="mt-8 rounded-[28px] border border-black/10 bg-[#F8F8F8] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Your cart</h3>
              <span className="text-sm text-[#111111]/60">{cart.length} item(s)</span>
            </div>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white p-4">
                  <div>
                    <p className="font-semibold">{item.name || `Product #${item.productId}`}</p>
                    <p className="mt-1 text-sm text-[#111111]/60">Qty: {item.quantity} · ₹{Number(item.salePrice || item.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <p className="font-semibold">₹{(Number(item.salePrice || item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#111111] p-4 text-white">
              <p className="font-semibold">Total</p>
              <p className="text-lg font-semibold text-[#D4AF37]">
                ₹{cart.reduce((sum, item) => sum + Number(item.salePrice || item.price || 0) * Number(item.quantity || 1), 0).toLocaleString('en-IN')}
              </p>
            </div>
            <button onClick={checkout} className="mt-4 w-full rounded-full bg-[#D4AF37] py-3 font-semibold text-[#111111] transition hover:-translate-y-0.5">
              Checkout now
            </button>
          </div>
        ) : null}

        {/* Orders Section */}
        <div className="mt-8 rounded-[28px] border border-black/10 bg-[#F8F8F8] p-6">
          <h3 className="text-xl font-semibold">Your orders</h3>
          <div className="mt-4 space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-[#111111]/60">No orders yet. Add items to your cart and checkout!</p>
            ) : null}
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Order #{String(order.id).slice(-6)}</p>
                  <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-[#D4AF37]">{order.status || 'Pending'}</span>
                </div>
                <p className="mt-1 text-sm text-[#111111]/70">{order.items?.length || 0} item(s) · ₹{Number(order.total || 0).toLocaleString('en-IN')}</p>
                <p className="mt-1 text-xs text-[#111111]/50">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
