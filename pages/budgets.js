import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function BudgetsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/budget-dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p>Đang chuyển hướng...</p>
      </div>
    </div>
  )
}
