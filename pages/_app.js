import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function App({ Component, pageProps: { session, ...pageProps } }){
  const [theme, setTheme] = useState('light')
  useEffect(()=>{
    if(document.documentElement.classList.contains('dark')) setTheme('dark')
  },[])
  
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
        
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  )
}
