import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AppShell from '../components/layout/AppShell'
import Notification, { useNotification } from '../components/Notification'

export default function Debts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { notification, showNotification, hideNotification } = useNotification()

  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState({
    person: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    due: '',
    status: 'borrowed',
    monthlyPayment: '',
    paymentDay: '',
    totalPeriods: 1,
    paidPeriods: 0
  })

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth')
    if (status === 'authenticated') fetchNotes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function fetchNotes() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/debts')
      const data = await res.json()
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Error fetching debts:', error)
      showNotification('❌ Không thể tải dữ liệu khoản nợ', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function addDebt() {
    if (!form.person || !form.amount) {
      showNotification('⚠️ Vui lòng nhập người vay/cho và số tiền', 'warning')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) })
      })

      if (res.ok) {
        showNotification('✅ Đã thêm khoản nợ', 'success')
        setForm({
          person: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          due: '',
          status: 'borrowed',
          monthlyPayment: '',
          paymentDay: '',
          totalPeriods: 1,
          paidPeriods: 0
        })
        await fetchNotes()
      } else {
        const data = await res.json()
        showNotification(`❌ ${data.error || 'Không thể thêm khoản nợ'}`, 'error')
      }
    } catch (error) {
      console.error('Error adding debt:', error)
      showNotification('❌ Có lỗi khi thêm khoản nợ', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function markPaid(id) {
    try {
      const res = await fetch('/api/debts', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id, status: 'paid' })
      })
      if (res.ok) {
        showNotification('✅ Đã đánh dấu thanh toán', 'success')
        await fetchNotes()
      }
    } catch (error) {
      console.error('Error marking paid:', error)
      showNotification('❌ Không thể cập nhật trạng thái', 'error')
    }
  }

  async function sendReminder(debt) {
    setIsSending(true)
    try {
      const res = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ debt })
      })
      const data = await res.json()
      if (res.ok) {
        showNotification(`📧 ${data.message}`, 'success', 7000)
      } else {
        showNotification(`❌ ${data.error}`, 'error')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      showNotification('❌ Không thể gửi email nhắc nợ', 'error')
    } finally {
      setIsSending(false)
    }
  }

  async function triggerAutoReminder() {
    setIsSending(true)
    try {
      const res = await fetch('/api/check-warnings', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        const sentCount = data.autoSent?.length || 0
        showNotification(`🔔 Kiểm tra xong. Đã gửi ${sentCount} email nhắc nợ tự động (mốc 3 ngày).`, 'success', 7000)
      } else {
        showNotification(`❌ ${data.error || 'Không thể chạy auto reminder'}`, 'error')
      }
    } catch (error) {
      console.error('Error trigger auto reminder:', error)
      showNotification('❌ Có lỗi khi chạy nhắc nợ tự động', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const getDaysUntilPayment = (paymentDay) => {
    if (!paymentDay) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const payment = new Date(paymentDay)
    payment.setHours(0, 0, 0, 0)
    return Math.ceil((payment - today) / (1000 * 60 * 60 * 24))
  }

  const debtRows = useMemo(() => {
    return notes
      .map(n => {
        const daysUntil = getDaysUntilPayment(n.paymentDay)
        const nearPayment = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3
        const warning = daysUntil !== null && daysUntil >= 0 && daysUntil <= 5
        return { ...n, daysUntil, nearPayment, warning }
      })
      .filter(n => {
        if (!searchTerm) return true
        const q = searchTerm.toLowerCase()
        return String(n.person || '').toLowerCase().includes(q)
      })
      .sort((a, b) => new Date(a.paymentDay || a.due || a.date) - new Date(b.paymentDay || b.due || b.date))
  }, [notes, searchTerm])

  const summary = useMemo(() => {
    const active = notes.filter(n => n.status !== 'paid')
    const totalDebt = active.reduce((sum, n) => sum + (Number(n.amount) || 0), 0)
    const urgent = active.filter(n => {
      const d = getDaysUntilPayment(n.paymentDay)
      return d !== null && d >= 0 && d <= 3
    }).length
    const warning = active.filter(n => {
      const d = getDaysUntilPayment(n.paymentDay)
      return d !== null && d > 3 && d <= 5
    }).length
    return { totalDebt, urgent, warning, activeCount: active.length }
  }, [notes])

  if (status === 'loading') {
    return <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex items-center justify-center">Đang tải...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1326] text-[#dae2fd]">
        <Link href="/auth" className="px-8 py-4 bg-[#2e5bff] rounded-2xl font-bold">Đăng nhập</Link>
      </div>
    )
  }

  return (
    <>
      <AppShell
        title="Quản lý Khoản nợ"
        activeMenu="debts"
        session={session}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Tìm theo tên người vay/cho..."
        primaryActionLabel="Tự động nhắc nợ"
        onPrimaryAction={triggerAutoReminder}
        rightActions={
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#b8c3ff]">
            <span className="material-symbols-outlined text-base">schedule_send</span>
            Mốc nhắc mail: trước 3 ngày
          </div>
        }
      >
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Tổng nợ chưa trả" value={`${summary.totalDebt.toLocaleString('vi-VN')} ₫`} tone="blue" />
          <StatCard title="Khoản nợ đang mở" value={`${summary.activeCount}`} tone="slate" />
          <StatCard title="Cảnh báo (<=5 ngày)" value={`${summary.warning}`} tone="orange" />
          <StatCard title="Khẩn cấp (<=3 ngày)" value={`${summary.urgent}`} tone="red" />
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-[#131b2e] border border-[#434656]/20 p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Thêm khoản nợ</h3>
              <div className="space-y-4">
                <Field label="Người vay/cho *"><input className="w-full px-4 py-3 rounded-lg bg-[#060e20] border border-[#434656]/30" value={form.person} onChange={(e) => setForm(f => ({ ...f, person: e.target.value }))} /></Field>
                <Field label="Số tiền (VNĐ) *"><input type="number" className="w-full px-4 py-3 rounded-lg bg-[#060e20] border border-[#434656]/30" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} /></Field>
                <Field label="Ngày tạo"><input type="date" className="w-full px-4 py-3 rounded-lg bg-[#060e20] border border-[#434656]/30 [color-scheme:dark]" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
                <Field label="Ngày thanh toán gần nhất"><input type="date" className="w-full px-4 py-3 rounded-lg bg-[#060e20] border border-[#434656]/30 [color-scheme:dark]" value={form.paymentDay} onChange={(e) => setForm(f => ({ ...f, paymentDay: e.target.value }))} /></Field>
                <Field label="Hạn cuối"><input type="date" className="w-full px-4 py-3 rounded-lg bg-[#060e20] border border-[#434656]/30 [color-scheme:dark]" value={form.due} onChange={(e) => setForm(f => ({ ...f, due: e.target.value }))} /></Field>
                <Field label="Trạng thái nợ">
                  <select className="w-full px-4 py-3 rounded-lg bg-[#060e20] border border-[#434656]/30" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="borrowed">Đi vay</option>
                    <option value="owed-to-me">Cho vay</option>
                  </select>
                </Field>

                <button onClick={addDebt} disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#b8c3ff] to-[#2e5bff] text-[#001356] font-bold disabled:opacity-60">
                  {isLoading ? 'Đang xử lý...' : 'Thêm khoản nợ'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-[#131b2e] border border-[#434656]/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Danh sách khoản nợ</h3>
                <span className="text-xs text-[#c4c5d9]">Auto email trước 3 ngày</span>
              </div>

              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                {debtRows.length === 0 ? (
                  <div className="text-center py-10 text-[#8e90a2]">Không có khoản nợ phù hợp.</div>
                ) : debtRows.map(n => (
                  <div key={n.id} className={`border rounded-xl p-4 ${n.nearPayment ? 'border-[#ffb3b6]/60 bg-[#ffb3b6]/5' : n.warning ? 'border-[#f59e0b]/50 bg-[#f59e0b]/5' : 'border-[#434656]/30 bg-[#060e20]/30'}`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-bold text-lg">{n.person}</div>
                        <div className="text-sm text-[#c4c5d9] mt-1">Số tiền: {Number(n.amount || 0).toLocaleString('vi-VN')} ₫</div>
                        <div className="text-xs text-[#8e90a2] mt-1">Ngày thanh toán: {n.paymentDay || 'Chưa đặt'}</div>
                        {n.daysUntil !== null && n.status !== 'paid' && (
                          <div className={`mt-2 inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${n.nearPayment ? 'bg-[#ffb3b6]/15 text-[#ffb3b6]' : n.warning ? 'bg-[#f59e0b]/15 text-[#f59e0b]' : 'bg-[#4edea3]/15 text-[#4edea3]'}`}>
                            {n.daysUntil < 0 ? 'Quá hạn' : `Còn ${n.daysUntil} ngày`}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${n.status === 'paid' ? 'bg-[#4edea3]/15 text-[#4edea3]' : 'bg-[#b8c3ff]/15 text-[#b8c3ff]'}`}>
                          {n.status === 'paid' ? 'Đã trả' : 'Đang mở'}
                        </span>
                        {n.status !== 'paid' && (
                          <>
                            <button onClick={() => markPaid(n.id)} className="px-3 py-2 rounded-lg bg-[#2e5bff] hover:bg-[#124af0] text-white text-sm">Đánh dấu đã trả</button>
                            <button onClick={() => sendReminder(n)} disabled={isSending} className="px-3 py-2 rounded-lg bg-[#2d3449] hover:bg-[#434656] text-sm">Gửi nhắc nợ</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AppShell>

      {notification && <Notification message={notification.message} type={notification.type} onClose={hideNotification} duration={notification.duration} />}
    </>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-[#c4c5d9] mb-2">{label}</label>
      {children}
    </div>
  )
}

function StatCard({ title, value, tone = 'slate' }) {
  const toneMap = {
    blue: 'border-[#2e5bff]/40 bg-[#2e5bff]/10 text-[#b8c3ff]',
    orange: 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]',
    red: 'border-[#ffb3b6]/40 bg-[#ffb3b6]/10 text-[#ffb3b6]',
    slate: 'border-[#434656]/30 bg-[#131b2e] text-[#dae2fd]'
  }

  return (
    <div className={`rounded-xl border p-5 ${toneMap[tone] || toneMap.slate}`}>
      <div className="text-xs uppercase tracking-widest opacity-80">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )
}
