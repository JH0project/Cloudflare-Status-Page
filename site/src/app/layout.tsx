import { Roboto } from 'next/font/google'
import DefaultRootLayout from './RootLayout'
import Script from 'next/script.js'
import config from '../../../config.json'

const inter = Roboto({ weight: ['300', '400', '500', '700'], display: 'swap', subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'] })

export const metadata = {
  title: config.settings.title,
  description: config.settings.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ minHeight: '100vh', color: '#FFF', backgroundColor: "#fff" }}>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-21C3KNWYDN" strategy='afterInteractive' />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-21C3KNWYDN');
          `}
        </Script>
        <DefaultRootLayout>
          {children}
        </DefaultRootLayout>
      </body>
    </html>
  )
}
