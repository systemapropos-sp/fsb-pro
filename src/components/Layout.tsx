import type { ReactNode } from 'react';
import Header from './Header';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen overflow-hidden" style={{ background: '#F0F2F5' }}>
      <Header />
      <main className="h-full overflow-y-auto pt-11 pb-16 md:pt-12 md:pb-24 xl:pb-[120px] overflow-x-hidden" style={{ background: '#F0F2F5' }}>
        {children}
      </main>
      <Navbar />
    </div>
  );
}
