import { shareMetadata } from "@/app/lib/shareMetadata";
import { notFound } from "next/navigation";
import { JetBrains_Mono } from "next/font/google"
import "../globals.css";
import NavBar from "@/components/NavBar";
import { LanguageProvider } from "../i18n/LanguageContext";
import type { Metadata } from "next"

const seo = {
  pt: {
    title: "Alex Alexandrino | Engenheiro de Software Full Stack",
    description:
      "Conheça meus projetos e minha experiência com React, Next.js, Node.js, Python e Go.",
  },
  en: {
    title: "Alex Alexandrino | Full Stack Software Engineer",
    description:
      "Explore my projects and experience with React, Next.js, Node.js, Python and Go.",
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "pt" && lang !== "en") notFound();
  const content = seo[lang];

  return {
    title: {
      default: content.title,
      template: "%s | Alex Alexandrino",
    },
    description: content.description,
    ...shareMetadata(lang, content.title, content.description),
  };
}

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
