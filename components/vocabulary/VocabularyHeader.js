import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
    { href: '/vocabulary', label: 'Trang chủ', icon: '🏠' },
    { href: '/vocabulary/search', label: 'Tra cứu', icon: '🔍' },
    { href: '/vocabulary/flashcard', label: 'Flashcard', icon: '🎴' },
    { href: '/vocabulary/quiz', label: 'Quiz', icon: '📝' },
    { href: '/vocabulary/list', label: 'Danh sách', icon: '📚' },
    { href: '/vocabulary/review', label: 'Ôn tập', icon: '🔄' },
]

export default function VocabularyHeader() {
    const router = useRouter()
    const { data: session } = useSession()

    const isActive = (path) => router.pathname === path

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-8">
                        <Link href="/vocabulary" className="flex items-center gap-2 group">
                            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">📚</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                VocabLearn
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href)
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        {session && (
                            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                                <img
                                    src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}`}
                                    alt={session.user.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                    {session.user.name}
                                </span>
                            </div>
                        )}

                        {/* Back to Financial App */}
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group"
                        >
                            <span className="text-lg group-hover:scale-110 transition-transform">💰</span>
                            <span className="hidden sm:inline text-sm font-semibold text-gray-700 group-hover:text-indigo-600">
                                Quản Lý Chi Tiêu
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Navigation (Horizontal Scroll) */}
                <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <div className="flex items-center gap-2">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${isActive(item.href)
                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    )
}
