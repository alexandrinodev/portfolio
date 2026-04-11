"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { menuItems } from "@/app/lib/contants"
import { Menu, X } from "lucide-react"

export default function NavBar() {

    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="fixed w-full z-50 bg-gray-950/80 backgrop-blur-sm">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    <Link href="/">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-bold text-white"
                        >
                            Alex<span className="text-emerald-400">.</span>JS
                        </motion.div>
                    </Link>

                    {/* Menu Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        {menuItems.map((item, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{y:-2}}
                                whileTap={{scale: 0.95}}
                            >
                                <Link 
                                    href={item.path}
                                    className={`${pathname === item.path ? "text-emerald-400" : "text-gray-400"} 
                                                hover:text-emerald-400 transition-colors relative group:`}
                                >
                                    {item.title}
                                    {pathname === item.path && (
                                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-400" />
                                    )}
                                </Link>
                            </motion.div>
                        ))}

                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale:0.95}}
                            className="bg-emerald-400 text-gray-900 px-6 py-2 rounded-full
                            font-medium hover:bg-emerald-300 transition-colors" 
                        >
                            Me Contrate
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
                    className="md:hidden bg-gray-900 -px-6 py-4"

                >
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.path}
                            className={`block py-6 px-6 w-full
                                        ${pathname === item.path ? "text-emerald-400" : "text-gray-300"}`}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.title}
                        </Link>
                    ))}
                    <button className="w-full bg-emerald-400 text-gray-900 px-6 py-2 
                            rounded-full font-medium mt-4">
                        Me contrate
                    </button>
                </motion.div>
            )}
        </nav>

    )
}