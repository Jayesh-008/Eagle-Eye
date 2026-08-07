import { useEffect, useMemo, useRef, useState } from 'react'
import { FiCheckCircle, FiShield, FiStar, FiX } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import CategoryCard from './components/CategoryCard'
import ProductCard from './components/ProductCard'
import CartDrawer from './components/CartDrawer'
import OffersView from './components/OffersView'
import ReviewsView from './components/ReviewsView'
import ContactView from './components/ContactView'
import Dashboard from './components/Dashboard'
import AdminPanel from './components/AdminPanel'
import AuthModal from './components/AuthModal'
import Toast from './components/Toast'
import api from './api'
import { categoriesSeed, productsSeed } from './data/mockData'

const shopFilters = ['All Collections', 'Eyeglasses', 'Sunglasses', 'Contact Lenses', 'Kids Glasses']
const whyItems = [
  { title: 'Crafted Excellence', description: 'Premium materials and precise finishes for every frame.' },
  { title: 'Advanced Lens Technology', description: 'UV400 and scratch-resistant treatments for everyday protection.' },
  { title: 'Lightweight Comfort', description: 'Frames designed to feel effortless during every wear.' },
  { title: 'Trusted Support', description: 'Dedicated customer care team available to help with prescriptions, orders, and any queries — every step of the way.' },
  { title: 'Free & Fast Shipping', description: 'Enjoy free delivery on all orders above ₹999. Orders are dispatched within 24 hours and delivered within 3–5 business days across India.' },
  { title: 'Insured Express Delivery', description: 'Every shipment is fully insured and tracked end-to-end. Receive real-time updates right to your phone so you always know where your frames are.' },
  { title: '30-Day Hassle-Free Returns', description: 'Not satisfied? Return any item within 30 days of delivery — no questions asked. We offer a full refund or exchange with free reverse pickup.' },
  { title: 'Secure Packaging', description: 'All frames are packed in a premium hard case with a microfibre cleaning cloth, ensuring your eyewear arrives in perfect, scratch-free condition.' },
]

