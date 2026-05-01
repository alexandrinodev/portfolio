"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/app/i18n/LanguageContext"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage()

    return (
        <motion.button
            onClick={toggleLanguage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 
                text-gray-400 hover:text-emerald-400 hover:border-emerald-400/50 hover:bg-emerald-400/10
                transition-all duration-300"
            title={language === "pt" ? "Switch to English" : "Mudar para Português"}
        >
            <Globe size={18} />
            <span className="text-sm font-medium">
                {language === "pt" ? "PT" : "EN"}
            </span>
            <motion.span
                initial={false}
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5 }}
                className="text-xs"
            >
                {language === "pt" ? "🇧🇷" : "🇺🇸"}
            </motion.span>
        </motion.button>
    )
}
