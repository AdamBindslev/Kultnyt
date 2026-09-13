import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kultnyt // Alternativ Musik, Udgivelser & Turnéer',
  description: 'Kurateret nyhedssite og radar for alternativ musik, nye udgivelser og koncerter i Danmark.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className="dark">
      <body className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-rose-500/30 selection:text-rose-200">
        {children}
      </body>
    </html>
  );
}
