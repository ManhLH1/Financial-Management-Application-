import { X, AlertTriangle, AlertCircle, Info, TrendingUp } from 'lucide-react'

/**
 * Modal component to show spending warnings before creating expense
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - alerts: array of alert objects
 * - currentSpending: object with today/thisWeek/thisMonth
 * - limits: object with daily/weekly/monthly
 * - afterExpense: object with projected values
 * - amount: number - the expense amount
 * - category: string - expense category
 * - onConfirm: function - called when user confirms to proceed
 * - onEdit: function - called when user wants to edit amount
 */
export default function SpendingWarningModal({
  isOpen,
  onClose,
  alerts = [],
  currentSpending = {},
  limits = {},
  afterExpense = {},
  amount = 0,
  category = '',
  onConfirm,
  onEdit
}) {
  if (!isOpen) return null

  const hasBlockedAlert = alerts.some(a => a.level === 'BLOCKED')
  const hasDangerAlert = alerts.some(a => a.level === 'DANGER')
  const hasWarningAlert = alerts.some(a => a.level === 'WARNING')

  const getAlertIcon = (level) => {
    switch (level) {
      case 'BLOCKED':
      case 'DANGER':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'WARNING':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
      case 'INFO':
        return <Info className="w-6 h-6 text-blue-500" />
      default:
        return <Info className="w-6 h-6 text-gray-500" />
    }
  }

  const getAlertColor = (level) => {
    switch (level) {
      case 'BLOCKED':
      case 'DANGER':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'WARNING':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'INFO':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800'
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + 'đ'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className={`p-6 border-b ${
          hasBlockedAlert ? 'bg-red-500' :
          hasDangerAlert ? 'bg-orange-500' :
          hasWarningAlert ? 'bg-yellow-500' :
          'bg-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasBlockedAlert ? '🚫' : hasDangerAlert ? '⚠️' : '💡'}
              <h2 className="text-2xl font-bold text-white">
                {hasBlockedAlert ? 'Không thể tiếp tục' :
                 hasDangerAlert ? 'Cảnh báo vượt ngân sách!' :
                 hasWarningAlert ? 'Lưu ý chi tiêu' :
                 'Thông tin chi tiêu'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Expense Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Khoản chi tiêu này:
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 ${getAlertColor(alert.level)}`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                      {alert.message}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      💡 {alert.recommendation}
                    </p>
                    {alert.percentage && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Mức sử dụng</span>
                          <span className="font-semibold">{alert.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              alert.level === 'BLOCKED' || alert.level === 'DANGER'
                                ? 'bg-red-500'
                                : alert.level === 'WARNING'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spending Comparison */}
          {(currentSpending.today !== undefined || currentSpending.thisWeek !== undefined) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                So sánh chi tiêu
              </h3>
              <div className="space-y-3">
                {/* Today */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Hôm nay</span>
                    <span className="font-semibold">
                      {formatCurrency(currentSpending.today)} → {formatCurrency(afterExpense.today)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Hạn mức: {formatCurrency(limits.daily)}
                  </div>
                </div>

                {/* This Week */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Tuần này</span>
                    <span className="font-semibold">
                      {formatCurrency(currentSpending.thisWeek)} → {formatCurrency(afterExpense.thisWeek)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Hạn mức: {formatCurrency(limits.weekly)}
                  </div>
                </div>

                {/* This Month */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Tháng này</span>
                    <span className="font-semibold">
                      {formatCurrency(currentSpending.thisMonth)} → {formatCurrency(afterExpense.thisMonth)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Ngân sách: {formatCurrency(limits.monthly)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            {!hasBlockedAlert && (
              <>
                <button
                  onClick={onEdit}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  ✏️ Chỉnh sửa số tiền
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                    hasDangerAlert
                      ? 'bg-red-500 hover:bg-red-600'
                      : hasWarningAlert
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {hasDangerAlert ? '⚠️ Vẫn tiếp tục' : '✅ Xác nhận'}
                </button>
              </>
            )}
            {hasBlockedAlert && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
          {hasDangerAlert && (
            <p className="text-xs text-center text-gray-500 mt-2">
              💡 Khuyến nghị: Cân nhắc hoãn hoặc giảm số tiền chi tiêu này
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
