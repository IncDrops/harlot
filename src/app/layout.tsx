
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/contexts/theme-provider';
import { Poppins, Lato } from 'next/font/google';
import { cn } from '@/lib/utils';
import Script from 'next/script';

const fontHeading = Poppins({ 
  subsets: ['latin'], 
  weight: ['600', '700'],
  variable: '--font-heading' 
});

const fontBody = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Pollitago.ai: Your Official AI Second Opinion & Decision App',
  description: 'Get clarity and confidence on any decision, big or small, with objective AI insights. No sign-up. Just answers.',
  icons: {
    icon: '/favicon.jpg', // Use the user's uploaded favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontHeading.variable,
          fontBody.variable
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed inset-0 z-[-1] background-grid" />
          <div className="background-lines" />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
