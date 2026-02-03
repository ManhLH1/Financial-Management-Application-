import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
  { href: '/vocabulary/search', label: 'Tra cứu từ vựng', icon: '🔍' },
  { href: '/vocabulary/topics', label: 'Học theo chủ đề', icon: '📖' },
]

export default function VocabularyHeader() {
  const router = useRouter()
  const { data: session } = useSession()

  const isActive = (path) => router.pathname === path

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030617]/80 text-white backdrop-blur-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-12 left-1/4 h-64 w-64 rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-purple-600/20 blur-[140px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/vocabulary/search"
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-indigo-900/20 transition hover:border-white/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl shadow-lg shadow-indigo-900/50">
              📚
            </span>
            <div>
              <p className="text-sm uppercase tracking-widest text-white/60">VocabLearn</p>
              <p className="text-lg font-bold text-white">Ngân hàng từ vựng</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <img
                  src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}`}
                  alt={session.user.name || 'Avatar'}
                  className="h-9 w-9 rounded-xl object-cover ring-2 ring-white/20"
                />
                <div>
                  <p className="font-semibold text-white">{session.user.name}</p>
                  <p className="text-xs text-white/60">Đồng bộ với tài chính</p>
                </div>
              </div>
            )}

            <Link
              href="/"
              className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:shadow-xl"
            >
              <span>💰</span>
              <span className="hidden sm:inline">Quay lại quản lý tài chính</span>
              <span className="sm:hidden">Trang chính</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 text-sm font-semibold">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 transition-all ${isActive(item.href)
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900/30'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-white/60">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1">
              <span>⚡</span>
              <span>Trạng thái: Đồng bộ</span>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-1">
              <span>🛡️</span>
              <span>Tài khoản bảo mật</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
