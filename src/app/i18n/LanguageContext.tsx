"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import en from "./translations/en.json"
import pt from "./translations/pt.json"

const translations = { en, pt }

type Language = "en" | "pt"

type TranslationKeys = typeof en

interface LanguageContextType {
  language: Language
  t: TranslationKeys
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = localStorage.getItem("language") as Language | null
    if (saved && (saved === "en" || saved === "pt")) {
      setLanguage(saved)
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === "pt" ? "en" : "pt"
      if (typeof window !== "undefined") {
        localStorage.setItem("language", newLang)
      }
      return newLang
    })
  }, [])

  if (!isClient) {
    return null
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
