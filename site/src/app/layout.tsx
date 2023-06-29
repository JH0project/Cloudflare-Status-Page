import { Roboto } from 'next/font/google'
import DefaultRootLayout from './RootLayout'

const inter = Roboto({ weight: ['300', '400', '500', '700'], display: 'swap', subsets: ['cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'latin', 'latin-ext', 'vietnamese'] })

export const metadata = {
  title: 'JH0project Status',
  description: 'A status page of JH0project, showing historical status and performane information.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ minHeight: '100vh', color: '#FFF', backgroundColor: "#fff" }}>
        <DefaultRootLayout>
          {children}
        </DefaultRootLayout>
      </body>
    </html>
  )
}
