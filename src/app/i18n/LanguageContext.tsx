"use client"

import { createContext, useContext, useSyncExternalStore, useEffect, ReactNode } from "react"
import en from "./translations/en.json"
import pt from "./translations/pt.json"

const translations = { en, pt }
type Language = "en" | "pt"
const listeners = new Set<() => void>()
let fallbackLanguage: Language = "pt"

function getLanguage(): Language {
  try {
    const saved = localStorage.getItem("language")
    return saved === "en" || saved === "pt" ? saved : fallbackLanguage
  } catch {
    return fallbackLanguage
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function toggleLanguage() {
  fallbackLanguage = getLanguage() === "pt" ? "en" : "pt"
  try {
    localStorage.setItem("language", fallbackLanguage)
  } catch {
    // Keep the selected language in memory when browser storage is unavailable.
  }
  listeners.forEach(listener => listener())
}

interface LanguageContextType {
  language: Language
  t: typeof en
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getLanguage, () => "pt" as Language)

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en"
  }, [language])

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
