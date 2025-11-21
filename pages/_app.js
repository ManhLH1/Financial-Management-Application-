import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setTheme('dark')
  }, [])

  return (
    <>
      <Head>
        <meta name="application-name" content="Quản Lý Chi Tiêu" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Quản Lý Chi Tiêu" />
        <meta name="description" content="Ứng dụng quản lý chi tiêu cá nhân với Google Sheets" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Premium Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <style>{`
          :root {
            --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
            --font-display: 'Outfit', system-ui, -apple-system, sans-serif;
          }
          body {
            font-family: var(--font-sans);
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-display);
          }
        `}</style>
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}
