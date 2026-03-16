import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'LeadHunter — Find Freelance Opportunities',
  description: 'AI-powered lead finder for freelancers. Monitor Facebook groups, job boards and more with automated alerts.',
  keywords: ['freelance', 'leads', 'jobs', 'facebook groups', 'seo', 'web developer'],
  openGraph: {
    title: 'LeadHunter',
    description: 'AI-powered lead finder for freelancers',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-bg-primary text-white antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141a2b',
              color: '#fff',
              border: '1px solid #1f2a44',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#141a2b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#141a2b' } },
          }}
        />
      </body>
    </html>
  )
}
