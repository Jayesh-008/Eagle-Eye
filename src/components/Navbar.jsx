import { useEffect, useRef, useState } from 'react'
import { FiSearch, FiHeart, FiShoppingBag, FiMenu, FiX, FiUser, FiChevronDown, FiPackage, FiStar, FiShield, FiLogOut } from 'react-icons/fi'

export default function Navbar({
  user,
  cartCount = 0,
  wishlistCount = 0,
  activeNav = 'home',
  onNavigate,
  onOpenAuth,
  onGoDashboard,
  onGoAdmin,
  onSearch,
  onOpenCart,
  onLogout,
}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { name: 'Home', view: 'home', href: '#' },
    { name: 'Shop', view: 'shop', href: '#shop' },
    { name: 'Offers', view: 'offers', href: '#offers' },
    { name: 'Reviews', view: 'reviews', href: '#reviews' },
    { name: 'Contact', view: 'contact', href: '#contact' },
  ]

  function handleNavClick(item) {
    setMobileOpen(false)
    if (onNavigate) {
      onNavigate(item.view, item.href)
    }
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'bg-black/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.16)]' : 'bg-black/90 backdrop-blur-2xl'}`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo Branding */}
        <button onClick={() => handleNavClick({ view: 'home', href: '#' })} className="flex items-center gap-3 text-left">
          <img src="https://images.scalebranding.com/brave-eye-vision-logo-owl-eagle-logo-01KXCGHY1TG2XAJV5N1Z0H850F-full.png" alt="Eagle Eye logo" className="h-10 w-auto object-contain" />
          <span className="hidden text-lg font-bold tracking-[0.35em] text-white uppercase sm:inline-block">EAGLE EYE</span>
        </button>

        {/* Customer Focused Main Nav Links */}
        <div className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item)}
              className={`text-sm font-semibold transition ${activeNav === item.view ? 'text-[#D4AF37]' : 'text-white/80 hover:text-[#D4AF37]'
                }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Right Action Icons: Search, Wishlist, Cart, Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <button onClick={onSearch} title="Search" className="rounded-full border border-white/15 bg-white/10 p-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:text-[#D4AF37]">
            <FiSearch size={18} />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => handleNavClick({ view: 'dashboard', href: '#wishlist' })}
            title={`Wishlist (${wishlistCount})`}
            className="relative rounded-full border border-white/15 bg-white/10 p-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            <FiHeart size={18} />
            {wishlistCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                {wishlistCount}
              </span>
            ) : null}
          </button>

          {/* Cart */}
          <button
            onClick={onOpenCart}
            title={`Cart (${cartCount})`}
            className="relative rounded-full border border-white/15 bg-white/10 p-2.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            <FiShoppingBag size={18} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#111111] shadow">
                {cartCount}
              </span>
            ) : null}
          </button>

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <FiUser size={16} className="text-[#D4AF37]" />
                <span className="hidden md:inline-block max-w-[100px] truncate">{user.name || 'Account'}</span>
                <FiChevronDown size={14} className={`transition duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#111111] transition hover:-translate-y-0.5 shadow-sm"
              >
                Sign In
              </button>
            )}

            {/* Account Dropdown Content */}
            {accountMenuOpen && user ? (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#111111] p-2 text-white shadow-2xl backdrop-blur-xl z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
                <div className="py-1 space-y-1">
                  <button
                    onClick={() => { setAccountMenuOpen(false); onGoDashboard() }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-[#D4AF37] transition"
                  >
                    <FiUser size={14} /> My Profile
                  </button>
                  <button
                    onClick={() => { setAccountMenuOpen(false); onGoDashboard() }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-[#D4AF37] transition"
                  >
                    <FiPackage size={14} /> My Orders
                  </button>
                  <button
                    onClick={() => { setAccountMenuOpen(false); onGoDashboard() }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-[#D4AF37] transition"
                  >
                    <FiHeart size={14} /> Wishlist ({wishlistCount})
                  </button>
                  <button
                    onClick={() => { setAccountMenuOpen(false); handleNavClick({ view: 'reviews', href: '#reviews' }) }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-white/90 hover:bg-white/10 hover:text-[#D4AF37] transition"
                  >
                    <FiStar size={14} /> My Reviews
                  </button>

                  {/* Admin Dashboard (ONLY for admin) */}
                  {user.role === 'admin' ? (
                    <button
                      onClick={() => { setAccountMenuOpen(false); onGoAdmin() }}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition"
                    >
                      <FiShield size={14} /> Admin Dashboard
                    </button>
                  ) : null}

                  <button
                    onClick={() => { setAccountMenuOpen(false); onLogout() }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition border-t border-white/5 mt-1"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="rounded-full border border-white/15 bg-white/10 p-2.5 text-white lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/95 px-4 py-6 shadow-2xl backdrop-blur lg:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item)}
                className="text-left text-base font-semibold text-white/90 hover:text-[#D4AF37]"
              >
                {item.name}
              </button>
            ))}

            {user ? (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <p className="text-xs font-semibold text-[#D4AF37] uppercase">Account</p>
                <button onClick={() => { setMobileOpen(false); onGoDashboard() }} className="block text-sm text-white/80">Dashboard & Orders</button>
                {user.role === 'admin' ? (
                  <button onClick={() => { setMobileOpen(false); onGoAdmin() }} className="block text-sm font-semibold text-[#D4AF37]">Admin Panel</button>
                ) : null}
                <button onClick={() => { setMobileOpen(false); onLogout() }} className="block text-sm text-red-400">Logout</button>
              </div>
            ) : (
              <button onClick={() => { setMobileOpen(false); onOpenAuth() }} className="mt-2 text-left text-sm font-bold text-[#D4AF37]">Sign In / Register</button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
