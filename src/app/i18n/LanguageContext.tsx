"use client"

import { createContext, useContext, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import en from "./translations/en.json"
import pt from "./translations/pt.json"

const translations = { en, pt }
type Language = "en" | "pt"

interface LanguageContextType {
  language: Language
  t: typeof en
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children, language }: { children: ReactNode; language: Language }) {
  const pathname = usePathname()
  const router = useRouter()

  function toggleLanguage() {
    const nextLanguage = language === "pt" ? "en" : "pt"
    document.cookie = `language=${nextLanguage}; Path=/; Max-Age=31536000; SameSite=Lax`
    const nextPath = pathname.replace(/^\/(pt|en)(?=\/|$)/, `/${nextLanguage}`)
    router.push(`${nextPath}${window.location.search}${window.location.hash}`, { scroll: false })
  }

  return (
    <LanguageContext.Provider value={{ language, t: translations[language], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const useTranslation = useLanguage
