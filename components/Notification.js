import { useState, useEffect } from 'react'

export default function Notification({ message, type = 'info', onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: '❌'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-500',
      text: 'text-orange-800',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: 'ℹ️'
    }
  }

  const style = types[type] || types.info

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${style.bg} ${style.border} border-l-4 ${style.text} p-4 rounded-lg shadow-lg max-w-md`}>
        <div className="flex items-start">
          <span className="text-2xl mr-3">{style.icon}</span>
          <div className="flex-1">
            <p className="font-medium whitespace-pre-line">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook to manage notifications
export function useNotification() {
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({ message, type, duration })
  }

  const hideNotification = () => {
    setNotification(null)
  }

  return {
    notification,
    showNotification,
    hideNotification
  }
}
