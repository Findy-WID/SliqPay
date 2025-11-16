import './globals.css';
import type { Metadata } from 'next';
import { Web3Provider } from '@/components/Web3Provider';
import { UserProvider } from '@/contexts/UserContext';


export const metadata: Metadata = {
  title: 'SliqPay - Seamless Bill Payments',
  description: 'Modern fintech solution for airtime, data, electricity, and cable TV payments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Web3Provider>
          <UserProvider>
            {children}
          </UserProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
