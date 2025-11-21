import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Header from '../components/Header'
import Notification, { useNotification } from '../components/Notification'

export default function Exports() {
    const { data: session } = useSession()
    const { notification, showNotification, hideNotification } = useNotification()
    const [isLoading, setIsLoading] = useState(false)
    const [exportHistory, setExportHistory] = useState([])
    const [expenses, setExpenses] = useState([])
    const [debts, setDebts] = useState([])

    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode')
            return saved ? JSON.parse(saved) : true
        }
        return true
    })

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode))
        if (darkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode])

    useEffect(() => {
        if (session) {
            fetchData()
        }
    }, [session])

    async function fetchData() {
        try {
            const [expRes, debtRes, historyRes] = await Promise.all([
                fetch('/api/expenses'),
                fetch('/api/debts'),
                fetch('/api/export-history')
            ])

            const expData = await expRes.json()
            const debtData = await debtRes.json()
            const historyData = await historyRes.json()

            setExpenses(expData.items || [])
            setDebts(debtData.notes || [])
            setExportHistory(historyData.history || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    async function handleExport(format) {
        setIsLoading(true)
        try {
            showNotification('⏳ Đang xuất dữ liệu...', 'info', 3000)

            const filteredExpenses = expenses.filter(e => {
                if (!e.date) return false
                return e.date >= dateRange.startDate && e.date <= dateRange.endDate
            })

            const stats = {
                totalExpense: filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0),
                totalIncome: filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0),
                totalDebt: debts.filter(d => d.status !== 'paid').reduce((sum, d) => sum + (d.amount || 0), 0),
            }
            stats.balance = stats.totalIncome - stats.totalExpense

            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    format,
                    expenses: filteredExpenses,
                    debts,
                    stats,
                    dateRange
                })
            })

            const data = await response.json()

            if (response.ok) {
                if (data.downloadUrl) {
                    const link = document.createElement('a')
                    link.href = data.downloadUrl
                    link.download = data.filename
                    link.click()
                }

                await fetch('/api/export-history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: data.filename,
                        format,
                        month: `${dateRange.startDate} to ${dateRange.endDate}`,
                        fileSize: 'N/A'
                    })
                })

                await fetchData()
                showNotification(`✅ Xuất ${format.toUpperCase()} thành công!`, 'success')
            } else {
                showNotification(`❌ ${data.error || 'Lỗi xuất dữ liệu'}`, 'error')
            }
        } catch (error) {
            console.error('Error exporting:', error)
            showNotification('❌ Không thể xuất dữ liệu', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleBackup() {
        setIsLoading(true)
        try {
            showNotification('💾 Đang tạo backup...', 'info', 3000)
            const response = await fetch('/api/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'backup' })
            })
            const data = await response.json()

            if (response.ok) {
                const link = document.createElement('a')
                link.href = data.downloadUrl
                link.download = data.filename
                link.click()
                showNotification(`✅ Backup thành công!`, 'success')
            } else {
                showNotification(`❌ ${data.error || 'Lỗi tạo backup'}`, 'error')
            }
        } catch (error) {
            showNotification('❌ Không thể tạo backup', 'error')
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
                    title="Xuất dữ liệu"
                    subtitle="Export và backup dữ liệu tài chính"
                    icon="📤"
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

                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Export Options */}
                    <div className={`rounded-[32px] p-8 ${darkMode
                            ? 'bg-[#0F172A]/80 border border-white/5 backdrop-blur-xl'
                            : 'bg-white border border-slate-100 shadow-xl'
                        }`}>
                        <div className="mb-8">
                            <h2 className={`text-2xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                Tùy chọn xuất dữ liệu
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Chọn khoảng thời gian và định dạng file
                            </p>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                            ? 'bg-slate-800/50 border-2 border-white/5 text-white focus:border-indigo-500/50'
                                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-indigo-500'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className={`w-full px-6 py-4 rounded-[20px] text-base font-semibold outline-none transition-all ${darkMode
                                            ? 'bg-slate-800/50 border-2 border-white/5 text-white focus:border-indigo-500/50'
                                            : 'bg-slate-50 border-2 border-slate-200 text-slate-900 focus:border-indigo-500'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Export Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button
                                onClick={() => handleExport('csv')}
                                disabled={isLoading}
                                className={`p-8 rounded-[24px] border-2 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 ${darkMode
                                        ? 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500 hover:border-transparent text-emerald-400 hover:text-white'
                                        : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-500 hover:border-transparent text-emerald-700 hover:text-white'
                                    }`}
                            >
                                <div className="text-4xl mb-4">📊</div>
                                <div className="font-bold text-xl mb-2">CSV</div>
                                <div className="text-xs opacity-80">Excel-compatible</div>
                            </button>

                            <button
                                onClick={() => handleExport('json')}
                                disabled={isLoading}
                                className={`p-8 rounded-[24px] border-2 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 ${darkMode
                                        ? 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500 hover:border-transparent text-blue-400 hover:text-white'
                                        : 'bg-blue-50 border-blue-100 hover:bg-blue-500 hover:border-transparent text-blue-700 hover:text-white'
                                    }`}
                            >
                                <div className="text-4xl mb-4">💾</div>
                                <div className="font-bold text-xl mb-2">JSON</div>
                                <div className="text-xs opacity-80">Raw data format</div>
                            </button>

                            <button
                                onClick={handleBackup}
                                disabled={isLoading}
                                className={`p-8 rounded-[24px] border-2 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 ${darkMode
                                        ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500 hover:border-transparent text-indigo-400 hover:text-white'
                                        : 'bg-indigo-50 border-indigo-100 hover:bg-indigo-500 hover:border-transparent text-indigo-700 hover:text-white'
                                    }`}
                            >
                                <div className="text-4xl mb-4">🔒</div>
                                <div className="font-bold text-xl mb-2">Backup</div>
                                <div className="text-xs opacity-80">Full data backup</div>
                            </button>
                        </div>
                    </div>

                    {/* Export History */}
                    <div className={`rounded-[32px] p-8 ${darkMode
                            ? 'bg-[#0F172A]/80 border border-white/5 backdrop-blur-xl'
                            : 'bg-white border border-slate-100 shadow-xl'
                        }`}>
                        <div className="mb-8">
                            <h2 className={`text-2xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                Lịch sử xuất file
                            </h2>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                Các lần xuất dữ liệu gần đây
                            </p>
                        </div>

                        {exportHistory.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-4xl mb-4">📭</div>
                                <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Chưa có lịch sử xuất file nào
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {exportHistory.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`p-6 rounded-[24px] border transition-colors ${darkMode
                                                ? 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60'
                                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-700'
                                                    }`}>
                                                    {item.format === 'csv' ? '📊' : item.format === 'json' ? '💾' : '🔒'}
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {item.filename}
                                                    </div>
                                                    <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {item.month} • {item.format.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`text-xs font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {new Date(item.exportedAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
