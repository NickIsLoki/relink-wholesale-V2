import './globals.css'

export const metadata = {
  title: 'reLink Wholesale',
  description: 'B2B wholesale platform for reLink Medical',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
