import { useMemo } from 'react'
import ProductCard from './ProductCard'
import { FiTag, FiPercent } from 'react-icons/fi'

const offerCategories = [
  { name: 'Sunglasses', discount: 'Up to 60% OFF', category: 'Sunglasses' },
  { name: 'Kids Eyewear', discount: 'Up to 52% OFF', category: 'Kids Glasses' },
  { name: 'Eyeglasses', discount: 'Up to 45% OFF', category: 'Eyeglasses' },
  { name: 'Contact Lenses', discount: 'Up to 38% OFF', category: 'Contact Lenses' },
]

export default function OffersView({ products = [], wishlistItems = [], onAddToCart, onWishlist, onQuickView }) {
  // Filter products that have sale price or discounts
  const discountedProducts = useMemo(() => {
    return products.filter((product) => {
      const price = Number(product.price || 0)
      const salePrice = Number(product.salePrice || price)
      return salePrice < price || product.badge === 'Special Offer' || product.badge === 'Sale' || product.badge === 'Limited'
    })
  }, [products])

  const displayList = discountedProducts.length > 0 ? discountedProducts : products

  return (
    <div id="offers" className="min-h-screen bg-[#F8F8F8] pb-24 text-[#111111]">
      {/* Header Banner with /hero2.png background */}
      <div className="relative overflow-hidden bg-black pt-24 pb-16 text-center text-white px-4 shadow-xl sm:pt-32 sm:pb-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero2.png')" }}
        />
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25),transparent_60%)]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#D4AF37] shadow-lg backdrop-blur">
            <FiTag size={15} /> EXCLUSIVE PROMOTIONAL OFFERS
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-md">
            Special Discounts & Deals
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/90 max-w-2xl mx-auto font-medium">
            Explore curated luxury frames, sunglasses, and contact lenses with verified savings from <strong className="text-[#D4AF37] underline underline-offset-4 font-bold">39% to 60% OFF</strong>.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* Promotional Category Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offerCategories.map((cat) => (
            <div
              key={cat.name}
              className="rounded-[24px] bg-[#111111] p-5 text-white shadow-2xl border border-[#D4AF37]/30 flex flex-col justify-between transition hover:-translate-y-1.5 hover:border-[#D4AF37]"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  PROMOTIONAL DEAL
                </span>
                <h3 className="mt-1.5 text-base sm:text-lg font-bold text-white tracking-wide">{cat.name}</h3>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Savings</span>
                <span className="text-base sm:text-lg font-extrabold text-[#D4AF37] tracking-tight">{cat.discount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Discounted Products Grid */}
        <div className="mt-20">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-black/10 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF37]">PROMOTIONAL CATALOG</p>
              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl text-[#111111]">Active Promotional Products</h2>
            </div>
            <p className="text-sm font-semibold text-[#111111]/70">Showing {displayList.length} item(s)</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayList.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistItems.some((item) => item.productId === product.id)}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