function App() {
  const [activeFilter, setActiveFilter] = useState('All Collections')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('eagle-eye-user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [authOpen, setAuthOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [view, setView] = useState('home') // 'home', 'shop', 'collections', 'offers', 'reviews', 'contact', 'dashboard', 'admin'
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const searchRef = useRef(null)

  useEffect(() => {
    loadCatalog()
  }, [])

  useEffect(() => {
    if (!user) {
      setCartItems([])
      setWishlistItems([])
      return
    }

    loadCart()
    loadWishlist()
  }, [user])

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null)
      setCartItems([])
      setWishlistItems([])
      setToastType('error')
      setToastMessage('Your session has expired. Please sign in again.')
      setAuthOpen(true)
    }

    window.addEventListener('auth:expired', handleAuthExpired)
    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [])

  useEffect(() => {
    if (!toastMessage) return undefined
    const timer = window.setTimeout(() => setToastMessage(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  async function loadCatalog() {
    setLoading(true)
    setError('')

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/products?limit=200'),
        api.get('/categories'),
      ])

      const fetchedProducts = Array.isArray(productsResponse.data.products) ? productsResponse.data.products : productsResponse.data
      const fetchedCategories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []

      if (fetchedProducts && fetchedProducts.length > 0) {
        setProducts(fetchedProducts)
        setCategories(fetchedCategories.length > 0 ? fetchedCategories : categoriesSeed)
      } else {
        setProducts(productsSeed)
        setCategories(categoriesSeed)
      }
    } catch {
      setProducts(productsSeed)
      setCategories(categoriesSeed)
      setError('Unable to reach the store API server. Showing cached catalog edit.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCart() {
    try {
      const response = await api.get('/cart')
      const items = Array.isArray(response.data) ? response.data : []
      setCartItems(items.map((item) => ({ ...item, cartItemId: item.id })))
    } catch {
      setCartItems([])
    }
  }

  async function loadWishlist() {
    try {
      const response = await api.get('/wishlist')
      const items = Array.isArray(response.data) ? response.data : []
      setWishlistItems(items)
    } catch {
      setWishlistItems([])
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeFilter === 'All Collections' || product.category === activeFilter
      const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice =
        priceRange === 'all' ||
        (priceRange === 'under-1000' && Number(product.salePrice || product.price) < 1000) ||
        (priceRange === '1000-2000' && Number(product.salePrice || product.price) >= 1000 && Number(product.salePrice || product.price) <= 2000) ||
        (priceRange === 'above-2000' && Number(product.salePrice || product.price) > 2000)

      return matchesCategory && matchesSearch && matchesPrice
    })
  }, [activeFilter, priceRange, products, searchTerm])

  const bestSellers = useMemo(() => products.filter((product) => product.badge === 'Best Seller' || product.badge === 'Limited' || product.badge === 'Special Offer').slice(0, 4), [products])
  const newArrivals = useMemo(() => products.filter((product) => product.badge === 'New Arrival' || product.badge === 'New' || product.badge === 'Fresh').slice(0, 4), [products])

  async function handleAddToCart(product) {
    if (!user) {
      setToastType('error')
      setToastMessage('Please sign in to add products to your cart.')
      setAuthOpen(true)
      return
    }

    try {
      const response = await api.post('/cart', { productId: product.id, quantity: 1 })
      const serverItem = response.data
      setCartItems((current) => {
        const existing = current.find((item) => item.productId === product.id)
        if (existing) {
          return current.map((item) =>
            item.productId === product.id
              ? { ...item, cartItemId: serverItem.id, quantity: serverItem.quantity }
              : item
          )
        }
        return [...current, { ...product, productId: product.id, cartItemId: serverItem.id, quantity: serverItem.quantity || 1 }]
      })
      setToastType('success')
      setToastMessage(`${product.name} added to your cart.`)
      setCartDrawerOpen(true)
    } catch (error) {
      setToastType('error')
      setToastMessage(error.response?.data?.message || 'Unable to add this item to the cart.')
    }
  }

  async function handleWishlist(product) {
    if (!user) {
      setToastType('error')
      setToastMessage('Please sign in to save favorites.')
      setAuthOpen(true)
      return
    }

    const existing = wishlistItems.find((item) => item.productId === product.id)
    if (existing) {
      try {
        await api.delete(`/wishlist/${existing.id}`)
        setWishlistItems((current) => current.filter((item) => item.id !== existing.id))
        setToastType('success')
        setToastMessage(`${product.name} removed from your wishlist.`)
      } catch (error) {
        setToastType('error')
        setToastMessage(error.response?.data?.message || 'Unable to remove from wishlist.')
      }
      return
    }

    try {
      const response = await api.post('/wishlist', { productId: product.id })
      setWishlistItems((current) => [...current, { ...product, productId: product.id, id: response.data.id }])
      setToastType('success')
      setToastMessage(`${product.name} saved to your wishlist.`)
    } catch (error) {
      setToastType('error')
      setToastMessage(error.response?.data?.message || 'Unable to save this item.')
    }
  }

  async function handleQuickView(productId) {
    try {
      const response = await api.get(`/products/${productId}`)
      setSelectedProduct(response.data)
    } catch {
      setToastType('error')
      setToastMessage('Unable to open product details right now.')
    }
  }

  async function handleUpdateQuantity(item, delta) {
    const nextQuantity = Math.max(1, Number(item.quantity || 1) + delta)

    try {
      await api.put(`/cart/${item.cartItemId}`, { quantity: nextQuantity })
      setCartItems((current) => current.map((entry) => entry.cartItemId === item.cartItemId ? { ...entry, quantity: nextQuantity } : entry))
    } catch {
      setToastType('error')
      setToastMessage('Unable to update the cart quantity.')
    }
  }

  async function handleRemoveFromCart(item) {
    try {
      await api.delete(`/cart/${item.cartItemId}`)
      setCartItems((current) => current.filter((entry) => entry.cartItemId !== item.cartItemId))
      setToastType('success')
      setToastMessage('Item removed from cart.')
    } catch {
      setToastType('error')
      setToastMessage('Unable to remove that item.')
    }
  }

  async function handleCheckout() {
    if (!user) {
      setAuthOpen(true)
      setToastType('error')
      setToastMessage('Sign in to place an order.')
      return
    }

    if (!cartItems.length) {
      setToastType('error')
      setToastMessage('Add at least one product before checkout.')
      return
    }

    const orderItems = cartItems
      .filter((item) => item.productId)
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity) || 1,
        price: Number(item.salePrice || item.price) || 0,
      }))

    if (orderItems.length === 0) {
      setToastType('error')
      setToastMessage('Cart data is incomplete. Please remove and re-add your items.')
      return
    }

    try {
      await api.post('/orders', {
        shippingAddress: 'Main Street, Mumbai',
        items: orderItems,
      })

      // Deduct stock locally so the UI is immediately up-to-date
      setProducts((current) =>
        current.map((product) => {
          const ordered = orderItems.find((item) => item.productId === product.id)
          if (!ordered) return product
          return { ...product, stock: Math.max(0, (product.stock ?? 0) - ordered.quantity) }
        })
      )

      setCartItems([])
      setCartDrawerOpen(false)
      setView('dashboard')
      setToastType('success')
      setToastMessage('Order placed successfully! Your dashboard has been updated.')
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Checkout failed.'
      setToastType('error')
      setToastMessage(msg)
    }
  }

  function handleLogout() {
    localStorage.removeItem('eagle-eye-token')
    localStorage.removeItem('eagle-eye-user')
    setUser(null)
    setView('home')
    setToastType('success')
    setToastMessage('You have been signed out.')
  }

  function handleNavigation(targetView, href) {
    if (targetView === 'dashboard') {
      if (!user) {
        setAuthOpen(true)
        setToastType('error')
        setToastMessage('Please sign in to access your dashboard.')
        return
      }
      setView('dashboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (targetView === 'offers') {
      if (view !== 'home') {
        setView('home')
      }
      setTimeout(() => {
        const el = document.getElementById('highlights') || document.getElementById('offers')
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }

    if (targetView === 'reviews' || targetView === 'contact') {
      setView(targetView)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (targetView === 'why-choose-us') {
      if (view !== 'home') setView('home')
      setTimeout(() => {
        document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }

    if (targetView === 'shop' || targetView === 'collections') {
      if (view !== 'home' && view !== 'shop') {
        setView('home')
      }
      setTimeout(() => {
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
      return
    }

    setView('home')
    if (href && href.startsWith('#')) {
      setTimeout(() => {
        const el = document.querySelector(href)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
        else window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleOpenSearch() {
    if (view !== 'home') setView('home')
    setTimeout(() => {
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
      searchRef.current?.focus()
    }, 100)
  }

  function handleCategoryClick(categoryName) {
    setView('home')
    setActiveFilter(categoryName)
    setTimeout(() => {
      document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  if (view === 'dashboard' && user) {
    return (
      <>
        <Navbar
          user={user}
          cartCount={cartItems.length}
          wishlistCount={wishlistItems.length}
          activeNav={view}
          onNavigate={handleNavigation}
          onOpenAuth={() => setAuthOpen(true)}
          onGoDashboard={() => handleNavigation('dashboard')}
          onGoAdmin={() => setView('admin')}
          onSearch={handleOpenSearch}
          onOpenCart={() => setCartDrawerOpen(true)}
          onLogout={handleLogout}
        />
        <div className="pt-20">
          <Dashboard user={user} onLogout={handleLogout} onGoHome={() => setView('home')} />
        </div>
        <CartDrawer
          open={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
        <Toast message={toastMessage} type={toastType} />
      </>
    )
  }

  if (view === 'admin' && user?.role === 'admin') {
    return (
      <>
        <Navbar
          user={user}
          cartCount={cartItems.length}
          wishlistCount={wishlistItems.length}
          activeNav={view}
          onNavigate={handleNavigation}
          onOpenAuth={() => setAuthOpen(true)}
          onGoDashboard={() => handleNavigation('dashboard')}
          onGoAdmin={() => setView('admin')}
          onSearch={handleOpenSearch}
          onOpenCart={() => setCartDrawerOpen(true)}
          onLogout={handleLogout}
        />
        <div className="pt-20">
          <AdminPanel user={user} onLogout={handleLogout} />
        </div>
        <CartDrawer
          open={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
        />
        <Toast message={toastMessage} type={toastType} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#111111]">
      <Navbar
        user={user}
        cartCount={cartItems.length}
        wishlistCount={wishlistItems.length}
        activeNav={view}
        onNavigate={handleNavigation}
        onOpenAuth={() => setAuthOpen(true)}
        onGoDashboard={() => handleNavigation('dashboard')}
        onGoAdmin={() => setView('admin')}
        onSearch={handleOpenSearch}
        onOpenCart={() => setCartDrawerOpen(true)}
        onLogout={handleLogout}
      />

      {/* Render View Content */}
      {view === 'offers' ? (
        <OffersView
          products={products}
          wishlistItems={wishlistItems}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          onQuickView={handleQuickView}
        />
      ) : view === 'reviews' ? (
        <ReviewsView
          user={user}
          products={products}
          onOpenAuth={() => setAuthOpen(true)}
          onReviewSubmitted={loadCatalog}
        />
      ) : view === 'contact' ? (
        <ContactView />
      ) : (
        <>
          <Hero onExplore={() => handleNavigation('shop', '#shop')} />

          <main>
            {/* Shop By Category Section */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Shop by category</p>
                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Collections tailored for every moment.</h2>
                </div>
                <button
                  onClick={() => handleNavigation('shop', '#shop')}
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-[#111111] transition hover:text-[#D4AF37]"
                >
                  Explore all collections →
                </button>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    title={category.name}
                    description={category.description}
                    image={category.image}
                    onClick={() => handleCategoryClick(category.name)}
                  />
                ))}
              </div>
            </section>

            {/* Main Shop Products Grid */}
            <section id="shop" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="rounded-[40px] border border-black/10 bg-white px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.08)] sm:px-8 sm:py-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">All Collections</p>
                    <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Find your perfect frame in one curated edit.</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {shopFilters.map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                          activeFilter === filter
                            ? 'bg-[#111111] text-white shadow-lg'
                            : 'border border-black/10 bg-white text-[#111111] hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 rounded-[28px] border border-black/10 bg-[#F8F8F8] p-4 md:flex-row md:items-center md:justify-between">
                  <input
                    ref={searchRef}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search frames, styles, or collections..."
                    className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none md:max-w-md focus:border-[#D4AF37]"
                  />
                  <select
                    value={priceRange}
                    onChange={(event) => setPriceRange(event.target.value)}
                    className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none"
                  >
                    <option value="all">All prices</option>
                    <option value="under-1000">Under ₹1,000</option>
                    <option value="1000-2000">₹1,000 - ₹2,000</option>
                    <option value="above-2000">Above ₹2,000</option>
                  </select>
                </div>

                {loading ? (
                  <div className="mt-8 rounded-[24px] border border-black/10 bg-[#F8F8F8] p-12 text-center text-sm text-[#111111]/70">
                    Loading latest products...
                  </div>
                ) : null}

                {!loading && error ? (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={loadCatalog}
                      className="shrink-0 rounded-full bg-[#111111] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#D4AF37] hover:text-[#111111]"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : null}

                {!loading ? (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistItems.some((item) => item.productId === product.id)}
                        onAddToCart={handleAddToCart}
                        onWishlist={handleWishlist}
                        onQuickView={handleQuickView}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            {/* EAGLE EYE HIGHLIGHTS & OFFERS Section (Preserved hero2.png) */}
            <section id="highlights" className="relative overflow-hidden py-24 scroll-mt-20">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero2.png')" }} />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
              <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.3)] backdrop-blur-lg sm:p-10 sm:p-14 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="max-w-xl text-white">
                    <span className="inline-block rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                      EAGLE EYE HIGHLIGHTS & OFFERS
                    </span>
                    <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl text-white">
                      Elevate every moment with premium eyewear.
                    </h2>
                    <p className="mt-6 text-base leading-8 text-white/85">
                      Discover titanium frames, scratch-resistant precision optics, and exclusive seasonal savings ranging from <strong className="text-[#D4AF37] font-bold">39% to 60% OFF</strong>.
                    </p>
                    <button
                      onClick={() => handleNavigation('shop', '#shop')}
                      className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-[#111111] transition hover:bg-white hover:text-[#111111] shadow-xl"
                    >
                      EXPLORE COLLECTION →
                    </button>
                  </div>

                  {/* 35% to 60% OFF Deals Cards */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { title: 'Sunglasses', discount: 'Up to 60% OFF' },
                      { title: 'Kids Eyewear', discount: 'Up to 52% OFF' },
                      { title: 'Eyeglasses', discount: 'Up to 45% OFF' },
                      { title: 'Contact Lenses', discount: 'Up to 38% OFF' },
                    ].map((deal) => (
                      <div
                        key={deal.title}
                        onClick={() => handleCategoryClick(deal.title)}
                        className="cursor-pointer flex flex-col justify-between rounded-[24px] border border-white/15 bg-black/60 p-5 text-white backdrop-blur transition hover:border-[#D4AF37] hover:bg-black/80"
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">PROMOTIONAL DEAL</span>
                          <h3 className="mt-1.5 text-base sm:text-lg font-bold text-white tracking-wide">{deal.title}</h3>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Savings</span>
                          <span className="text-base sm:text-lg font-extrabold text-[#D4AF37] tracking-tight">{deal.discount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Why Choose Us Section */}
            <section id="why-choose-us" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Why Choose Us</p>
                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Tailored quality, designed for daily wear.</h2>
                  <div className="mt-8 space-y-6">
                    {whyItems.map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[#D4AF37]">
                          <FiCheckCircle size={18} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#111111] text-base">{item.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#111111]/70">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[36px] border border-black/10 bg-white p-8 shadow-xl">
                  <h3 className="text-2xl font-bold text-[#111111]">Eagle Eye Excellence Guarantee</h3>
                  <p className="mt-4 text-sm leading-7 text-[#111111]/70">
                    Every frame undergoes a 12-point inspection before dispatch. Enjoy 30-day effortless returns, scratch protection, and express insured delivery.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/10 pt-6">
                    <div>
                      <p className="text-3xl font-extrabold text-[#D4AF37]">100%</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#111111]/60">UV400 Protection</p>
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-[#111111]">30 Days</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#111111]/60">Easy Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <Footer onNavigate={handleNavigation} />

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={(userData) => {
          setUser(userData)
          setToastType('success')
          setToastMessage(`Welcome back, ${userData.name}!`)
        }}
      />

      {/* Quick View Product Modal */}
      {selectedProduct ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 rounded-full bg-[#111111]/5 p-2 text-[#111111] hover:bg-[#111111]/10">
              <FiX size={18} />
            </button>
            <div className="grid gap-6 md:grid-cols-2 items-center">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="h-52 w-full rounded-2xl object-cover sm:h-72" />
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#D4AF37]/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                    {selectedProduct.badge || selectedProduct.category}
                  </span>
                  {selectedProduct.rating != null && Number(selectedProduct.reviewCount || 0) > 0 ? (
                    <span className="text-[#D4AF37] font-bold text-xs">★ {Number(selectedProduct.rating).toFixed(1)} ({selectedProduct.reviewCount})</span>
                  ) : (
                    <span className="text-xs text-[#111111]/50 italic">No rating given yet</span>
                  )}
                </div>
                <h3 className="mt-3 text-2xl font-bold">{selectedProduct.name}</h3>
                <p className="mt-2 text-sm text-[#111111]/70">{selectedProduct.description}</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <p className="text-3xl font-extrabold text-[#111111]">
                    ₹{Number(selectedProduct.salePrice || selectedProduct.price).toLocaleString('en-IN')}
                  </p>
                  {selectedProduct.price > selectedProduct.salePrice ? (
                    <p className="text-sm text-[#111111]/50 line-through">₹{Number(selectedProduct.price).toLocaleString('en-IN')}</p>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs text-[#111111]/60 italic font-medium">
                  * Note: Price of the product may differ based on the power of the lens.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="flex-1 rounded-full bg-[#111111] py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#D4AF37] hover:text-[#111111]"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleWishlist(selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="rounded-full border border-black/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#111111] transition hover:border-[#D4AF37]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Toast message={toastMessage} type={toastType} />
    </div>
  )
}

export default App
