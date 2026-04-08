import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AppShell from '../../components/layout/AppShell'
import Notification, { useNotification } from '../../components/Notification'

const expenseCategories = ['Ăn uống', 'Di chuyển', 'Giải trí', 'Mua sắm', 'Sức khỏe', 'Học tập', 'Hóa đơn', 'Khác']
const incomeCategories = ['Lương', 'Thưởng', 'Đầu tư', 'Kinh doanh', 'Khác']

export default function NewTransaction() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Ăn uống',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    customCategory: ''
  })

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const formatAmountInput = (value) => {
    if (!value) return ''
    const numeric = String(value).replace(/\D/g, '')
    return numeric ? Number(numeric).toLocaleString('vi-VN') : ''
  }

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
        showNotification(`✅ Đã thêm ${form.type === 'expense' ? 'khoản chi' : 'khoản thu'} thành công!`, 'success')
        setTimeout(() => router.push('/expenses'), 1200)
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

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex items-center justify-center">Đang tải...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-[#dae2fd]">
        <Link href="/auth" className="px-8 py-4 bg-[#2e5bff] rounded-2xl font-bold">Đăng nhập ngay</Link>
      </div>
    )
  }

  return (
    <>
      <AppShell
        title="Editorial Financial Intelligence"
        activeMenu="expenses"
        session={session}
        searchPlaceholder="Tìm kiếm dữ liệu..."
        headerTabs={<></>}
        rightActions={
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2d3449]/50 transition-colors text-[#b8c3ff]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        }
      >
        <div className="flex-1 flex items-center justify-center py-8 md:py-12">
          <div className="w-full max-w-2xl">
            <div className="bg-[rgba(45,52,73,0.6)] backdrop-blur-[20px] rounded-[2rem] p-8 md:p-12 shadow-2xl border border-[#434656]/10 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#b8c3ff]/10 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#4edea3]/5 blur-[100px] rounded-full" />

              <div className="relative z-10">
                <div className="mb-10 text-center md:text-left">
                  <h2 className="font-bold text-3xl md:text-4xl mb-2 tracking-tight">Thêm giao dịch mới</h2>
                  <p className="text-[#c4c5d9]/80 text-base">Điền thông tin chi tiết khoản chi hoặc thu nhập của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex p-1.5 bg-[#060e20] rounded-2xl gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: 'expense', category: 'Ăn uống' }))}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        form.type === 'expense'
                          ? 'bg-[#d71142] text-[#ffeceb] shadow-lg shadow-[#d71142]/20'
                          : 'text-[#c4c5d9] hover:bg-[#2d3449]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">trending_down</span>
                      Khoản chi
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: 'income', category: 'Lương' }))}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                        form.type === 'income'
                          ? 'bg-[#00a572] text-[#00311f] shadow-lg shadow-[#00a572]/20'
                          : 'text-[#c4c5d9] hover:bg-[#2d3449]/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">trending_up</span>
                      Khoản thu
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Tên giao dịch">
                      <div className="group relative">
                        <input
                          className="w-full bg-[#060e20] border border-[#434656]/20 rounded-xl px-4 py-4 text-[#dae2fd] placeholder:text-[#c4c5d9]/30 focus:ring-1 focus:ring-[#b8c3ff]/40 focus:border-[#b8c3ff]/40 outline-none"
                          placeholder="Ví dụ: Ăn tối tại nhà hàng"
                          value={form.title}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          type="text"
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c4c5d9]/40 group-focus-within:text-[#b8c3ff]">edit_note</span>
                      </div>
                    </Field>

                    <Field label="Số tiền (VNĐ)">
                      <div className="group relative">
                        <input
                          className="w-full bg-[#060e20] border border-[#434656]/20 rounded-xl px-4 py-4 text-[#dae2fd] placeholder:text-[#c4c5d9]/30 focus:ring-1 focus:ring-[#b8c3ff]/40 focus:border-[#b8c3ff]/40 outline-none font-semibold"
                          placeholder="0"
                          value={formatAmountInput(form.amount)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '')
                            setForm((prev) => ({ ...prev, amount: rawValue }))
                          }}
                          inputMode="numeric"
                          type="text"
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c4c5d9]/40 group-focus-within:text-[#b8c3ff]">payments</span>
                      </div>
                    </Field>

                    <Field label="Ngày giao dịch">
                      <input
                        className="w-full bg-[#060e20] border border-[#434656]/20 rounded-xl px-4 py-4 text-[#dae2fd] focus:ring-1 focus:ring-[#b8c3ff]/40 focus:border-[#b8c3ff]/40 outline-none [color-scheme:dark]"
                        value={form.date}
                        onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                        type="date"
                      />
                    </Field>

                    <Field label="Danh mục">
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-[#060e20] border border-[#434656]/20 rounded-xl px-4 py-4 text-[#dae2fd] focus:ring-1 focus:ring-[#b8c3ff]/40 focus:border-[#b8c3ff]/40 outline-none cursor-pointer"
                          value={form.category}
                          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, customCategory: '' }))}
                        >
                          {(form.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c4c5d9]/40 pointer-events-none">expand_more</span>
                      </div>
                    </Field>

                    {form.category === 'Khác' && (
                      <div className="md:col-span-2">
                        <Field label="Danh mục khác">
                          <input
                            className="w-full bg-[#060e20] border border-[#434656]/20 rounded-xl px-4 py-4 text-[#dae2fd] placeholder:text-[#c4c5d9]/30 focus:ring-1 focus:ring-[#b8c3ff]/40 focus:border-[#b8c3ff]/40 outline-none"
                            placeholder="Ví dụ: Quà tặng"
                            value={form.customCategory}
                            onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
                            type="text"
                          />
                        </Field>
                      </div>
                    )}
                  </div>

                  <button
                    className="w-full py-5 px-8 bg-gradient-to-r from-[#b8c3ff] to-[#2e5bff] text-[#001356] font-extrabold text-sm uppercase tracking-widest rounded-xl shadow-xl shadow-[#2e5bff]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-60"
                    type="submit"
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    {isLoading ? 'Đang lưu...' : 'Thêm giao dịch'}
                  </button>
                </form>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-[#c4c5d9]/40 italic">Giao dịch của bạn sẽ được mã hóa và phân tích bởi AI Intelligence.</p>
          </div>
        </div>
      </AppShell>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={notification.duration}
        />
      )}
    </>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#b8c3ff]/70 ml-1">{label}</label>
      {children}
    </div>
  )
}
