export default function Toast({ message, type = 'success' }) {
  if (!message) return null

  const styles = type === 'error' ? 'bg-red-600 text-white' : 'bg-[#111111] text-white'

  return (
    <div className={`fixed bottom-6 right-6 z-[90] rounded-full px-5 py-3 text-sm font-semibold shadow-xl ${styles}`}>
      {message}
    </div>
  )
}
