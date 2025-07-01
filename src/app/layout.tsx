import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import { StripeProvider } from '@/contexts/stripe-provider';
import { ThemeProvider } from '@/contexts/theme-provider';

export const metadata: Metadata = {
  title: 'PollitAGo: THE 2nd OPINION APP',
  description: 'The ultimate app for getting a second opinion on anything.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&family=Cormorant+Garamond:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <StripeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </StripeProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
