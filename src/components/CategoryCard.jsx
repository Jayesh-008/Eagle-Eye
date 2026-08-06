import { FiArrowRight } from 'react-icons/fi'

export default function CategoryCard({ title, description, image, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-[32px] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.14)]"
    >
      <img src={image} alt={title} className="h-80 w-full object-cover transition duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      <div className="absolute inset-x-0 bottom-0 p-8 text-white flex flex-col justify-between h-full">
        <div className="flex justify-end">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition duration-300 group-hover:bg-[#D4AF37] group-hover:text-[#111111] group-hover:border-[#D4AF37]">
            <FiArrowRight size={18} />
          </span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white tracking-wide">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/80 max-w-xs">{description}</p>
        </div>
      </div>
    </div>
  )
}
