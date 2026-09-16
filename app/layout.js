import './globals.css';

export const metadata = { title: 'WorthIt — What could your stuff sell for?', description: 'UK resale estimates and trade-in offers for electronics, gaming and fashion.' };

export default function RootLayout({ children }) {
  return <html lang="en-GB"><body>{children}</body></html>;
}