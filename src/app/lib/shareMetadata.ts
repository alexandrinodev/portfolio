import type { Metadata } from "next"

export function shareMetadata(
  lang: "pt" | "en",
  title: string,
  description: string,
  path = "",
): Metadata {
  const image = {
    url: `/portfolio-${lang}.png`,
    width: 1291,
    height: 620,
    alt: lang === "pt"
      ? "Portfólio de Alex Alexandrino — Engenheiro de Software Full Stack"
      : "Alex Alexandrino’s Portfolio — Full Stack Software Engineer",
  }

  return {
    metadataBase: new URL("https://alex-alexandrino-portfolio.vercel.app"),
    openGraph: {
      title,
      description,
      url: `/${lang}${path}`,
      siteName: "Alex Alexandrino",
      locale: lang === "pt" ? "pt_BR" : "en_US",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}
