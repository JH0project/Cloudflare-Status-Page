import { Roboto } from 'next/font/google'
import RootProvider from '@/components/RootProvider'
import config from '../../../config.json'
import { GoogleAnalytics } from "@next/third-parties/google";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@/components/Link';

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
      <body className={inter.className} style={{ minHeight: '100vh' }}>
        <RootProvider>
          <Container maxWidth='md' style={{ padding: '0 0 5vh 0' }}>
            <Typography variant='h3' component='h1' style={{ margin: '2.5vh 1vw' }}>
              {config.settings.title}
            </Typography >
            {children}
            <Typography>
              <Link href='https://github.com/JH0project/Cloudflare-Status-Page'>
                Cloudflare Status Page
              </Link>
              {' by '}
              <Link href='https://github.com/H01001000'>
                H01001000
              </Link>
            </Typography>
            <Typography>{'Powered by '}<Link href='https://www.cloudflare.com/'>Cloudflare</Link>{' and '}<Link href='https://nextjs.org/'>Next.js</Link></Typography>
          </Container >
        </RootProvider>
      </body>
      <GoogleAnalytics gaId="G-21C3KNWYDN" />
    </html>
  )
}
