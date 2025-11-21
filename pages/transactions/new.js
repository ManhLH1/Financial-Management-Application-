import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/Header'
import Notification, { useNotification } from '../../components/Notification'

const expenseCategories = {
    'Ăn uống': '🍽️',
    'Di chuyển': '🚗',
    'Giải trí': '🎮',
    'Mua sắm': '🛍️',
    'Sức khỏe': '💊',
    'Học tập': '📚',
    'Hóa đơn': '📄',
    'Khác': '📦'
}

const incomeCategories = {
    'Lương': '💰',
    'Thưởng': '🎁',
    'Đầu tư': '📈',
    'Kinh doanh': '💼',
    'Khác': '💵'
}

export default function NewTransaction() {
    const { data: session } = useSession()
    const router = useRouter()
    const { notification, showNotification, hideNotification } = useNotification()
    const [isLoading, setIsLoading] = useState(false)

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode')
            return saved ? JSON.parse(saved) : true
        }
        return true
    })

    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Ăn uống',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        customCategory: ''
    })

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode))
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    async function handleSubmit(e) {
        e.preventDefault()

        if (!form.title || !form.amount) {
            showNotification('⚠️ Vui lòng điền đầy đủ thông tin!', 'warning')
            return
        }

        if (form.category === 'Khác' && !form.customCategory) {
            showNotification('⚠️ Vui lòng nhập danh mục khác!', 'warning')
            return
        }

        const finalCategory = form.category === 'Khác' && form.customCategory ? form.customCategory : form.category

        setIsLoading(true)
        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: form.title,
                    amount: Number(form.amount),
                    category: finalCategory,
                    date: form.date,
                    type: form.type
                })
            })

            if (res.ok) {
                showNotification(`✅ Đã thêm ${form.type === 'expense' ? 'chi tiêu' : 'thu nhập'} thành công!`, 'success')
                setTimeout(() => {
                    router.push('/expenses')
                }, 1500)
            } else {
                showNotification('❌ Có lỗi xảy ra!', 'error')
            }
        } catch (error) {
            console.error('Error saving transaction:', error)
            showNotification('❌ Không thể lưu giao dịch!', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6">Bạn cần đăng nhập</h2>
                    <Link href="/auth" className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30">
                        Đăng nhập ngay
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
            {darkMode && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] opacity-30"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] opacity-30"></div>
                </div>
            )}

            <div className="relative z-10">
                <Header
                    title="Giao dịch mới"
                    subtitle="Thêm khoản chi hoặc thu nhập"
                    icon="➕"
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    showDarkModeToggle={true}
                />

                {notification && (
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        onClose={hideNotification}
                        duration={notification.duration}
                    />
                )}

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <form onSubmit={handleSubmit} className={`rounded-[32px] p-8 md:p-12 transition-all duration-300 ${darkMode
                            ? 'bg-[#0F172A]/80 border border-white/5 backdrop-blur-xl shadow-2xl shadow-black/20'
                            : 'bg-white border border-slate-100 shadow-xl'
                        }`}>

                        {/* Back Button */}
                        <Link href="/expenses" className={`inline-flex items-center gap-2 mb-8 text-sm font-semibold transition-colors ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                            }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại danh sách
                        </Link>

                        <div className="mb-8">
                            <h2 className={`text-3xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                Thêm giao dịch mới
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Điền thông tin chi tiêu hoặc thu nhập của bạn
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Type Selection */}
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Loại giao dịch
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type: 'expense', category: 'Ăn uống' }))}
                                        className={`p-6 rounded-[24px] border-2 transition-all duration-300 hover:-translate-y-1 ${form.type === 'expense'
                                                ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white border-transparent shadow-lg shadow-rose-500/30'
                                                : darkMode
                                                    ? 'bg-slate-800/50 border-white/5 text-slate-400 hover:border-white/10'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-3xl mb-3">💸</div>
                                        <div className="font-bold text-lg">Khoản chi</div>
                                        <div className={`text-xs mt-1 ${form.type === 'expense' ? 'text-white/80' : darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                            Chi tiêu hàng ngày
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, type: 'income', category: 'Lương' }))}
                                        className={`p-6 rounded-[24px] border-2 transition-all duration-300 hover:-translate-y-1 ${form.type === 'income'
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-lg shadow-emerald-500/30'
                                                : darkMode
                                                    ? 'bg-slate-800/50 border-white/5 text-slate-400 hover:border-white/10'
                                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="text-3xl mb-3">💰</div>
                                        <div className="font-bold text-lg">Khoản thu</div>
                                        <div className={`text-xs mt-1 ${form.type === 'income' ? 'text-white/80' : darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                            Thu nhập và tiết kiệm
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Transaction Name */}
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Tên giao dịch <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    placeholder="VD: Cà phê sáng"
                                    className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                            ? 'bg-slate-800/50 border-2 border-white/5 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-slate-800'
                                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                                        }`}
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Số tiền (VNĐ) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0"
                                        className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                                ? 'bg-slate-800/50 border-2 border-white/5 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-slate-800'
                                                : 'bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                                            }`}
                                    />
                                    {form.amount && (
                                        <div className={`absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {Number(form.amount).toLocaleString('vi-VN')}đ
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Danh mục
                                </label>
                                <select
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value, customCategory: '' }))}
                                    className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                            ? 'bg-slate-800/50 border-2 border-white/5 text-white focus:border-indigo-500/50 focus:bg-slate-800'
                                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'
                                        }`}
                                >
                                    {form.type === 'expense'
                                        ? Object.keys(expenseCategories).map(cat => (
                                            <option key={cat} value={cat}>{expenseCategories[cat]} {cat}</option>
                                        ))
                                        : Object.keys(incomeCategories).map(cat => (
                                            <option key={cat} value={cat}>{incomeCategories[cat]} {cat}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            {/* Custom Category */}
                            {form.category === 'Khác' && (
                                <div>
                                    <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        Danh mục khác <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.customCategory}
                                        onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                                        placeholder="VD: Quà tặng"
                                        className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                                ? 'bg-slate-800/50 border-2 border-white/5 text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-slate-800'
                                                : 'bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                                            }`}
                                    />
                                </div>
                            )}

                            {/* Date */}
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Ngày giao dịch
                                </label>
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                    className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                            ? 'bg-slate-800/50 border-2 border-white/5 text-white focus:border-indigo-500/50 focus:bg-slate-800'
                                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'
                                        }`}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-5 rounded-[20px] font-bold text-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20'
                                    }`}
                            >
                                {isLoading ? '⏳ Đang lưu...' : `➕ Thêm ${form.type === 'expense' ? 'chi tiêu' : 'thu nhập'}`}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    )
}
