import type { ReactNode } from 'react';
import Header from './Header';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-bg-primary">
      <Header />
      <main
        className="pt-[48px] pb-[96px] min-h-[100dvh]"
      >
        {children}
      </main>
      <Navbar />
    </div>
  );
}
