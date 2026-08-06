import { useEffect, useState } from 'react'
import { FiStar, FiMessageSquare, FiUser, FiCheckCircle } from 'react-icons/fi'
import api from '../api'

export default function ReviewsView({ user, products = [], onOpenAuth, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ productId: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    setLoading(true)
    try {
      const response = await api.get('/reviews')
      setReviews(Array.isArray(response.data) ? response.data : [])
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user) {
      onOpenAuth?.()
      return
    }

    if (!form.productId || !form.comment.trim()) {
      setErrorMsg('Please select a product and write your review comment.')
      return
    }

    setSubmitting(true)
    setMessage('')
    setErrorMsg('')

    try {
      await api.post('/reviews', {
        productId: Number(form.productId),
        rating: Number(form.rating),
        comment: form.comment.trim(),
      })
      setForm({ productId: '', rating: 5, comment: '' })
      setMessage('Thank you! Your review has been published.')
      loadReviews()
      onReviewSubmitted?.()  // re-fetch products so ratings update everywhere
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-24 text-[#111111]">
      {/* Header Banner */}
      <div className="relative min-h-[380px] pt-28 pb-20 text-white text-center px-4 overflow-hidden bg-cover bg-center flex flex-col justify-center items-center sm:min-h-[450px] sm:pt-36 sm:pb-28" style={{ backgroundImage: "url('https://www.shutterstock.com/image-photo/customer-review-good-rating-concept-260nw-2236198959.jpg')" }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 bg-black/40 px-4.5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37] backdrop-blur-md">
            <FiMessageSquare size={14} /> Verified Feedback
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-md">Customer Reviews</h1>
          <p className="mt-5 text-base sm:text-lg leading-8 text-white/90 drop-shadow">
            Read real experiences shared by our valued customers. Honest ratings from verified purchases.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        {/* Reviews List */}
        <div>
          <div className="flex items-center justify-between border-b border-black/10 pb-4">
            <h2 className="text-2xl font-bold">Published Reviews ({reviews.length})</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[#111111]/60">Loading customer reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="my-8 rounded-[32px] border border-dashed border-black/15 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F8F8] text-[#D4AF37] mb-4">
                <FiStar size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#111111]">No customer reviews yet.</h3>
              <p className="mt-2 text-sm text-[#111111]/70 max-w-md mx-auto">
                Be the first to share your experience with Eagle Eye frames and lenses!
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white font-bold text-sm">
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#111111]">{rev.userName || 'Verified Customer'}</p>
                          {rev.productName ? (
                            <p className="text-xs text-[#111111]/50">Product: <span className="font-semibold">{rev.productName}</span></p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#D4AF37]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} size={16} className={i < rev.rating ? 'fill-[#D4AF37]' : 'text-black/20'} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#111111]/80">{rev.comment}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-black/5 pt-3 text-xs text-[#111111]/50">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <FiCheckCircle size={12} /> Verified Buyer
                    </span>
                    <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write a Review Box */}
        <div>
          <div className="top-28 rounded-[32px] border border-black/10 bg-white p-6 shadow-xl lg:sticky">
            <h3 className="text-xl font-bold text-[#111111]">Write a Review</h3>
            <p className="mt-1 text-xs leading-5 text-[#111111]/60">Share your rating and feedback with our community.</p>

            {user ? (
              <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Select Product</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] px-4 py-3 text-sm outline-none"
                    required
                  >
                    <option value="">-- Choose a product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Star Rating</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] px-4 py-3 text-sm outline-none"
                  >
                    <option value={5}>★★★★★ 5 Stars - Excellent</option>
                    <option value={4}>★★★★☆ 4 Stars - Very Good</option>
                    <option value={3}>★★★☆☆ 3 Stars - Average</option>
                    <option value={2}>★★☆☆☆ 2 Stars - Poor</option>
                    <option value={1}>★☆☆☆☆ 1 Star - Terrible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Your Review</label>
                  <textarea
                    rows={4}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Describe frame comfort, build quality, shipping speed..."
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] p-4 text-sm outline-none resize-none"
                    required
                  />
                </div>

                {message ? <p className="text-xs font-semibold text-emerald-600">{message}</p> : null}
                {errorMsg ? <p className="text-xs font-semibold text-red-600">{errorMsg}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#111111] py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#D4AF37] hover:text-[#111111]"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-[#F8F8F8] p-6 text-center">
                <p className="text-sm text-[#111111]/70">Please log in to submit a review for your purchase.</p>
                <button
                  onClick={onOpenAuth}
                  className="mt-4 rounded-full bg-[#111111] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#D4AF37] hover:text-[#111111]"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
