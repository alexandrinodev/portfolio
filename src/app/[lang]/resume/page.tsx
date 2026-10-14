import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Resume from "@/components/Resume";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== "pt" && lang !== "en") notFound();

  return {
    title: lang === "en" ? "Resume" : "Currículo",
    description: lang === "en" ? "Explore Alex Alexandrino’s professional experience, education and skills in full stack software engineering." : "Conheça a experiência profissional, formação e habilidades de Alex Alexandrino em engenharia de software Full Stack.",
  };
}

export default function PageResume(){
    return(
        <div className="pt-15">
            <Resume />
        </div>
    )
}