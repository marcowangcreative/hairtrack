import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hair Track',
  description: 'Factory ops tracker for hairline launches.',
};

// Runs before React hydrates — reads saved preference or falls back to
// light mode. Keeps `<html class="light">` until the user flips the toggle.
const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem('ht.theme');
    const theme = saved === 'dark' ? 'dark' : 'light';
    if (theme === 'light') document.documentElement.classList.add('light');
  } catch (_) {
    document.documentElement.classList.add('light');
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
