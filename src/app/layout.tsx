// RootLayout.tsx
import './globals.css';
import { ReactNode } from 'react';
import LayoutWrapper from './LayoutWrapper';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
