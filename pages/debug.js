import { useSession, signIn, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/debug-session')
        .then(res => res.json())
        .then(data => setSessionInfo(data))
        .catch(err => setSessionInfo({ error: err.message }))
    }
  }, [status])

  return (
    <>
      <Head>
        <title>Debug Session</title>
      </Head>
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
        <h1 style={{ color: '#1B3C53' }}>🔍 Debug Session Info</h1>
        
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>NextAuth Client Session:</h2>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Has Session:</strong> {session ? 'Yes ✅' : 'No ❌'}</p>
          {session && (
            <>
              <p><strong>User Name:</strong> {session.user?.name}</p>
              <p><strong>User Email:</strong> {session.user?.email}</p>
              <p><strong>Has Access Token:</strong> {session.accessToken ? 'Yes ✅' : 'No ❌'}</p>
              {session.accessToken && (
                <p><strong>Access Token Length:</strong> {session.accessToken.length} characters</p>
              )}
            </>
          )}
        </div>

        {sessionInfo && (
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>Server Session Check:</h2>
            <pre style={{ overflow: 'auto', background: 'white', padding: '15px', borderRadius: '4px' }}>
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          {status === 'authenticated' ? (
            <>
              <button
                onClick={() => signOut()}
                style={{
                  padding: '12px 24px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🚪 Đăng xuất
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                🔄 Reload
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('google')}
              style={{
                padding: '12px 24px',
                background: '#1B3C53',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔐 Đăng nhập với Google
            </button>
          )}
        </div>

        <div style={{ marginTop: '40px', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
          <h3>⚠️ Hướng dẫn sửa lỗi:</h3>
          <ol>
            <li>Nếu <strong>"Has Access Token"</strong> là <strong>No ❌</strong>, bạn cần:</li>
            <ul>
              <li>✅ Click <strong>"🚪 Đăng xuất"</strong></li>
              <li>✅ Click <strong>"🔐 Đăng nhập với Google"</strong> lại</li>
              <li>✅ Cho phép tất cả quyền truy cập Google Sheets</li>
            </ul>
            <li>Sau khi đăng nhập lại, access token sẽ được cấp mới</li>
            <li>Kiểm tra lại trang này để xác nhận</li>
          </ol>
        </div>

        <div style={{ marginTop: '20px' }}>
          <a href="/" style={{ color: '#1B3C53', textDecoration: 'underline' }}>← Về trang chủ</a>
          {' | '}
          <a href="/debts" style={{ color: '#1B3C53', textDecoration: 'underline' }}>Trang Nợ</a>
          {' | '}
          <a href="/expenses" style={{ color: '#1B3C53', textDecoration: 'underline' }}>Trang Chi tiêu</a>
        </div>
      </div>
    </>
  )
}
