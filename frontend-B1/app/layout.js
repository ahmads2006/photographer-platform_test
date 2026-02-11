import { Space_Grotesk, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import AppNav from '@/components/AppNav';

const sans = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const serif = IBM_Plex_Serif({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '700'] });

export const metadata = {
  title: 'Photographer Platform',
  description: 'Collaboration platform for photographers',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable}`}>
        <Providers>
          <AppNav />
          <main className="page-wrap">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
