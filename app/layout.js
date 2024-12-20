import localFont from 'next/font/local';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Script from 'next/script';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata = {
  title: 'Ateneo QPI Calculator',
  description:
    'An easy way to calculate your cumulative QPI in Ateneo. Select your program from a list of courses and calculate your QPI using the ADMU QPI Calculator!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "c5d0d4ba8f124594b444a4148fb59e0b"}'
        ></script>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-9B3GZG43XC"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', 'G-9B3GZG43XC');
                `,
          }}
        ></script>
      </body>
    </html>
  );
}
