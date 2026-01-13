import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlexSpace - Workspace Booking',
  description: 'Intelligent workspace booking system with QR code access control',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}