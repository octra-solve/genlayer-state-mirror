// frontend/app/layout.tsx
import "../public/style.css"; // your global CSS

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
            <body>{children}</body>
                </html>
                  );
                  }