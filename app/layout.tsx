import './globals.css';
import type { ReactNode } from 'react';
import { DndProvider } from '@/context/dnd';

export const metadata = {
  title: 'Planubi',
  description: 'Planificador semanal sin fricción',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-900 dark:text-neutral-100">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center gap-4 bg-white/70 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
            <h1 className="text-xl font-semibold tracking-tight">Planubi</h1>
          </header>
          <main className="flex-1 flex min-h-0">
            <DndProvider>{children}</DndProvider>
          </main>
        </div>
      </body>
    </html>
  );
}
