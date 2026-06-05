import type { ReactNode } from 'react';
import Header from './Header';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen overflow-hidden bg-bg-primary">
      <Header />
      <main className="h-full overflow-y-auto pt-11 pb-16 md:pt-12 md:pb-20 xl:pb-24 overflow-x-hidden">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
