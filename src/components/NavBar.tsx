"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { menuItems } from "@/app/lib/constants"
import { Menu, X } from "lucide-react"
import LanguageToggle from "./LanguageToggle"
import { useLanguage } from "@/app/i18n/LanguageContext"

const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
        const offset = 64 // altura da navbar
        const bodyRect = document.body.getBoundingClientRect().top
        const elementRect = element.getBoundingClientRect().top
        const elementPosition = elementRect - bodyRect
        const offsetPosition = elementPosition - offset

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        })
    }
}

export default function NavBar() {
    const { t } = useLanguage()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleNavClick = (id: string) => {
        if (id === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" })
        } else {
            const sectionId = id.replace("/", "")
            scrollToSection(sectionId)
        }
        setIsMenuOpen(false)
    }

    return (
        <nav className="fixed w-full z-50 bg-gray-950/80 backdrop-blur-sm">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    <button
                        onClick={() => handleNavClick("/")}
                        className="text-2xl font-bold text-white cursor-pointer"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            Alex<span className="text-emerald-400">.</span>JS
                        </motion.div>
                    </button>

                    {/* Menu Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <button
                                    onClick={() => handleNavClick(item.path)}
                                    className="text-gray-400 hover:text-emerald-400 transition-colors relative group cursor-pointer"
                                >
                                    {index === 0 ? t.nav.home :
                                        index === 1 ? t.nav.services :
                                            index === 2 ? t.nav.resume :
                                                index === 3 ? t.nav.work :
                                                    t.nav.contact}
                                </button>
                            </motion.div>
                        ))}

                        <LanguageToggle />

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleNavClick("/contact")}
                            className="bg-emerald-400 text-gray-900 px-6 py-2 rounded-full font-medium hover:bg-emerald-300 transition-colors cursor-pointer"
                        >
                            {t.nav.hireMe}
                        </motion.button>
                    </div>

                    {/* Botao Menu Mobile */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}

                    </button>

                </div>
            </div>
            {/* Menu Mobile */}
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut"
                    }}
                    className="md:hidden bg-gray-900 px-6 py-4"

                >
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => handleNavClick(item.path)}
                            className="block py-6 px-6 w-full text-left text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
                        >

                            {
                                index === 0 ? t.nav.home :
                                index === 1 ? t.nav.services :
                                index === 2 ? t.nav.resume :
                                index === 3 ? t.nav.work :
                                t.nav.contact
                            }
                        </button>
                    ))}
                    <div className="ml-5">
                        <LanguageToggle />
                    </div>
                    <button
                        onClick={() => handleNavClick("/contact")}
                        className="w-full bg-emerald-400 text-gray-900 px-6 py-2 rounded-full font-medium mt-4 cursor-pointer"
                    >
                        {t.nav.hireMe}
                    </button>
                </motion.div>
            )}
        </nav>

    )
}