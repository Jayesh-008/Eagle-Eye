import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi'
import { FaHeart } from 'react-icons/fa'

export default function ProductCard({ product, isWishlisted = false, onAddToCart, onWishlist, onQuickView }) {
  const pId = Number(product.id || 1)
  const calculatedDiscount = product.price > product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : null
  const discount = (calculatedDiscount && calculatedDiscount >= 35 && calculatedDiscount <= 60)
    ? calculatedDiscount
    : 35 + ((pId * 17 + 11) % 26)
  const price = product.price != null ? Number(product.price) : 1499
  const salePrice = (calculatedDiscount && calculatedDiscount >= 35 && calculatedDiscount <= 60 && product.salePrice)
    ? Number(product.salePrice)
    : Math.round((price * (100 - discount)) / 100)

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.06)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_100px_rgba(0,0,0,0.12)]">
      <div>
        <div className="relative overflow-hidden">
          <img loading="lazy" src={product.image} alt={product.name} className="h-52 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-72" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition" />
          
          {/* Badge */}
          {product.badge ? (
            <div className="absolute left-4 top-4 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] shadow-md">
              {product.badge}
            </div>
          ) : null}

          {/* Discount Tag */}
          {discount ? (
            <div className="absolute left-4 top-14 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-md">
              -{discount}%
            </div>
          ) : null}

          {/* Top Right Wishlist Button (Always Visible) */}
          <button
            onClick={() => onWishlist?.(product)}
            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur transition duration-300 ${
              isWishlisted ? 'bg-red-500 text-white scale-105' : 'bg-white/80 text-[#111111] hover:bg-white hover:scale-110'
            }`}
          >
            {isWishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />}
          </button>

          {/* Quick View Hover Button */}
          <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition duration-300 group-hover:opacity-100">
            <button
              onClick={() => onQuickView?.(product.id)}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition hover:bg-black/80"
            >
              <FiEye size={14} /> Quick View
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.15em] text-[#111111]/60">
            <span>{product.brand || 'Eagle Eye'}</span>
            {product.rating != null && Number(product.reviewCount || 0) > 0 ? (
              <span className="text-[#D4AF37] font-bold">★ {Number(product.rating).toFixed(1)} ({product.reviewCount})</span>
            ) : (
              <span className="text-[10px] font-medium normal-case tracking-normal text-[#111111]/45 italic">No rating given yet</span>
            )}
          </div>
          <h3 className="mt-2 text-xl font-semibold text-[#111111]">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-[#111111]/70 line-clamp-2">{product.description}</p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-4">
          <div>
            <p className="text-2xl font-bold text-[#111111]">
              ₹{salePrice.toLocaleString('en-IN')}
            </p>
            {price > salePrice ? (
              <p className="text-xs text-[#111111]/40 line-through">₹{price.toLocaleString('en-IN')}</p>
            ) : null}
          </div>
          <button
            onClick={() => onAddToCart?.(product)}
            className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#D4AF37] hover:text-[#111111] hover:shadow-md"
          >
            <FiShoppingBag size={14} /> Add
          </button>
        </div>
        <p className="mt-3 text-[11px] font-medium text-[#111111]/55 italic leading-tight border-t border-black/5 pt-2">
          * Price may vary based on lens prescription power.
        </p>
      </div>
    </article>
  )
}
