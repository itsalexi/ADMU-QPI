import localFont from 'next/font/local';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

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
        'Select your program from a list of courses and calculate your QPI!',
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
                    data-cf-beacon='{"token": "86ec04c4f2cb40658a18c7523aa83bc2"}'
                ></script>
            </body>
        </html>
    );
}
