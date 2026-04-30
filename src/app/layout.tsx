import { JetBrains_Mono } from "next/font/google"
import "./globals.css";
import NavBar from "@/components/NavBar";
import { LanguageProvider } from "./i18n/LanguageContext";


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
          <LanguageProvider>
            <NavBar />
            <main className="min-h-screen">
              {children}
            </main>
          </LanguageProvider>
        </body>
    </html>
  );
}
