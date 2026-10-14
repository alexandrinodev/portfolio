import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Work from "@/components/Work";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "pt" && lang !== "en") notFound();

  return {
    title: lang === "en" ? "Professional Work" : "Entregas profissionais",
    description: lang === "en" ? "Explore Alex Alexandrino’s work on web and desktop applications, microservices, integrations, automation and DevOps." : "Conheça as entregas de Alex Alexandrino em aplicações web e desktop, microsserviços, integrações, automação e DevOps.",
  };
}

export default function PageWork(){
    return(
        <div className="pt-15">
            <Work />
        </div>
    )
}