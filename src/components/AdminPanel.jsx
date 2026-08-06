import { useEffect, useMemo, useState } from 'react'
import { FiPlus, FiMinus, FiTrash2, FiPackage, FiBox, FiUsers, FiDollarSign, FiCheck, FiRefreshCw, FiMail, FiPhone, FiClock, FiMessageSquare } from 'react-icons/fi'
import api from '../api'

export default function AdminPanel({ user, onLogout }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [contactMessages, setContactMessages] = useState([])
  const [readMessageIds, setReadMessageIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('ee-read-msgs') || '[]')) } catch { return new Set() }
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState('products') // 'products', 'orders', 'add', 'messages'
  const [expandedMsg, setExpandedMsg] = useState(null)

  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'Eagle Eye',
    price: '',
    discountPercent: 0,
    category: 'Eyeglasses',
    badge: 'New',
    stock: 50,
    description: '',
    image: '',
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  function loadAdminData() {
    setLoading(true)
    Promise.all([
      api.get('/products?limit=300'),
      api.get('/orders'),
      api.get('/users'),
      api.get('/categories'),
      api.get('/contact'),
    ])
      .then(([productsRes, ordersRes, usersRes, categoriesRes, contactRes]) => {
        setProducts(productsRes.data.products || productsRes.data || [])
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : [])
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : [])
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
        setContactMessages(Array.isArray(contactRes.data) ? contactRes.data : [])
      })
      .catch(() => setErrorMsg('Unable to load admin store data.'))
      .finally(() => setLoading(false))
  }

  function markAsRead(id) {
    setReadMessageIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('ee-read-msgs', JSON.stringify([...next]))
      return next
    })
  }

  const unreadCount = contactMessages.filter((m) => !readMessageIds.has(m.id)).length

  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
    const lowStock = products.filter((p) => Number(p.stock || 0) < 10).length
    return {
      products: products.length,
      orders: orders.length,
      users: users.length,
      revenue: totalRev,
      lowStock,
    }
  }, [products, orders, users])

  async function handleAddProduct(e) {
    e.preventDefault()
    if (!productForm.name || !productForm.price) {
      setErrorMsg('Product name and price are required.')
      return
    }

    setMessage('')
    setErrorMsg('')

    const price = Number(productForm.price)
    const discount = Number(productForm.discountPercent || 0)
    const computedSalePrice = discount > 0
      ? Math.round(price * (1 - discount / 100))
      : price

    try {
      const response = await api.post('/products', {
        name: productForm.name,
        brand: productForm.brand,
        price,
        salePrice: computedSalePrice,
        category: productForm.category,
        badge: productForm.badge,
        stock: Number(productForm.stock || 50),
        description: productForm.description,
        image: productForm.image,
      })
      setProducts([response.data, ...products])
      setMessage(`"${response.data.name}" added successfully!`)
      setProductForm({
        name: '',
        brand: 'Eagle Eye',
        price: '',
        discountPercent: 0,
        category: 'Eyeglasses',
        badge: 'New',
        stock: 50,
        description: '',
        image: '',
      })
      setActiveTab('products')
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to create product.')
    }
  }

  async function handleUpdateStock(productId, currentStock, delta) {
    const newStock = Math.max(0, Number(currentStock || 0) + delta)
    try {
      await api.put(`/products/${productId}/stock`, { stock: newStock })
      setProducts((current) =>
        current.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      )
    } catch {
      alert('Failed to update product stock.')
    }
  }

  async function handleDeleteProduct(productId, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await api.delete(`/products/${productId}`)
      setProducts((current) => current.filter((p) => p.id !== productId))
      setMessage(`"${name}" was deleted.`)
    } catch {
      alert('Failed to delete product.')
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}`, { status })
      setOrders(orders.map((order) => (order.id === orderId ? response.data : order)))
    } catch {
      alert('Unable to update order status.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-3 sm:p-4 md:p-6 text-[#111111]">
      <div className="mx-auto max-w-7xl rounded-[36px] bg-white p-4 shadow-2xl sm:p-6">
        {/* Admin Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-black/10 pb-6">
          <div>
            <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              ADMIN DASHBOARD
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-[#111111]">Eagle Eye Control Hub</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-[#F8F8F8] px-4 py-2.5 text-xs font-semibold text-[#111111] hover:border-[#D4AF37]"
            >
              <FiRefreshCw size={14} /> Refresh Data
            </button>
            <button
              onClick={onLogout}
              className="rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Notifications */}
        {message ? (
          <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700">
            ✅ {message}
          </div>
        ) : null}
        {errorMsg ? (
          <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
            ⚠️ {errorMsg}
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <div className="flex items-center justify-between text-[#111111]/60">
              <span className="text-xs uppercase tracking-[0.2em]">Total Products</span>
              <FiBox size={18} />
            </div>
            <p className="mt-3 text-3xl font-bold">{stats.products}</p>
            {stats.lowStock > 0 ? (
              <p className="mt-1 text-xs font-semibold text-amber-600">⚠️ {stats.lowStock} item(s) low in stock</p>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <div className="flex items-center justify-between text-[#111111]/60">
              <span className="text-xs uppercase tracking-[0.2em]">Total Orders</span>
              <FiPackage size={18} />
            </div>
            <p className="mt-3 text-3xl font-bold">{stats.orders}</p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <div className="flex items-center justify-between text-[#111111]/60">
              <span className="text-xs uppercase tracking-[0.2em]">Registered Users</span>
              <FiUsers size={18} />
            </div>
            <p className="mt-3 text-3xl font-bold">{stats.users}</p>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5">
            <div className="flex items-center justify-between text-[#111111]/60">
              <span className="text-xs uppercase tracking-[0.2em]">Total Revenue</span>
              <FiDollarSign size={18} className="text-[#D4AF37]" />
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#D4AF37]">₹{stats.revenue.toLocaleString('en-IN')}</p>
          </div>

          <button
            onClick={() => { setActiveTab('messages'); contactMessages.forEach((m) => markAsRead(m.id)) }}
            className="relative rounded-[28px] border border-black/10 bg-[#F8F8F8] p-5 text-left transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
          >
            <div className="flex items-center justify-between text-[#111111]/60">
              <span className="text-xs uppercase tracking-[0.2em]">Messages</span>
              <FiMessageSquare size={18} />
            </div>
            <p className="mt-3 text-3xl font-bold">{contactMessages.length}</p>
            {unreadCount > 0 ? (
              <p className="mt-1 text-xs font-semibold text-red-600">🔴 {unreadCount} unread</p>
            ) : (
              <p className="mt-1 text-xs font-semibold text-emerald-600">All read ✓</p>
            )}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap border-b border-black/10 gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'products' ? 'border-[#D4AF37] text-[#111111]' : 'border-transparent text-[#111111]/60 hover:text-[#111111]'
            }`}
          >
            Manage Products & Stock ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'add' ? 'border-[#D4AF37] text-[#111111]' : 'border-transparent text-[#111111]/60 hover:text-[#111111]'
            }`}
          >
            + Add New Product
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'orders' ? 'border-[#D4AF37] text-[#111111]' : 'border-transparent text-[#111111]/60 hover:text-[#111111]'
            }`}
          >
            Orders & Status ({orders.length})
          </button>
          <button
            onClick={() => { setActiveTab('messages'); contactMessages.forEach((m) => markAsRead(m.id)) }}
            className={`relative px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'messages' ? 'border-[#D4AF37] text-[#111111]' : 'border-transparent text-[#111111]/60 hover:text-[#111111]'
            }`}
          >
            Contact Messages
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* TAB 1: MANAGE PRODUCTS & STOCK TABLE */}
        {activeTab === 'products' ? (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Product Inventory ({products.length})</h3>
              <button
                onClick={() => setActiveTab('add')}
                className="rounded-full bg-[#111111] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#D4AF37] hover:text-[#111111]"
              >
                + Add Product
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-[#111111]/60">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#111111]/60">No products found. Click "+ Add New Product" to create one.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 bg-[#F8F8F8] text-xs uppercase tracking-wider text-[#111111]/70">
                      <th className="p-4">Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Sale Price</th>
                      <th className="p-4">Stock Level</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {products.map((p) => {
                      const stockVal = Number(p.stock ?? 50)
                      return (
                        <tr key={p.id} className="hover:bg-[#F8F8F8]/50 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                              ) : (
                                <div className="h-12 w-12 rounded-xl bg-black/10 flex items-center justify-center text-xs">No img</div>
                              )}
                              <div>
                                <p className="font-bold text-[#111111]">{p.name}</p>
                                <p className="text-xs text-[#111111]/50">ID #{p.id} · {p.badge || 'Standard'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-xs text-[#111111]/80">{p.category}</td>
                          <td className="p-4 font-semibold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                          <td className="p-4 font-semibold text-[#D4AF37]">₹{Number(p.salePrice || p.price).toLocaleString('en-IN')}</td>
                          
                          {/* Stock Manager Control */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 rounded-full border border-black/15 bg-[#F8F8F8] px-2 py-1">
                                <button
                                  onClick={() => handleUpdateStock(p.id, stockVal, -1)}
                                  title="Decrease stock"
                                  className="rounded-full bg-white p-1 text-[#111111]/70 hover:bg-black/10 hover:text-black transition"
                                >
                                  <FiMinus size={12} />
                                </button>
                                <span className={`px-2 text-xs font-bold ${stockVal < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                                  {stockVal} units
                                </span>
                                <button
                                  onClick={() => handleUpdateStock(p.id, stockVal, 1)}
                                  title="Increase stock"
                                  className="rounded-full bg-white p-1 text-[#111111]/70 hover:bg-black/10 hover:text-black transition"
                                >
                                  <FiPlus size={12} />
                                </button>
                              </div>
                              {stockVal < 10 ? (
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Low Stock</span>
                              ) : (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">In Stock</span>
                              )}
                            </div>
                          </td>

                          {/* Action Delete */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                              title="Delete Product"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}

        {/* TAB 2: ADD PRODUCT FORM */}
        {activeTab === 'add' ? (
          <div className="mt-6 max-w-3xl rounded-[28px] border border-black/10 bg-[#F8F8F8] p-6 sm:p-8">
            <h3 className="text-xl font-bold mb-4">Add New Product to Store</h3>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleAddProduct}>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Product Name *</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="e.g. Kepler Titanium Classic"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Category</label>
                <select
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                >
                  <option value="Eyeglasses">Eyeglasses</option>
                  <option value="Sunglasses">Sunglasses</option>
                  <option value="Contact Lenses">Contact Lenses</option>
                  <option value="Kids Glasses">Kids Glasses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Badge</label>
                <select
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  value={productForm.badge}
                  onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                >
                  <option value="New">New</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="Special Offer">Special Offer</option>
                  <option value="Retro">Retro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Regular Price (₹) *</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="1499"
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Discount %</label>
                <select
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  value={productForm.discountPercent}
                  onChange={(e) => setProductForm({ ...productForm, discountPercent: Number(e.target.value) })}
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((d) => (
                    <option key={d} value={d}>{d === 0 ? 'No Discount' : `${d}% OFF`}</option>
                  ))}
                </select>
                {/* Live sale price preview */}
                {productForm.price && Number(productForm.price) > 0 ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    {productForm.discountPercent > 0
                      ? `Sale price: ₹${Math.round(Number(productForm.price) * (1 - productForm.discountPercent / 100)).toLocaleString('en-IN')} (saving ₹${Math.round(Number(productForm.price) * productForm.discountPercent / 100).toLocaleString('en-IN')})`
                      : 'No discount — sale price equals regular price.'}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Initial Stock Count</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="50"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Image URL</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="https://..."
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Description</label>
                <textarea
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none resize-none"
                  rows={3}
                  placeholder="Product specifications, frame material, lens UV rating..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button className="flex-1 rounded-full bg-[#111111] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#D4AF37] hover:text-[#111111]" type="submit">
                  + Create Product
                </button>
                <button onClick={() => setActiveTab('products')} className="rounded-full border border-black/15 bg-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#111111]" type="button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' ? (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Customer Orders ({orders.length})</h3>
            {orders.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#111111]/60">No customer orders placed yet.</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 pb-3">
                      <div>
                        <p className="font-bold text-base text-[#111111]">Order #{order.id}</p>
                        <p className="text-xs text-[#111111]/50">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-base text-[#D4AF37]">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
                        <span className="rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-bold text-[#D4AF37]">
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-[#111111]/70 max-w-md">Address: {order.shippingAddress || 'Standard Delivery'}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#111111]/50 mr-1">Update Status:</span>
                        {['Pending', 'Packing', 'Shipped', 'Delivered'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            className={`rounded-full px-3 py-1 text-[10px] font-bold transition ${
                              order.status === status
                                ? 'bg-[#111111] text-white'
                                : 'border border-black/10 bg-[#F8F8F8] text-[#111111]/70 hover:border-[#D4AF37]'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* TAB 4: CONTACT MESSAGES */}
        {activeTab === 'messages' ? (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Contact Messages</h3>
                <p className="mt-1 text-xs text-[#111111]/50">{contactMessages.length} total message{contactMessages.length !== 1 ? 's' : ''} received from customers</p>
              </div>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  All caught up ✓
                </span>
              )}
            </div>

            {contactMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-[28px] border border-dashed border-black/15 bg-[#F8F8F8]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111111]/5 text-[#111111]/30">
                  <FiMessageSquare size={32} />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#111111]/50">No messages yet</p>
                <p className="mt-1 text-xs text-[#111111]/40">Customer messages from the Contact page will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((msg) => {
                  const isRead = readMessageIds.has(msg.id)
                  const isExpanded = expandedMsg === msg.id
                  const date = msg.created_at ? new Date(msg.created_at) : null
                  return (
                    <div
                      key={msg.id}
                      onClick={() => { setExpandedMsg(isExpanded ? null : msg.id); markAsRead(msg.id) }}
                      className={`cursor-pointer rounded-[24px] border p-5 shadow-sm transition hover:shadow-md ${
                        isRead
                          ? 'border-black/10 bg-white'
                          : 'border-[#D4AF37]/40 bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/20'
                      }`}
                    >
                      {/* Message Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[#D4AF37] text-sm font-bold">
                            {msg.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm text-[#111111]">{msg.name}</p>
                              {!isRead ? (
                                <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#111111]">NEW</span>
                              ) : null}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1 text-[11px] text-[#111111]/60">
                                <FiMail size={11} /> {msg.email}
                              </span>
                              {msg.phone ? (
                                <span className="flex items-center gap-1 text-[11px] text-[#111111]/60">
                                  <FiPhone size={11} /> {msg.phone}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {date ? (
                            <span className="flex items-center gap-1 text-[11px] text-[#111111]/40">
                              <FiClock size={11} />
                              {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              {' · '}
                              {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : null}
                          <span className="text-xs text-[#111111]/30">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Message Preview / Expanded */}
                      <div className={`mt-3 pl-[52px] transition-all ${ isExpanded ? '' : '' }`}>
                        {isExpanded ? (
                          <div className="rounded-2xl border border-black/8 bg-[#F8F8F8] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]/50 mb-2">Message</p>
                            <p className="text-sm leading-6 text-[#111111] whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        ) : (
                          <p className="text-xs leading-5 text-[#111111]/60 line-clamp-2">{msg.message}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
