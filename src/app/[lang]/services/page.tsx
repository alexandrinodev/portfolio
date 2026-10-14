import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Services from "@/components/Services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "pt" && lang !== "en") notFound();

  return {
    title: lang === "en" ? "Services" : "Serviços",
    description: lang === "en" ? "Explore Alex Alexandrino’s services in full stack development, API architecture, automation and software quality." : "Conheça os serviços de Alex Alexandrino em desenvolvimento Full Stack, arquitetura de APIs, automação e qualidade de software.",
  };
}

export default function PageService(){
    return(
        <div className="pt-15">
            <Services />
        </div>
    )
}