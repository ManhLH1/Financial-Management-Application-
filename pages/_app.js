import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function App({ Component, pageProps: { session, ...pageProps } }){
  const [theme, setTheme] = useState('light')
  useEffect(()=>{
    if(document.documentElement.classList.contains('dark')) setTheme('dark')
  },[])
  
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
