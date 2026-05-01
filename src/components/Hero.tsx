"use client"

import { motion } from "framer-motion"
import { LuDownload } from "react-icons/lu"
import { socialLinks, stats } from "@/app/lib/constants"
import Image from "next/image"
import CountUp from "./CountUp"
import { useLanguage } from "@/app/i18n/LanguageContext"

export default function Hero() {
    const { t } = useLanguage()

    return (
        <section className="min-h-screen bg-gray-950 text-white pt-20">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-gray-400 mb-4 block text-center lg:text-left"> {t.hero.role}
                            <h1 className="text-5xl font-bold mb-4 text-center lg:text-left">
                                {t.hero.greeting}
                                <span className="block text-emerald-400 mt-2">
                                    {t.hero.name}
                                </span>
                            </h1>
                            <p className="text-gray-400 mb-8 text-center lg:text-left">
                                {t.hero.description}
                            </p>
                            <div className="flex flex-col items-center gap-4 lg:flex-row">
                                <motion.a
                                    href="/curriculo.pdf"
                                    download
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full lg:w-auto bg-emerald-400 text-shadow-gray-900 py-3 rounded-full flex items-center justify-center gap-2 px-6 hover:bg-emerald-300"
                                >
                                    <LuDownload size={20} className="text-gray-900" />
                                    <span className="text-gray-900">
                                        {t.hero.download}
                                    </span>
                                </motion.a>

                                <div className="flex items-center gap-4">
                                    {socialLinks.map((social, index) => (
                                        <motion.a
                                            key={index}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 border border-gray-800 rounded-full flex items-center justify-center text-gray-400 
                                            hover:text-emerald-400 hover:border-emerald-400 transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {social.icon}
                                        </motion.a>
                                    ))}
                                </div>
                            </div>
                        </span>
                    </motion.div>


                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.8,
                            ease: "easeOut"
                        }}
                        className="relative flex-1"
                    >
                        <div className="w-[350px] - h-[350px] relative mx-auto overflow-hidden">
                            <motion.div
                                animate={{
                                    rotate: 360,
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 8,
                                    ease: 'linear',
                                    repeat: Infinity
                                }}
                                className="absolute inset-0 rounded-full border-2 border-emerald-400/20"
                            />

                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 3,
                                    ease: 'easeInOut',
                                    repeat: Infinity
                                }}
                                className="absolute inset-[-10px] rounded-full border-2 border-emerald-400/10"
                            />

                            <motion.div
                                animate={{
                                    rotate: -360,
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 10,
                                    ease: 'linear',
                                    repeat: Infinity
                                }}
                                className="absolute top-2 left-0 w-full border-b-2 border-dashed border-emerald-400/5 overflow-hidden"
                            />

                            <Image
                                src="/avatar-bg.png"
                                alt="Seu Avatar"
                                fill
                                className="object-cover rounded-full p-3"
                            />
                        </div>

                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
                >
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <h2 className="text-4xl font-bold text-emerald-400">
                                <CountUp value={Number(stat.number)}></CountUp>
                            </h2>
                            <p className="text-gray-400 text-sm">
                                {
                                    index === 0 ? t.stats.yearsExperience :
                                        index === 1 ? t.stats.projects :
                                            index === 2 ? t.stats.technologies :
                                                t.stats.commits
                                }
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}