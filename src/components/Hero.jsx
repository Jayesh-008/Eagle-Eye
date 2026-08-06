import { motion } from 'framer-motion'

export default function Hero({ onExplore }) {
  return (
    <section className="relative h-screen overflow-hidden bg-black text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero.png')",
        }}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_35%)]" />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.42em] text-[#D4AF37]">Luxury Eyewear</p>
          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
            See the world with luminous clarity.
          </h1>
          <p className="mt-4 text-base leading-7 text-white/80 sm:mt-6 sm:text-xl">
            Discover premium frames crafted for elegance, comfort, and a refined everyday signature that feels effortlessly luxurious.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <motion.a
              whileHover={{ y: -2 }}
              href="#shop"
              onClick={onExplore}
              className="inline-flex items-center justify-center rounded-full bg-[#D4AF37] px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.22em] text-[#111111] shadow-[0_20px_80px_rgba(212,175,55,0.22)] transition"
            >
              Shop Collection
            </motion.a>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-10 flex justify-center text-center text-sm uppercase tracking-[0.35em] text-white/70">
        Scroll to Discover
      </div>
    </section>
  )
}
