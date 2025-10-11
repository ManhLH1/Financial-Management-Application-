// Mobile-specific utility hooks and helpers

import { useState, useEffect } from 'react'

// Hook to detect mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// Hook for swipeable gestures
export function useSwipeGesture(onSwipeLeft, onSwipeRight) {
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

// Pull-to-refresh hook
export function usePullToRefresh(onRefresh) {
  const [startY, setStartY] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const minPullDistance = 80

  const onTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }

  const onTouchMove = (e) => {
    if (startY === 0 || window.scrollY > 0) return
    
    const currentY = e.touches[0].clientY
    const distance = currentY - startY
    
    if (distance > 0) {
      setPullDistance(distance)
    }
  }

  const onTouchEnd = async () => {
    if (pullDistance > minPullDistance && !isRefreshing) {
      setIsRefreshing(true)
      if (onRefresh) {
        await onRefresh()
      }
      setIsRefreshing(false)
    }
    
    setStartY(0)
    setPullDistance(0)
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    pullDistance,
    isRefreshing,
    showIndicator: pullDistance > 10
  }
}

// Format currency for mobile (shorter)
export function formatMobileCurrency(amount) {
  const num = parseFloat(amount)
  
  if (isNaN(num)) return '0'
  
  // Tỷ (Billions)
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)} tỷ`
  }
  
  // Triệu (Millions)
  if (num >= 1000000) {
    const millions = num / 1000000
    // Nếu là số tròn triệu, không hiển thị .0
    return millions % 1 === 0 
      ? `${Math.floor(millions)} tr`
      : `${millions.toFixed(1)} tr`
  }
  
  // Nghìn (Thousands)
  if (num >= 1000) {
    const thousands = num / 1000
    return thousands % 1 === 0
      ? `${Math.floor(thousands)}K`
      : `${thousands.toFixed(1)}K`
  }
  
  // Dưới 1000 - hiển thị đầy đủ
  return num.toLocaleString('vi-VN')
}

// Format full currency (for desktop or detail view)
export function formatFullCurrency(amount) {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0đ'
  return num.toLocaleString('vi-VN') + 'đ'
}

// Vibrate on action (if supported)
export function vibrateOnAction(duration = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}
