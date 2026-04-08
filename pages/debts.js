import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function DebtsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/budget-dashboard?tab=debts')
  }, [router])

  return null
}
