import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function VocabularyIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/vocabulary/search')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  )
}

