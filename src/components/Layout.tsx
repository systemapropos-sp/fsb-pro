import type { ReactNode } from 'react';
import Header from './Header';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
        {children}
      </main>
      <Navbar />
    </div>
  );
}
