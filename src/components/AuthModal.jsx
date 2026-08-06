import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
import api from '../api'

export default function AuthModal({ open, onClose, onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) {
      setForm({ name: '', email: '', password: '' })
      setMessage('')
    }
  }, [open])

  if (!open) return null

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const response = await api.post(endpoint, form)
      localStorage.setItem('eagle-eye-token', response.data.token)
      localStorage.setItem('eagle-eye-user', JSON.stringify(response.data.user))
      onAuth(response.data.user)
      onClose()
    } catch (error) {
      setMessage(error.response?.data?.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Account</p>
            <h3 className="mt-2 text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-[#111111]/5 p-2 text-[#111111]">
            <FiX size={18} />
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === 'register' ? (
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-black/10 px-4 py-3" placeholder="Full name" required />
          ) : null}
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-black/10 px-4 py-3" placeholder="Email address" required />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-2xl border border-black/10 px-4 py-3" placeholder="Password" required />
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-[#111111] px-4 py-3 font-semibold text-white">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 rounded-2xl bg-[#F8F8F8] p-3 text-sm text-[#111111]/70">
          Admin access: <span className="font-semibold">jayeshsubramani008@gmail.com</span> / <span className="font-semibold">admin123</span>
        </p>

        <div className="mt-4 text-center text-sm text-[#111111]/70">
          {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}
          <button className="font-semibold text-[#D4AF37]" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create one' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  )
}
