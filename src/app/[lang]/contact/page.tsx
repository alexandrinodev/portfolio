import { shareMetadata } from "@/app/lib/shareMetadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Contact from "@/components/Contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "pt" && lang !== "en") notFound();

  const title = lang === "en" ? "Contact" : "Contato";
  const description = lang === "en" ? "Contact Alex Alexandrino to discuss software projects and professional opportunities." : "Entre em contato com Alex Alexandrino para conversar sobre projetos de software e oportunidades profissionais.";

  return {
    title,
    description,
    ...shareMetadata(lang, `${title} | Alex Alexandrino`, description, "/contact"),
  };
}

export default function PageService(){
    return(
        <div className="pt-15">
            <Contact />
        </div>
    )
}