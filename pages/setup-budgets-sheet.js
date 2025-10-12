import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SetupBudgetsSheet() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/setup-budgets-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl">
                <span className="text-4xl">🔧</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Setup Budgets Sheet
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Initialize the Budgets sheet in your Google Spreadsheet
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Logged in as:
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {session?.user?.email}
              </p>
            </div>

            {/* Setup Button */}
            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Setup Budgets Sheet</span>
                </>
              )}
            </button>
          </div>

          {/* Success Result */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-2xl p-6 mb-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-green-500 text-white p-3 rounded-xl">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                    Setup Successful!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    {result.message}
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sheet ID:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{result.sheetId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Spreadsheet ID:</span>
                      <span className="font-mono text-xs text-gray-900 dark:text-white break-all">
                        {result.spreadsheetId}
                      </span>
                    </div>
                    {result.headers && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Headers created:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.headers.map((header, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-xs font-medium rounded"
                            >
                              {header}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => router.push('/budget-dashboard')}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Go to Budget Dashboard →
                    </button>
                    <button
                      onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`, '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Open Spreadsheet 📊
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 mb-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="bg-red-500 text-white p-3 rounded-xl">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                    Setup Failed
                  </h3>
                  <p className="text-red-700 dark:text-red-300">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <span>ℹ️</span>
              <span>What this does:</span>
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Creates a new "Budgets" sheet in your Google Spreadsheet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Adds 8 column headers with proper formatting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Includes sample budget data to get you started</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Freezes header row for easy scrolling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold">✓</span>
                <span>Auto-resizes columns for optimal viewing</span>
              </li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> If the "Budgets" sheet already exists, this operation will be skipped.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
