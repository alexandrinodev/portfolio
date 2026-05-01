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
        <section className="min-h-screen bg-gray-950 text-white pt-20 relative overflow-hidden">
            {/* Gradient Background Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            {/* Floating Geometric Shapes */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 360, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-32 left-20 w-4 h-4 border border-emerald-500/30 rotate-45"
            />
            <motion.div
                animate={{ y: [0, 30, 0], rotate: [0, -360, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 right-32 w-3 h-3 bg-cyan-500/20 rounded-full"
            />
            <motion.div
                animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-32 left-1/3 w-2 h-2 border border-emerald-500/40 rounded-full"
            />

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex-1"
                    >
                        {/* Role Badge with Glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-6 inline-block"
                        >
                            <span className="px-4 py-2 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 text-sm font-medium">
                                {t.hero.role}
                            </span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center lg:text-left leading-tight">
                            {t.hero.greeting}
                            {/* Animated Gradient Text */}
                            <motion.span 
                                className="block mt-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-[length:200%_auto] bg-clip-text text-transparent"
                                animate={{
                                    backgroundPosition: ["0% center", "100% center", "0% center"]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            >
                                {t.hero.name}
                            </motion.span>
                        </h1>

                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 text-lg mb-8 text-center lg:text-left max-w-xl"
                        >
                            {t.hero.description}
                        </motion.p>

                        <div className="flex flex-col items-center gap-4 lg:flex-row">
                            {/* Download Button with Glow Effect */}
                            <motion.a
                                href="/curriculo.pdf"
                                download
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(52, 211, 153, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-full lg:w-auto bg-emerald-400 text-gray-900 py-3.5 rounded-full flex items-center justify-center gap-2 px-8 font-semibold overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <LuDownload size={20} className="relative z-10" />
                                <span className="relative z-10">
                                    {t.hero.download}
                                </span>
                            </motion.a>

                            {/* Social Links with Enhanced Hover */}
                            <motion.div 
                                className="flex items-center gap-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.15, y: -3 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-11 h-11 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-400/50 hover:bg-emerald-400/10 transition-all duration-300"
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>


                    {/* Avatar Section with Glowing Effect */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 1,
                            ease: "easeOut"
                        }}
                        className="relative flex-1 flex justify-center"
                    >
                        {/* Glow Effect Behind Avatar */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl scale-75" />
                        
                        <div className="w-[320px] h-[320px] md:w-[380px] md:h-[380px] relative">
                            {/* Rotating Ring 1 */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 20,
                                    ease: 'linear',
                                    repeat: Infinity
                                }}
                                className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20"
                            />

                            {/* Rotating Ring 2 - Reverse */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{
                                    duration: 25,
                                    ease: 'linear',
                                    repeat: Infinity
                                }}
                                className="absolute inset-4 rounded-full border-2 border-emerald-400/10"
                            />

                            {/* Pulsing Ring */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.15, 1],
                                    opacity: [0.3, 0.1, 0.3]
                                }}
                                transition={{
                                    duration: 4,
                                    ease: 'easeInOut',
                                    repeat: Infinity
                                }}
                                className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
                            />

                            {/* Core Avatar Container with Glassmorphism */}
                            <motion.div
                                animate={{
                                    y: [0, -8, 0]
                                }}
                                transition={{
                                    duration: 6,
                                    ease: 'easeInOut',
                                    repeat: Infinity
                                }}
                                className="absolute inset-4 rounded-full bg-gray-900/50 backdrop-blur-md border border-gray-700/50 overflow-hidden"
                            >
                                <Image
                                    src="/avatar-bg.png"
                                    alt="Avatar"
                                    fill
                                    className="object-cover rounded-full p-2"
                                />
                            </motion.div>
                        </div>

                    </motion.div>
                </div>

                {/* Stats Section with Glass Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-20"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="p-5 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 group"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                <CountUp value={Number(stat.number)}></CountUp>
                            </h2>
                            <p className="text-gray-400 text-sm mt-2 group-hover:text-gray-300 transition-colors">
                                {
                                    index === 0 ? t.stats.yearsExperience :
                                        index === 1 ? t.stats.projects :
                                            index === 2 ? t.stats.technologies :
                                                t.stats.commits
                                }
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
