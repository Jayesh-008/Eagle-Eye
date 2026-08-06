export default function Footer({ onNavigate }) {
  function handleLink(view, href) {
    if (onNavigate) {
      onNavigate(view, href)
    }
  }

  return (
    <footer className="border-t border-white/10 bg-[#111111] px-4 pt-16 pb-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="https://images.scalebranding.com/brave-eye-vision-logo-owl-eagle-logo-01KXCGHY1TG2XAJV5N1Z0H850F-full.png"
              alt="Eagle Eye logo"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold tracking-[0.35em] text-white uppercase">EAGLE EYE</span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/70">
            Crafted for modern living, designed with optical precision, and delivered with the calm confidence of luxury eyewear.
          </p>
          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Customer Care Phone</p>
            <a href="tel:6369412636" className="text-base font-bold text-white hover:text-[#D4AF37] transition">
              6369412636
            </a>
          </div>
        </div>

        {/* SHOP Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">SHOP</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>
              <button onClick={() => handleLink('shop', '#shop')} className="transition hover:text-white">
                Collections
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('shop', '#shop')} className="transition hover:text-white">
                Eyeglasses
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('shop', '#shop')} className="transition hover:text-white">
                Sunglasses
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('shop', '#shop')} className="transition hover:text-white">
                Kids Eyewear
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('shop', '#shop')} className="transition hover:text-white">
                Contact Lenses
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('offers', '#offers')} className="transition hover:text-[#D4AF37] font-semibold">
                Offers & Deals
              </button>
            </li>
          </ul>
        </div>

        {/* HELP Column */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">HELP</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li>
              <button onClick={() => handleLink('contact', '#contact')} className="transition hover:text-white">
                Contact Us
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('contact', '#contact')} className="transition hover:text-white">
                FAQs
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('why-choose-us', '#why-choose-us')} className="transition hover:text-white">
                Shipping Info
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('why-choose-us', '#why-choose-us')} className="transition hover:text-white">
                Returns Policy
              </button>
            </li>
            <li>
              <button onClick={() => handleLink('dashboard', '#orders')} className="transition hover:text-white">
                Track Order
              </button>
            </li>
          </ul>
        </div>

        {/* ACCOUNT & FOLLOW Column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">ACCOUNT</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li>
                <button onClick={() => handleLink('dashboard', '#profile')} className="transition hover:text-white">
                  My Profile
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('dashboard', '#orders')} className="transition hover:text-white">
                  My Orders
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('dashboard', '#wishlist')} className="transition hover:text-white">
                  Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('reviews', '#reviews')} className="transition hover:text-white">
                  Customer Reviews
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">FOLLOW US</h3>
            <div className="mt-3 flex items-center gap-3 text-sm text-white/80">
              <a href="https://www.instagram.com/e____m__02468/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">
                Instagram
              </a>
              <span>·</span>
              <a href="https://www.facebook.com/profile.php?id=61582346283871" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">
                Facebook
              </a>
              <span>·</span>
              <a href="https://www.linkedin.com/in/jayesh-s-11b5b5386/" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
        <p>© 2026 Eagle Eye. All rights reserved.</p>
        <p>Premium Crafted Eyewear & Optics</p>
      </div>
    </footer>
  )
}
