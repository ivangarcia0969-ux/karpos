import type { Metadata } from 'next';
import '@karpos/ui/globals.css';

export const metadata: Metadata = {
  title: { default: 'Karpos', template: '%s · Karpos' },
  description: 'Plataforma SaaS multi-tenant para el manejo integral de cultivos frutales.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
