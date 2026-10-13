import { notFound } from "next/navigation";
import { JetBrains_Mono } from "next/font/google"
import "../globals.css";
import NavBar from "@/components/NavBar";
import { LanguageProvider } from "../i18n/LanguageContext";


const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ["400","700"],
  variable: "--front-jetbarins-mono"
})

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (lang !== "pt" && lang !== "en") notFound();

  return (
    <html lang={lang === "pt" ? "pt-BR" : "en"}>
        <body className={jetbrainsMono.className}>
          <LanguageProvider language={lang}>
            <NavBar />
            <main className="min-h-screen">
              {children}
            </main>
          </LanguageProvider>
        </body>
    </html>
  );
}
