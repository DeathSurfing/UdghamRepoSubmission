import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { CustomToastProvider } from '@/components/ui/use-toast'; // Import the CustomToastProvider

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Resume Parser',
  description: 'AI-powered resume analysis system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CustomToastProvider>
            {children}
            <Toaster />
          </CustomToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
