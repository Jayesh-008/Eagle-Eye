import { useState } from 'react'
import { FiPhone, FiMail, FiInstagram, FiMessageSquare, FiSend, FiCheckCircle } from 'react-icons/fi'
import api from '../api'

const faqItems = [
  { question: 'How long does shipping take?', answer: 'Standard delivery takes 4-6 business days with premium protective packaging.' },
  { question: 'Can I return my order?', answer: 'Yes, returns are available within 30 days of purchase with free return shipping.' },
  { question: 'Do you offer prescription lenses?', answer: 'We offer precision prescription lenses on select frames with custom optical power.' },
  { question: 'Are your sunglasses UV protected?', answer: 'All sunglasses come with 100% UV400 protection and premium anti-glare coatings.' },
]

export default function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Please fill in your name, email, and message.')
      return
    }

    setLoading(true)
    setStatusMsg('')
    setErrorMsg('')

    try {
      const response = await api.post('/contact', form)
      setStatusMsg(response.data.message || 'Thank you! Your message has been sent.')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="contact" className="min-h-screen bg-[#F8F8F8] pb-24 text-[#111111]">
      {/* Header Banner */}
      <div
        className="relative min-h-[320px] pt-28 pb-16 text-white text-center px-4 overflow-hidden bg-cover bg-center flex flex-col justify-center items-center sm:min-h-[440px] sm:pt-36 sm:pb-28"
        style={{ backgroundImage: "url('/contact-bg.jpg')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/60 bg-black/60 px-4.5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37] backdrop-blur-md shadow-lg">
            <FiMessageSquare size={14} /> Get In Touch
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight text-white drop-shadow-lg">CONTACT EAGLE EYE</h1>
          <p className="mt-5 text-base sm:text-lg leading-8 text-white/95 drop-shadow-md">
            Have questions about your prescription power, delivery status, or custom frames? Our team is here to assist you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Customer Care</p>
              <h2 className="mt-2 text-3xl font-bold">Reach Out Directly</h2>
              <p className="mt-3 text-sm leading-6 text-[#111111]/70">
                Connect with our optical specialists via phone, email, or Instagram.
              </p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {/* Phone */}
              <a
                href="tel:6369412636"
                className="group rounded-[28px] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111] text-[#D4AF37] transition group-hover:bg-[#D4AF37] group-hover:text-[#111111]">
                    <FiPhone size={20} />
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-[#111111]">Phone</h3>
                  <p className="mt-1 text-xs font-semibold text-[#D4AF37] break-all">6369412636</p>
                </div>
                <p className="mt-2 text-[10px] text-[#111111]/50">Mon-Sat 9am-7pm</p>
              </a>

              {/* Email */}
              <a
                href="mailto:jayeshsubramani008@gmail.com"
                className="group rounded-[28px] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111] text-[#D4AF37] transition group-hover:bg-[#D4AF37] group-hover:text-[#111111]">
                    <FiMail size={20} />
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-[#111111]">Email Us</h3>
                  <p className="mt-1 text-xs font-semibold text-[#D4AF37] break-all">jayeshsubramani008@gmail.com</p>
                </div>
                <p className="mt-2 text-[10px] text-[#111111]/50">24/7 Response</p>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/e____m__02468/"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-[28px] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111111] text-[#D4AF37] transition group-hover:bg-[#D4AF37] group-hover:text-[#111111]">
                    <FiInstagram size={20} />
                  </div>
                  <h3 className="mt-3 font-bold text-sm text-[#111111]">Instagram</h3>
                  <p className="mt-1 text-xs font-semibold text-[#D4AF37] break-all">@e____m__02468</p>
                </div>
                <p className="mt-2 text-[10px] text-[#111111]/50">Follow Us</p>
              </a>
            </div>

            {/* FAQs Accordion Box */}
            <div className="rounded-[32px] border border-black/10 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-[#111111]">Frequently Asked Questions</h3>
              <div className="mt-6 space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-black/5 bg-[#F8F8F8] p-4">
                    <h4 className="font-semibold text-sm text-[#111111]">{item.question}</h4>
                    <p className="mt-2 text-xs leading-5 text-[#111111]/70">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[36px] border border-black/10 bg-white p-8 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Send Message</p>
              <h3 className="mt-2 text-2xl font-bold">Write to Our Support Team</h3>
              <p className="mt-2 text-xs leading-5 text-[#111111]/60">
                Fill out the form below and an optical consultant will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] px-4 py-3.5 text-sm outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] px-4 py-3.5 text-sm outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="6369412636"
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] px-4 py-3.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#111111]/70 mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us how we can help with your eyewear selection..."
                    className="w-full rounded-2xl border border-black/15 bg-[#F8F8F8] p-4 text-sm outline-none resize-none"
                    required
                  />
                </div>

                {statusMsg ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-700">
                    <FiCheckCircle size={16} /> {statusMsg}
                  </div>
                ) : null}

                {errorMsg ? (
                  <p className="text-xs font-semibold text-red-600">{errorMsg}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#111111] py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#D4AF37] hover:text-[#111111] shadow-lg flex items-center justify-center gap-2"
                >
                  <FiSend size={14} /> {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
