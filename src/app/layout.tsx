import { JetBrains_Mono } from "next/font/google"
import "./globals.css";


const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ["400","700"],
  variable: "--front-jetbarins-mono"
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={jetbrainsMono.className}>
          <main className="min-h-screen">
            {children}
            </main>
        </body>
    </html>
  );
}
